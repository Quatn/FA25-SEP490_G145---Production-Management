import { PartialType } from '@nestjs/swagger';
import { CreateSemiFinishedGoodTransactionDto } from './create-semi-finished-good-transaction.dto';

export class UpdateSemiFinishedGoodTransactionDto extends PartialType(CreateSemiFinishedGoodTransactionDto) {}
