import { Module } from '@nestjs/common';
import { OrderFinishingProcessService } from './order-finishing-process.service';
import { OrderFinishingProcessController } from './order-finishing-process.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderFinishingProcess, OrderFinishingProcessSchema } from '../schemas/order-finishing-process.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderFinishingProcess.name, schema: OrderFinishingProcessSchema },
    ]),
  ],
  controllers: [OrderFinishingProcessController],
  providers: [OrderFinishingProcessService],
  exports: [OrderFinishingProcessService],
})
export class OrderFinishingProcessModule { }
