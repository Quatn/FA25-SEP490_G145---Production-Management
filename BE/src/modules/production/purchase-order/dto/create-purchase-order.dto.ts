import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString, IsMongoId, IsEnum } from "class-validator";
import { PurchaseOrderStatus } from "@/modules/production/schemas/purchase-order.schema";

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: "PO-2025-0001", description: "Unique Purchase Order code" })
  @IsString()
  code: string;

  @ApiProperty({ example: "6912f310cb595e272bb037d0", description: "Customer ObjectId (optional)" })
  @IsOptional()
  @IsMongoId()
  customer?: string;

  @ApiProperty({ example: "2025-11-14", description: "Order date (ISO date string)" })
  @IsDateString()
  orderDate: string;

  @ApiProperty({ example: "Warehouse A", description: "Delivery address" })
  @IsString()
  deliveryAdress: string;

  @ApiProperty({ example: "30 days", description: "Payment terms" })
  @IsString()
  paymentTerms: string;

  @ApiProperty({ example: PurchaseOrderStatus.Draft, enum: PurchaseOrderStatus, description: "Status" })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;

  @ApiProperty({ example: "Notes...", description: "Optional note" })
  @IsOptional()
  @IsString()
  note?: string;
}
