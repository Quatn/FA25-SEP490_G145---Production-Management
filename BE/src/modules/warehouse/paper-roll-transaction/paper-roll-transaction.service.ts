// src/modules/warehouse/paper-roll-transaction/paper-roll-transaction.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaperRollTransaction, PaperRollTransactionDocument } from '../schemas/paper-roll-transaction.schema';
import { Model, Types } from 'mongoose';
import { CreatePaperRollTransactionDto } from './dto/create-paper-roll-transaction.dto';
import { UpdatePaperRollTransactionDto } from './dto/update-paper-roll-transaction.dto';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';

type SoftTx = PaperRollTransaction & SoftDeleteDocument;

@Injectable()
export class PaperRollTransactionService {
  constructor(
    @InjectModel(PaperRollTransaction.name) private readonly txModel: Model<PaperRollTransactionDocument>,
  ) { }

  /**
   * Paginated list with optional filtering by paperRollId or search on fields.
   */
  async findPaginated(page = 1, limit = 10, search?: string, paperRollId?: string) {
    const skip = (page - 1) * limit;
    const pipeline: any[] = [];

    // --- OPTIONAL: if you want to restrict txModel itself by paperRollId (ObjectId)
    if (paperRollId) {
      // ensure we match transaction documents that reference that paperRollId
      pipeline.push({
        $match: { paperRollId: new Types.ObjectId(paperRollId) },
      });
    }

    // lookup paperRoll (keeps your previous behavior)
    pipeline.push({
      $lookup: {
        from: "paperrolls",
        let: { prId: "$paperRollId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$prId"] } } },
          // project what you need from paper roll
          { $project: { /* include fields you want: name:1, sequenceNumber:1, ... */ } },
        ],
        as: "paperRoll",
      },
    });
    pipeline.push({ $unwind: { path: "$paperRoll", preserveNullAndEmptyArrays: true } });

    // lookup employee — this uses a lookup pipeline so Mongoose soft-delete pre-find won't hide deleted employees
    pipeline.push({
      $lookup: {
        from: "employees",
        let: { empId: "$employeeId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$empId"] } } },

          // If employeeId is stored as a string (not ObjectId) in transactions, replace the above line with:
          // { $match: { $expr: { $eq: ["$_id", { $toObjectId: "$$empId" }] } } },

          // drop fields you don't want to return (example)
          { $project: { password: 0, someSecretField: 0 } },
        ],
        as: "employee",
      },
    });
    pipeline.push({ $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } });

    // Build search match (search across transactionType, inCharge, paperRoll.name, paperRoll.sequenceNumber)
    const match: any = {};
    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      match.$or = [
        { transactionType: regex },
        { inCharge: regex },
        { "paperRoll.name": regex },
        { "paperRoll.sequenceNumber": regex },
      ];
    }

    if (Object.keys(match).length) pipeline.push({ $match: match });

    // sort + facet for pagination
    pipeline.push({ $sort: { timeStamp: -1 } });

    pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    });

    const result = await this.txModel.aggregate(pipeline).exec();
    const data = result[0]?.data || [];
    const totalItems = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { data, page, limit, totalItems, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
  }

  async findAll() {
    const pipeline: any[] = [];

    // lookup paperRoll
    pipeline.push({
      $lookup: {
        from: "paperrolls",
        let: { prId: "$paperRollId" },
        pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$prId"] } } }],
        as: "paperRoll",
      },
    });
    pipeline.push({ $unwind: { path: "$paperRoll", preserveNullAndEmptyArrays: true } });

    // lookup employee (will include deleted employees)
    pipeline.push({
      $lookup: {
        from: "employees",
        let: { empId: "$employeeId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$empId"] } } },
          // if empId stored as string, use $toObjectId conversion as noted above
        ],
        as: "employee",
      },
    });
    pipeline.push({ $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } });

    // optional: sort (same as paginated results)
    pipeline.push({ $sort: { timeStamp: -1 } });

    return await this.txModel.aggregate(pipeline).exec();
  }

  async findOne(id: string) {
    const pipeline = [
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'paperrolls',
          localField: 'paperRollId',
          foreignField: '_id',
          as: 'paperRoll',
        },
      },
      { $unwind: { path: '$paperRoll', preserveNullAndEmptyArrays: true } },
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

  async createOne(dto: CreatePaperRollTransactionDto) {
    const doc = new this.txModel({
      paperRollId: new Types.ObjectId(dto.paperRollId),
      employeeId: dto.employeeId ? new Types.ObjectId(dto.employeeId) : undefined,
      transactionType: dto.transactionType,
      initialWeight: dto.initialWeight,
      finalWeight: dto.finalWeight,
      timeStamp: new Date(dto.timeStamp),
      inCharge: dto.inCharge,
    });
    const inserted = await doc.save();

    // return populated
    const pipeline = [
      { $match: { _id: inserted._id } },
      {
        $lookup: {
          from: 'paperrolls',
          localField: 'paperRollId',
          foreignField: '_id',
          as: 'paperRoll',
        },
      },
      { $unwind: { path: '$paperRoll', preserveNullAndEmptyArrays: true } },
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

  async updateOne(id: string, dto: UpdatePaperRollTransactionDto) {
    const raw: any = { ...dto };
    if (raw.paperRollId) raw.paperRollId = new Types.ObjectId(raw.paperRollId);
    if (raw.employeeId) raw.employeeId = new Types.ObjectId(raw.employeeId);
    if (raw.timeStamp) raw.timeStamp = new Date(raw.timeStamp);

    const updated = await this.txModel.findByIdAndUpdate(id, raw, { new: true });
    if (!updated) throw new NotFoundException('Transaction not found');

    // populate like others
    const pipeline = [
      { $match: { _id: updated._id } },
      {
        $lookup: {
          from: 'paperrolls',
          localField: 'paperRollId',
          foreignField: '_id',
          as: 'paperRoll',
        },
      },
      { $unwind: { path: '$paperRoll', preserveNullAndEmptyArrays: true } },
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
