import { Prop, Schema } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

@Schema()
export class BaseSchema {
  @ApiProperty()
  @Prop({ default: false })
  isDeleted: boolean = false;
}
