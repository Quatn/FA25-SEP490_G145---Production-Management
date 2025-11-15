import { Module } from '@nestjs/common';
import { SemiFinishedGoodService } from './semi-finished-good.service';
import { SemiFinishedGoodController } from './semi-finished-good.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SemiFinishedGood, SemiFinishedGoodSchema } from '../schemas/semi-finished-good.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SemiFinishedGood.name, schema: SemiFinishedGoodSchema },
    ]),
  ],
  providers: [SemiFinishedGoodService],
  controllers: [SemiFinishedGoodController],
  exports: [SemiFinishedGoodService],
})
export class SemiFinishedGoodModule { }
