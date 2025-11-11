import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import {
  ManufacturingOrder,
  ManufacturingOrderSchema,
} from "../schemas/manufacturing-order.schema";
import { CreateManufacturingOrderRequestDto } from "./dto/create-order-request.dto";
import { UpdateManufacturingOrderRequestDto } from "./dto/update-order-request.dto";
import { PaginatedList } from "@/common/dto/paginated-list.dto";
import { FullDetailManufacturingOrderDto } from "./dto/full-details-orders.dto";
import { PurchaseOrderItemSchema } from "../schemas/purchase-order-item.schema";
import { SubPurchaseOrderSchema } from "../schemas/sub-purchase-order.schema";
import { PurchaseOrderSchema } from "../schemas/purchase-order.schema";

@Injectable()
export class ManufacturingOrderService {
  constructor(
    @InjectModel(
      ManufacturingOrder.name,
    ) private readonly manufacturingOrderModel: Model<ManufacturingOrder>,
  ) {}

  async findAll() {
    return await this.manufacturingOrderModel.find();
  }

  async queryList({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<PaginatedList<ManufacturingOrder>> {
    const skip = (page - 1) * limit;

    // temp
    const filter = {};

    // temp
    const populate = [];

    const [totalItems, data] = await Promise.all([
      this.manufacturingOrderModel.countDocuments(filter),
      this.manufacturingOrderModel
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
  }): Promise<PaginatedList<FullDetailManufacturingOrderDto>> {
    const skip = (page - 1) * limit;

    // temp
    const filter = {};

    const poiPath = ManufacturingOrderSchema.path("purchaseOrderItem");
    const subpoPath = PurchaseOrderItemSchema.path("subPurchaseOrder");
    const warePath = PurchaseOrderItemSchema.path("ware");
    const poPath = SubPurchaseOrderSchema.path("purchaseOrder");
    const productPath = SubPurchaseOrderSchema.path("product");
    const customerPath = PurchaseOrderSchema.path("customer");

    const populate = {
      path: poiPath.path,
      populate: [
        { path: warePath.path },
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
      ],
    };

    const [totalItems, data] = await Promise.all([
      this.manufacturingOrderModel.countDocuments(filter),
      this.manufacturingOrderModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .populate(populate)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const mappedData: FullDetailManufacturingOrderDto[] = data.map(
      (mo) => new FullDetailManufacturingOrderDto(mo),
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

  async createOne(dto: CreateManufacturingOrderRequestDto) {
    const doc = new this.manufacturingOrderModel(dto);
    return await doc.save();
  }

  // TODO
  async updateOne(dto: UpdateManufacturingOrderRequestDto) {
    // const doc = new this.manufacturingOrderModel(dto);
    // return await doc.save();
  }
}
