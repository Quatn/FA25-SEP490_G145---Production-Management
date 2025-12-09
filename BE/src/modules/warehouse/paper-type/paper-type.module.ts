import { Module } from '@nestjs/common';
import { PaperTypeController } from './paper-type.controller';
import { PaperTypeService } from './paper-type.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PaperType, PaperTypeSchema } from '../schemas/paper-type.schema';
import { PaperColor, PaperColorSchema } from '../schemas/paper-color.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaperType.name, schema: PaperTypeSchema },
      { name: PaperColor.name, schema: PaperColorSchema },
    ]),
  ],
  controllers: [PaperTypeController],
  providers: [PaperTypeService],
  exports: [PaperTypeService],
})
export class PaperTypeModule { }
