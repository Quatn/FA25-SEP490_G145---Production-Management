import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsDateString, IsString, Min, IsOptional } from 'class-validator';

/**
 * Update DTO for PaperRoll.
 * Make fields optional and allow weight = 0 on update (exports).
 */
export class UpdatePaperRollDto {
    @ApiPropertyOptional({
        example: '690f75f5e7115610c1866f93',
        description: 'MongoDB ObjectId of the paper supplier',
    })
    @IsOptional()
    @IsMongoId({ message: 'paperSupplierId must be a valid MongoDB ObjectId' })
    paperSupplierId?: string;

    @ApiPropertyOptional({
        example: '6912f310cb595e272bb037d0',
        description: 'MongoDB ObjectId of the paper type',
    })
    @IsOptional()
    @IsMongoId({ message: 'paperTypeId must be a valid MongoDB ObjectId' })
    paperTypeId?: string;

    @ApiPropertyOptional({
        example: 1,
        description: 'Sequence number of the paper roll',
    })
    @IsOptional()
    @IsNumber({}, { message: 'sequenceNumber must be a number' })
    @Min(1, { message: 'sequenceNumber must be greater than 0' })
    sequenceNumber?: number;

    @ApiPropertyOptional({
        example: 1000,
        description: 'Weight of the paper roll in kilograms (allow 0 on update for export)',
    })
    @IsOptional()
    @IsNumber({}, { message: 'weight must be a number' })
    @Min(0, { message: 'weight must be greater than or equal to 0' })
    weight?: number;

    @ApiPropertyOptional({
        example: '2025-11-11',
        description: 'Date when the paper roll was received',
    })
    @IsOptional()
    @IsDateString({}, { message: 'receivingDate must be a valid ISO date string' })
    receivingDate?: string;

    @ApiPropertyOptional({
        example: 'First batch of rolls for production line 1',
        description: 'Notes or remarks about this paper roll',
    })
    @IsOptional()
    @IsString({ message: 'note must be a string' })
    note?: string;
}
