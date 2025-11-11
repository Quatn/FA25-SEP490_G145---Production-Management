import { Module } from '@nestjs/common';
import { PaperColorController } from './paper-color.controller';
import { PaperColorService } from './paper-color.service';
import { PaperColor, PaperColorSchema } from '../schemas/paper-color.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaperColor.name, schema: PaperColorSchema },
    ]),
  ],
  controllers: [PaperColorController],
  providers: [PaperColorService],
  exports: [PaperColorService],
})
export class PaperColorModule { }
