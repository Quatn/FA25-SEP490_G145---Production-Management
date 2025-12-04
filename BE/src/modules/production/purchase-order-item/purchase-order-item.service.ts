import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  PurchaseOrderItem,
  PurchaseOrderItemSchema,
} from "../schemas/purchase-order-item.schema";
import mongoose, { Model } from "mongoose";
import { PaginatedList } from "@/common/dto/paginated-list.dto";
import { FullDetailPurchaseOrderItemDto } from "./dto/full-details-orders.dto";
import { Ware, WareSchema } from "../schemas/ware.schema";
import { SubPurchaseOrder, SubPurchaseOrderSchema } from "../schemas/sub-purchase-order.schema";
import { PurchaseOrder, PurchaseOrderSchema } from "../schemas/purchase-order.schema";
import { UpdatePurchaseOrderItemDto } from "./dto/update-purchase-order-item.dto";
import { Product, ProductDocument } from "../schemas/product.schema";

@Injectable()
export class PurchaseOrderItemService {
  constructor(
    @InjectModel(PurchaseOrderItem.name)
    private readonly purchaseOrderItemModel: Model<PurchaseOrderItem>,
    @InjectModel(SubPurchaseOrder.name)
    private readonly subPOModel: Model<SubPurchaseOrder>,
    @InjectModel(Ware.name)
    private readonly wareModel: Model<Ware>,
    @InjectModel(PurchaseOrder.name)
    private readonly poModel: Model<PurchaseOrder>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) { }

  async findAll() {
    return await this.purchaseOrderItemModel.find();
  }

