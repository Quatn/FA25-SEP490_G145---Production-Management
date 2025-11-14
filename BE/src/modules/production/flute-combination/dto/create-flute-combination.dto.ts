import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
export class CreateFluteCombinationDto {
    @ApiProperty({ example: '3B', description: 'Unique code of the flute combination' })
    @IsString()
    @Length(1, 10, { message: 'Code must be between 1 and 10 characters' })
    code: string;

    @ApiProperty({ example: 'Single Wall - B Flute (3 layers)', description: 'Optional description', required: false })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({ example: 'Loại phổ biến cho thùng carton tiêu chuẩn.', description: 'Optional note', required: false })
    @IsOptional()
    @IsString()
    note: string;
}
