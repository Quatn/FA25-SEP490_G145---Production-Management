import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { TransactionType } from "../enums/transaction-type.enum";
import { FinishedGood } from "./finished-good.schema";
import { Employee } from "@/modules/employee/schemas/employee.schema";

@Schema({ timestamps: true })
export class FinishedGoodTransaction extends BaseSchema {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: FinishedGood.name, required: true })
    finishedGood: mongoose.Types.ObjectId | FinishedGood;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name, required: true })
    employee: mongoose.Types.ObjectId | Employee;

    @Prop({
        type: String,
        enum: Object.values(TransactionType),
        required: true,
    })
    transactionType: TransactionType;

    @Prop({ required: true })
    initialQuantity: number;

    @Prop({ required: true })
    finalQuantity: number;

    @Prop({ required: false })
    note: string;

    createdAt: string;
}

export type FinishedGoodTransactionDocument = HydratedDocument<FinishedGoodTransaction>;

export const FinishedGoodTransactionSchema = SchemaFactory.createForClass(FinishedGoodTransaction).plugin(
    softDeletePlugin,
);
