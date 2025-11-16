import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateFinishedGoodDto {
    @ApiProperty({
        description: 'The ID of the manufacturing order this finished good belongs to',
        type: String,
        example: '690ffc4630c354a12e61f679',
    })
    @IsNotEmpty()
    @IsMongoId()
    manufacturingOrderId: string;

    @ApiProperty({
        description: 'Current quantity of the finished good',
        type: Number,
        example: 0,
        default: 0,
    })
    @IsOptional()
    @IsNumber()
    currentQuantity?: number = 0;

    @ApiProperty({
        description: 'Optional note for the finished good',
        type: String,
        example: 'Initial batch from MO-1234',
    })
    @IsOptional()
    note?: string;
}
