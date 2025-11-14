import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMultiplePaperRollDto, CreatePaperRollDto } from './dto/create-paper-roll.dto';
import { UpdatePaperRollDto } from './dto/update-paper-roll.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PaperRoll, PaperRollDocument } from '../schemas/paper-roll.schema';
import { PaperSequenceNumber, PaperSequenceNumberDocument } from '../schemas/paper-sequence-number.schema';
import { Model, Types } from 'mongoose';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';

type SoftPaperRoll = PaperRoll & SoftDeleteDocument;

@Injectable()
export class PaperRollService {
  constructor(
    @InjectModel(PaperRoll.name) private readonly PaperRollModel: Model<PaperRollDocument>,
    @InjectModel(PaperSequenceNumber.name) private readonly SequenceModel: Model<PaperSequenceNumberDocument>,
  ) { }

  async findPaginated(
    page = 1,
    limit = 10,
    search?: string,
    sortBy: 'weight' | 'receivingDate' | 'updatedAt' | 'both' = 'both',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;

    const pipeline: any[] = [];

    pipeline.push({
      $lookup: {
        from: 'papertypes',
        localField: 'paperTypeId',
        foreignField: '_id',
        as: 'paperType',
      },
    });
    pipeline.push({ $unwind: { path: '$paperType', preserveNullAndEmptyArrays: true } });

    pipeline.push({
      $lookup: {
        from: 'papersuppliers',
        localField: 'paperSupplierId',
        foreignField: '_id',
        as: 'paperSupplier',
      },
    });
    pipeline.push({ $unwind: { path: '$paperSupplier', preserveNullAndEmptyArrays: true } });

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'paperType.width': { $regex: regex } },
            { 'paperType.grammage': { $regex: regex } },
            { 'paperSupplier.name': regex },
            { note: regex },
          ],
        },
      });
    }

    let sortStage: any = {
      weight: -1,
      updatedAt: -1,
      receivingDate: -1,
    };
    if (sortBy === 'weight') sortStage = { weight: sortOrder === 'asc' ? 1 : -1 };
    else if (sortBy === 'receivingDate') sortStage = { receivingDate: sortOrder === 'asc' ? 1 : -1 };
    else if (sortBy === 'updatedAt') sortStage = { updatedAt: sortOrder === 'asc' ? 1 : -1 };

    pipeline.push({ $sort: sortStage });

    pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    });

    const result = await this.PaperRollModel.aggregate(pipeline).exec();

    const data = result[0]?.data || [];
    const totalItems = result[0]?.totalCount[0]?.count || 0;
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

  async create(dto: CreatePaperRollDto): Promise<any> {
    const sequence = await this.SequenceModel.findOneAndUpdate(
      {},
      { $inc: { currentSequence: 1 } },
      { new: true, upsert: true },
    );

    const paperRoll = new this.PaperRollModel({
      paperSupplierId: dto.paperSupplierId,
      paperTypeId: dto.paperTypeId,
      sequenceNumber: sequence.currentSequence,
      weight: dto.weight,
      receivingDate: new Date(dto.receivingDate),
      note: dto.note,
    });

    const insertedRoll = await paperRoll.save();

    const populatedRoll = await this.PaperRollModel.aggregate([

      { $match: { _id: insertedRoll._id } },

      {
        $lookup: {
          from: 'papertypes',
          localField: 'paperTypeId',
          foreignField: '_id',
          as: 'paperType',
        },
      },

      { $unwind: { path: '$paperType', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'papersuppliers',
          localField: 'paperSupplierId',
          foreignField: '_id',
          as: 'paperSupplier',
        },
      },

      { $unwind: { path: '$paperSupplier', preserveNullAndEmptyArrays: true } },
    ]);

    return populatedRoll[0];
  }


  async createMultiple(dto: CreateMultiplePaperRollDto): Promise<any[]> {
    if (!dto.rolls || dto.rolls.length === 0) return [];

    const sequence = await this.SequenceModel.findOneAndUpdate(
      {},
      { $inc: { currentSequence: dto.rolls.length } },
      { new: true, upsert: true },
    );

    const startSequence = sequence.currentSequence - dto.rolls.length + 1;

    const rollsToInsert = dto.rolls.map((rollDto, index) => ({
      paperSupplierId: rollDto.paperSupplierId,
      paperTypeId: rollDto.paperTypeId,
      sequenceNumber: startSequence + index,
      weight: rollDto.weight,
      receivingDate: new Date(rollDto.receivingDate),
      note: rollDto.note,
    }));

    const insertedRolls = await this.PaperRollModel.insertMany(rollsToInsert);

    const populatedRolls = await this.PaperRollModel.aggregate([

      { $match: { _id: { $in: insertedRolls.map(r => r._id) } } },

      {
        $lookup: {
          from: 'papertypes',
          localField: 'paperTypeId',
          foreignField: '_id',
          as: 'paperType',
        },
      },

      { $unwind: { path: '$paperType', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'papersuppliers',
          localField: 'paperSupplierId',
          foreignField: '_id',
          as: 'paperSupplier',
        },
      },

      { $unwind: { path: '$paperSupplier', preserveNullAndEmptyArrays: true } },

      { $sort: { sequenceNumber: 1 } },
    ]);

    return populatedRolls;
  }


  async findOne(id: string): Promise<any> {
    const populatedRoll = await this.PaperRollModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'papertypes',
          localField: 'paperTypeId',
          foreignField: '_id',
          as: 'paperType',
        },
      },
      { $unwind: { path: '$paperType', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'papersuppliers',
          localField: 'paperSupplierId',
          foreignField: '_id',
          as: 'paperSupplier',
        },
      },
      { $unwind: { path: '$paperSupplier', preserveNullAndEmptyArrays: true } },
    ]);

    if (!populatedRoll || populatedRoll.length === 0) {
      throw new NotFoundException(`Paper roll #${id} not found`);
    }

    return populatedRoll[0];
  }


  async update(id: string, dto: UpdatePaperRollDto): Promise<any> {
    const updatedRoll = await this.PaperRollModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updatedRoll) throw new NotFoundException(`Paper roll #${id} not found`);

    const populatedRoll = await this.PaperRollModel.aggregate([

      { $match: { _id: updatedRoll._id } },

      {
        $lookup: {
          from: 'papertypes',
          localField: 'paperTypeId',
          foreignField: '_id',
          as: 'paperType',
        },
      },

      { $unwind: { path: '$paperType', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'papersuppliers',
          localField: 'paperSupplierId',
          foreignField: '_id',
          as: 'paperSupplier',
        },
      },

      { $unwind: { path: '$paperSupplier', preserveNullAndEmptyArrays: true } },
    ]);

    return populatedRoll[0];
  }


  async softDelete(id: string) {
    const type = await this.PaperRollModel.findById(id) as SoftPaperRoll;
    if (!type) throw new NotFoundException("Paper type not found");
    await type.softDelete();
    return { success: true };
  }

  async restore(id: string) {
    const type = await this.PaperRollModel.findById(id) as SoftPaperRoll;
    if (!type) throw new NotFoundException("Paper type not found");
    await type.restore();
    return { success: true };
  }

  async removeHard(id: string) {
    const result = await this.PaperRollModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException("Paper type not found");
    return { success: true };
  }

  async findDeleted(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    // directly query the collection with an explicit filter (this bypasses pre 'find' if you use collection)
    const filter = { isDeleted: true };
    const [data, totalCount] = await Promise.all([
      this.PaperRollModel.find(filter).skip(skip).limit(limit).populate([{ path: 'paperTypeId', populate: { path: 'paperColorId' } }, { path: 'paperSupplierId' }]).lean().exec(),
      this.PaperRollModel.countDocuments(filter),
    ]);
    const totalPages = Math.ceil((totalCount || 0) / limit);
    return {
      data,
      page,
      limit,
      totalItems: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

}
