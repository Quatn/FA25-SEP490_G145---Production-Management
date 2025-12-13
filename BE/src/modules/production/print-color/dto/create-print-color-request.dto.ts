import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class CreatePrintColorRequestDto {
  @ApiProperty({ example: 'P01', description: 'Unique code of the print color' })
  @Matches(/^[A-Z0-9]{2,10}$/, {
    message: 'Code can only contain between 2 and 10 uppercase letters or numbers',
  })
  @IsString()
  code: string;

  @ApiProperty({ example: 'CMYK BLACK', description: 'Optional description' })
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Some note', description: 'Optional note' })
  @IsString()
  note?: string;
}
