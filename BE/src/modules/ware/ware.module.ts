import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Ware, WareSchema } from "./schemas/ware.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Ware.name,
        schema: WareSchema,
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class WareModule {}

