import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Employee } from "./schemas/employee.schema";
import mongoose, { Model } from "mongoose";

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Employee.name) private readonly userModel: Model<Employee>,
  ) { }

  async findAll() {
    return await this.userModel.find();
  }

  async findById(id: mongoose.Types.ObjectId) {
    return await this.userModel.findById(id);
  }

  async findByCode(code: string) {
    return await this.userModel.findOne({ code });
  }
}
