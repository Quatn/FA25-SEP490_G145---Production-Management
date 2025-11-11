import { Module } from '@nestjs/common';
import { SubPurchaseOrderController } from './sub-purchase-order.controller';
import { SubPurchaseOrderService } from './sub-purchase-order.service';

@Module({
  controllers: [SubPurchaseOrderController],
  providers: [SubPurchaseOrderService]
})
export class SubPurchaseOrderModule {}
