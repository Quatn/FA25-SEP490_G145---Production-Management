import { Module } from '@nestjs/common';
import { WareManufacturingProcessTypeService } from './ware-manufacturing-process-type.service';
import { WareManufacturingProcessTypeController } from './ware-manufacturing-process-type.controller';
import { WareManufacturingProcessType, WareManufacturingProcessTypeSchema } from '../schemas/ware-manufacturing-process-type.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WareManufacturingProcessType.name, schema: WareManufacturingProcessTypeSchema },
    ]),
  ],
  controllers: [WareManufacturingProcessTypeController],
  providers: [WareManufacturingProcessTypeService],
  exports: [WareManufacturingProcessTypeService],
})
export class WareManufacturingProcessTypeModule {}
