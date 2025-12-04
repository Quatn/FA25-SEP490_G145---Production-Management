import { PartialType } from '@nestjs/swagger';
import { CreateOrderFinishingProcessDto } from './create-order-finishing-process.dto';

export class UpdateOrderFinishingProcessDto extends PartialType(CreateOrderFinishingProcessDto) {}
