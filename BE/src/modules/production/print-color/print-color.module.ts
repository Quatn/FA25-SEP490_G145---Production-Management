// src/modules/print-color/print-color.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PrintColor, PrintColorSchema } from "../schemas/print-color.schema";
import { PrintColorService } from "./print-color.service";
import { PrintColorController } from "./print-color.controller";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PrintColor.name, schema: PrintColorSchema }]),
  ],
  providers: [PrintColorService],
  controllers: [PrintColorController],
  exports: [PrintColorService],
})
export class PrintColorModule { }
