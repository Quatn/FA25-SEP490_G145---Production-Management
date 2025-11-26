import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { ManufacturingOrder } from "@/modules/production/schemas/manufacturing-order.schema";
import { CurrentStatusType } from "../enums/finished-good-type.enum";

@Schema({ timestamps: true })
export class FinishedGood extends BaseSchema {
    _id: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ManufacturingOrder.name, required: true })
    manufacturingOrder: mongoose.Types.ObjectId | ManufacturingOrder;

    @Prop({ required: true, default: 0 })
    importedQuantity: number;

    @Prop({ required: true, default: 0 })
    exportedQuantity: number;

    @Prop({ required: true, default: 0 })
    currentQuantity: number;

    @Prop({ required: false })
    note: string;

    @Prop({required: false})
    currentStatus: CurrentStatusType;
}

export type FinishedGoodDocument = HydratedDocument<FinishedGood>;

export const FinishedGoodSchema = SchemaFactory.createForClass(FinishedGood).plugin(
    softDeletePlugin,
);
