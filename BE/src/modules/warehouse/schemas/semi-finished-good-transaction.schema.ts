import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { SemiFinishedGood } from "./semi-finished-good.schema";
import { TransactionType } from "../enums/transaction-type.enum";
import { Employee } from "@/modules/employee/schemas/employee.schema";

@Schema({ timestamps: true })
export class SemiFinishedGoodTransaction extends BaseSchema {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: SemiFinishedGood.name, required: true })
    semiFinishedGood: mongoose.Types.ObjectId | SemiFinishedGood;

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

    @Prop({ required: true })
    transactionDate: Date;

    @Prop({ required: false })
    note?: string;

    createdAt: Date;
    updatedAt: Date;
}

export type SemiFinishedGoodTransactionDocument = HydratedDocument<SemiFinishedGoodTransaction>;

export const SemiFinishedGoodTransactionSchema = SchemaFactory.createForClass(SemiFinishedGoodTransaction).plugin(
    softDeletePlugin,
);
