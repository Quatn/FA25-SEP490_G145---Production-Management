// production/schemas/delivery-note.schema.ts
import { softDeletePlugin } from '@/common/plugins/soft-delete.plugin';
import { BaseSchema } from '@/common/schemas/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class DeliveryNote extends BaseSchema {
    @Prop({ required: true, unique: true })
    code: number;

    @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
    customer: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'PurchaseOrderItem' }], default: [] })
    poitems: Types.ObjectId[];

    @Prop({
        type: String,
        enum: ['PENDINGAPPROVAL', 'APPROVED', 'CONFIRMEDAPPROVAL'],
        default: 'PENDINGAPPROVAL',
    })
    status: string;

    @Prop({ type: Date, default: () => new Date() })
    date: Date;
}

export type DeliveryNoteDocument = HydratedDocument<DeliveryNote>;

export const DeliveryNoteSchema = SchemaFactory.createForClass(DeliveryNote);
DeliveryNoteSchema.plugin(softDeletePlugin);

// DeliveryNoteSchema.index({ code: 1 }, { unique: true });
