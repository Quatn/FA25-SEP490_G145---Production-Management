import { Module } from '@nestjs/common';
import { WareFinishingProcessTypeService } from './ware-finishing-process-type.service';
import { WareFinishingProcessTypeController } from './ware-finishing-process-type.controller';
import { WareFinishingProcessType, WareFinishingProcessTypeSchema } from '../schemas/ware-finishing-process-type.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WareFinishingProcessType.name, schema: WareFinishingProcessTypeSchema },
    ]),
  ],
  controllers: [WareFinishingProcessTypeController],
  providers: [WareFinishingProcessTypeService],
  exports: [WareFinishingProcessTypeService],
})
export class WareFinishingProcessTypeModule {}