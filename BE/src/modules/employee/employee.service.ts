import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Employee } from "./schemas/employee.schema";
import mongoose, { Model } from "mongoose";
import { PaginatedList } from "@/common/dto/paginated-list.dto";
import { FullDetailEmployeeDto } from "./dto/full-details-employees.dto";
import {
  EmployeeDetailsFilterAggregateFilters,
  fullDetailsFilterAggregationPipeline,
} from "./aggregate-pipes/full-details-filter";
import { User } from "../user/schemas/user.schema";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
  ) { }

  async findAll() {
    return await this.employeeModel.find();
  }

  async findById(id: mongoose.Types.ObjectId) {
    return await this.employeeModel.findById(id);
  }

  async findByCode(code: string) {
    return await this.employeeModel.findOne({ code });
  }

  async queryListFullDetails({
    page,
    limit,
    filter = {},
    sort = [],
  }: {
    page: number;
    limit: number;
    filter?: object;
    sort?: EmployeeDetailsFilterAggregateFilters[];
  }): Promise<PaginatedList<FullDetailEmployeeDto>> {
    const skip = (page - 1) * limit;

    const pipeline = fullDetailsFilterAggregationPipeline({
      filter,
      skip,
      limit,
      sort,
    });

    const [data, countArr] = await Promise.all([
      this.employeeModel.aggregate([...pipeline]),
      this.employeeModel.aggregate([
        ...pipeline.filter((stage) => !("$skip" in stage || "$limit" in stage)),
        { $count: "total" },
      ]),
    ]);
    const totalItems =
      (countArr[0] as { total: number } | undefined)?.total ?? 0;

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const mappedData: FullDetailEmployeeDto[] = (
      data as (Employee & { user?: User })[]
    ).map(
      (empl) => new FullDetailEmployeeDto(empl as Employee, empl.user ?? null),
    );

    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage,
      hasPrevPage,
      data: mappedData,
    };
  }

  async create(createDto: CreateEmployeeDto) {
    const payload: any = {
      ...createDto,
      role: new mongoose.Types.ObjectId(createDto.role),
      address: createDto.address ?? null,
      email: createDto.email ?? null,
      contactNumber: createDto.contactNumber ?? null,
      note: createDto.note ?? "",
    };

    const doc = new this.employeeModel(payload);
    const saved = await doc.save();
    return this.employeeModel.populate(saved.toObject(), [{ path: "role" }]);
  }

  async update(id: string, updateDto: UpdateEmployeeDto) {
    const up: any = { ...updateDto };
    if (up.role) up.role = new mongoose.Types.ObjectId(up.role);
    if (Object.prototype.hasOwnProperty.call(up, "address") && up.address === undefined) delete up.address;
    if (Object.prototype.hasOwnProperty.call(up, "email") && up.email === undefined) delete up.email;
    if (Object.prototype.hasOwnProperty.call(up, "contactNumber") && up.contactNumber === undefined) delete up.contactNumber;

    const updated = await this.employeeModel.findByIdAndUpdate(
      id,
      { $set: up },
      { new: true },
    ).populate("role");

    if (!updated) throw new NotFoundException("Không tìm thấy nhân viên");
    return updated;
  }

  async softDelete(id: string) {
    const doc: any = await this.employeeModel.findById(id);
    if (!doc) throw new NotFoundException("Không tìm thấy nhân viên");
    if (typeof doc.softDelete !== "function") {
      doc.isDeleted = true;
      doc.deletedAt = new Date();
      await doc.save();
    } else {
      await doc.softDelete();
    }
    return { success: true, message: "Đã xóa" };
  }

  async findDeleted(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter = { isDeleted: true };

    const [rawDocs, totalCount] = await Promise.all([
      this.employeeModel.collection.find(filter).skip(skip).limit(limit).toArray(),
      this.employeeModel.collection.countDocuments(filter),
    ]);

    const populated = await this.employeeModel.populate(rawDocs, [{ path: "role" }]);

    const totalPages = Math.ceil((totalCount || 0) / limit);
    return {
      data: populated,
      page,
      limit,
      totalItems: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async restore(id: string) {
    const doc: any = await this.employeeModel.findById(id);
    if (!doc) throw new NotFoundException("Không tìm thấy nhân viên");
    if (typeof doc.restore !== "function") {
      doc.isDeleted = false;
      doc.deletedAt = null;
      await doc.save();
    } else {
      await doc.restore();
    }
    return { success: true, message: "Đã khôi phục" };
  }
}
