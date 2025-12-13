import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateWareManufacturingProcessTypeDto {
	@ApiProperty({ example: 'WP', description: 'Unique code of the manufacturing process type' })
	@IsString()
	@Matches(/^[A-Z]{2,20}$/, {
		message: 'Code can only contain from 2 to 20 letters'
	})
	code: string;

	@ApiProperty({ example: 'In hộp', description: 'Name of the manufacturing process type' })
	@IsString()
	@Matches(/^(?!.* {2})[A-Za-zÀ-Ỹà-ỹ ]{2,20}$/, {
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
