import { Injectable } from "@nestjs/common";
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
}
