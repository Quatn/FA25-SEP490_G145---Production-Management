import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class PaperSequenceNumber {
    @Prop({ required: true, default: 0 })
    currentSequence: number;
}

export type PaperSequenceNumberDocument = HydratedDocument<PaperSequenceNumber>;
export const PaperSequenceNumberSchema = SchemaFactory.createForClass(PaperSequenceNumber);
