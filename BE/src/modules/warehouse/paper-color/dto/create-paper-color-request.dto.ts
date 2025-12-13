import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class CreatePaperColorRequestDto {
    @ApiProperty({
        example: 'T',
        description: 'Unique code of the paper color',
    })
    @Matches(/^[A-Z0-9]{1,3}$/, {
        message: 'Code can only contain between 1 and 3 letters or numbers'
    })
    @IsString()
    code: string;

    @ApiProperty({
        example: 'TRẮNG',
        description: 'Full title of the paper color',
    })
    @IsString()
    @Matches(/^(?!.* {2})[A-ZÀ-Ỹ0-9 ]{2,10}$/, {
        message: 'Title can only contain between 2 and 10 letters or numbers; no more than 2 spaces between characters'
    })
    title: string;

}
