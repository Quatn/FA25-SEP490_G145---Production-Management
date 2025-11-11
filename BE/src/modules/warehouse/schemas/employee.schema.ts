import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class Employee extends BaseSchema {
    @Prop({ required: true })
    code: string;

    @Prop({ required: true })
    name: string;

}

export type EmployeeDocument = HydratedDocument<Employee>;

export const EmployeeSchema = SchemaFactory.createForClass(Employee).plugin(
    softDeletePlugin,
);
