import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateOrderFinishingProcessDto } from "./dto/create-order-finishing-process.dto";
import { UpdateOrderFinishingProcessDto } from "./dto/update-order-finishing-process.dto";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import {
  OrderFinishingProcess,
  OrderFinishingProcessDocument,
  OrderFinishingProcessSchema,
  OrderFinishingProcessStatus,
} from "../schemas/order-finishing-process.schema";
import { SoftDeleteDocument } from "@/common/types/soft-delete-document";
import { GetOrderFinishingProcessDto } from "./dto/get-order-finishing-process.dto";
import { ManufacturingOrderSchema } from "../schemas/manufacturing-order.schema";
import { PurchaseOrderItemSchema } from "../schemas/purchase-order-item.schema";
import { WareSchema } from "../schemas/ware.schema";
import { SubPurchaseOrderSchema } from "../schemas/sub-purchase-order.schema";
import { PurchaseOrderSchema } from "../schemas/purchase-order.schema";

type SoftOrderFinishingProcess = OrderFinishingProcess & SoftDeleteDocument;

@Injectable()
export class OrderFinishingProcessService {
  constructor(
    @InjectModel(OrderFinishingProcess.name)
    private readonly ofpModel: Model<OrderFinishingProcessDocument>,
  ) { }

  async create(dto: CreateOrderFinishingProcessDto) {
    try {
      const payload: any = {
        code: dto.code,
        manufacturingOrder: dto.manufacturingOrder
          ? new Types.ObjectId(dto.manufacturingOrder)
          : null,
        wareFinishingProcessType: dto.wareFinishingProcessType
          ? new Types.ObjectId(dto.wareFinishingProcessType)
          : null,
        sequenceNumber: dto.sequenceNumber,
        completedAmount: dto.completedAmount ?? 0,
        status: dto.status,
        note: dto.note ?? "",
      };

      const created = await this.ofpModel.create(payload);
      return created;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictException(
          `Duplicate key error: ${JSON.stringify(err.keyValue)}`,
        );
      }
      throw err;
    }
  }

  async findPaginated(query: GetOrderFinishingProcessDto) {
    const { page = 1, limit = 10, status, search, startDate, endDate } = query;

    const skip = (page - 1) * limit;

    const matchStage: any = {};
    if (status) matchStage.status = status;

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        matchStage.createdAt.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = e;
      }

      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        throw new BadRequestException("startDate must be earlier than endDate");
      }
    }

    const pipeline: any[] = [
      { $match: matchStage },

      {
        $lookup: {
          from: "manufacturingorders",
          localField: "manufacturingOrder",
          foreignField: "_id",
          as: "mo",
        },
      },
      { $unwind: { path: "$mo", preserveNullAndEmptyArrays: true } },
    ];

    if (search?.trim()) {
      pipeline.push(
        {
          $lookup: {
            from: "purchaseorderitems",
            localField: "mo.purchaseOrderItem",
            foreignField: "_id",
            as: "poi",
          },
        },
        { $unwind: { path: "$poi", preserveNullAndEmptyArrays: true } },

        {
          $lookup: {
            from: "wares",
            localField: "poi.ware",
            foreignField: "_id",
            as: "ware",
          },
        },
        { $unwind: { path: "$ware", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "flutecombinations",
            localField: "ware.fluteCombination",
            foreignField: "_id",
            as: "flute",
          },
        },
        { $unwind: { path: "$flute", preserveNullAndEmptyArrays: true } },

        {
          $lookup: {
            from: "subpurchaseorders",
            localField: "poi.subPurchaseOrder",
            foreignField: "_id",
            as: "subpo",
          },
        },
        { $unwind: { path: "$subpo", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "purchaseorders",
            localField: "subpo.purchaseOrder",
            foreignField: "_id",
            as: "po",
          },
        },
        { $unwind: { path: "$po", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "customers",
            localField: "po.customer",
            foreignField: "_id",
            as: "customer",
          },
        },
        { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },

        {
          $lookup: {
            from: "warefinishingprocesstypes",
            localField: "wareFinishingProcessType",
            foreignField: "_id",
            as: "wfpt",
          },
        },
        { $unwind: { path: "$wfpt", preserveNullAndEmptyArrays: true } },
      );

      const keywords = search.trim().split(/\s+/);
      const searchConditions = keywords.map((word) => {
        const regex = new RegExp(
          word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i",
        );
        return {
          $or: [
            { code: regex },
            { "mo.code": regex },
            { "ware.code": regex },
            { "po.code": regex },
            { "customer.name": regex },
            { "customer.code": regex },
            { "flute.code": regex },
            { "wfpt.name": regex },
            { "wfpt.code": regex },
          ],
        };
      });

      pipeline.push({
        $match: { $and: searchConditions },
      });
    }

    const sort: Record<string, 1 | -1> = {};
    if (query.status != OrderFinishingProcessStatus.Scheduled) {
      sort.updatedAt = -1;
    } else {
      const sortByMo = "mo.createdAt";
      sort[sortByMo] = 1;
      sort.code = 1;
    }
    pipeline.push({
      $sort: sort,
    });

    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }, { $project: { _id: 1 } }], // Get only IDs
      },
    });

    const result = await this.ofpModel.aggregate(pipeline);

    const metadata = result[0].metadata;
    const totalItems = metadata.length > 0 ? metadata[0].total : 0;
    const foundIds = result[0].data.map((item: any) => item._id);

    const moPath = OrderFinishingProcessSchema.path("manufacturingOrder");
    const poiPath = ManufacturingOrderSchema.path("purchaseOrderItem");
    const subpoPath = PurchaseOrderItemSchema.path("subPurchaseOrder");
    const warePath = PurchaseOrderItemSchema.path("ware");
    const fluteCombinationPath = WareSchema.path("fluteCombination");
    const poPath = SubPurchaseOrderSchema.path("purchaseOrder");
    const customerPath = PurchaseOrderSchema.path("customer");

    const populateConfig = {
      path: moPath.path,
      populate: [
        {
          path: poiPath.path,
          populate: [
            {
              path: warePath.path,
              populate: { path: fluteCombinationPath.path },
            },
            {
              path: subpoPath.path,
              populate: [
                {
                  path: poPath.path,
                  populate: { path: customerPath.path },
                },
              ],
            },
          ],
        },
      ],
    };

    const unsortedData = await this.ofpModel
      .find({ _id: { $in: foundIds } })
      .populate("wareFinishingProcessType")
      .populate(populateConfig);

    const data = foundIds.map((id: any) =>
      unsortedData.find((doc) => doc._id.toString() === id.toString()),
    );

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async findAll() {
    return this.ofpModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const doc = await this.ofpModel.findById(id);

    if (!doc) {
      throw new NotFoundException("OrderFinishingProcess not found");
    }

    return doc;
  }

  async update(id: string, dto: UpdateOrderFinishingProcessDto) {
    const raw: any = { ...dto };

    if (dto.manufacturingOrder) {
      raw.manufacturingOrder = new Types.ObjectId(dto.manufacturingOrder);
    }

    if (dto.employee) {
      raw.employee = new Types.ObjectId(dto.employee);
    }

    if (dto.wareFinishingProcessType) {
      raw.wareFinishingProcessType = new Types.ObjectId(
        dto.wareFinishingProcessType,
      );
    }

    try {
      const updated = await this.ofpModel.findByIdAndUpdate(id, raw, {
        new: true,
      });

      if (!updated) {
        throw new NotFoundException("OrderFinishingProcess not found");
      }

      return updated;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictException(
          `Duplicate key error: ${JSON.stringify(err.keyValue)}`,
        );
      }
      throw err;
    }
  }

  async updateMany(ids: string[], dto: UpdateOrderFinishingProcessDto) {
    const raw: any = { ...dto };

    if (dto.manufacturingOrder) {
      raw.manufacturingOrder = new Types.ObjectId(dto.manufacturingOrder);
    }

    if (dto.wareFinishingProcessType) {
      raw.wareFinishingProcessType = new Types.ObjectId(
        dto.wareFinishingProcessType,
      );
    }

    try {
      const result = await this.ofpModel.updateMany(
        { _id: { $in: ids } },
        { $set: raw },
      );

      if (result.matchedCount === 0) {
        throw new NotFoundException(
          "No OrderFinishingProcess documents found for the provided IDs",
        );
      }

      return {
        matched: result.matchedCount,
        modified: result.modifiedCount,
      };
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictException(
          `Duplicate key error: ${JSON.stringify(err.keyValue)}`,
        );
      }
      throw err;
    }
  }

  async softRemove(id: string) {
    const doc = (await this.ofpModel.findById(id)) as SoftOrderFinishingProcess;
    if (!doc) throw new NotFoundException("OrderFinishingProcess not found");

    await doc.softDelete();
    return { message: "Soft deleted successfully" };
  }

  async restore(id: string) {
    const doc = (await this.ofpModel.findById(id)) as SoftOrderFinishingProcess;

    if (!doc) throw new NotFoundException("OrderFinishingProcess not found");

    await doc.restore();
    return { message: "Restored successfully" };
  }

  async hardRemove(id: string) {
    const deleted = await this.ofpModel.findByIdAndDelete(id);
    if (!deleted)
      throw new NotFoundException("OrderFinishingProcess not found");

    return { message: "Hard deleted successfully" };
  }

  async findManyByManufacturingOrderIds(
    ids: Types.ObjectId[],
  ): Promise<OrderFinishingProcess[]> {
    const employeePath = OrderFinishingProcessSchema.path("employee");
    const processTypePath = OrderFinishingProcessSchema.path(
      "wareFinishingProcessType",
    );

    const populate = [employeePath, processTypePath];

    const res = await this.ofpModel
      .find({ manufacturingOrder: { $in: ids } })
      .populate(populate);

    return res;
  }
}
