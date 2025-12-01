import { IsEnum, IsOptional, IsString, IsInt, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../../enums/transaction-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetSemiFinishedGoodTransactionsDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @ApiProperty({
        description: 'The page of this list',
        type: 'number',
        example: '1',
    })
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @ApiProperty({
        description: 'The limit per page of this list',
        type: 'number',
        example: '10',
    })
    limit?: number = 10;

    @IsString()
    @ApiProperty({
        description: 'The semi finished good object of this list',
        type: 'string',
        example: '691b6752fae6d96e57cd9550',
    })
    semiFinishedGood: string;

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

    @IsOptional()
    @IsString()
    @IsEnum(['ASC', 'DESC'])
    @ApiPropertyOptional({
        description: 'sort',
        type: 'string',
        example: 'ASC',
    })
    sort?: string = 'ASC';
}