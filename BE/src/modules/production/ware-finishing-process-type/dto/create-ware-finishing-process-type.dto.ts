import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class CreateWareFinishingProcessTypeDto {
	@ApiProperty({ example: 'WF', description: 'Unique code of the finishing process type' })
	@IsString()
	@Matches(/^[A-Z]{2,10}$/, {
		message: 'Code can only contain from 2 to 10 letters'
	})
	code: string;

	@ApiProperty({ example: 'Dán mép', description: 'Name of the finishing process type' })
	@IsString()
	@Matches(/^(?!.* {2})[A-Za-zÀ-Ỹà-ỹ ]{2,10}$/, {
		message: 'Name can only contain between 2 and 10 letters; no more than 2 spaces between characters'
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