import { IntersectionType, PartialType } from "@nestjs/mapped-types";
import {
  CreateManufacturingOrderRequestDtoFormFields,
  CreateManufacturingOrderRequestDtoInfoFields,
} from "./create-order-request.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsOptional } from "class-validator";
import mongoose from "mongoose";
import {
  CorrugatorProcess,
  ManufacturingOrderApprovalStatus,
} from "../../schemas/manufacturing-order.schema";

class IdentificationFields {
  @ApiProperty({
    description: "Id of the manufacturing order",
  })
  @IsMongoId()
  id: mongoose.Types.ObjectId;

  // Not identification fields, just unique from create dto
  @IsOptional()
  @IsEnum(ManufacturingOrderApprovalStatus)
  approvalStatus?: ManufacturingOrderApprovalStatus;

  @IsOptional()
  corrugatorProcess?: Partial<CorrugatorProcess>;
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
