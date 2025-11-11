import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreatePaperColorRequestDto {
    @ApiProperty({
        example: 'T',
        description: 'Unique code of the paper color',
    })
    @IsString()
    @Length(1, 3, { message: 'Code must be between 1 and 3 characters' })
    code: string;

    @ApiProperty({
        example: 'TRẮNG',
        description: 'Full title of the paper color',
    })
    @IsString()
    @Length(2, 10, { message: 'Title must be between 2 and 10 characters' })
    title: string;

}
