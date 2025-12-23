import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsString } from "class-validator";
import mongoose from "mongoose";

export class FindFullDetailsManufacturingOrderRequestDto {
  @ApiProperty()
  @IsMongoId()
  id: mongoose.Types.ObjectId;
}
