import { Injectable } from "@nestjs/common";
import { PurchaseOrder } from "../schemas/purchase-order.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { PaginatedList } from "@/common/dto/paginated-list.dto";
import { PurchaseOrderItem } from "../schemas/purchase-order-item.schema";
import { ordersWithUnmanufacturedItemsLeanPipe } from "./aggregate-pipes/orders-with-unmanufactured-items";
import {
  QueryOrdersWithUnmanufacturedItemsDto,
} from "./dto/query-orders-with-unmanufactured-items.dto";

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
  }): Promise<PaginatedList<QueryOrdersWithUnmanufacturedItemsDto>> {
    // temp
    const data = await this.purchaseOrderItemModel.aggregate(
      ordersWithUnmanufacturedItemsLeanPipe(1, 20, "AI"),
    );

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
      data: data as QueryOrdersWithUnmanufacturedItemsDto[],
    };
  }
}
