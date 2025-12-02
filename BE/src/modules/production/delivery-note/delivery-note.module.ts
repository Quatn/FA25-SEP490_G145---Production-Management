// production/delivery-note/delivery-note.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeliveryNote, DeliveryNoteSchema } from './../schemas/delivery-note.schema';
import { DeliveryNoteService } from './delivery-note.service';
import { DeliveryNoteController } from './delivery-note.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliveryNote.name, schema: DeliveryNoteSchema },
    ]),
  ],
  providers: [DeliveryNoteService],
  controllers: [DeliveryNoteController],
  exports: [DeliveryNoteService],
})
export class DeliveryNoteModule { }
