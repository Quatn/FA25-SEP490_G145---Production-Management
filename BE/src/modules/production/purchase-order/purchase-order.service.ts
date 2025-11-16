import { Injectable, NotFoundException } from "@nestjs/common";
import { PurchaseOrder, PurchaseOrderSchema } from "../schemas/purchase-order.schema";

import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { PaginatedList } from "@/common/dto/paginated-list.dto";
import { PurchaseOrderItem } from "../schemas/purchase-order-item.schema";
// import { ordersWithUnmanufacturedItemsPopulatedPipe } from "./aggregate-pipes/orders-with-unmanufactured-items";
import { ordersWithUnmanufacturedItemsLeanPipe } from "./aggregate-pipes/orders-with-unmanufactured-items";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { UpdatePurchaseOrderDto } from "./dto/update-purchase-order.dto";
import { SoftDeleteDocument } from "@/common/types/soft-delete-document";
import {
  QueryOrdersWithUnmanufacturedItemsResponseDto,
} from "./dto/query-orders-with-unmanufactured-items.dto";
import {
  SubPurchaseOrder,
  SubPurchaseOrderSchema,
} from "../schemas/sub-purchase-order.schema";
import { Customer } from "../schemas/customer.schema";
import { Ware } from "../schemas/ware.schema";

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
    @InjectModel(
      Customer.name,
    ) private readonly customerModel: Model<Customer>,
    @InjectModel(
      Ware.name,
    ) private readonly wareModel: Model<Ware>,
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
    search,
  }: {
    page: number;
    limit: number;
    search: string;
  }): Promise<PaginatedList<QueryOrdersWithUnmanufacturedItemsResponseDto>> {
    const data = await this.purchaseOrderItemModel.aggregate(
      ordersWithUnmanufacturedItemsLeanPipe(1, 20, search),
    );

    await this.customerModel.populate(data, [
      { path: "purchaseOrder.customer" },
    ]);

    await this.wareModel.populate(data, [
      { path: "subPurchaseOrders.purchaseOrderItems.ware" },
    ]);
    // console.log(populatedData)

    // temp
    const totalItems = 0;
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
      data: data as QueryOrdersWithUnmanufacturedItemsResponseDto[],
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

  async getDetailWithSubs(id: string): Promise<any> {
    const pipeline: any[] = [
      // match the PO
      { $match: { _id: new Types.ObjectId(id), isDeleted: false } },

      {
        $lookup: {
          from: "subpurchaseorders",
          let: { poId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$purchaseOrder", "$$poId"] }, { $eq: ["$isDeleted", false] }] } } },

            {
              $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "product",
              },
            },
            { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },

            {
              $lookup: {
                from: "purchaseorderitems",
                let: { subId: "$_id" },
                pipeline: [
                  { $match: { $expr: { $and: [{ $eq: ["$subPurchaseOrder", "$$subId"] }, { $eq: ["$isDeleted", false] }] } } },

                  {
                    $lookup: {
                      from: "wares",
                      localField: "ware",
                      foreignField: "_id",
                      as: "ware",
                    },
                  },
                  { $unwind: { path: "$ware", preserveNullAndEmptyArrays: true } },

                ],
                as: "items",
              },
            },

            { $sort: { deliveryDate: -1 } },
          ],
          as: "subPurchaseOrders",
        },
      },

    ];

    const agg = await this.purchaseOrderModel.aggregate(pipeline).exec();
    const doc = agg[0];
    if (!doc) {
      throw new NotFoundException(`PurchaseOrder ${id} not found`);
    }
    return doc;
  }
}
