import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { PaperRoll } from "./paper-roll.schema";
import { Employee } from "./employee.schema";

@Schema({ timestamps: true })
export class PaperRollTransaction extends BaseSchema {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: PaperRoll.name, required: true })
    paperRollId: mongoose.Types.ObjectId | PaperRoll;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name, required: true })
    employeeId: mongoose.Types.ObjectId | Employee;

    @Prop({ required: true })
    transactionType: string;

    @Prop({ required: true })
    initialWeight: number;

    @Prop({ required: true })
    finalWeight: number;

    @Prop({ required: true })
    timeStamp: Date;

}

export type PaperRollTransactionDocument = HydratedDocument<PaperRollTransaction>;

export const PaperRollTransactionSchema = SchemaFactory.createForClass(PaperRollTransaction).plugin(
    softDeletePlugin,
);
