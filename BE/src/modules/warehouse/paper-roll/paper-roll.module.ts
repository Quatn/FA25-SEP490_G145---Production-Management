import { Module } from '@nestjs/common';
import { PaperRollService } from './paper-roll.service';
import { PaperRollController } from './paper-roll.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PaperRoll, PaperRollSchema } from '../schemas/paper-roll.schema';
import { PaperSequenceNumber, PaperSequenceNumberSchema } from '../schemas/paper-sequence-number.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaperRoll.name, schema: PaperRollSchema },
      { name: PaperSequenceNumber.name, schema: PaperSequenceNumberSchema },
    ]),
  ],
  controllers: [PaperRollController],
  providers: [PaperRollService],
  exports: [PaperRollService],
})
export class PaperRollModule { }
