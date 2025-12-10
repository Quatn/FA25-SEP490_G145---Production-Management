import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SemiFinishedGoodTransaction, SemiFinishedGoodTransactionDocument, SemiFinishedGoodTransactionSchema } from '../schemas/semi-finished-good-transaction.schema';
import { Model, PipelineStage, Types } from 'mongoose';
import { CreateSemiFinishedGoodTransactionDto } from './dto/create-semi-finished-good-transaction.dto';
import { UpdateSemiFinishedGoodTransactionDto } from './dto/update-semi-finished-good-transaction.dto';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { SemiFinishedGood, SemiFinishedGoodDocument, SemiFinishedGoodSchema } from '../schemas/semi-finished-good.schema';
import { TransactionType } from '../enums/transaction-type.enum';
import { GetSemiFinishedGoodTransactionsDto } from './dto/get-semi-finished-good-transaction.dto';
import { ManufacturingOrderSchema } from '@/modules/production/schemas/manufacturing-order.schema';
import { PurchaseOrderItemSchema } from '@/modules/production/schemas/purchase-order-item.schema';
import { SubPurchaseOrderSchema } from '@/modules/production/schemas/sub-purchase-order.schema';
import { PurchaseOrderSchema } from '@/modules/production/schemas/purchase-order.schema';
import { dot } from 'node:test/reporters';

type SoftSFGTransaction = SemiFinishedGoodTransaction & SoftDeleteDocument;

@Injectable()
export class SemiFinishedGoodTransactionService {
  constructor(
    @InjectModel(SemiFinishedGoodTransaction.name) private readonly sfgTransactionModel: Model<SemiFinishedGoodTransactionDocument>,
    @InjectModel(SemiFinishedGood.name) private readonly semiModel: Model<SemiFinishedGoodDocument>,
  ) { }

