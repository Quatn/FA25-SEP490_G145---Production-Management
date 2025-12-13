import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';
export class CreateProductTypeDto {
    @ApiProperty({ example: 'BO', description: 'Unique code of the product type' })
    @IsString()
    @Matches(/^[A-Z0-9]{2,10}$/, {
        message: 'Code can only contain from 2 to 20 letters or numbers'
    })
    code: string;

    @ApiProperty({ example: 'Bộ', description: 'Name of the product type' })
    @IsString()
    @Matches(/^(?!.* {2})[A-Za-zÀ-Ỹà-ỹ0-9 ]{2,20}$/, {
        message: 'Name can only contain between 2 and 20 letters; no more than 2 spaces between characters'
    })
    name: string;

    @ApiProperty({ example: '', description: 'Optional description', required: false })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({ example: '', description: 'Optional note', required: false })
    @IsOptional()
    @IsString()
    note: string;
}
