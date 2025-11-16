import { PartialType } from '@nestjs/swagger';
import { CreateFinishedGoodTransactionDto } from './create-finished-good-transaction.dto';

export class UpdateFinishedGoodTransactionDto extends PartialType(CreateFinishedGoodTransactionDto) {}
