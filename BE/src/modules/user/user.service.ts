import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schemas/user.schema";
import { Model } from "mongoose";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

  async findAll() {
    return await this.userModel.find();
  }

  async findByUsername(username: string) {
    return await this.userModel.findOne({ username });
  }
}
