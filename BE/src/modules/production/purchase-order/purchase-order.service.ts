import { Injectable, NotFoundException } from "@nestjs/common";
import { PurchaseOrder } from "../schemas/purchase-order.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { PaginatedList } from "@/common/dto/paginated-list.dto";
import { PurchaseOrderItem } from "../schemas/purchase-order-item.schema";
import { ordersWithUnmanufacturedItemsPopulatedPipe } from "./aggregate-pipes/orders-with-unmanufactured-items-populated";
import { ordersWithUnmanufacturedItemsLeanPipe } from "./aggregate-pipes/orders-with-unmanufactured-items-lean";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { UpdatePurchaseOrderDto } from "./dto/update-purchase-order.dto";
import { SoftDeleteDocument } from "@/common/types/soft-delete-document";

type SoftPurchaseOrder = PurchaseOrder & SoftDeleteDocument;

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectModel(PurchaseOrder.name) private readonly purchaseOrderModel: Model<
      PurchaseOrder
    >,
    @InjectModel(
      PurchaseOrderItem.name,
    ) private readonly purchaseOrderItemModel: Model<PurchaseOrderItem>,
  ) { }

  async findAll() {
    return await this.purchaseOrderModel.find();
  }

  async queryList({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<PaginatedList<PurchaseOrder>> {
    const skip = (page - 1) * limit;

    // temp
    const filter = {};

    // temp
    const populate = [];

    const [totalItems, data] = await Promise.all([
      this.purchaseOrderModel.countDocuments(filter),
      this.purchaseOrderModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .populate(populate || []),
    ]);

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
      data,
    };
  }

  async queryOrdersWithUnmanufacturedItems({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<PaginatedList<PurchaseOrder>> {
    const skip = (page - 1) * limit;

    // temp
    const filter = {};

    // temp
    const populate = [];

    const [totalItems, data] = await Promise.all([
      this.purchaseOrderModel.countDocuments(filter),
      this.purchaseOrderModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .populate(populate || []),
    ]);

    /*
    const test = await this.purchaseOrderItemModel.aggregate([
      // 0️⃣ Only consider non-deleted PurchaseOrderItems
      { $match: { isDeleted: false } },

      // 1️⃣ Lookup ManufacturingOrders (also non-deleted)
      {
        $lookup: {
          from: "manufacturingorders",
          let: { itemId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$purchaseOrderItem", "$$itemId"] } } },
            { $match: { isDeleted: false } },
          ],
          as: "manufacturingOrder",
        },
      },

      // 2️⃣ Keep only items WITHOUT a manufacturing order
      { $match: { "manufacturingOrder.0": { $exists: false } } },

      // 3️⃣ Lookup SubPurchaseOrder (filtering out deleted ones)
      {
        $lookup: {
          from: "subpurchaseorders",
          let: { subId: "$subPurchaseOrder" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$subId"] } } },
            { $match: { isDeleted: false } },
          ],
          as: "subPurchaseOrder",
        },
      },
      { $unwind: "$subPurchaseOrder" },

      // 4️⃣ Lookup PurchaseOrder (filtering out deleted ones)
      {
        $lookup: {
          from: "purchaseorders",
          let: { poId: "$subPurchaseOrder.purchaseOrder" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$poId"] } } },
            { $match: { isDeleted: false } },
          ],
          as: "purchaseOrder",
        },
      },
      { $unwind: "$purchaseOrder" },

      // 5️⃣ Group by PurchaseOrder (unique, only active ones)
      {
        $group: {
          _id: "$purchaseOrder._id",
          purchaseOrder: { $first: "$purchaseOrder" },
          unmanufacturedItemCount: { $sum: 1 },
        },
      },

      // 6️⃣ Optionally clean up projection
      {
        $project: {
          _id: 0,
          purchaseOrder: 1,
          unmanufacturedItemCount: 1,
        },
      },
    ]);
    */
    const test = await this.purchaseOrderItemModel.aggregate(
      ordersWithUnmanufacturedItemsLeanPipe,
    );
    console.log(test);

    const test2 = await this.purchaseOrderItemModel.aggregate(
      ordersWithUnmanufacturedItemsPopulatedPipe,
    );
    console.log(JSON.stringify(test2));

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
      data,
    };
  }

  async create(dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    // transform date
    const payload: any = {
      ...dto,
      orderDate: new Date(dto.orderDate),
    };

    const doc = new this.purchaseOrderModel(payload);
    try {
      const saved = await doc.save();
      return saved;
    } catch (err: any) {
      // re-throw to let controller / global handler format
      throw err;
    }
  }

  async findOne(id: string): Promise<PurchaseOrder> {
    const doc = await this.purchaseOrderModel.findById(id);
    if (!doc) throw new NotFoundException(`Purchase order ${id} not found`);
    return doc;
  }

  async updateOne(id: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const payload: any = { ...dto };
    if (dto.orderDate) payload.orderDate = new Date(dto.orderDate as any);

    const updated = await this.purchaseOrderModel.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) throw new NotFoundException(`Purchase order ${id} not found`);
    return updated;
  }

  async softDelete(id: string) {
    const doc = await this.purchaseOrderModel.findById(id) as SoftPurchaseOrder;
    if (!doc) throw new NotFoundException("Purchase order not found");
    await doc.softDelete();
    return { success: true };
  }

  async restore(id: string) {
    const doc = await this.purchaseOrderModel.findById(id) as SoftPurchaseOrder;
    if (!doc) throw new NotFoundException("Purchase order not found");
    await doc.restore();
    return { success: true };
  }

  async removeHard(id: string) {
    const result = await this.purchaseOrderModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException("Purchase order not found");
    return { success: true };
  }
}
