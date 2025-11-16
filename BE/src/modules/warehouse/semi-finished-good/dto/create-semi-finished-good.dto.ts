import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsMongoId, IsNumber } from 'class-validator';

export class CreateSemiFinishedGoodDto {
    @ApiProperty({
        description: 'The ID of the manufacturing order this semi-finished good belongs to',
        type: String,
        example: '690ffc4630c354a12e61f679',
    })
    @IsNotEmpty()
    @IsMongoId()
    manufacturingOrderId: string;

    @ApiProperty({
        description: 'Current quantity of the semi-finished good',
        type: Number,
        example: 0,
        default: 0,
    })
    @IsOptional()
    @IsNumber()
    currentQuantity?: number = 0;

    @ApiProperty({
        description: 'Optional note for the semi-finished good',
        type: String,
        example: 'Initial batch from MO-1234',
    })
    @IsOptional()
    note?: string;
}
