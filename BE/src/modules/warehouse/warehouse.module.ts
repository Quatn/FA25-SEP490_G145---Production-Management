import { Module } from '@nestjs/common';
import { PaperSupplierModule } from './paper-supplier/paper-supplier.module';

@Module({
  imports: [PaperSupplierModule]
})
export class WarehouseModule {}
