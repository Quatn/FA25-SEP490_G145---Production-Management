import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsOptional,
    IsString,
    IsDateString,
    Min,
    IsInt,
} from 'class-validator';
import { OrderFinishingProcessStatus } from '../../schemas/order-finishing-process.schema';
import { Type } from 'class-transformer';
export class GetOrderFinishingProcessDto {

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

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        description: 'search',
        type: 'string',
        example: '',
    })
    search?: string;

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