  async findAdjustmentTransaction(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const filter = { transactionType: 'ADJUSTMENT' };

    const employeePath = SemiFinishedGoodTransactionSchema.path('employee');
    const sfgPath = SemiFinishedGoodTransactionSchema.path('semiFinishedGood');
    const moPath = SemiFinishedGoodSchema.path("manufacturingOrder");
    const poiPath = ManufacturingOrderSchema.path("purchaseOrderItem");
    const subpoPath = PurchaseOrderItemSchema.path("subPurchaseOrder");
    const warePath = PurchaseOrderItemSchema.path("ware");
    const poPath = SubPurchaseOrderSchema.path("purchaseOrder");
    const customerPath = PurchaseOrderSchema.path("customer");

    const populate = [{
      path: sfgPath.path,
      populate:
      {
        path: moPath.path,
        populate: [
          {
            path: poiPath.path,
            populate: [
              {
                path: warePath.path,
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
      }
    },
    {
      path: employeePath.path,
    }
    ];

    const [data, totalItems] = await Promise.all([
      this.sfgTransactionModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .populate(populate)
        .sort({ 'updatedAt': -1 })
        .exec(),
      this.sfgTransactionModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil((totalItems || 0) / limit);
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

  async findPaginated(dto: GetSemiFinishedGoodTransactionsDto) {
    const {
      page = 1,
      limit = 10,
      semiFinishedGood,
      search,
      transactionType,
      startDate,
      endDate,
      sort,
    } = dto;

    const skip = (page - 1) * limit;
    const semiFinishedGoodId = new Types.ObjectId(semiFinishedGood);

    // 1. Initial Match: Filter by the semi finished Good first
    const initialMatch: PipelineStage.Match = {
      $match: { semiFinishedGood: semiFinishedGoodId }
    };

    // 2. Calculate Running Totals ($setWindowFields)
    const calculateRunningTotals: PipelineStage = {
      $setWindowFields: {
        partitionBy: 'semiFinishedGood',
        sortBy: { createdAt: 1 },
        output: {
          runningTotalImport: {
            $sum: {
              $cond: [
                { $eq: ['$transactionType', 'IMPORT'] },
                { $subtract: ['$finalQuantity', '$initialQuantity'] }, // Amount added
                0
              ]
            },
            window: { documents: ['unbounded', 'current'] } // Sum from start to this row
          },
          runningTotalExport: {
            $sum: {
              $cond: [
                { $eq: ['$transactionType', 'EXPORT'] },
                { $abs: { $subtract: ['$finalQuantity', '$initialQuantity'] } },
                0
              ]
            },
            window: { documents: ['unbounded', 'current'] }
          }
        }
      }
    };

    // 3. Lookups (Populate)
    const lookups: PipelineStage[] = [
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeData'
        }
      },
      {
        $unwind: { path: '$employeeData', preserveNullAndEmptyArrays: true }
      }
    ];

    // 4. Secondary Filter (Search, Date, Type)
    const filterQuery: any = {};

    if (transactionType) {
      filterQuery.transactionType = transactionType;
    } else {
      filterQuery.transactionType = { $in: ["IMPORT", "EXPORT"] };
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      if (start > end) {
        throw new BadRequestException("startDate must be earlier than or equal to endDate");
      }

      filterQuery.transactionDate = {
        $gte: start,
        $lte: end,
      };
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      filterQuery.transactionDate = { $gte: start };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filterQuery.transactionDate = { $lte: end };
    }

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filterQuery.$or = [
        { 'employeeData.code': regex }
      ];
    }

    const secondaryMatch: PipelineStage.Match = { $match: filterQuery };

    // 5. Build the Final Pipeline with Facets for Pagination
    const pipeline: PipelineStage[] = [
      initialMatch,
      calculateRunningTotals,
      ...lookups,
      secondaryMatch,
      { $sort: { createdAt: sort == 'ASC' ? 1 : -1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: limit }
          ]
        }
      }
    ];

    const [result] = await this.sfgTransactionModel.aggregate(pipeline);

    const data = result.data || [];
    const totalItems = result.metadata[0]?.total || 0;

    // 6. Map to Table Format
    const tableData = data.map((doc: any, index: number) => {
      return {
        index: skip + index + 1,
        createdDate: doc.createdAt,
        transactionType: doc.transactionType,

        totalImport: doc.runningTotalImport || 0,
        totalExport: doc.runningTotalExport || 0,

        totalCurrent: doc.finalQuantity,

        transactionDate: doc.transactionDate,
        employee: doc.employeeData?.code || 'Unknown',
        note: doc.note || ''
      };
    });

    return {
      data: tableData,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      hasNextPage: page * limit < totalItems,
      hasPrevPage: page > 1,
    };
  }

  async findAll() {
    return await this.sfgTransactionModel.find().exec();
  }

  async findOne(id: string) {
    const empPath = SemiFinishedGoodTransactionSchema.path('employee');
    const finishedGoodPath = SemiFinishedGoodTransactionSchema.path("finishedGood");

    const [data] = await Promise.all([
      this.sfgTransactionModel
        .find({ _id: id })
        .populate([
          {
            path: empPath.path,
          },
          {
            path: finishedGoodPath.path,
          },
        ])
        .lean(),
    ]);

    if (!data || data.length === 0) throw new NotFoundException('Transaction not found');

    return data[0];
  }

  async createOne(dto: CreateSemiFinishedGoodTransactionDto) {
    const moId = new Types.ObjectId(dto.manufacturingOrder);
    let semi = await this.semiModel.findOne({ manufacturingOrder: moId }).exec();
    if (semi) {
      if (dto.transactionType == 'EXPORT' && semi.exportedTo == undefined) {
        semi.exportedTo = dto.exportedTo;
        await semi.save();
      }
    } else {
      semi = await this.semiModel.create({ manufacturingOrder: moId, currentQuantity: 0 });
    }

    const initialQuantity = semi.currentQuantity ?? 0;
    let finalQuantity = initialQuantity;
    if (dto.transactionType === 'IMPORT') {
      finalQuantity = initialQuantity + dto.quantity;
      semi.importedQuantity += dto.quantity;
    }
    else if (dto.transactionType === 'EXPORT') {
      finalQuantity = initialQuantity - dto.quantity;
      semi.exportedQuantity += dto.quantity;
    } else if (dto.transactionType === 'ADJUSTMENT') {
      finalQuantity = dto.quantity;
    }
    // else if (dto.transactionType === 'ADJUSTMENT') finalQuantity = dto.quantity;

    if (dto.transactionType != 'ADJUSTMENT') {
      semi.currentQuantity = finalQuantity;
      await semi.save();
    }

    const doc = new this.sfgTransactionModel({
      semiFinishedGood: semi._id,
      employee: dto.employee ? new Types.ObjectId(dto.employee) : undefined,
      transactionType: dto.transactionType,
      initialQuantity,
      finalQuantity,
      transactionDate: dto.transactionDate,
      note: dto.note,
    });
    const inserted = await doc.save();

    const pipeline = [
      { $match: { _id: inserted._id } },
      {
        $lookup: {
          from: 'semifinishedgoods',
          localField: 'semiFinishedGood',
          foreignField: '_id',
          as: 'semiFinishedGood',
        },
      },
      { $unwind: { path: '$semiFinishedGood', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
    ];
    const docs = await this.sfgTransactionModel.aggregate(pipeline).exec();
    return docs[0];
  }

  async updateOne(id: string, dto: UpdateSemiFinishedGoodTransactionDto) {
    const raw: any = { ...dto };
    if (raw.semiFinishedGood) raw.semiFinishedGood = new Types.ObjectId(String(raw.semiFinishedGood));
    if (raw.employee) raw.employee = new Types.ObjectId(String(raw.employee));

    const updated = await this.sfgTransactionModel.findByIdAndUpdate(id, raw, { new: true });
    if (!updated) throw new NotFoundException('Transaction not found');

    const pipeline = [
      { $match: { _id: updated._id } },
      {
        $lookup: {
          from: 'semifinishedgoods',
          localField: 'semiFinishedGood',
          foreignField: '_id',
          as: 'semiFinishedGood',
        },
      },
      { $unwind: { path: '$semiFinishedGood', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
    ];
    const docs = await this.sfgTransactionModel.aggregate(pipeline).exec();
    return docs[0];
  }

  async getDailyEmployees(date: string) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const pipeline: any[] = [];
    pipeline.push({
      $match: {
        createdAt: { $gte: dayStart, $lte: dayEnd },
        isDeleted: false,
      },
    });

    pipeline.push({
      $group: {
        _id: '$employee',
        transactionCount: { $sum: 1 },
      },
    });

    pipeline.push({
      $lookup: {
        from: 'employees',
        localField: '_id',
        foreignField: '_id',
        as: 'employee',
      },
    });

    pipeline.push({ $unwind: '$employee' });

    pipeline.push({
      $project: {
        _id: '$employee._id',
        name: '$employee.name',
        email: '$employee.email',
        transactionCount: 1,
      },
    });

    const data = await this.sfgTransactionModel.aggregate(pipeline).exec();

    return { data };
  }

  async getDailyReport(
    page = 1,
    limit = 10,
    date: string,
    transactionType?: TransactionType,
    employee?: string,
    manufacturingOrderId?: string) {
    const skip = (page - 1) * limit;

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
        localField: "semiFinishedGood",
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
        localField: "semiFinishedGood.manufacturingOrder",
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
        localField: "employee",
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

    if (transactionType) {
      pipeline.push({
        $match: { transactionType: transactionType },
      });
    }

    if (employee) {
      pipeline.push({
        $match: { employee: new Types.ObjectId(employee) },
      });
    }

    if (manufacturingOrderId) {
      pipeline.push({
        $match: { "semiFinishedGood.manufacturingOrder": new Types.ObjectId(manufacturingOrderId) },
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    });

    const result = await this.sfgTransactionModel.aggregate(pipeline).exec();
    const data = result[0]?.data || [];
    const totalItems = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { data, page, limit, totalItems, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
  }

  async softDelete(id: string) {
    const doc = await this.sfgTransactionModel.findById(id) as SoftSFGTransaction;
    if (!doc) throw new NotFoundException('Transaction not found');
    await doc.softDelete();
    return { success: true };
  }

  async restore(id: string) {
    const doc = await this.sfgTransactionModel.findOne({
      _id: id,
      isDeleted: true
    }) as SoftSFGTransaction;
    if (!doc) throw new NotFoundException('Transaction not found');
    await doc.restore();
    return { success: true };
  }

  async removeHard(id: string) {
    const res = await this.sfgTransactionModel.findOne({
      _id: id,
      isDeleted: true
    });
    if (!res) throw new NotFoundException('Transaction not found');
    return { success: true };
  }
}
