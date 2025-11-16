import { Module } from '@nestjs/common';
import { FinishedGoodTransactionService } from './finished-good-transaction.service';
import { FinishedGoodTransactionController } from './finished-good-transaction.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FinishedGoodTransaction, FinishedGoodTransactionSchema } from '../schemas/finished-good-transaction.schema';
import { FinishedGood, FinishedGoodSchema } from '../schemas/finished-good.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FinishedGoodTransaction.name, schema: FinishedGoodTransactionSchema },
      { name: FinishedGood.name, schema: FinishedGoodSchema },
    ]),
  ],
  controllers: [FinishedGoodTransactionController],
  providers: [FinishedGoodTransactionService],
})
export class FinishedGoodTransactionModule { }
