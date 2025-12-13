// production/delivery-note/delivery-note.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeliveryNote, DeliveryNoteSchema } from './../schemas/delivery-note.schema';
import { DeliveryNoteService } from './delivery-note.service';
import { DeliveryNoteController } from './delivery-note.controller';
import { PurchaseOrderItem, PurchaseOrderItemSchema } from '../schemas/purchase-order-item.schema';
import { Customer, CustomerSchema } from '../schemas/customer.schema';
import { FinishedGood, FinishedGoodSchema } from '@/modules/warehouse/schemas/finished-good.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliveryNote.name, schema: DeliveryNoteSchema },
      { name: PurchaseOrderItem.name, schema: PurchaseOrderItemSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: FinishedGood.name, schema: FinishedGoodSchema },
    ]),
  ],
  providers: [DeliveryNoteService],
  controllers: [DeliveryNoteController],
  exports: [DeliveryNoteService],
})
export class DeliveryNoteModule { }
