import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSemiFinishedGoodDto } from './dto/create-semi-finished-good.dto';
import { UpdateSemiFinishedGoodDto } from './dto/update-semi-finished-good.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SemiFinishedGood, SemiFinishedGoodDocument, SemiFinishedGoodSchema } from '../schemas/semi-finished-good.schema';
import { Model, Types } from 'mongoose';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { ManufacturingOrderSchema } from '@/modules/production/schemas/manufacturing-order.schema';
import { PurchaseOrderItemSchema } from '@/modules/production/schemas/purchase-order-item.schema';
import { WareSchema } from '@/modules/production/schemas/ware.schema';
import { SubPurchaseOrderSchema } from '@/modules/production/schemas/sub-purchase-order.schema';
import { PurchaseOrderSchema } from '@/modules/production/schemas/purchase-order.schema';

type SoftSemi = SemiFinishedGood & SoftDeleteDocument;

@Injectable()
export class SemiFinishedGoodService {
  constructor(
    @InjectModel(SemiFinishedGood.name) private readonly model: Model<SemiFinishedGoodDocument>,
  ) { }

  async findPaginated(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    let matchFilter: any = {};

    if (search?.trim()) {
      const keywords = search.trim().split(/\s+/);

      const regexConditions = keywords.map((word) => {
        const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

        return {
          $or: [
            { 'mo.code': regex },
            { 'ware.code': regex },
            { 'po.code': regex },
            { 'customer.name': regex },
            { 'customer.code': regex },
            { 'fluteCombination.code': regex },
            { 'deliveryDateFormatted': regex },
          ],
        };
      });

      const matchingIds = await this.model.aggregate([
        // --- A. Standard Joins (MO, POI, Ware) ---
        {
          $lookup: { from: 'manufacturingorders', localField: 'manufacturingOrder', foreignField: '_id', as: 'mo' },
        },
        { $unwind: { path: '$mo', preserveNullAndEmptyArrays: true } },
        {
          $lookup: { from: 'purchaseorderitems', localField: 'mo.purchaseOrderItem', foreignField: '_id', as: 'poi' },
        },
        { $unwind: { path: '$poi', preserveNullAndEmptyArrays: true } },
        {
          $lookup: { from: 'wares', localField: 'poi.ware', foreignField: '_id', as: 'ware' },
        },
        { $unwind: { path: '$ware', preserveNullAndEmptyArrays: true } },

        // --- B. Flute Join ---
        {
          $lookup: { from: 'flutecombinations', localField: 'ware.fluteCombination', foreignField: '_id', as: 'fluteCombination' },
        },
        { $unwind: { path: '$fluteCombination', preserveNullAndEmptyArrays: true } },

        // --- C. Deep Joins (SubPO -> PO -> Customer) ---
        {
          $lookup: { from: 'subpurchaseorders', localField: 'poi.subPurchaseOrder', foreignField: '_id', as: 'subpo' },
        },
        { $unwind: { path: '$subpo', preserveNullAndEmptyArrays: true } },
        {
          $lookup: { from: 'purchaseorders', localField: 'subpo.purchaseOrder', foreignField: '_id', as: 'po' },
        },
        { $unwind: { path: '$po', preserveNullAndEmptyArrays: true } },
        {
          $lookup: { from: 'customers', localField: 'po.customer', foreignField: '_id', as: 'customer' },
        },
        { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },

        {
          $addFields: {
            deliveryDateFormatted: {
              $dateToString: { format: "%d/%m/%Y", date: "$subpo.deliveryDate", onNull: "" }
            }
          }
        },

        // Every keyword must find a home in at least one field
        {
          $match: {
            $and: regexConditions
          },
        },

        // --- F. Return IDs ---
        { $project: { _id: 1 } },
      ]);

      const ids = matchingIds.map((doc) => doc._id);
      matchFilter = ids.length > 0 ? { _id: { $in: ids } } : { _id: { $in: [] } };
    }

    const moPath = SemiFinishedGoodSchema.path("manufacturingOrder");
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

    const [totalItems, data] = await Promise.all([
      this.model.countDocuments(matchFilter),
      this.model
        .find(matchFilter)
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

  async create(dto: CreateSemiFinishedGoodDto) {
    const doc = new this.model({
      manufacturingOrder: new Types.ObjectId(dto.manufacturingOrder),
      importedQuantity: dto.importedQuantity ?? 0,
      exportedQuantity: 0,
      currentQuantity: dto.importedQuantity ?? 0,
      note: dto.note,
    });
    const inserted = await doc.save();

    const moPath = SemiFinishedGoodSchema.path("manufacturingOrder");

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
    const moPath = SemiFinishedGoodSchema.path("manufacturingOrder");

    const [data] = await Promise.all([
      this.model
        .find({ _id: id })
        .populate({
          path: moPath.path,
        })
        .lean(),
    ]);

    if (!data || data.length === 0) throw new NotFoundException('Semi-finished goods not found');

    return data[0];
  }

  async update(id: string, dto: UpdateSemiFinishedGoodDto) {
    const raw: any = { ...dto };
    if (raw.manufacturingOrder) raw.manufacturingOrder = new Types.ObjectId(String(raw.manufacturingOrder));

    const updated = await this.model.findByIdAndUpdate(id, raw, { new: true });
    if (!updated) throw new NotFoundException(`Finished good #${id} not found`);

    const moPath = SemiFinishedGoodSchema.path("manufacturingOrder");

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
    const doc = await this.model.findById(id) as SoftSemi;
    if (!doc) throw new NotFoundException('Semi-finished good not found');
    await doc.softDelete();
    return { success: true };
  }

  async restore(id: string) {
    const doc = await this.model.findById(id) as SoftSemi;
    if (!doc) throw new NotFoundException('Semi-finished good not found');
    await doc.restore();
    return { success: true };
  }

  async removeHard(id: string) {
    const res = await this.model.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Semi-finished good not found');
    return { success: true };
  }

}
