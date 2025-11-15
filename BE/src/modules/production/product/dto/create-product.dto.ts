import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsMongoId,
} from "class-validator";

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  customer: string;

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

  @ApiProperty({ description: "ProductType ObjectId" })
  @IsMongoId()
  @IsNotEmpty()
  productType: string;

  @ApiProperty({ type: [String], description: "Array of Ware ObjectIds" })
  @IsArray()
  @IsMongoId({ each: true })
  wares: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
