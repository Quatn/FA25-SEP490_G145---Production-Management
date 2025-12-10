import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMultiplePaperRollDto, CreatePaperRollDto } from './dto/create-paper-roll.dto';
import { UpdatePaperRollDto } from './dto/update-paper-roll.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PaperRoll, PaperRollDocument } from '../schemas/paper-roll.schema';
import { PaperSequenceNumber, PaperSequenceNumberDocument } from '../schemas/paper-sequence-number.schema';
import { Model, Types } from 'mongoose';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import check from 'check-types';

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
      $addFields: {
        'paperType.widthStr': {
          $cond: [
            { $ifNull: ['$paperType.width', false] },
            { $toString: '$paperType.width' },
            null,
          ],
        },
        'paperType.grammageStr': {
          $cond: [
            { $ifNull: ['$paperType.grammage', false] },
            { $toString: '$paperType.grammage' },
            null,
          ],
        },
      },
    });

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
            { 'paperType.widthStr': { $regex: regex } },
            { 'paperType.grammageStr': { $regex: regex } },
            { 'paperSupplier.name': regex },
            { 'paperSupplier.code': regex },
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
    const type = await this.PaperRollModel.findOne({
      _id: id,
      isDeleted: true
    }) as SoftPaperRoll;
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
    const filter = { isDeleted: true };

    // Use the raw collection to bypass Mongoose `pre('find')` middleware added by the plugin
    const [rawDocs, totalCount] = await Promise.all([
      // collection.find returns raw JS objects (no mongoose middleware applied)
      this.PaperRollModel.collection
        .find(filter)
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.PaperRollModel.collection.countDocuments(filter),
    ]);

    const populatedDocs = await this.PaperRollModel.populate(rawDocs, [
      { path: "paperTypeId", populate: { path: "paperColorId" } },
      { path: "paperSupplierId" },
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

  async findByPaperRollId(paperRollId: string): Promise<any> {
    const populatedRoll = await this.PaperRollModel.aggregate([
      { $match: { paperRollId: paperRollId } },
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
      throw new NotFoundException(`Paper roll with paperRollId #${paperRollId} not found`);
    }

    return populatedRoll[0];
  }


  async queryInventoryByWarePaperTypeCodes(codes: string[]): Promise<{code: string, weight: number}[]> {
    const set = new Set(codes?.flat())
    const arr = [...set].filter(p => !check.undefined(p) && !check.null(p))

    const splittedCodes = arr.map(c => c.split("/")).filter(cs => check.inRange(cs.length, 3, 4))

    if (splittedCodes.some(s => s.length == 3) && splittedCodes.some(s => s.length == 4)) {
      throw new BadRequestException("Only send an array of all face and back type codes or all middle layer codes, this is to prevent duplicated rows from showing up in the results")
    }

    const promAcc: Promise<any>[] = []

    splittedCodes.forEach((cs) => {
      if (cs.length == 3) {
        const paperColorCode = cs[0];
        const paperWidth = parseInt(cs[1]);
        const paperGrammage = parseInt(cs[2]);

        if (check.string(paperColorCode) && check.number(paperWidth) && check.number(paperGrammage)) {
          promAcc.push(this.PaperRollModel.aggregate([
            {
              $lookup: {
                from: 'papertypes',
                localField: 'paperTypeId',
                foreignField: '_id',
                as: 'paperType',
              },
            },
            { $unwind: { path: '$paperType', preserveNullAndEmptyArrays: true } },
            { $match: { "paperType.width": paperWidth, "paperType.grammage": paperGrammage } },
            {
              $lookup: {
                from: 'papercolors',
                localField: 'paperType.paperColor',
                foreignField: '_id',
                as: 'paperType.paperColor',
              },
            },
            { $unwind: { path: '$paperType.paperColor', preserveNullAndEmptyArrays: true } },
            { $match: { "paperType.paperColor.code": paperColorCode } },
            {
              $addFields: {
                code: {
                  $convert: {
                    input: cs.join("/"),
                    to: "string",
                    onError: -1, // fallback value for bad format
                    onNull: -1,
                  },
                },
              },
            },
          ]))
        }
      }
      if (cs.length == 4) {
        const paperColorCode = cs[0];
        const paperSupplierCode = cs[1];
        const paperWidth = parseInt(cs[2]);
        const paperGrammage = parseInt(cs[3]);

        if (check.string(paperColorCode) && check.number(paperWidth) && check.number(paperGrammage)) {
          promAcc.push(this.PaperRollModel.aggregate([
            {
              $lookup: {
                from: 'papertypes',
                localField: 'paperTypeId',
                foreignField: '_id',
                as: 'paperType',
              },
            },
            { $unwind: { path: '$paperType', preserveNullAndEmptyArrays: true } },
            { $match: { "paperType.width": paperWidth, "paperType.grammage": paperGrammage } },
            {
              $lookup: {
                from: 'papersuppliers',
                localField: 'paperSupplierId',
                foreignField: '_id',
                as: 'paperSupplier',
              },
            },
            { $unwind: { path: '$paperSupplier', preserveNullAndEmptyArrays: true } },
            { $match: { "paperSupplier.code": paperSupplierCode } },
            {
              $lookup: {
                from: 'papercolors',
                localField: 'paperType.paperColor',
                foreignField: '_id',
                as: 'paperType.paperColor',
              },
            },
            { $unwind: { path: '$paperType.paperColor', preserveNullAndEmptyArrays: true } },
            { $match: { "paperType.paperColor.code": paperColorCode } },
            {
              $addFields: {
                code: {
                  $convert: {
                    input: cs.join("/"),
                    to: "string",
                    onError: -1, // fallback value for bad format
                    onNull: -1,
                  },
                },
              },
            },
          ]))
        }
      }
    })

    const rolls = await Promise.all(promAcc)

    return (rolls as (PaperRoll & { code: string })[][]).map(rolls => {
      const code = rolls.at(0)?.code

      if (!code) return []
      return [rolls.reduce((acc, item) => ({ code, weight: acc.weight + item.weight }), { code, weight: 0})]
    }).flat();
  }

}
