import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Employee } from "@/modules/employee/schemas/employee.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import mongoose, { HydratedDocument } from "mongoose";
import { AccessPrivilege } from "./access-privilege.schema";

export enum UserRole {
  Admin = "admin",
  Guest = "guest",
}

@Schema({ timestamps: true })
export class User extends BaseSchema {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  username: string;

  // Should be encrypted before saving, although there's currently no way to enforce that
  @ApiProperty()
  @Prop({ required: true })
  password: string;

  @ApiProperty()
  @Prop({
    required: true,
    unique: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Employee.name,
  })
  employee: mongoose.Types.ObjectId | Employee;

  @ApiProperty()
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: AccessPrivilege.name,
      },
    ],
  })
  accessPrivileges: mongoose.Types.ObjectId[] | AccessPrivilege[];
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User).plugin(
  softDeletePlugin,
);
