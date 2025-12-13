import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class PaperColor extends BaseSchema {
    @Prop({ required: true, unique: true })
    code: string;

    @Prop({ required: true })
    title: string;

}

export type PaperColorDocument = HydratedDocument<PaperColor>;

export const PaperColorSchema = SchemaFactory.createForClass(PaperColor).plugin(
    softDeletePlugin,
);
