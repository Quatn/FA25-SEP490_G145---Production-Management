// src/modules/warehouse/paper-roll-transaction/paper-roll-transaction.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaperRollTransactionController } from './paper-roll-transaction.controller';
import { PaperRollTransactionService } from './paper-roll-transaction.service';
import { PaperRollTransaction, PaperRollTransactionSchema } from '../schemas/paper-roll-transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaperRollTransaction.name, schema: PaperRollTransactionSchema },
    ]),
  ],
  controllers: [PaperRollTransactionController],
  providers: [PaperRollTransactionService],
  exports: [PaperRollTransactionService],
})
export class PaperRollTransactionModule { }
