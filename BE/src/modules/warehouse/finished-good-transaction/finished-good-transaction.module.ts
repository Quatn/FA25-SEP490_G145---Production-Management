import { Module } from '@nestjs/common';
import { FinishedGoodTransactionService } from './finished-good-transaction.service';
import { FinishedGoodTransactionController } from './finished-good-transaction.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FinishedGoodTransaction, FinishedGoodTransactionSchema } from '../schemas/finished-good-transaction.schema';
import { FinishedGood, FinishedGoodSchema } from '../schemas/finished-good.schema';
import { Employee, EmployeeSchema } from '@/modules/employee/schemas/employee.schema';
import { ManufacturingOrder, ManufacturingOrderSchema } from '@/modules/production/schemas/manufacturing-order.schema';
import { PurchaseOrderItem, PurchaseOrderItemSchema } from '@/modules/production/schemas/purchase-order-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FinishedGoodTransaction.name, schema: FinishedGoodTransactionSchema },
      { name: FinishedGood.name, schema: FinishedGoodSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: ManufacturingOrder.name, schema: ManufacturingOrderSchema },
      { name: PurchaseOrderItem.name, schema: PurchaseOrderItemSchema },
    ]),
  ],
  controllers: [FinishedGoodTransactionController],
  providers: [FinishedGoodTransactionService],
})
export class FinishedGoodTransactionModule { }
