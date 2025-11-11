import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { WareCodeDto } from "./ware-code.dto";
import { ProductType } from "../schemas/product.schema";

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  productLength: number;

  @ApiProperty()
  @IsNumber()
  productWidth: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  productHeight?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ enum: ProductType })
  @IsEnum(ProductType)
  productType: ProductType;

  @ApiProperty({ type: [WareCodeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WareCodeDto)
  wareCodes: WareCodeDto[];
}
