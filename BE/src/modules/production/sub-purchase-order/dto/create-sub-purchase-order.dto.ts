// sub-purchase-order/dto/create-sub-purchase-order.dto.ts
import { IsDateString, IsEnum, IsMongoId, IsOptional, IsString } from "class-validator";
import { SubPurchaseOrderStatus } from "@/modules/production/schemas/sub-purchase-order.schema";

export class CreateSubPurchaseOrderDto {
  @IsString()
  code!: string;

  @IsMongoId()
  purchaseOrder!: string;

  @IsMongoId()
  product!: string;

  @IsDateString()
  deliveryDate!: string;

  @IsEnum(SubPurchaseOrderStatus)
  status!: SubPurchaseOrderStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
