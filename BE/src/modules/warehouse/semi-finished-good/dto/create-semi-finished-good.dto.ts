import { ApiProperty} from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsMongoId, IsNumber } from 'class-validator';

export class CreateSemiFinishedGoodDto {
    @ApiProperty({
        description: 'The ID of the manufacturing order this semi-finished good belongs to',
        type: String,
        example: '690ffc4630c354a12e61f679',
    })
    @IsNotEmpty()
    @IsMongoId()
    manufacturingOrder: string;

    @ApiProperty({
        description: 'Imported quantity of the semi - finished good',
        type: Number,
        example: 0,
        default: 0,
    })
    @IsOptional()
    @IsNumber()
    importedQuantity?: number = 0;

    @ApiProperty({
        description: 'Optional export to for the semi-finished good',
        type: String,
        example: 'GHIM DAN',
    })
    @IsOptional()
    exportedTo?: string;

    @ApiProperty({
        description: 'Optional note for the semi-finished good',
        type: String,
        example: 'Initial batch from MO-1234',
    })
    @IsOptional()
    note?: string;


}
