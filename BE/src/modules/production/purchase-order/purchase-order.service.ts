import { Injectable } from "@nestjs/common";
import { PurchaseOrder } from "../schemas/purchase-order.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { PaginatedList } from "@/common/dto/paginated-list.dto";
import { PurchaseOrderItem } from "../schemas/purchase-order-item.schema";
import { ordersWithUnmanufacturedItemsPopulatedPipe } from "./aggregate-pipes/orders-with-unmanufactured-items-populated";
import { ordersWithUnmanufacturedItemsLeanPipe } from "./aggregate-pipes/orders-with-unmanufactured-items-lean";

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectModel(PurchaseOrder.name) private readonly purchaseOrderModel: Model<
      PurchaseOrder
    >,
    @InjectModel(
      PurchaseOrderItem.name,
    ) private readonly purchaseOrderItemModel: Model<PurchaseOrderItem>,
  ) {}

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
}
