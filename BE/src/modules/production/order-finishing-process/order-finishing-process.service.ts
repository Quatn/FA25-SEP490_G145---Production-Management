import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderFinishingProcessDto } from './dto/create-order-finishing-process.dto';
import { UpdateOrderFinishingProcessDto } from './dto/update-order-finishing-process.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { OrderFinishingProcess, OrderFinishingProcessDocument, OrderFinishingProcessSchema } from '../schemas/order-finishing-process.schema';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { GetOrderFinishingProcessDto } from './dto/get-order-finishing-process.dto';
import { ManufacturingOrderSchema } from '../schemas/manufacturing-order.schema';
import { PurchaseOrderItemSchema } from '../schemas/purchase-order-item.schema';
import { WareSchema } from '../schemas/ware.schema';
import { SubPurchaseOrderSchema } from '../schemas/sub-purchase-order.schema';
import { PurchaseOrderSchema } from '../schemas/purchase-order.schema';

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
        note: dto.note ?? '',
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
    const {
      page = 1,
      limit = 10,
      status,
      search,
      startDate,
      endDate,
    } = query;

    const filter: any = {};

    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = s;
      }

      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = e;
      }

      if (startDate && endDate) {
        if (new Date(startDate) > new Date(endDate)) {
          throw new BadRequestException(
            "startDate must be earlier than endDate",
          );
        }
      }
    }

    if (search?.trim()) {
      const keywords = search.trim().split(/\s+/);

      const searchRegexList = keywords.map(word => {
        const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

        return {
          $or: [
            { code: regex },

            { 'manufacturingOrder.code': regex },
            { 'manufacturingOrder.purchaseOrderItem.ware.code': regex },
            { 'manufacturingOrder.purchaseOrderItem.subPurchaseOrder.purchaseOrder.code': regex },

            { 'manufacturingOrder.purchaseOrderItem.subPurchaseOrder.purchaseOrder.customer.name': regex },
            { 'manufacturingOrder.purchaseOrderItem.subPurchaseOrder.purchaseOrder.customer.code': regex },

            { 'manufacturingOrder.purchaseOrderItem.ware.fluteCombination.code': regex },

            { 'wareFinishingProcessType.name': regex },
            { 'wareFinishingProcessType.code': regex },
          ],
        };
      });

      filter.$and = searchRegexList;
    }

    const skip = (page - 1) * limit;

    const moPath = OrderFinishingProcessSchema.path("manufacturingOrder");
    const poiPath = ManufacturingOrderSchema.path("purchaseOrderItem");
    const subpoPath = PurchaseOrderItemSchema.path("subPurchaseOrder");
    const warePath = PurchaseOrderItemSchema.path("ware");
    const fluteCombinationPath = WareSchema.path("fluteCombination");
    const poPath = SubPurchaseOrderSchema.path("purchaseOrder");
    const customerPath = PurchaseOrderSchema.path("customer");

    const populate = {
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

    const [data, totalItems] = await Promise.all([
      this.ofpModel
        .find(filter)
        .populate("wareFinishingProcessType")
        .populate(populate)
        .skip(skip)
        .limit(limit),

      this.ofpModel.countDocuments(filter),
    ]);

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
      throw new NotFoundException('OrderFinishingProcess not found');
    }

    return doc;
  }

  async update(id: string, dto: UpdateOrderFinishingProcessDto) {
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
      const updated = await this.ofpModel.findByIdAndUpdate(id, raw, {
        new: true,
      });

      if (!updated) {
        throw new NotFoundException('OrderFinishingProcess not found');
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

  async softRemove(id: string) {
    const doc = await this.ofpModel.findById(id) as SoftOrderFinishingProcess;
    if (!doc) throw new NotFoundException('OrderFinishingProcess not found');

    await doc.softDelete();
    return { message: 'Soft deleted successfully' };
  }

  async restore(id: string) {
    const doc = await this.ofpModel.findById(id) as SoftOrderFinishingProcess;

    if (!doc) throw new NotFoundException('OrderFinishingProcess not found');

    await doc.restore();
    return { message: 'Restored successfully' };
  }

  async hardRemove(id: string) {
    const deleted = await this.ofpModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('OrderFinishingProcess not found');

    return { message: 'Hard deleted successfully' };
  }

  async findManyByManufacturingOrderIds(ids: Types.ObjectId[]): Promise<OrderFinishingProcess[]> {
    const res = await this.ofpModel.find({ manufacturingOrder: { $in: ids }});

    return res
  }
}
