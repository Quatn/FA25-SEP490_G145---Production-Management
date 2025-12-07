// production/delivery-note/delivery-note.service.ts
import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DeliveryNote } from './../schemas/delivery-note.schema';
import { CreateDeliveryNoteDto } from './dto/create-delivery-note.dto';
import { PurchaseOrderItem } from '../schemas/purchase-order-item.schema';


@Injectable()
export class DeliveryNoteService {
    private readonly logger = new Logger(DeliveryNoteService.name);
    private readonly MAX_RETRIES = 6;

    constructor(
        @InjectModel(DeliveryNote.name) private readonly deliveryNoteModel: Model<DeliveryNote>,
        @InjectModel(PurchaseOrderItem.name) private readonly poItemModel: Model<PurchaseOrderItem>,
    ) { }

    private async computeNextCode(): Promise<number> {
        // find current max code
        const doc = await this.deliveryNoteModel.findOne({}, { code: 1 }).sort({ code: -1 }).lean().exec();
        const max = doc?.code ?? 0;
        return Number(max) + 1;
    }

    private normalizePoitemsArray(raw: any[]): { poitem: Types.ObjectId; deliveredAmount: number }[] {
        const out: { poitem: Types.ObjectId; deliveredAmount: number }[] = [];
        for (const entry of raw) {
            if (!entry) continue;
            if (typeof entry === 'string' || entry instanceof Types.ObjectId) {
                out.push({ poitem: new Types.ObjectId(String(entry)), deliveredAmount: 0 });
                continue;
            }
            if (entry.poitem) {
                const id = new Types.ObjectId(String(entry.poitem));
                const d = Number(entry.deliveredAmount ?? 0) || 0;
                out.push({ poitem: id, deliveredAmount: d });
                continue;
            }
            try {
                const id = new Types.ObjectId(String(entry));
                out.push({ poitem: id, deliveredAmount: 0 });
            } catch (e) {
                // skip invalid
                this.logger.warn('Skipping invalid poitem entry during normalization: ' + JSON.stringify(entry));
            }
        }
        return out;
    }

    private async getDeliveredSumsForPoItems(poItemIds: Types.ObjectId[]) {
        if (!poItemIds || poItemIds.length === 0) return new Map<string, number>();
        const pipeline: any[] = [
            { $match: { 'poitems.poitem': { $in: poItemIds }, isDeleted: false } },
            { $unwind: '$poitems' },
            { $match: { 'poitems.poitem': { $in: poItemIds } } },
            {
                $group: {
                    _id: '$poitems.poitem',
                    totalDelivered: { $sum: '$poitems.deliveredAmount' },
                },
            },
            { $project: { poitem: '$_id', totalDelivered: 1, _id: 0 } },
        ];

        const results = await this.deliveryNoteModel.aggregate(pipeline).exec();
        const map = new Map<string, number>();
        for (const r of results) map.set(String(r.poitem), Number(r.totalDelivered || 0));
        return map;
    }

    // NEW: compute remaining for a list of poitem ids
    async getRemainingForPoItems(ids: string[]) {
        const uniqueIds = Array.from(new Set((ids || []).filter(Boolean))).map((s) => new Types.ObjectId(String(s)));
        if (uniqueIds.length === 0) return {};

        // how much already delivered
        const sumsMap = await this.getDeliveredSumsForPoItems(uniqueIds);

        // fetch original amounts from PO items
        const poDocs = await this.poItemModel.find({ _id: { $in: uniqueIds } }).lean().exec();
        const result: Record<string, number> = {};
        for (const p of poDocs) {
            const idStr = String(p._id);
            const amount = Number(p.amount) || 0;
            const already = sumsMap.get(idStr) ?? 0;
            const remaining = Math.max(0, amount - already);
            result[idStr] = remaining;
        }
        // for ids not found, set 0
        for (const id of uniqueIds) {
            const s = String(id);
            if (result[s] === undefined) result[s] = 0;
        }
        return result;
    }

    async create(dto: CreateDeliveryNoteDto) {
        if (!dto.customer) {
            throw new BadRequestException('customer is required');
        }
        if (!dto.poitems || !Array.isArray(dto.poitems) || dto.poitems.length === 0) {
            throw new BadRequestException('poitems is required and must be non-empty');
        }

        const normalized = this.normalizePoitemsArray(dto.poitems);
        if (normalized.length === 0) throw new BadRequestException('No valid poitems provided');

        const uniqueIds = Array.from(new Set(normalized.map((p) => String(p.poitem)))).map((s) => new Types.ObjectId(s));

        const sumsMap = await this.getDeliveredSumsForPoItems(uniqueIds);

        const poDocs = await this.poItemModel.find({ _id: { $in: uniqueIds } }).lean().exec();
        const poMap = new Map(poDocs.map((p: any) => [String(p._id), p]));

        for (const entry of normalized) {
            const pid = String(entry.poitem);
            const po = poMap.get(pid);
            if (!po) throw new BadRequestException(`PurchaseOrderItem ${pid} not found`);
            const alreadyDelivered = sumsMap.get(pid) ?? 0;
            const remaining = (Number(po.amount) || 0) - alreadyDelivered;
            if (entry.deliveredAmount > remaining) {
                throw new BadRequestException(`Delivered amount (${entry.deliveredAmount}) exceeds remaining (${remaining}) for PO item ${pid}`);
            }
        }

        let attempt = 0;
        let lastErr: any = null;

        while (attempt < this.MAX_RETRIES) {
            attempt += 1;
            try {
                const codeToUse = dto.code ?? (await this.computeNextCode());

                const created = new this.deliveryNoteModel({
                    code: codeToUse,
                    customer: new Types.ObjectId(dto.customer),
                    poitems: normalized.map((p) => ({ poitem: p.poitem, deliveredAmount: p.deliveredAmount })),
                    status: dto.status ?? 'PENDINGAPPROVAL',
                    date: dto.date ? new Date(dto.date) : new Date(),
                });

                const saved = await created.save();
                return saved;
            } catch (err: any) {
                lastErr = err;
                const isDupKey = err && (err.code === 11000 || (err.name === 'MongoError' && err.code === 11000));
                if (isDupKey) {
                    this.logger.warn(`Duplicate code detected on attempt ${attempt} — retrying`);
                    await new Promise((res) => setTimeout(res, 40 + Math.random() * 120));
                    continue;
                }
                this.logger.error('Error creating DeliveryNote', err);
                throw err;
            }
        }

        this.logger.error('Exhausted retries while creating DeliveryNote', lastErr);
        throw new InternalServerErrorException('Failed to create DeliveryNote after retries');
    }

    async findAll() {
        return this.deliveryNoteModel.find().sort({ createdAt: -1 }).lean().exec();
    }

    async findById(id: string) {
        return this.deliveryNoteModel.findById(id).lean().exec();
    }
}
