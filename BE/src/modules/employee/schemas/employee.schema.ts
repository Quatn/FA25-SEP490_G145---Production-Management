import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import mongoose, { HydratedDocument } from "mongoose";
import { Role } from "./role.schema";

@Schema({ timestamps: true })
export class Employee extends BaseSchema {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;

  @ApiProperty()
  @Prop({ required: true })
  @IsString()
  name: string;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  address: string | null;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  email: string | null;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  contactNumber: string | null;

  @ApiProperty()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Role.name,
  })
  role: mongoose.Types.ObjectId | Role;

  @ApiProperty()
  @Prop({ required: false, default: "" })
  @IsOptional()
  @IsString()
  note: string = "";
}

export type EmployeeDocument = HydratedDocument<Employee>;

export const EmployeeSchema = SchemaFactory.createForClass(Employee).plugin(
  softDeletePlugin,
);

