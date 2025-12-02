import { IsEnum, IsOptional, IsString, IsInt, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../../enums/transaction-type.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetFinishedGoodDailyReportDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @ApiPropertyOptional({
        description: 'The page of this list',
        type: 'number',
        example: '1',
    })
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @ApiPropertyOptional({
        description: 'The limit per page of this list',
        type: 'number',
        example: '10',
    })
    limit?: number;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        description: 'search',
        type: 'string',
        example: '',
    })
    search?: string;

    @IsOptional()
    @IsEnum(TransactionType)
    @ApiPropertyOptional({
        description: 'transactionType',
        type: 'string',
        example: '',
    })
    transactionType?: string;

    @IsOptional()
    @IsDateString()
    @ApiPropertyOptional({
        description: 'startDate',
        type: 'string',
        example: '',
    })
    startDate?: string;

    @IsOptional()
    @IsDateString()
    @ApiPropertyOptional({
        description: 'endDate',
        type: 'string',
        example: '',
    })
    endDate?: string;

}