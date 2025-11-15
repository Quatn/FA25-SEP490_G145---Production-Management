import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdatePurchaseOrderItemDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
