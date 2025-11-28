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
import { IntersectionType } from "@nestjs/mapped-types";
import {
  CorrugatorLine,
  ManufacturingOrderDirectives,
} from "../../schemas/manufacturing-order.schema";

export class CreateManufacturingOrderRequestDtoInfoFields {
  @ApiProperty({
    description:
      "Id of the PO Item the order attachs with, must be unique since an PO Item can only be used to create one order",
  })
  @IsMongoId()
  purchaseOrderItemId: mongoose.Types.ObjectId;
}

export class CreateManufacturingOrderRequestDtoFormFields {
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
  corrugatorLineAdjustment?: CorrugatorLine | null;

  @ApiProperty()
  @IsOptional()
  manufacturingDirective?: ManufacturingOrderDirectives | null;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  note: string = "";
}

export class CreateManufacturingOrderRequestDto extends IntersectionType(
  CreateManufacturingOrderRequestDtoInfoFields,
  CreateManufacturingOrderRequestDtoFormFields,
) { }

export class AssembledCreateManufacturingOrderRequestDto extends CreateManufacturingOrderRequestDto {
  purchaseOrderItem: FullDetailPurchaseOrderItemDto;
}
