import { Module } from '@nestjs/common';
import { FluteCombinationService } from './flute-combination.service';
import { FluteCombinationController } from './flute-combination.controller';
import { FluteCombination, FluteCombinationSchema } from '../schemas/flute-combination.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FluteCombination.name, schema: FluteCombinationSchema },
    ]),
  ],
  controllers: [FluteCombinationController],
  providers: [FluteCombinationService],
  exports: [FluteCombinationService],
})
export class FluteCombinationModule { }
