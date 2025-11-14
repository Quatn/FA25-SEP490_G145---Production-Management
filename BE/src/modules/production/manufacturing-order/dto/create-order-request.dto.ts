import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";

export class CreateManufacturingOrderRequestDto {
  @ApiProperty({
    example: "TA-ĐH 03-01-01",
    description:
      "Code of the PO Item the order attachs with, must be unique since an PO Item can only be used to create one order",
  })
  @IsString()
  purchaseOrderItemCode: mongoose.Types.ObjectId;

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
  @IsOptional()
  @IsString()
  note: string = "";
}
