import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Employee } from "@/modules/employee/schemas/employee.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose, { HydratedDocument } from "mongoose";
import { ALL_ACCESS_PRIVILEGE_VALUES, AnyAccessPrivileges } from "@/config/access-privileges-list";

export enum UserRole {
  Admin = "admin",
  Guest = "guest",
}

@Schema({ timestamps: true })
export class User extends BaseSchema {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  code: string;

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
    type: [String],
    enum: ALL_ACCESS_PRIVILEGE_VALUES,
    required: true,
    default: [],
  })
  accessPrivileges: AnyAccessPrivileges[];
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema =
  SchemaFactory.createForClass(User).plugin(softDeletePlugin);
