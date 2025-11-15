import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { Employee } from "./employee.schema";
import { SemiFinishedGood } from "./semi-finished-good.schema";
import { SemiFinishedGoodTransactionType } from "../enums/semi-finished-good-transaction-type.enum";

@Schema({ timestamps: true })
export class SemiFinishedGoodTransaction extends BaseSchema {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: SemiFinishedGood.name, required: true })
    semiFinishedGoodId: mongoose.Types.ObjectId | SemiFinishedGood;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name, required: true })
    employeeId: mongoose.Types.ObjectId | Employee;

    @Prop({
        type: String,
        enum: Object.values(SemiFinishedGoodTransactionType),
        required: true,
    })
    transactionType: SemiFinishedGoodTransactionType;

    @Prop({ required: true })
    initialQuantity: number;

    @Prop({ required: true })
    finalQuantity: number;

    @Prop({ required: false })
    note: string;
}

export type SemiFinishedGoodTransactionDocument = HydratedDocument<SemiFinishedGoodTransaction>;

export const SemiFinishedGoodTransactionSchema = SchemaFactory.createForClass(SemiFinishedGoodTransaction).plugin(
    softDeletePlugin,
);
