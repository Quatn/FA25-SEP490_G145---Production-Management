import { Prop, Schema } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class BaseSchema {
  @Prop({ default: false })
  isDeleted: boolean;
}
