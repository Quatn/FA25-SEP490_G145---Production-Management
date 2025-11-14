import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  PurchaseOrderItem,
  PurchaseOrderItemSchema,
} from "../schemas/purchase-order-item.schema";
import mongoose, { Model } from "mongoose";
import { PaginatedList } from "@/common/dto/paginated-list.dto";
import { FullDetailPurchaseOrderItemDto } from "./dto/full-details-orders.dto";
import { WareSchema } from "../schemas/ware.schema";
import { SubPurchaseOrderSchema } from "../schemas/sub-purchase-order.schema";
import { PurchaseOrderSchema } from "../schemas/purchase-order.schema";

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

    const populate = [
      {
        path: warePath.path,
        populate: [fluteCombinationPath, finishingProcessesPath],
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

    const populate = [
      {
        path: warePath.path,
        populate: [fluteCombinationPath, finishingProcessesPath],
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
}
