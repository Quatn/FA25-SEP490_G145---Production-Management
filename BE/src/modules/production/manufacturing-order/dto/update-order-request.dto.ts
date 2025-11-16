import { IntersectionType, PartialType } from "@nestjs/mapped-types";
import {
  CreateManufacturingOrderRequestDtoFormFields,
  CreateManufacturingOrderRequestDtoInfoFields,
} from "./create-order-request.dto";
import { FullDetailPurchaseOrderItemDto } from "../../purchase-order-item/dto/full-details-orders.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";
import mongoose from "mongoose";

class IdentificationFields {
  @ApiProperty({
    description: "Id of the manufacturing order",
  })
  @IsMongoId()
  id: mongoose.Types.ObjectId;
}

// Makes update dto have the exact same fields as create dto, except everything is optional
export class UpdateManufacturingOrderRequestDto extends IntersectionType(
  IdentificationFields,
  CreateManufacturingOrderRequestDtoInfoFields,
  PartialType(CreateManufacturingOrderRequestDtoFormFields),
) { }

export class AssembledUpdateManufacturingOrderRequestDto extends UpdateManufacturingOrderRequestDto {
  // purchaseOrderItem: FullDetailPurchaseOrderItemDto;
}
