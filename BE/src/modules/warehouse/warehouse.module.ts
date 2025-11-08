import { Module } from '@nestjs/common';
import { PaperSupplierModule } from './paper-supplier/paper-supplier.module';
import { PaperColorModule } from './paper-color/paper-color.module';

@Module({
  imports: [PaperSupplierModule, PaperColorModule]
})
export class WarehouseModule {}
