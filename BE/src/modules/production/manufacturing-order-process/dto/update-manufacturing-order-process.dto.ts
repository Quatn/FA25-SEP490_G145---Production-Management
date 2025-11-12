import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ProcessStatus } from '../schemas/manufacturing-order-process.schema';

export class UpdateManufacturingOrderProcessDto {
  @ApiProperty({
    example: 'RUNNING',
    description: 'Trạng thái mới của công đoạn',
    enum: ProcessStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProcessStatus)
  status?: ProcessStatus;

  @ApiProperty({
    example: 100,
    description: 'Số lượng mới đã sản xuất',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  manufacturedAmount?: number;
}