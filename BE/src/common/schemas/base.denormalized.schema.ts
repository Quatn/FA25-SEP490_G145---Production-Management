import { Prop, Schema } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import { ApiProperty } from "@nestjs/swagger";

@Schema()
export class BaseDenormalizedSchema extends BaseSchema {
  @ApiProperty()
  @Prop({ default: true })
  recalculateFlag: boolean = true;
}
