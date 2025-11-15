import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
import { SemiFinishedGoodTransactionType } from '../../enums/semi-finished-good-transaction-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateSemiFinishedGoodTransactionDto {
    @ApiProperty({
        description: 'The ID of the manufacturing order this transaction is associated with',
        type: String,
        example: '64f5c3b8e4b0f2a3c1d2e3f4',
    })
    @IsNotEmpty()
    @IsMongoId()
    manufacturingOrderId: string;

    @ApiProperty({
        description: 'Type of transaction (IMPORT or EXPORT)',
        enum: SemiFinishedGoodTransactionType,
        example: SemiFinishedGoodTransactionType.IMPORT,
    })
    @IsNotEmpty()
    @IsEnum(SemiFinishedGoodTransactionType)
    transactionType: SemiFinishedGoodTransactionType;

    @ApiProperty({
        description: 'Quantity of semi-finished good for this transaction',
        type: Number,
        example: 100,
        minimum: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiProperty({
        description: 'The ID of the employee who performs this transaction',
        type: String,
        example: '69146dd889bf8e8ca320bcff',
    })
    @IsNotEmpty()
    @IsMongoId()
    employeeId: string;

    @ApiPropertyOptional({
        description: 'Optional note for this transaction',
        type: String,
        example: 'Imported from MO-1234',
    })
    @IsOptional()
    note?: string;
}
