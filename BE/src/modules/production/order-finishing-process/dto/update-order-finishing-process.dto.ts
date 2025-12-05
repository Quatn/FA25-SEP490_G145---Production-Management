import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateOrderFinishingProcessDto } from './create-order-finishing-process.dto';
import { IsDateString, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateOrderFinishingProcessDto extends PartialType(CreateOrderFinishingProcessDto) {
    @ApiProperty({
        description: 'The ID of the employee who performs this operation',
        type: String,
        example: '6926c834c0637050c69dc2a3',
    })
    @IsNotEmpty()
    @IsMongoId()
    @IsOptional()
    employee?: string;

    @ApiProperty({
        description: 'Date of starting the operation',
        type: 'string',
        example: '',
    })
    @IsNotEmpty()
    @IsDateString()
    @IsOptional()
    startedAt?: Date;

    @ApiProperty({
        description: 'Date of completing the operation',
        type: 'string',
        example: '',
    })
    @IsNotEmpty()
    @IsDateString()
    @IsOptional()
    completedAt?: Date;
}
