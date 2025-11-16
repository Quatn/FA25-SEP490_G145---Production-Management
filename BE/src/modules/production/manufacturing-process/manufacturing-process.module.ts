import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ManufacturingProcess, ManufacturingProcessSchema } from "../schemas/manufacturing-process.schema";
import { ManufacturingProcessService } from "./manufacturing-process.service";
import { ManufacturingProcessController } from "./manufacturing-process.controller";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ManufacturingProcess.name, schema: ManufacturingProcessSchema }]),
  ],
  providers: [ManufacturingProcessService],
  controllers: [ManufacturingProcessController],
  exports: [ManufacturingProcessService],
})
export class ManufacturingProcessModule {}