  async queryList({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<PaginatedList<PurchaseOrderItem>> {
    const skip = (page - 1) * limit;
    const filter = {};

    const [totalItems, items] = await Promise.all([
      this.purchaseOrderItemModel.countDocuments(filter),
      this.purchaseOrderItemModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const wareIdStrings = Array.from(
      new Set((items as any[]).map((d) => d.ware).filter(Boolean).map((id: any) => id.toString())),
    );
    const subPoIdStrings = Array.from(
      new Set((items as any[]).map((d) => d.subPurchaseOrder).filter(Boolean).map((id: any) => id.toString())),
    );

    const wareIds = wareIdStrings.map((s) => new mongoose.Types.ObjectId(s));
    const subPoIds = subPoIdStrings.map((s) => new mongoose.Types.ObjectId(s));

    const wareColl = this.wareModel.collection;
    const subPoColl = this.subPOModel.collection;
    const purchaseOrderColl = this.poModel.collection;

    const [waresRaw, subPosRaw] = await Promise.all([
      wareIds.length ? wareColl.find({ _id: { $in: wareIds } }).toArray() : [],
      subPoIds.length ? subPoColl.find({ _id: { $in: subPoIds } }).toArray() : [],
    ]) as any[];

    const nestedPoIdStrings = Array.from(
      new Set((subPosRaw as any[]).map((s: any) => s.purchaseOrder).filter(Boolean).map((id: any) => id.toString())),
    );
    const nestedPoIds = nestedPoIdStrings.map((s) => new mongoose.Types.ObjectId(s));
    const purchaseOrders = nestedPoIds.length ? await purchaseOrderColl.find({ _id: { $in: nestedPoIds } }).toArray() : [];

    const wareMap = (waresRaw as any[]).reduce<Map<string, any>>(
      (m, w) => m.set(w._id.toString(), w),
      new Map<string, any>(),
    );
    const subPoMap = (subPosRaw as any[]).reduce<Map<string, any>>(
      (m, s) => m.set(s._id.toString(), s),
      new Map<string, any>(),
    );
    const poMap = (purchaseOrders as any[]).reduce<Map<string, any>>(
      (m, p) => m.set(p._id.toString(), p),
      new Map<string, any>(),
    );

    const populatedSubPos = (subPosRaw as any[]).map((s) => ({
      ...s,
      purchaseOrder: s.purchaseOrder ? poMap.get(s.purchaseOrder.toString()) ?? null : null,
    }));
    const populatedSubPoMap = populatedSubPos.reduce<Map<string, any>>(
      (m, s) => m.set(s._id.toString(), s),
      new Map<string, any>(),
    );

    const populated = (items as any[]).map((r) => ({
      ...r,
      ware: r.ware ? wareMap.get(r.ware.toString()) ?? null : null,
      subPurchaseOrder: r.subPurchaseOrder ? populatedSubPoMap.get(r.subPurchaseOrder.toString()) ?? null : null,
    }));

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage,
      hasPrevPage,
      data: populated,
    };
  }



  async queryListFullDetails({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<PaginatedList<FullDetailPurchaseOrderItemDto>> {
    const skip = (page - 1) * limit;

    // temp
    const filter = {};

    const subpoPath = PurchaseOrderItemSchema.path("subPurchaseOrder");
    const warePath = PurchaseOrderItemSchema.path("ware");
    const fluteCombinationPath = WareSchema.path("fluteCombination");
    const finishingProcessesPath = WareSchema.path("finishingProcesses");
    const poPath = SubPurchaseOrderSchema.path("purchaseOrder");
    const productPath = SubPurchaseOrderSchema.path("product");
    const customerPath = PurchaseOrderSchema.path("customer");
    const wareManufacturingProcessTypePath = WareSchema.path(
      "wareManufacturingProcessType",
    );

    const populate = [
      {
        path: warePath.path,
        populate: [
          fluteCombinationPath,
          finishingProcessesPath,
          wareManufacturingProcessTypePath,
        ],
      },
      {
        path: subpoPath.path,
        populate: [
          productPath,
          {
            path: poPath.path,
            populate: { path: customerPath.path },
          },
        ],
      },
    ];

    const [totalItems, data] = await Promise.all([
      this.purchaseOrderItemModel.countDocuments(filter),
      this.purchaseOrderItemModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .populate(populate)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const mappedData: FullDetailPurchaseOrderItemDto[] = data.map(
      (poi) => new FullDetailPurchaseOrderItemDto(poi),
    );

    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage,
      hasPrevPage,
      data: mappedData,
    };
  }

  async queryListFullDetailsByIds({
    ids,
  }: {
    ids: mongoose.Types.ObjectId[];
  }): Promise<FullDetailPurchaseOrderItemDto[]> {
    const filter = { _id: { $in: ids } };

    const subpoPath = PurchaseOrderItemSchema.path("subPurchaseOrder");
    const warePath = PurchaseOrderItemSchema.path("ware");
    const fluteCombinationPath = WareSchema.path("fluteCombination");
    const finishingProcessesPath = WareSchema.path("finishingProcesses");
    const poPath = SubPurchaseOrderSchema.path("purchaseOrder");
    const productPath = SubPurchaseOrderSchema.path("product");
    const customerPath = PurchaseOrderSchema.path("customer");
    const wareManufacturingProcessTypePath = WareSchema.path("wareManufacturingProcessType")

    const populate = [
      {
        path: warePath.path,
        populate: [
          fluteCombinationPath,
          finishingProcessesPath,
          wareManufacturingProcessTypePath,
        ],
      },
      {
        path: subpoPath.path,
        populate: [
          productPath,
          {
            path: poPath.path,
            populate: { path: customerPath.path },
          },
        ],
      },
    ];

    const data = await this.purchaseOrderItemModel
      .find(filter)
      .populate(populate)
      .lean();

    const mappedData: FullDetailPurchaseOrderItemDto[] = data.map(
      (poi) => new FullDetailPurchaseOrderItemDto(poi),
    );

    return mappedData;
  }

  async update(
    id: string,
    payload: UpdatePurchaseOrderItemDto,
  ): Promise<PurchaseOrderItem> {
    const updated = await this.purchaseOrderItemModel
      .findByIdAndUpdate(id, payload, { new: true })
      .populate("ware")
      .populate("subPurchaseOrder")
      .exec();

    if (!updated) throw new NotFoundException("PurchaseOrderItem not found");
    return updated as any;
  }

  async softRemove(id: string): Promise<void> {
    const res = await this.purchaseOrderItemModel
      .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .exec();
    if (!res) throw new NotFoundException("PurchaseOrderItem not found");
  }

  async findDeleted(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter = { isDeleted: true };

    const [rawDocs, totalCount] = await Promise.all([
      this.purchaseOrderItemModel.collection.find(filter).skip(skip).limit(limit).toArray(),
      this.purchaseOrderItemModel.collection.countDocuments(filter),
    ]);

    const wareIdStrings = Array.from(
      new Set(rawDocs.map((d: any) => d.ware).filter(Boolean).map((id: any) => id.toString())),
    );
    const subPoIdStrings = Array.from(
      new Set(rawDocs.map((d: any) => d.subPurchaseOrder).filter(Boolean).map((id: any) => id.toString())),
    );

    const wareIds = wareIdStrings.map((s) => new mongoose.Types.ObjectId(s));
    const subPoIds = subPoIdStrings.map((s) => new mongoose.Types.ObjectId(s));

    const wareColl = this.wareModel.collection;
    const subPoColl = this.subPOModel.collection;
    const purchaseOrderColl = this.poModel.collection;

    const [waresRaw, subPosRaw] = await Promise.all([
      wareIds.length ? wareColl.find({ _id: { $in: wareIds } }).toArray() : [],
      subPoIds.length ? subPoColl.find({ _id: { $in: subPoIds } }).toArray() : [],
    ]) as any[];

    const nestedPoIdStrings = Array.from(
      new Set(subPosRaw.map((s: any) => s.purchaseOrder).filter(Boolean).map((id: any) => id.toString())),
    );
    const nestedPoIds = nestedPoIdStrings.map((s: any) => new mongoose.Types.ObjectId(s));
    const purchaseOrders = nestedPoIds.length
      ? await purchaseOrderColl.find({ _id: { $in: nestedPoIds } }).toArray()
      : [];

    const wareMap = (waresRaw as any[]).reduce<Map<string, any>>(
      (m, w) => m.set(w._id.toString(), w),
      new Map<string, any>(),
    );
    const subPoMap = (subPosRaw as any[]).reduce<Map<string, any>>(
      (m, s) => m.set(s._id.toString(), s),
      new Map<string, any>(),
    );
    const poMap = (purchaseOrders as any[]).reduce<Map<string, any>>(
      (m, p) => m.set(p._id.toString(), p),
      new Map<string, any>(),
    );

    const populatedSubPos = (subPosRaw as any[]).map((s) => ({
      ...s,
      purchaseOrder: s.purchaseOrder ? poMap.get(s.purchaseOrder.toString()) ?? null : null,
    }));
    const populatedSubPoMap = populatedSubPos.reduce<Map<string, any>>(
      (m, s) => m.set(s._id.toString(), s),
      new Map<string, any>(),
    );

    const populated = (rawDocs as any[]).map((r) => ({
      ...r,
      ware: r.ware ? wareMap.get(r.ware.toString()) ?? null : null,
      subPurchaseOrder: r.subPurchaseOrder ? populatedSubPoMap.get(r.subPurchaseOrder.toString()) ?? null : null,
    }));

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
    const doc = await this.purchaseOrderItemModel.findById(id) as any;
    if (!doc) throw new NotFoundException("Purchase order item not found");
    await doc.restore();
    return { success: true };
  }
}
