// src/modules/warehouse/paper-roll-transaction/dto/update-paper-roll-transaction.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePaperRollTransactionDto } from './create-paper-roll-transaction.dto';

export class UpdatePaperRollTransactionDto extends PartialType(CreatePaperRollTransactionDto) {}
