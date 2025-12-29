import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";
import mongoose from "mongoose";

export class CancelManufacturingOrderRequestDto {
  @ApiProperty()
  @IsMongoId()
  id: mongoose.Types.ObjectId;
}
