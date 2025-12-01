// sub-purchase-order.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
    SubPurchaseOrder,
    SubPurchaseOrderDocument,
} from "../schemas/sub-purchase-order.schema";
import {
    PurchaseOrderItem,
    PurchaseOrderItemDocument,
} from "../schemas/purchase-order-item.schema";
import { Product, ProductDocument } from "../schemas/product.schema";
import { CreateSubPurchaseOrderDto } from "./dto/create-sub-purchase-order.dto";
import { UpdateSubPurchaseOrderDto } from "./dto/update-sub-purchase-order.dto";
import { CreateSubFromProductsDto } from "./dto/create-sub-from-products.dto";

@Injectable()
export class SubPurchaseOrderService {
    constructor(
        @InjectModel(SubPurchaseOrder.name)
        private readonly subPoModel: Model<SubPurchaseOrderDocument>,
        @InjectModel(PurchaseOrderItem.name)
        private readonly poItemModel: Model<PurchaseOrderItemDocument>,
        @InjectModel(Product.name)
        private readonly productModel: Model<ProductDocument>,
    ) { }

    async findAll(options: { purchaseOrderId?: string } = {}) {
        const filter: any = { isDeleted: false };
        if (options.purchaseOrderId) {
            filter.purchaseOrder = options.purchaseOrderId;
        }
        return this.subPoModel.find(filter).populate("product").sort({ createdAt: -1 }).exec();
    }

    async findOneById(id: string) {
        const doc = await this.subPoModel.findById(id).populate("product").exec();
        if (!doc) throw new NotFoundException("SubPurchaseOrder not found");
        return doc;
    }

    /**
     * Create SubPurchaseOrders (bulk) from selected products.
     * For each selected product:
     *   - create a SubPurchaseOrder
     *   - for each ware referenced by the product, create a PurchaseOrderItem referencing that subPO & ware
     */
    async createFromProducts(payload: CreateSubFromProductsDto) {
        const { purchaseOrderId, products } = payload;

        const createdSubs: any[] = [];

        for (let i = 0; i < products.length; i++) {
            const p = products[i];
            // load product (with populated wares if possible)
            const productDoc = await this.productModel.findById(p.productId).populate("wares").exec();
            if (!productDoc) {
                // skip or throw - we will throw for clarity
                throw new NotFoundException(`Product not found: ${p.productId}`);
            }

            // create subPO doc
            const subCode = `SUBPO-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
            const subDoc = await this.subPoModel.create({
                code: subCode,
                purchaseOrder: purchaseOrderId,
                product: p.productId,
                deliveryDate: new Date(p.deliveryDate),
                status: p.status,
            });

            // for each ware in productDoc.wares, create a PurchaseOrderItem (amount default to 0)
            const wares: any[] = Array.isArray(productDoc.wares) ? productDoc.wares : [];

            const createdItems: PurchaseOrderItemDocument[] = [];
            for (const ware of wares) {
                // amount is required - set default 0
                const itemCode = `POITEM-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
                const newItem = await this.poItemModel.create({
                    code: itemCode,
                    subPurchaseOrder: subDoc._id,
                    ware: ware._id ?? ware,
                    amount: 0,
                    // other optional fields use defaults
                });
                createdItems.push(newItem);
            }

            const populatedSub = await this.subPoModel.findById(subDoc._id).populate("product").exec();
            createdSubs.push({ sub: populatedSub, items: createdItems });
        }

        return {
            success: true,
            message: "Created sub purchase orders",
            data: createdSubs,
        };
    }

    async update(id: string, payload: UpdateSubPurchaseOrderDto): Promise<SubPurchaseOrder> {
        const updated = await this.subPoModel.findByIdAndUpdate(id, payload, { new: true }).populate("product").exec();
        if (!updated) throw new NotFoundException("SubPurchaseOrder not found");
        return updated as any;
    }

    async create(payload: CreateSubPurchaseOrderDto): Promise<SubPurchaseOrder> {
        const created = await this.subPoModel.create(payload);
        const populated = await this.subPoModel.findById(created._id).populate("product").exec();
        if (!populated) throw new NotFoundException("Failed to create SubPurchaseOrder");
        return populated as any;
    }

    async softRemove(id: string): Promise<void> {
        const res = await this.subPoModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
        if (!res) throw new NotFoundException("SubPurchaseOrder not found");
        // optionally we could also soft-delete related PO items; decide as needed
    }

    async findDeleted(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const filter = { isDeleted: true };

        const [rawDocs, totalCount] = await Promise.all([
            this.subPoModel.collection.find(filter).skip(skip).limit(limit).toArray(),
            this.subPoModel.collection.countDocuments(filter),
        ]);

        const populated = await this.subPoModel.populate(rawDocs, [
            { path: "product" },
            { path: "purchaseOrder" },
        ]);

        const totalPages = Math.ceil((totalCount || 0) / limit);
        return {
            data: populated,
            page,
            limit,
            totalItems: totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };
    }

    async restore(id: string) {
        const doc = await this.subPoModel.findById(id) as any;
        if (!doc) throw new NotFoundException("Sub purchase order not found");
        await doc.restore();
        return { success: true };
    }
}
