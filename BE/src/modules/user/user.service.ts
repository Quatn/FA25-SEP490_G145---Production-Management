import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schemas/user.schema";
import { Model } from "mongoose";
import { Employee } from "../employee/schemas/employee.schema";
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
} from "./dto/create-user.dto";
import { CreateResult } from "@/common/dto/create-result.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
  ) { }

  async findAll() {
    return await this.userModel.find();
  }

  async findByCode(code: string) {
    return await this.userModel.findOne({ code });
  }

  async createOne(
    dto: CreateUserRequestDto,
  ): Promise<CreateResult<{ code: string }>> {
    const empl = this.employeeModel.findById(dto.employee);

    const user = new this.userModel(dto);
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
