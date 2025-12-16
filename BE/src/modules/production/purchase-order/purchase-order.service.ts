import { Injectable, NotFoundException } from "@nestjs/common";
import {
  PurchaseOrder,
  PurchaseOrderSchema,
} from "../schemas/purchase-order.schema";

import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { PaginatedList } from "@/common/dto/paginated-list.dto";
import { PurchaseOrderItem } from "../schemas/purchase-order-item.schema";
// import { ordersWithUnmanufacturedItemsPopulatedPipe } from "./aggregate-pipes/orders-with-unmanufactured-items";
import { ordersWithUnmanufacturedItemsLeanPipe } from "./aggregate-pipes/orders-with-unmanufactured-items";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { UpdatePurchaseOrderDto } from "./dto/update-purchase-order.dto";
import { SoftDeleteDocument } from "@/common/types/soft-delete-document";
import { QueryOrdersWithUnmanufacturedItemsResponseDto } from "./dto/query-orders-with-unmanufactured-items.dto";
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
    @InjectModel(PurchaseOrder.name)
    private readonly purchaseOrderModel: Model<PurchaseOrder>,
    @InjectModel(PurchaseOrderItem.name)
    private readonly purchaseOrderItemModel: Model<PurchaseOrderItem>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    @InjectModel(Ware.name) private readonly wareModel: Model<Ware>,
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

    // main filter for purchase orders (adjust as needed)
    const filter = {};

    // populate customer and explicitly include both deleted and non-deleted docs
    const populate = [
      {
        path: "customer",
        model: "Customer", // optional if ref is set on schema
        // explicit isDeleted so the soft-delete plugin won't add its default filter
        match: { isDeleted: { $in: [true, false] } },
        // pick the fields you want returned
        select:
          "_id code name address email contactNumber note isDeleted deletedAt createdAt updatedAt",
        // justOne: true // useful if customer is a single ref
      },
    ];

    const [totalItems, data] = await Promise.all([
      this.purchaseOrderModel.countDocuments(filter),
      this.purchaseOrderModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .populate(populate),
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
    const [data, countArr] = await Promise.all([
      this.purchaseOrderItemModel.aggregate(
        ordersWithUnmanufacturedItemsLeanPipe(1, 20, search),
      ),
      this.purchaseOrderItemModel.aggregate([
        ...ordersWithUnmanufacturedItemsLeanPipe(1, 20, search).filter(
          (stage) => !("$skip" in stage || "$limit" in stage),
        ),
        { $count: "total" },
      ]),
    ]);

    // TODO: Move this into the aggregate pipe
    await this.customerModel.populate(data, [
      { path: "purchaseOrder.customer" },
    ]);

    await this.wareModel.populate(data, [
      {
        path: "subPurchaseOrders.purchaseOrderItems.ware",
        populate: [
          { path: "fluteCombination" },
          { path: "printColors" },
          { path: "finishingProcesses" },
          { path: "wareManufacturingProcessType" },
        ],
      },
    ]);
    // console.log(populatedData)

    const totalItems =
      (countArr[0] as { total: number } | undefined)?.total ?? 0;
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

  async updateOne(
    id: string,
    dto: UpdatePurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    const payload: any = { ...dto };
    if (dto.orderDate) payload.orderDate = new Date(dto.orderDate as any);

    const updated = await this.purchaseOrderModel.findByIdAndUpdate(
      id,
      payload,
      { new: true },
    );
    if (!updated) throw new NotFoundException(`Purchase order ${id} not found`);
    return updated;
  }

  async softDelete(id: string) {
    const doc = (await this.purchaseOrderModel.findById(
      id,
    )) as SoftPurchaseOrder;
    if (!doc) throw new NotFoundException("Purchase order not found");
    await doc.softDelete();
    return { success: true };
  }

  async findDeleted(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter = { isDeleted: true };

    const [rawDocs, totalCount] = await Promise.all([
      this.purchaseOrderModel.collection
        .find(filter)
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.purchaseOrderModel.collection.countDocuments(filter),
    ]);

    // populate customer and (optionally) other fields
    const populatedDocs = await this.purchaseOrderModel.populate(rawDocs, [
      { path: "customer" },
      // you can add more populate instructions if needed
    ]);

    const totalPages = Math.ceil((totalCount || 0) / limit);
    return {
      data: populatedDocs,
      page,
      limit,
      totalItems: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async restore(id: string) {
    const doc = (await this.purchaseOrderModel.findOne({
      _id: id,
      isDeleted: true,
    })) as SoftPurchaseOrder;
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
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$purchaseOrder", "$$poId"] },
                    { $eq: ["$isDeleted", false] },
                  ],
                },
              },
            },

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
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$subPurchaseOrder", "$$subId"] },
                          { $eq: ["$isDeleted", false] },
                        ],
                      },
                    },
                  },

                  {
                    $lookup: {
                      from: "wares",
                      localField: "ware",
                      foreignField: "_id",
                      as: "ware",
                    },
                  },
                  {
                    $unwind: {
                      path: "$ware",
                      preserveNullAndEmptyArrays: true,
                    },
                  },
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
