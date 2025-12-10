import { Injectable, Logger, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DeliveryNote } from './../schemas/delivery-note.schema';
import { CreateDeliveryNoteDto } from './dto/create-delivery-note.dto';
import { PurchaseOrderItem } from '../schemas/purchase-order-item.schema';
import { Customer } from '../schemas/customer.schema';
import mongoose from 'mongoose';

@Injectable()
export class DeliveryNoteService {
    private readonly logger = new Logger(DeliveryNoteService.name);
    private readonly MAX_RETRIES = 6;

    constructor(
        @InjectModel(DeliveryNote.name) private readonly deliveryNoteModel: Model<DeliveryNote>,
        @InjectModel(PurchaseOrderItem.name) private readonly poItemModel: Model<PurchaseOrderItem>,
        @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    ) { }

    private async computeNextCode(): Promise<number> {
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

    /**
     * Manual population helper:
     * - populates customer document into `customer`
     * - populates each poitems[].poitem with the corresponding PurchaseOrderItem doc
     * - also populates purchaseOrder and ware under each poitem (so front-end can use ware.code and purchaseOrder.code)
     */
    private async populateDeliveryNotes(docs: any[]) {
        if (!docs || docs.length === 0) return [];

        // collect customer ids and poitem ids (handles mixed shapes)
        const customerIdStrings = new Set<string>();
        const poitemIdStrings = new Set<string>();

        for (const d of docs) {
            if (d?.customer) customerIdStrings.add(String(d.customer));
            if (!Array.isArray(d?.poitems)) continue;
            for (const pi of d.poitems) {
                if (!pi) continue;
                if (pi && typeof pi === "object" && (pi.poitem !== undefined && pi.poitem !== null)) {
                    poitemIdStrings.add(String(pi.poitem));
                } else {
                    try {
                        poitemIdStrings.add(String(pi));
                    } catch (e) {
                        // ignore
                    }
                }
            }
        }

        const customerIds = Array.from(customerIdStrings).map((s) => new Types.ObjectId(s));
        const poitemIds = Array.from(poitemIdStrings)
            .map((s) => {
                try {
                    return new Types.ObjectId(s);
                } catch {
                    return null;
                }
            })
            .filter(Boolean) as Types.ObjectId[];

        const customerColl = this.customerModel.collection;
        const poitemColl = this.poItemModel.collection;

        // fetch raw poitems and customers
        const [customersRaw, poitemsRaw] = (await Promise.all([
            customerIds.length ? customerColl.find({ _id: { $in: customerIds } }).toArray() : [],
            poitemIds.length ? poitemColl.find({ _id: { $in: poitemIds } }).toArray() : [],
        ])) as any[];

        // --- additional population for PO items: ware and subPurchaseOrder -> purchaseOrder ---
        const wareIdStrings = Array.from(
            new Set((poitemsRaw as any[]).map((d) => d.ware).filter(Boolean).map((id: any) => String(id)))
        );
        const subPoIdStrings = Array.from(
            new Set((poitemsRaw as any[]).map((d) => d.subPurchaseOrder).filter(Boolean).map((id: any) => String(id)))
        );

        const wareIds = wareIdStrings.map((s) => new mongoose.Types.ObjectId(s));
        const subPoIds = subPoIdStrings.map((s) => new mongoose.Types.ObjectId(s));

        // fetch wares / subPos / purchaseOrders using collection names (adjust names if different)
        let waresRaw: any[] = [];
        let subPosRaw: any[] = [];
        let purchaseOrdersRaw: any[] = [];

        try {
            if (wareIds.length) {
                try {
                    waresRaw = await this.poItemModel.db.collection("wares").find({ _id: { $in: wareIds } }).toArray();
                } catch {
                    waresRaw = [];
                }
            }

            if (subPoIds.length) {
                try {
                    subPosRaw = await this.poItemModel.db.collection("subpurchaseorders").find({ _id: { $in: subPoIds } }).toArray();
                } catch {
                    subPosRaw = [];
                }
            }

            const nestedPoIdStrings = Array.from(
                new Set((subPosRaw as any[]).map((s: any) => s.purchaseOrder).filter(Boolean).map((id: any) => String(id)))
            );
            const nestedPoIds = nestedPoIdStrings.map((s) => new mongoose.Types.ObjectId(s));
            if (nestedPoIds.length) {
                try {
                    purchaseOrdersRaw = await this.poItemModel.db.collection("purchaseorders").find({ _id: { $in: nestedPoIds } }).toArray();
                } catch {
                    purchaseOrdersRaw = [];
                }
            }
        } catch (e) {
            this.logger.debug("Warning while attempting to fetch ware/subPo/purchaseOrder collections: " + (e && e.message));
        }

        const customerMap = (customersRaw as any[]).reduce<Map<string, any>>((m, c) => m.set(String(c._id), c), new Map());
        const wareMap = (waresRaw as any[]).reduce<Map<string, any>>((m, w) => m.set(String(w._id), w), new Map());
        const subPoMapRaw = (subPosRaw as any[]).reduce<Map<string, any>>((m, s) => m.set(String(s._id), s), new Map());
        const purchaseOrderMap = (purchaseOrdersRaw as any[]).reduce<Map<string, any>>((m, p) => m.set(String(p._id), p), new Map());

        const populatedSubPos = (subPosRaw as any[]).map((s) => ({
            ...s,
            purchaseOrder: s.purchaseOrder ? (purchaseOrderMap.get(String(s.purchaseOrder)) ?? null) : null,
        }));
        const populatedSubPoMap = populatedSubPos.reduce<Map<string, any>>((m, s) => m.set(String(s._id), s), new Map());

        const populatedPoitems = (poitemsRaw as any[]).map((p) => ({
            ...p,
            ware: p.ware ? (wareMap.get(String(p.ware)) ?? null) : null,
            subPurchaseOrder: p.subPurchaseOrder ? (populatedSubPoMap.get(String(p.subPurchaseOrder)) ?? null) : null,
        }));

        const poitemMap = populatedPoitems.reduce<Map<string, any>>((m, p) => m.set(String(p._id), p), new Map());

        const populated = docs.map((r) => {
            const customerPop = r.customer ? (customerMap.get(String(r.customer)) ?? null) : null;

            const poitemsOut: Array<{ poitem: any | null; deliveredAmount: number }> = [];
            if (Array.isArray(r.poitems)) {
                for (const rawPi of r.poitems) {
                    if (!rawPi) continue;

                    let rawId: any = null;
                    let deliveredAmount = 0;

                    if (typeof rawPi === "object" && (rawPi.poitem !== undefined && rawPi.poitem !== null)) {
                        rawId = rawPi.poitem;
                        deliveredAmount = Number(rawPi.deliveredAmount ?? 0) || 0;
                    } else {
                        rawId = rawPi;
                        deliveredAmount = 0;
                    }

                    // string or null
                    let idStr: string | null = null;
                    try {
                        idStr = rawId != null ? String(rawId) : null;
                    } catch {
                        idStr = null;
                    }

                    const poitemDoc = idStr ? (poitemMap.get(idStr) ?? null) : null;
                    poitemsOut.push({ poitem: poitemDoc, deliveredAmount });
                }
            }

            return {
                ...r,
                customer: customerPop,
                poitems: poitemsOut,
            };
        });

        return populated;
    }

    async findAll() {
        const docs = await this.deliveryNoteModel.find().sort({ createdAt: -1 }).lean().exec();
        const populated = await this.populateDeliveryNotes(docs);
        return populated;
    }

    async findById(id: string) {
        const doc = await this.deliveryNoteModel.findById(id).lean().exec();
        if (!doc) return null;
        const [pop] = await this.populateDeliveryNotes([doc]);
        return pop ?? null;
    }

    /**
     * Generic update: accepts partial fields; returns populated delivery note
     */
    async update(id: string, payload: Partial<any>) {
        if (!id) throw new BadRequestException('id is required');
        // Only allow certain fields? currently generic - you can restrict keys if needed.
        const updated = await this.deliveryNoteModel.findByIdAndUpdate(id, payload, { new: true }).lean().exec();
        if (!updated) throw new NotFoundException('DeliveryNote not found');
        const [pop] = await this.populateDeliveryNotes([updated]);
        return pop ?? updated;
    }
}
