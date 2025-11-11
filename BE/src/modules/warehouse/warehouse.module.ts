import { Module } from '@nestjs/common';
import { PaperSupplierModule } from './paper-supplier/paper-supplier.module';
import { PaperColorModule } from './paper-color/paper-color.module';
import { PaperTypeModule } from './paper-type/paper-type.module';
import { PaperRollModule } from './paper-roll/paper-roll.module';

@Module({
  imports: [PaperSupplierModule, PaperColorModule, PaperTypeModule, PaperRollModule]
})
export class WarehouseModule {}
