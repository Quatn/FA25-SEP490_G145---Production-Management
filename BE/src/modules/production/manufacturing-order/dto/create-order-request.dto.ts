import { ApiProperty } from "@nestjs/swagger";
import {
  IsDate,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import mongoose from "mongoose";
import { FullDetailPurchaseOrderItemDto } from "../../purchase-order-item/dto/full-details-orders.dto";

export class CreateManufacturingOrderRequestDto {
  @ApiProperty({
    example: "TA-ĐH 03-01-01",
    description:
      "Code of the PO Item the order attachs with, must be unique since an PO Item can only be used to create one order",
  })
  @IsMongoId()
  purchaseOrderItemId: mongoose.Types.ObjectId;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  manufacturingDateAdjustment: Date | null;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  requestedDatetime: Date | null;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  corrugatorLineAdjustment: number | null;

  @ApiProperty({ example: "", description: "Add desc later" })
  @IsOptional()
  @IsString()
  manufacturingDirective: string | null;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  note: string = "";
}

export class AssembledCreateManufacturingOrderRequestDto extends CreateManufacturingOrderRequestDto {
  purchaseOrderItem: FullDetailPurchaseOrderItemDto;
}
