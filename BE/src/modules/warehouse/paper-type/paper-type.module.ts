import { Module } from '@nestjs/common';
import { PaperTypeController } from './paper-type.controller';
import { PaperTypeService } from './paper-type.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PaperType, PaperTypeSchema } from '../schemas/paper-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaperType.name, schema: PaperTypeSchema },
    ]),
  ],
  controllers: [PaperTypeController],
  providers: [PaperTypeService],
  exports: [PaperTypeService],
})
export class PaperTypeModule { }
