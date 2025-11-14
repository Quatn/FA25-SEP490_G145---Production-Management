import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, IsNumber, IsDateString, IsString, Min, ValidateNested } from 'class-validator';

export class CreatePaperRollDto {
    @ApiProperty({
        example: '690f75f5e7115610c1866f93',
        description: 'MongoDB ObjectId of the paper supplier',
    })
    @IsMongoId({ message: 'paperSupplierId must be a valid MongoDB ObjectId' })
    paperSupplierId: string;

    @ApiProperty({
        example: '6912f310cb595e272bb037d0',
        description: 'MongoDB ObjectId of the paper type',
    })
    @IsMongoId({ message: 'paperTypeId must be a valid MongoDB ObjectId' })
    paperTypeId: string;

    // @ApiProperty({
    //     example: 1,
    //     description: 'Sequence number of the paper roll',
    // })
    // @IsNumber({}, { message: 'sequenceNumber must be a number' })
    // @Min(1, { message: 'sequenceNumber must be greater than 0' })
    // sequenceNumber: number;

    @ApiProperty({
        example: 1000,
        description: 'Weight of the paper roll in kilograms',
    })
    @IsNumber({}, { message: 'weight must be a number' })
    @Min(1, { message: 'weight must be greater than 0' })
    weight: number;

    @ApiProperty({
        example: '2025-11-11',
        description: 'Date when the paper roll was received',
    })
    @IsDateString({}, { message: 'receivingDate must be a valid ISO date string' })
    receivingDate: string;

    @ApiProperty({
        example: 'First batch of rolls for production line 1',
        description: 'Notes or remarks about this paper roll',
    })
    @IsString({ message: 'note must be a string' })
    note: string;
}

export class CreateMultiplePaperRollDto {
  @ApiProperty({ type: [CreatePaperRollDto], description: 'List of paper rolls to create' })
  @ValidateNested({ each: true })
  @Type(() => CreatePaperRollDto)
  rolls: CreatePaperRollDto[];
}