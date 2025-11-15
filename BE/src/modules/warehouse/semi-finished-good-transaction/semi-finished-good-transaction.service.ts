import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SemiFinishedGoodTransaction, SemiFinishedGoodTransactionDocument } from '../schemas/semi-finished-good-transaction.schema';
import { Model, Types } from 'mongoose';
import { CreateSemiFinishedGoodTransactionDto } from './dto/create-semi-finished-good-transaction.dto';
import { UpdateSemiFinishedGoodTransactionDto } from './dto/update-semi-finished-good-transaction.dto';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { SemiFinishedGood, SemiFinishedGoodDocument, SemiFinishedGoodSchema } from '../schemas/semi-finished-good.schema';

type SoftTx = SemiFinishedGoodTransaction & SoftDeleteDocument;

@Injectable()
export class SemiFinishedGoodTransactionService {
  constructor(
    @InjectModel(SemiFinishedGoodTransaction.name) private readonly txModel: Model<SemiFinishedGoodTransactionDocument>,
    @InjectModel(SemiFinishedGood.name) private readonly semiModel: Model<SemiFinishedGoodDocument>,
  ) { }

  async findPaginated(page = 1, limit = 10, search?: string, semiFinishedGoodId?: string) {
    const skip = (page - 1) * limit;
    const pipeline: any[] = [];

    pipeline.push({
      $lookup: {
        from: 'semifinishedgoods',
        localField: 'semiFinishedGoodId',
        foreignField: '_id',
        as: 'semiFinishedGood',
      },
    });
    pipeline.push({ $unwind: { path: '$semiFinishedGood', preserveNullAndEmptyArrays: true } });

    pipeline.push({
      $lookup: {
        from: 'employees',
        localField: 'employeeId',
        foreignField: '_id',
        as: 'employee',
      },
    });
    pipeline.push({ $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } });

