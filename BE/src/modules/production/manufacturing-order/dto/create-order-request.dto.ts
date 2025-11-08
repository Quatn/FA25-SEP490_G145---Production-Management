import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateManufacturingOrderRequestDto {
  // TODO: change to ref
  @ApiProperty({
    example: "TA-ĐH 03-01-01",
    description:
      "Code of the PO Item the order attachs with, must be unique since an PO Item can only be used to create one order",
  })
  @IsString()
  purchaseOrderItemCode: string;


  @ApiProperty({
    example: new Date("2025-11-01"),
    description: "Date and time that the order is required to finish",
  })
  @IsOptional()
  @IsDate()
  requestedDatetime: Date;

  @ApiProperty({ example: "7", description: "Add desc later" })
  @IsNumber()
  corrugatorLine: number;

  @ApiProperty({ example: 1000, description: "Add desc later" })
  @IsNumber()
  manufacturedAmount: number;

  @ApiProperty({ example: "", description: "Add desc later" })
  @IsOptional()
  @IsString()
  manufacturingDirective: string;

  @ApiProperty({ example: 1000, description: "Add desc later" })
  @IsOptional()
  @IsString()
  note: string = "";
}
