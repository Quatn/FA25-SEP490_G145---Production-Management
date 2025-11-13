// src/modules/production/corrugator-process/corrugator-process.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CorrugatorProcessController } from './corrugator-process.controller';
import { CorrugatorProcessService } from './corrugator-process.service';
import { CorrugatorProcess, CorrugatorProcessSchema } from './schemas/corrugator-process.schema';
import { ManufacturingOrder, ManufacturingOrderSchema } from '@/modules/production/manufacturing-order/schemas/manufacturing-order.schema';
import { ManufacturingOrderProcess, ManufacturingOrderProcessSchema } from '../production/manufacturing-order-process/schemas/manufacturing-order-process.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      // 1. Đăng ký schema của module này
      { name: CorrugatorProcess.name, schema: CorrugatorProcessSchema },
      
      // 2. Import schema MO để Service có thể cập nhật trạng thái MO
      { name: ManufacturingOrder.name, schema: ManufacturingOrderSchema },
      { name: ManufacturingOrderProcess.name, schema: ManufacturingOrderProcessSchema },
    ]),
  ],
  controllers: [CorrugatorProcessController],
  providers: [CorrugatorProcessService],
  exports: [CorrugatorProcessService] // Export service nếu module khác cần
})
export class CorrugatorProcessModule {}