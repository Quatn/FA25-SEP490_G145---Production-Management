import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Ware, WareSchema } from "../schemas/ware.schema";
import { WareService } from "./ware.service";
import { WareController } from "./ware.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Ware.name,
        schema: WareSchema,
      },
    ]),
  ],
  controllers: [WareController],
  providers: [WareService],
  exports: [MongooseModule, WareService],
})
export class WareModule {}

