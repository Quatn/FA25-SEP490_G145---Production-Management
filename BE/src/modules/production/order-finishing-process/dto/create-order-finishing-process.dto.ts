import { ApiProperty } from '@nestjs/swagger';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsMongoId,
    Min,
} from 'class-validator';
import { OrderFinishingProcessStatus } from '../../schemas/order-finishing-process.schema';
export class CreateOrderFinishingProcessDto {
    @ApiProperty({
        example: 'OFP-001',
        description: 'Unique code of the order finishing process',
    })
    @IsString()
    @IsNotEmpty({ message: 'Code is required' })
    code: string;

    @ApiProperty({
        example: '674ac8f62f9d1b345678abcd',
        description: 'Manufacturing Order ID (MongoDB ObjectId)',
        required: false,
    })
    @IsOptional()
    @IsMongoId({ message: 'manufacturingOrder must be a valid Mongo Id' })
    manufacturingOrder?: string;

    /** Deprecated but still required in schema */
    @ApiProperty({
        example: '674ac8f62f9d1b345678abce',
        description:
            'Ware Finishing Process Type ID (MongoDB ObjectId). Deprecated, but still accepted.',
        required: false,
    })
    @IsOptional()
    @IsMongoId({ message: 'WareFinishingProcessType must be a valid Mongo Id' })
    wareFinishingProcessType?: string;

    @ApiProperty({
        example: 1,
        description: 'Sequence number (unique per manufacturing order)',
    })
    @IsNumber({}, { message: 'sequenceNumber must be a number' })
    @Min(1, { message: 'sequenceNumber must be at least 1' })
    sequenceNumber: number;

    @ApiProperty({
        example: 0,
        description: 'Completed amount (defaults to 0)',
        required: false,
    })
    @IsOptional()
    @IsNumber({}, { message: 'completedAmount must be a number' })
    @Min(0, { message: 'completedAmount cannot be negative' })
    completedAmount?: number;

    @ApiProperty({
        example: OrderFinishingProcessStatus.PendingApproval,
        enum: OrderFinishingProcessStatus,
        default: OrderFinishingProcessStatus.PendingApproval,
        description: 'Current processing status',
    })
    @IsEnum(OrderFinishingProcessStatus, {
        message: `Status must be one of: ${Object.values(OrderFinishingProcessStatus).join(', ')}`,
    })
    status: OrderFinishingProcessStatus;

    @ApiProperty({
        example: 'Requires urgent processing',
        description: 'Optional note',
        required: false,
    })
    @IsOptional()
    @IsString()
    note?: string;
}
