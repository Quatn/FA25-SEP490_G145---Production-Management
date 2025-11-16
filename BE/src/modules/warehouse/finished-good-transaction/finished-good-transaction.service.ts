import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFinishedGoodTransactionDto } from './dto/create-finished-good-transaction.dto';
import { UpdateFinishedGoodTransactionDto } from './dto/update-finished-good-transaction.dto';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { FinishedGoodTransaction, FinishedGoodTransactionDocument } from '../schemas/finished-good-transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FinishedGood, FinishedGoodDocument } from '../schemas/finished-good.schema';

type SoftFGTransaction = FinishedGoodTransaction & SoftDeleteDocument;
@Injectable()
export class FinishedGoodTransactionService {
  constructor(
    @InjectModel(FinishedGoodTransaction.name) private readonly fgTransactionModel: Model<FinishedGoodTransactionDocument>,
    @InjectModel(FinishedGood.name) private readonly finishedModel: Model<FinishedGoodDocument>,
  ) { }

  async findPaginated(page = 1, limit = 10, search?: string, finishedGoodId?: string) {
    const skip = (page - 1) * limit;
    const pipeline: any[] = [];

    pipeline.push({
      $lookup: {
        from: 'finishedgoods',
        localField: 'finishedGoodId',
        foreignField: '_id',
        as: 'finishedGood',
      },
    });
    pipeline.push({ $unwind: { path: '$finishedGood', preserveNullAndEmptyArrays: true } });

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
    if (finishedGoodId) match.finishedGoodId = new Types.ObjectId(finishedGoodId);
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      match.$or = [
        { transactionType: regex },
        { note: regex },
        { 'finishedGood.note': regex },
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

    const result = await this.fgTransactionModel.aggregate(pipeline).exec();
    const data = result[0]?.data || [];
    const totalItems = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { data, page, limit, totalItems, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
  }

  async findAll() {
    return await this.fgTransactionModel.find().exec();
  }

  async findOne(id: string) {
    const pipeline = [
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'finishedgoods',
          localField: 'finishedGoodId',
          foreignField: '_id',
          as: 'finishedGood',
        },
      },
      { $unwind: { path: '$finishedGood', preserveNullAndEmptyArrays: true } },
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

    const docs = await this.fgTransactionModel.aggregate(pipeline).exec();
    if (!docs || docs.length === 0) throw new NotFoundException('Transaction not found');
    return docs[0];
  }

  async createOne(dto: CreateFinishedGoodTransactionDto) {
    const moId = new Types.ObjectId(dto.manufacturingOrderId);
    let finishedGood = await this.finishedModel.findOne({ manufacturingOrderId: moId }).exec();
    if (!finishedGood) {
      finishedGood = await this.finishedModel.create({ manufacturingOrderId: moId, currentQuantity: 0 });
    }

    const initialQuantity = finishedGood.currentQuantity ?? 0;
    let finalQuantity = initialQuantity;
    if (dto.transactionType === 'IMPORT') finalQuantity = initialQuantity + dto.quantity;
    else if (dto.transactionType === 'EXPORT') finalQuantity = initialQuantity - dto.quantity;
    else if (dto.transactionType === 'ADJUSTMENT') finalQuantity = dto.quantity;

    finishedGood.currentQuantity = finalQuantity;
    await finishedGood.save();

    const doc = new this.fgTransactionModel({
      finishedGoodId: finishedGood._id,
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
          from: 'finishedgoods',
          localField: 'finishedGoodId',
          foreignField: '_id',
          as: 'finishedGood',
        },
      },
      { $unwind: { path: '$finishedGood', preserveNullAndEmptyArrays: true } },
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
    const docs = await this.fgTransactionModel.aggregate(pipeline).exec();
    return docs[0];
  }

  async updateOne(id: string, dto: UpdateFinishedGoodTransactionDto) {
    const raw: any = { ...dto };
    if (raw.finishedGoodId) raw.finishedGoodId = new Types.ObjectId(String(raw.finishedGoodId));
    if (raw.employeeId) raw.employeeId = new Types.ObjectId(String(raw.employeeId));

    const updated = await this.fgTransactionModel.findByIdAndUpdate(id, raw, { new: true });
    if (!updated) throw new NotFoundException('Transaction not found');

    const pipeline = [
      { $match: { _id: updated._id } },
      {
        $lookup: {
          from: 'finishedgoods',
          localField: 'finishedGoodId',
          foreignField: '_id',
          as: 'finishedGood',
        },
      },
      { $unwind: { path: '$finishedGood', preserveNullAndEmptyArrays: true } },
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
    const docs = await this.fgTransactionModel.aggregate(pipeline).exec();
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
        from: "finishedgoods",
        localField: "finishedGoodId",
        foreignField: "_id",
        as: "finishedGood",
      },
    });
    pipeline.push({
      $unwind: { path: "$finishedGood", preserveNullAndEmptyArrays: true },
    });

    pipeline.push({
      $lookup: {
        from: "manufacturingorders",
        localField: "finishedGood.manufacturingOrderId",
        foreignField: "_id",
        as: "finishedGood.manufacturingOrder",
      },
    });
    pipeline.push({
      $unwind: { path: "$finishedGood.manufacturingOrder", preserveNullAndEmptyArrays: true },
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

    const result = (await this.fgTransactionModel.aggregate(pipeline).exec())[0];

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
    const doc = await this.fgTransactionModel.findById(id) as SoftFGTransaction;
    if (!doc) throw new NotFoundException('Transaction not found');
    await doc.softDelete();
    return { success: true };
  }

  async restore(id: string) {
    const doc = await this.fgTransactionModel.findById(id) as SoftFGTransaction;
    if (!doc) throw new NotFoundException('Transaction not found');
    await doc.restore();
    return { success: true };
  }

  async removeHard(id: string) {
    const res = await this.fgTransactionModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Transaction not found');
    return { success: true };
  }
}
