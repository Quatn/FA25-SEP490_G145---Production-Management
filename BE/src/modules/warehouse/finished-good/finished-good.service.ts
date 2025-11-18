import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFinishedGoodDto } from './dto/create-finished-good.dto';
import { UpdateFinishedGoodDto } from './dto/update-finished-good.dto';
import { FinishedGood, FinishedGoodDocument, FinishedGoodSchema } from '../schemas/finished-good.schema';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ManufacturingOrderSchema } from '@/modules/production/schemas/manufacturing-order.schema';
import { PurchaseOrderItemSchema } from '@/modules/production/schemas/purchase-order-item.schema';
import { WareSchema } from '@/modules/production/schemas/ware.schema';
import { SubPurchaseOrderSchema } from '@/modules/production/schemas/sub-purchase-order.schema';
import { PurchaseOrderSchema } from '@/modules/production/schemas/purchase-order.schema';

type SoftFinishedGood = FinishedGood & SoftDeleteDocument;

@Injectable()
export class FinishedGoodService {
  constructor(
    @InjectModel(FinishedGood.name) private readonly model: Model<FinishedGoodDocument>,
  ) { }

  async findPaginated(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const moPath = FinishedGoodSchema.path("manufacturingOrder");
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
              populate:
              {
                path: fluteCombinationPath.path,
                // select: 'code',
              },
              // select: 'code wareWidth wareLength wareHeight',
            },
            {
              path: subpoPath.path,
              populate: [
                {
                  path: poPath.path,
                  populate: {
                    path: customerPath.path,
                    // select: 'code name address email contactNumber',
                  },
                  // select: 'code',
                },
              ],
              // select: 'deliveryDate',
            },
          ],
          // select: 'amount',
        }
      ],
      // select: 'code',
    }

    const regex = new RegExp(search?.trim() ?? "", 'i');
    const filter = search?.trim() ? {
      $or: [
        { note: regex },
        { 'manufacturingOrder.code': regex },
      ],
    } : {};

    const [totalItems, data] = await Promise.all([
      this.model.countDocuments(filter),
      this.model
        .find(filter)
        .skip(skip)
        .limit(limit)
        .populate(populate)
        .sort({ updatedAt: -1 })
        .lean(),
    ]);

    return {
      data,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      hasNextPage: page * limit < totalItems,
      hasPrevPage: page > 1,
    };
  }


  async findAll() {
    return await this.model.find().exec();
  }

  async create(dto: CreateFinishedGoodDto) {
    const doc = new this.model({
      manufacturingOrder: new Types.ObjectId(dto.manufacturingOrder),
      importedQuantity: dto.importedQuantity ?? 0,
      exportedQuantity: 0,
      currentQuantity: dto.importedQuantity ?? 0,
      note: dto.note,
    });
    const inserted = await doc.save();

    const moPath = FinishedGoodSchema.path("manufacturingOrder");

    const [data] = await Promise.all([
      this.model
        .find({ _id: inserted._id })
        .populate({
          path: moPath.path,
        })
        .lean(),
    ]);

    return data[0];
  }

  async findOne(id: string) {
    const moPath = FinishedGoodSchema.path("manufacturingOrder");

    const [data] = await Promise.all([
      this.model
        .find({ _id: id })
        .populate({
          path: moPath.path,
        })
        .lean(),
    ]);

    if (!data || data.length === 0) throw new NotFoundException('Finished goods not found');

    return data[0];
  }

  async update(id: string, dto: UpdateFinishedGoodDto) {
    const raw: any = { ...dto };
    if (raw.manufacturingOrder) raw.manufacturingOrder = new Types.ObjectId(String(raw.manufacturingOrder));

    const updated = await this.model.findByIdAndUpdate(id, raw, { new: true });
    if (!updated) throw new NotFoundException(`Finished good #${id} not found`);

    const moPath = FinishedGoodSchema.path("manufacturingOrder");

    const [data] = await Promise.all([
      this.model
        .find({ _id: id })
        .populate({
          path: moPath.path,
        })
        .lean(),
    ]);

    return data[0];
  }

  async softDelete(id: string) {
    const doc = await this.model.findById(id) as SoftFinishedGood;
    if (!doc) throw new NotFoundException('Finished good not found');
    await doc.softDelete();
    return { success: true };
  }

  async restore(id: string) {
    const doc = await this.model.findById(id) as SoftFinishedGood;
    if (!doc) throw new NotFoundException('Finished good not found');
    await doc.restore();
    return { success: true };
  }

  async removeHard(id: string) {
    const res = await this.model.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Finished good not found');
    return { success: true };
  }

}
