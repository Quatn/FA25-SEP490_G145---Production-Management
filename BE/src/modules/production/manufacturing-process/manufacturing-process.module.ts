import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ManufacturingProcess,
  ManufacturingProcessSchema,
} from '../schemas/manufacturing-process.schema';
import { ManufacturingProcessService } from './manufacturing-process.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ManufacturingProcess.name, schema: ManufacturingProcessSchema },
    ]),
  ],
  providers: [ManufacturingProcessService],
  exports: [ManufacturingProcessService], // Export để các module khác có thể Inject Service này
})
export class ManufacturingProcessModule {}