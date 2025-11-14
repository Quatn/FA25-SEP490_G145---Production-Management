import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class CreateWareFinishingProcessTypeDto {
	@ApiProperty({ example: 'WF', description: 'Unique code of the finishing process type' })
	@IsString()
	@Length(1, 10, { message: 'Code must be between 1 and 10 characters' })
	code: string;

	@ApiProperty({ example: 'Dán mép', description: 'Name of the finishing process type' })
	@IsString()
	@Length(1, 100, { message: 'Name must be between 1 and 100 characters' })
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