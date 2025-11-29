import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import mongoose, { HydratedDocument } from "mongoose";
import { ManufacturingOrder } from "./manufacturing-order.schema";
import { WareFinishingProcessType } from "./ware-finishing-process-type.schema";

export enum OrderFinishingProcessStatus {
  PendingApproval = "PENDINGAPPROVAL",
  Approved = "APPROVED",
  Scheduled = "SCHEDULED",
  OnHold = "ONHOLD",
  Cancelled = "CANCELLED",
  InProduction = "INPRODUCTION",
  Paused = "PAUSED",
  FinishedProduction = "FINISHEDPRODUCTION",
  QualityCheck = "QUALITYCHECK",
  Completed = "COMPLETED",
}

@Schema({ timestamps: true })
export class OrderFinishingProcess extends BaseSchema {
  @ApiProperty()
  @Prop({ required: true })
  @IsString()
  code: string;

  @ApiProperty({
    type: mongoose.Types.ObjectId,
    description: "ObjectId by default, ManufacturingOrder when populated",
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ManufacturingOrder.name,
  })
  manufacturingOrder: mongoose.Types.ObjectId | ManufacturingOrder;

  /** @deprecated this is supposed to be named wareFinishingProcessType, this will probably be corrected in the future */
  @ApiProperty({
    type: mongoose.Types.ObjectId,
    description: "ObjectId by default, WareFinishingProcessType when populated",
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: WareFinishingProcessType.name,
  })
  wareManufacturingProcessType:
    | mongoose.Types.ObjectId
    | WareFinishingProcessType;

  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  sequenceNumber: number;

  @ApiProperty()
  @Prop({ required: true, default: 0 })
  @IsNumber()
  completedAmount: number = 0;

  @ApiProperty({
    default: OrderFinishingProcessStatus.PendingApproval,
    enum: OrderFinishingProcessStatus,
  })
  @Prop({
    required: true,
    enum: OrderFinishingProcessStatus,
    default: OrderFinishingProcessStatus.PendingApproval,
  })
  @IsEnum(OrderFinishingProcessStatus)
  status: OrderFinishingProcessStatus;

  @ApiProperty()
  @Prop({ required: false, default: "" })
  @IsOptional()
  @IsString()
  note: string = "";
}

export type OrderFinishingProcessDocument =
  HydratedDocument<OrderFinishingProcess>;

export const OrderFinishingProcessSchema = SchemaFactory.createForClass(
  OrderFinishingProcess,
).plugin(softDeletePlugin);

OrderFinishingProcessSchema.index(
  { code: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

OrderFinishingProcessSchema.index(
  { manufacturingOrder: 1, sequenceNumber: 1 },
  { unique: true },
);
