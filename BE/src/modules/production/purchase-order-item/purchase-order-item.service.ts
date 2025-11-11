import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PurchaseOrderItem } from "../schemas/purchase-order-item.schema";
import { Model } from "mongoose";
import { PaginatedList } from "@/common/dto/paginated-list.dto";

@Injectable()
export class PurchaseOrderItemService {
  constructor(
    @InjectModel(
      PurchaseOrderItem.name,
    ) private readonly purchaseOrderItemModel: Model<PurchaseOrderItem>,
  ) {}

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

    // temp
    const filter = {};

    // temp
    const populate = [];

    const [totalItems, data] = await Promise.all([
      this.purchaseOrderItemModel.countDocuments(filter),
      this.purchaseOrderItemModel
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
}
