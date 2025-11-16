import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { ManufacturingOrder } from "@/modules/production/schemas/manufacturing-order.schema";

@Schema({ timestamps: true })
export class FinishedGood extends BaseSchema {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ManufacturingOrder.name, required: true })
    manufacturingOrderId: mongoose.Types.ObjectId | ManufacturingOrder;

    @Prop({ required: true, default: 0 })
    currentQuantity: number;

    @Prop({ required: false })
    note: string;

}

export type FinishedGoodDocument = HydratedDocument<FinishedGood>;

export const FinishedGoodSchema = SchemaFactory.createForClass(FinishedGood).plugin(
    softDeletePlugin,
);
