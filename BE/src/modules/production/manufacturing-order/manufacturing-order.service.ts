import { Injectable } from "@nestjs/common";
import mongoose, { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import {
  ManufacturingOrder,
  ManufacturingOrderSchema,
} from "../schemas/manufacturing-order.schema";
import { CreateManufacturingOrderRequestDto } from "./dto/create-order-request.dto";
import { UpdateManufacturingOrderRequestDto } from "./dto/update-order-request.dto";
import { PaginatedList } from "@/common/dto/paginated-list.dto";
import { FullDetailManufacturingOrderDto } from "./dto/full-details-orders.dto";
import {
  PurchaseOrderItem,
  PurchaseOrderItemSchema,
} from "../schemas/purchase-order-item.schema";
import { SubPurchaseOrderSchema } from "../schemas/sub-purchase-order.schema";
import { PurchaseOrderSchema } from "../schemas/purchase-order.schema";
import { Ware, WareSchema } from "../schemas/ware.schema";
import { MOCodeGenerator } from "./business-logics/mo-code-generator";
import { getManufacturingDate } from "./business-logics/mo-manufacturing-date-getter";
import { FullDetailPurchaseOrderItemDto } from "../purchase-order-item/dto/full-details-orders.dto";
import { getCorrugatorLine } from "./business-logics/mo-corrugator-line-getter";

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

  async getLastOrder() {
    const order = await this.manufacturingOrderModel.find().limit(1).sort({
      code: -1,
    });
    if (order.length < 1) {
      throw Error("Cannot get last order since no orders exist in the system");
    }
    return order[0];
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
    const fluteCombinationPath = WareSchema.path("fluteCombination");
    const finishingProcessesPath = WareSchema.path("finishingProcesses");
    const poPath = SubPurchaseOrderSchema.path("purchaseOrder");
    const productPath = SubPurchaseOrderSchema.path("product");
    const customerPath = PurchaseOrderSchema.path("customer");

    const populate = {
      path: poiPath.path,
      populate: [
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

  async draftOrderByFullDetailsPois({
    purchaseOrderItems,
  }: {
    purchaseOrderItems: FullDetailPurchaseOrderItemDto[];
  }): Promise<FullDetailManufacturingOrderDto[]> {
    const lastOrder = await this.getLastOrder()
      .then((order) => order)
      .catch(() => undefined);
    const codeGenerator = new MOCodeGenerator(lastOrder?.code);

    const mos: FullDetailManufacturingOrderDto[] = purchaseOrderItems.map(
      (poi, index) => ({
        code: codeGenerator.getCode(index),
        purchaseOrderItem: poi,
        manufacturingDate: getManufacturingDate(
          poi.subPurchaseOrder.deliveryDate,
          poi.subPurchaseOrder.purchaseOrder.customer.code,
        ),
        manufacturingDateAdjustment: null,
        requestedDatetime: null,
        corrugatorLine: getCorrugatorLine(
          poi.ware.fluteCombination.code,
          poi.subPurchaseOrder.purchaseOrder.customer.code,
        ),
        corrugatorLineAdjustment: null,
        manufacturedAmount: 0,
        manufacturingDirective: "",
        note: "",
        recalculateFlag: false,
        isDeleted: false,
      }),
    );

    return mos;
  }

  async createOne(dto: CreateManufacturingOrderRequestDto) {
    const doc = new this.manufacturingOrderModel(dto);
    return await doc.save();
  }

  async createMany(dto: CreateManufacturingOrderRequestDto) {
    const doc = new this.manufacturingOrderModel(dto);
    return await doc.save();
  }

  // TODO
  async updateOne(dto: UpdateManufacturingOrderRequestDto) {
    // const doc = new this.manufacturingOrderModel(dto);
    // return await doc.save();
  }
}
