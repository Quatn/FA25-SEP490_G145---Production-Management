import { Module } from '@nestjs/common';
import { FinishedGoodService } from './finished-good.service';
import { FinishedGoodController } from './finished-good.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FinishedGood, FinishedGoodSchema } from '../schemas/finished-good.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FinishedGood.name, schema: FinishedGoodSchema },
    ]),
  ],
  providers: [FinishedGoodService],
  controllers: [FinishedGoodController],
  exports: [FinishedGoodService],
})
export class FinishedGoodModule { }
