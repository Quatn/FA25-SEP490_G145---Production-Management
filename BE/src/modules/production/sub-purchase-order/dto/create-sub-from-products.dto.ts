// create-sub-from-products.dto.ts
import { Type } from "class-transformer";
import {
    IsArray,
    IsDateString,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from "class-validator";

export class CreateSubFromProductsItemDto {
    @IsMongoId()
    productId!: string;

    @IsDateString()
    deliveryDate!: string;

    @IsString()
    status!: string;
}

export class CreateSubFromProductsDto {
    @IsMongoId()
    purchaseOrderId!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSubFromProductsItemDto)
    products!: CreateSubFromProductsItemDto[];
}
