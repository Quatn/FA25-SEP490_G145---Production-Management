import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SemiFinishedGoodTransactionService } from './semi-finished-good-transaction.service';
import { SemiFinishedGoodTransactionController } from './semi-finished-good-transaction.controller';
import { SemiFinishedGoodTransaction, SemiFinishedGoodTransactionSchema } from '../schemas/semi-finished-good-transaction.schema';
import { SemiFinishedGood, SemiFinishedGoodSchema } from '../schemas/semi-finished-good.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SemiFinishedGoodTransaction.name, schema: SemiFinishedGoodTransactionSchema },
      { name: SemiFinishedGood.name, schema: SemiFinishedGoodSchema },
    ]),
  ],
  controllers: [SemiFinishedGoodTransactionController],
  providers: [SemiFinishedGoodTransactionService],
})
export class SemiFinishedGoodTransactionModule {}
