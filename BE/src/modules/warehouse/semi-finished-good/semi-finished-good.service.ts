import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSemiFinishedGoodDto } from './dto/create-semi-finished-good.dto';
import { UpdateSemiFinishedGoodDto } from './dto/update-semi-finished-good.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SemiFinishedGood, SemiFinishedGoodDocument } from '../schemas/semi-finished-good.schema';
import { Model, Types } from 'mongoose';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';

type SoftSemi = SemiFinishedGood & SoftDeleteDocument;

@Injectable()
export class SemiFinishedGoodService {
  constructor(
    @InjectModel(SemiFinishedGood.name) private readonly model: Model<SemiFinishedGoodDocument>,
  ) { }

  async findPaginated(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'manufacturingorders',
          localField: 'manufacturingOrderId',
          foreignField: '_id',
          as: 'manufacturingOrder',
        },
      },
      {
        $unwind: {
          path: '$manufacturingOrder',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      pipeline.push({
        $match: {
          $or: [
            { note: regex },
            { 'manufacturingOrder.code': regex },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { updatedAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    );

    const result = await this.model.aggregate(pipeline).exec();
    const data = result[0]?.data || [];
    const totalItems = result[0]?.totalCount[0]?.count || 0;

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
      manufacturingOrderId: new Types.ObjectId(dto.manufacturingOrderId),
      currentQuantity: dto.currentQuantity ?? 0,
      note: dto.note,
    });
    const inserted = await doc.save();

    const pipeline = [
      { $match: { _id: inserted._id } },
      {
        $lookup: {
          from: 'manufacturingorders',
          localField: 'manufacturingOrderId',
          foreignField: '_id',
          as: 'manufacturingOrder',
        },
      },
      { $unwind: { path: '$manufacturingOrder', preserveNullAndEmptyArrays: true } },
    ];

    const docs = await this.model.aggregate(pipeline).exec();
    return docs[0];
  }

  async findOne(id: string) {
    const pipeline = [
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'manufacturingorders',
          localField: 'manufacturingOrderId',
          foreignField: '_id',
          as: 'manufacturingOrder',
        },
      },
      { $unwind: { path: '$manufacturingOrder', preserveNullAndEmptyArrays: true } },
    ];

    const docs = await this.model.aggregate(pipeline).exec();
    if (!docs || docs.length === 0) throw new NotFoundException(`Semi-finished good #${id} not found`);
    return docs[0];
  }

  async update(id: string, dto: UpdateSemiFinishedGoodDto) {
    const raw: any = { ...dto };
    if (raw.manufacturingOrderId) raw.manufacturingOrderId = new Types.ObjectId(raw.manufacturingOrderId);

    const updated = await this.model.findByIdAndUpdate(id, raw, { new: true });
    if (!updated) throw new NotFoundException(`Semi-finished good #${id} not found`);

    const pipeline = [
      { $match: { _id: updated._id } },
      {
        $lookup: {
          from: 'manufacturingorders',
          localField: 'manufacturingOrderId',
          foreignField: '_id',
          as: 'manufacturingOrder',
        },
      },
      { $unwind: { path: '$manufacturingOrder', preserveNullAndEmptyArrays: true } },
    ];

    const docs = await this.model.aggregate(pipeline).exec();
    return docs[0];
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