    const match: any = {};
    if (semiFinishedGoodId) match.semiFinishedGoodId = new Types.ObjectId(semiFinishedGoodId);
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      match.$or = [
        { transactionType: regex },
        { note: regex },
        { 'semiFinishedGood.note': regex },
      ];
    }
    if (Object.keys(match).length) pipeline.push({ $match: match });

    pipeline.push({ $sort: { createdAt: -1 } });

    pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    });

    const result = await this.txModel.aggregate(pipeline).exec();
    const data = result[0]?.data || [];
    const totalItems = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { data, page, limit, totalItems, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
  }

  async findAll() {
    return await this.txModel.find().exec();
  }

  async findOne(id: string) {
    const pipeline = [
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'semifinishedgoods',
          localField: 'semiFinishedGoodId',
          foreignField: '_id',
          as: 'semiFinishedGood',
        },
      },
      { $unwind: { path: '$semiFinishedGood', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
    ];

    const docs = await this.txModel.aggregate(pipeline).exec();
    if (!docs || docs.length === 0) throw new NotFoundException('Transaction not found');
    return docs[0];
  }

  async createOne(dto: CreateSemiFinishedGoodTransactionDto) {
    // dto contains manufacturingOrderId and quantity
    // find or create semi finished good by manufacturingOrderId
    const moId = new Types.ObjectId(dto.manufacturingOrderId);
    let semi = await this.semiModel.findOne({ manufacturingOrderId: moId }).exec();
    if (!semi) {
      semi = await this.semiModel.create({ manufacturingOrderId: moId, currentQuantity: 0 });
    }

    const initialQuantity = semi.currentQuantity ?? 0;
    let finalQuantity = initialQuantity;
    if (dto.transactionType === 'IMPORT') finalQuantity = initialQuantity + dto.quantity;
    else if (dto.transactionType === 'EXPORT') finalQuantity = initialQuantity - dto.quantity;
    else if (dto.transactionType === 'ADJUSTMENT') finalQuantity = dto.quantity;

    // update semi finished good quantity
    semi.currentQuantity = finalQuantity;
    await semi.save();

    const doc = new this.txModel({
      semiFinishedGoodId: semi._id,
      employeeId: dto.employeeId ? new Types.ObjectId(dto.employeeId) : undefined,
      transactionType: dto.transactionType,
      initialQuantity,
      finalQuantity,
      note: dto.note,
    });
    const inserted = await doc.save();

    const pipeline = [
      { $match: { _id: inserted._id } },
      {
        $lookup: {
          from: 'semifinishedgoods',
          localField: 'semiFinishedGoodId',
          foreignField: '_id',
          as: 'semiFinishedGood',
        },
      },
      { $unwind: { path: '$semiFinishedGood', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
    ];
    const docs = await this.txModel.aggregate(pipeline).exec();
    return docs[0];
  }

  async updateOne(id: string, dto: UpdateSemiFinishedGoodTransactionDto) {
    const raw: any = { ...dto };
    if (raw.semiFinishedGoodId) raw.semiFinishedGoodId = new Types.ObjectId(raw.semiFinishedGoodId);
    if (raw.employeeId) raw.employeeId = new Types.ObjectId(raw.employeeId);

    const updated = await this.txModel.findByIdAndUpdate(id, raw, { new: true });
    if (!updated) throw new NotFoundException('Transaction not found');

    const pipeline = [
      { $match: { _id: updated._id } },
      {
        $lookup: {
          from: 'semifinishedgoods',
          localField: 'semiFinishedGoodId',
          foreignField: '_id',
          as: 'semiFinishedGood',
        },
      },
      { $unwind: { path: '$semiFinishedGood', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
    ];
    const docs = await this.txModel.aggregate(pipeline).exec();
    return docs[0];
  }

  async getDailyReport(date: string) {
    const input = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (input > today) input.setTime(today.getTime());

    const start = new Date(input);
    start.setHours(0, 0, 0, 0);

    const end = new Date(input);
    end.setHours(23, 59, 59, 999);

    const pipeline: any[] = [];

    pipeline.push({
      $lookup: {
        from: "semifinishedgoods",
        localField: "semiFinishedGoodId",
        foreignField: "_id",
        as: "semiFinishedGood",
      },
    });
    pipeline.push({
      $unwind: { path: "$semiFinishedGood", preserveNullAndEmptyArrays: true },
    });

    pipeline.push({
      $lookup: {
        from: "manufacturingorders",
        localField: "semiFinishedGood.manufacturingOrderId",
        foreignField: "_id",
        as: "semiFinishedGood.manufacturingOrder",
      },
    });
    pipeline.push({
      $unwind: { path: "$semiFinishedGood.manufacturingOrder", preserveNullAndEmptyArrays: true },
    });

    pipeline.push({
      $lookup: {
        from: "employees",
        localField: "employeeId",
        foreignField: "_id",
        as: "employee",
      },
    });
    pipeline.push({
      $unwind: { path: "$employee", preserveNullAndEmptyArrays: true },
    });

    pipeline.push({
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    });

    pipeline.push({ $sort: { createdAt: -1 } });

    pipeline.push({
      $facet: {
        data: [],
        totalCount: [{ $count: "count" }],
        importStats: [
          { $match: { transactionType: "IMPORT" } },
          {
            $project: {
              quantity: { $subtract: ["$finalQuantity", "$initialQuantity"] },
            },
          },
          { $group: { _id: null, total: { $sum: "$quantity" } } },
        ],

        exportStats: [
          { $match: { transactionType: "EXPORT" } },
          {
            $project: {
              quantity: { $subtract: ["$initialQuantity", "$finalQuantity"] },
            },
          },
          { $group: { _id: null, total: { $sum: "$quantity" } } },
        ],
      },
    });

    const result = (await this.txModel.aggregate(pipeline).exec())[0];

    const totalImport = result.importStats[0]?.total ?? 0;
    const totalExport = result.exportStats[0]?.total ?? 0;

    const data = result.data ?? [];

    return {
      date: start.toISOString().slice(0, 10),
      totalImport,
      totalExport,
      net: totalImport - totalExport,
      data,
    };
  }

  async softDelete(id: string) {
    const doc = await this.txModel.findById(id) as SoftTx;
    if (!doc) throw new NotFoundException('Transaction not found');
    await doc.softDelete();
    return { success: true };
  }

  async restore(id: string) {
    const doc = await this.txModel.findById(id) as SoftTx;
    if (!doc) throw new NotFoundException('Transaction not found');
    await doc.restore();
    return { success: true };
  }

  async removeHard(id: string) {
    const res = await this.txModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Transaction not found');
    return { success: true };
  }
}
