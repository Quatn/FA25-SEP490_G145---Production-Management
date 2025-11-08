import { Prop, Schema } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";

@Schema()
export class BaseDenormalizedSchema extends BaseSchema {
  @Prop({ default: true })
  recalculateFlag: boolean = true;
}
