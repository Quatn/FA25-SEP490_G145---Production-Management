// src/modules/warehouse/paper-roll-transaction/dto/create-paper-roll-transaction.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreatePaperRollTransactionDto {
    @ApiProperty({ example: '690f75f5e7115610c1866f93', description: 'MongoDB ObjectId of the paper roll' })
    @IsMongoId({ message: 'paperRollId must be a valid MongoDB ObjectId' })
    paperRollId: string;

    @ApiProperty({ example: 'NHAP', description: 'Transaction type: NHAP | XUAT | NHAPLAI | ...' })
    @IsString()
    transactionType: string;

    @ApiProperty({ example: 1200, description: 'Initial weight before transaction' })
    @IsNumber({}, { message: 'initialWeight must be a number' })
    initialWeight: number;

    @ApiProperty({ example: 1000, description: 'Final weight after transaction' })
    @IsNumber({}, { message: 'finalWeight must be a number' })
    finalWeight: number;

    @ApiProperty({ example: '2025-11-12T08:30:00.000Z', description: 'Timestamp of the transaction (ISO string)' })
    @IsDateString({}, { message: 'timeStamp must be a valid ISO date string' })
    timeStamp: string;

    @ApiProperty({ example: 'operator-1', description: 'Name or id of the person in charge', required: false })
    @IsOptional()
    @IsString()
    inCharge?: string;

    // optional: link to employee id if you want relation
    @ApiProperty({ example: '60a7c6...', description: 'Employee id (optional)', required: false })
    @IsOptional()
    @IsString()
    employeeId?: string;
}
