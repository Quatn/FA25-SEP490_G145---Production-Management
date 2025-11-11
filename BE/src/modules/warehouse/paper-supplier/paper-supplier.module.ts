import { Module } from '@nestjs/common';
import { PaperSupplierController } from './paper-supplier.controller';
import { PaperSupplierService } from './paper-supplier.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PaperSupplier, PaperSupplierSchema } from '../schemas/paper-supplier.schema';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: PaperSupplier.name, schema: PaperSupplierSchema },
      ]),
    ],
  controllers: [PaperSupplierController],
  providers: [PaperSupplierService],
  exports: [PaperSupplierService],
})
export class PaperSupplierModule {}
