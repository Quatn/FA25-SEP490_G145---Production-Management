import { softDeletePlugin } from '@/common/plugins/soft-delete.plugin';
import { BaseSchema } from '@/common/schemas/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { HydratedDocument } from 'mongoose';


class DeliveryNotePoItem {
    @Prop({ type: Types.ObjectId, ref: 'PurchaseOrderItem', required: true })
    poitem: Types.ObjectId;


    @Prop({ type: Number, required: true, default: 0 })
    deliveredAmount: number;
}


@Schema({ timestamps: true })
export class DeliveryNote extends BaseSchema {
    @Prop({ required: true, unique: true })
    code: number;


    @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
    customer: Types.ObjectId;


    @Prop({ type: [DeliveryNotePoItem], default: [] })
    poitems: DeliveryNotePoItem[];


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