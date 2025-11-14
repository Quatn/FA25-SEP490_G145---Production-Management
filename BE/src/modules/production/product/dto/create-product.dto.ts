import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsMongoId,
} from "class-validator";
import { ProductType } from "../../schemas/product.schema";

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

  @ApiProperty({ type: [String], description: "Array of Ware ObjectIds" })
  @IsArray()
  @IsMongoId({ each: true })
  wareCodes: string[];
}
