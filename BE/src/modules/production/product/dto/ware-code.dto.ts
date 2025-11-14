import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import {
  WareUsageType,
  WareManufacturingProcessType,
} from "../../schemas/ware.schema";

export class WareCodeDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  wareCode: string;

  //Sẽ xử lý ref sau
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerCode: string;

  @ApiProperty({ description: "Sóng", example: "5C, 7CBE..." })
  @IsString()
  @IsNotEmpty()
  fluteCombination: string;

  @ApiProperty({ description: "Rộng" })
  @IsNumber()
  wareLength: number;

  @ApiProperty({ description: "Dài" })
  @IsNumber()
  wareWidth: number;

  @ApiProperty({ description: "Cao", required: false })
  @IsOptional()
  @IsNumber()
  wareHeight?: number;

  @ApiProperty({ description: "Khổ giấy" })
  @IsNumber()
  paperWidth: number;

  @ApiProperty({ enum: WareManufacturingProcessType, description: "Kiểu gia công" })
  @IsEnum(WareManufacturingProcessType)
  processingType: WareManufacturingProcessType;

  @ApiProperty({ enum: WareUsageType, description: "Loại" })
  @IsEnum(WareUsageType)
  wareUsageType: WareUsageType;
}
