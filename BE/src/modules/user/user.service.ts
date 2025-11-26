import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schemas/user.schema";
import mongoose, { Model } from "mongoose";
import { Employee } from "../employee/schemas/employee.schema";
import { CreateUserRequestDto } from "./dto/create-user.dto";
import { CreateResult } from "@/common/dto/create-result.dto";
import { CryptoService } from "@/common/services/crypto.service";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
    private cryptoService: CryptoService,
  ) { }

  async findAll() {
    return await this.userModel.find();
  }

  async findByCode(code: string) {
    return await this.userModel.findOne({ code });
  }

  async findByEmployeeId(emplId: mongoose.Types.ObjectId) {
    return await this.userModel.findOne({ employee: emplId });
  }

  async createOne(
    dto: CreateUserRequestDto,
  ): Promise<CreateResult<{ code: string }>> {
    const empl = await this.employeeModel.findById(dto.employee);
    if (!empl) {
      throw new BadRequestException(
        `Employee with id ${dto.employee.toHexString()} does not exist.`,
      );
    }

    const codeDup = await this.findByCode(dto.code);
    if (codeDup) {
      throw new BadRequestException(`Duplicate code: ${dto.code}.`);
    }

    const employeeDup = await this.findByEmployeeId(dto.employee);
    if (employeeDup) {
      throw new BadRequestException(
        `Employee with id "${dto.employee.toHexString()}" is aldready an user.`,
      );
    }

    const hashedPassword = await this.cryptoService.hash(dto.password);
    const user = new this.userModel({ ...dto, password: hashedPassword });
    const res = await user.save();

    return {
      requestedAmount: 1,
      createdAmount: 1,
      echo: {
        code: res.code,
      },
    };
  }
}
