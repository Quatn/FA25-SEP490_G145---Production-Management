import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, Min } from 'class-validator';

export class CreatePaperTypeRequestDto {
    @ApiProperty({
        example: '690f83f3af3d4ce06984814a',
        description: 'MongoDB ObjectId of the paper color this paper type belongs to',
    })
    @IsMongoId({ message: 'paperColorId must be a valid MongoDB ObjectId' })
    paperColor: string;

    @ApiProperty({
        example: 1200,
        description: 'Width of the paper in millimeters',
    })
    @IsNumber({}, { message: 'width must be a number' })
    @Min(1, { message: 'width must be greater than 0' })
    width: number;

    @ApiProperty({
        example: 200,
        description: 'Grammage of the paper (gsm – grams per square meter)',
    })
    @IsNumber({}, { message: 'grammage must be a number' })
    @Min(1, { message: 'grammage must be greater than 0' })
    grammage: number;

}
