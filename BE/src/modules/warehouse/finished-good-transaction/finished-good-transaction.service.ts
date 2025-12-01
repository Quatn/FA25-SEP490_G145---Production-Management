import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFinishedGoodTransactionDto } from './dto/create-finished-good-transaction.dto';
import { UpdateFinishedGoodTransactionDto } from './dto/update-finished-good-transaction.dto';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { FinishedGoodTransaction, FinishedGoodTransactionDocument, FinishedGoodTransactionSchema } from '../schemas/finished-good-transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage, Types } from 'mongoose';
import { FinishedGood, FinishedGoodDocument, FinishedGoodSchema } from '../schemas/finished-good.schema';
import { TransactionType } from '../enums/transaction-type.enum';
import { ManufacturingOrderSchema } from '@/modules/production/schemas/manufacturing-order.schema';
import { PurchaseOrderItemSchema } from '@/modules/production/schemas/purchase-order-item.schema';
import { WareSchema } from '@/modules/production/schemas/ware.schema';
import { SubPurchaseOrderSchema } from '@/modules/production/schemas/sub-purchase-order.schema';
import { PurchaseOrderSchema } from '@/modules/production/schemas/purchase-order.schema';
import { GetFinishedGoodTransactionsDto } from './dto/get-finished-good-transaction.dto';

type SoftFGTransaction = FinishedGoodTransaction & SoftDeleteDocument;
@Injectable()
export class FinishedGoodTransactionService {
  constructor(
    @InjectModel(FinishedGoodTransaction.name) private readonly fgTransactionModel: Model<FinishedGoodTransactionDocument>,
    @InjectModel(FinishedGood.name) private readonly finishedModel: Model<FinishedGoodDocument>,
  ) { }

  async findPaginated(dto: GetFinishedGoodTransactionsDto) {
    const {
      page = 1,
      limit = 10,
      finishedGood,
      search,
      transactionType,
      startDate,
      endDate,
      sort,
    } = dto;

    const skip = (page - 1) * limit;
    const finishedGoodId = new Types.ObjectId(finishedGood);

    // 1. Initial Match: Filter by the Finished Good first
    const initialMatch: PipelineStage.Match = {
      $match: { finishedGood: finishedGoodId }
    };

    // 2. Calculate Running Totals ($setWindowFields)
    const calculateRunningTotals: PipelineStage = {
      $setWindowFields: {
        partitionBy: '$finishedGood',
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

    const [result] = await this.fgTransactionModel.aggregate(pipeline);

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
    return await this.fgTransactionModel.find().exec();
  }

  async findOne(id: string) {

    const empPath = FinishedGoodTransactionSchema.path('employee');
    const finishedGoodPath = FinishedGoodTransactionSchema.path("finishedGood");

    const [data] = await Promise.all([
      this.fgTransactionModel
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

  async createOne(dto: CreateFinishedGoodTransactionDto) {
    return (await this.createMany([dto]))[0];
  }

  async createMany(dtos: CreateFinishedGoodTransactionDto[]) {
    if (!Array.isArray(dtos) || dtos.length === 0) {
      throw new BadRequestException('Input must be a non-empty array.');
    }

    const session = await this.finishedModel.db.startSession();
    session.startTransaction();

    try {
      const results: FinishedGoodTransaction[] = [];

      for (const dto of dtos) {
        const result = await this._createOneInternal(dto, session);
        results.push(result);
      }

      await session.commitTransaction();
      session.endSession();

      return results;

    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  private async _createOneInternal(
    dto: CreateFinishedGoodTransactionDto,
    session: mongoose.ClientSession
  ) {
    const moId = new Types.ObjectId(dto.manufacturingOrder);

    let finishedGood = await this.finishedModel
      .findOne({ manufacturingOrder: moId })
      .session(session)
      .exec();

    if (!finishedGood) {
      finishedGood = await this.finishedModel.create(
        [{ manufacturingOrder: moId, importedQuantity: 0, exportedQuantity: 0, currentQuantity: 0 }],
        { session }
      ).then(r => r[0]);
    }

    const initialQuantity = finishedGood!.currentQuantity ?? 0;
    let finalQuantity = initialQuantity;

    if (dto.transactionType === 'IMPORT') {
      finalQuantity += dto.quantity;
      finishedGood!.importedQuantity += dto.quantity;
    } else if (dto.transactionType === 'EXPORT') {
      finalQuantity -= dto.quantity;
      finishedGood!.exportedQuantity += dto.quantity;
    }

    finishedGood!.currentQuantity = finalQuantity;
    await finishedGood!.save({ session });

    const transaction = await this.fgTransactionModel.create(
      [{
        finishedGood: finishedGood!._id,
        employee: dto.employee ? new Types.ObjectId(dto.employee) : undefined,
        transactionType: dto.transactionType,
        initialQuantity,
        finalQuantity,
        transactionDate: dto.transactionDate,
        note: dto.note,
      }],
      { session }
    ).then(r => r[0]);

    const populated = await this.fgTransactionModel
      .find({ _id: transaction._id })
      .populate(['employee', 'finishedGood'])
      .lean()
      .session(session);

    if (!populated || populated.length === 0) {
      throw new NotFoundException('Transaction not found');
    }

    return populated[0];
  }

  async updateOne(id: string, dto: UpdateFinishedGoodTransactionDto) {
    const raw: any = { ...dto };
    if (raw.finishedGood) raw.finishedGood = new Types.ObjectId(String(raw.finishedGood));
    if (raw.employee) raw.employee = new Types.ObjectId(String(raw.employee));

    const updated = await this.fgTransactionModel.findByIdAndUpdate(id, raw, { new: true });
    if (!updated) throw new NotFoundException('Transaction not found');

    const empPath = FinishedGoodTransactionSchema.path('employee');
    const finishedGoodPath = FinishedGoodTransactionSchema.path("finishedGood");

    const [data] = await Promise.all([
      this.fgTransactionModel
        .find({ _id: updated._id })
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

  async getDailyReport(startDate: string, endDate: string, transactionType: TransactionType) {

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const transactionDateQuery: any = {};
    const safeQuery: any = { transactionType };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      if (start > end) {
        throw new BadRequestException("startDate must be earlier than or equal to endDate");
      }

      if (start > today) {
        throw new BadRequestException("startDate must be earlier than or equal to today");
      }

      transactionDateQuery.transactionDate = {
        $gte: start,
        $lte: end,
      };
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      transactionDateQuery.transactionDate = { $gte: start };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      transactionDateQuery.transactionDate = { $lte: end };
    }

    if (Object.keys(transactionDateQuery).length > 0) {
      Object.assign(safeQuery, transactionDateQuery);
    }

    const fgPath = FinishedGoodTransactionSchema.path("finishedGood");
    const emPath = FinishedGoodTransactionSchema.path("employee");
    const moPath = FinishedGoodSchema.path("manufacturingOrder");
    const poiPath = ManufacturingOrderSchema.path("purchaseOrderItem");
    const subpoPath = PurchaseOrderItemSchema.path("subPurchaseOrder");
    const warePath = PurchaseOrderItemSchema.path("ware");
    const fluteCombinationPath = WareSchema.path("fluteCombination");
    const poPath = SubPurchaseOrderSchema.path("purchaseOrder");
    const customerPath = PurchaseOrderSchema.path("customer");

    const populate = [
      {
        path: fgPath.path,
        populate: {
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
      },
      {
        path: emPath.path,
      }
    ]

    const docs = await this.fgTransactionModel
      .find(safeQuery)
      .populate(populate)
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    const dailySummary = new Map<
      string,
      {
        date: string;
        dailyTotal: number;
        summaryPerFinishedGood: Map<string, { finishedGood: any; total: number }>;
      }
    >();

    for (const doc of docs) {
      const fg = doc.finishedGood;
      if (!fg?._id) continue;

      const fgId = fg._id.toString();
      const date = new Date(doc.transactionDate ?? new Date());
      const dateKey = date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .split("/")
        .reverse()
        .join("-");

      const importQty = doc.finalQuantity - doc.initialQuantity;
      const exportQty = doc.initialQuantity - doc.finalQuantity;
      const qty = transactionType === "IMPORT" ? importQty : exportQty;

      const daily = dailySummary.get(dateKey) ?? {
        date: dateKey,
        dailyTotal: 0,
        summaryPerFinishedGood: new Map(),
      };

      daily.dailyTotal += qty;

      const dailyFG = daily.summaryPerFinishedGood.get(fgId) ?? {
        finishedGood: fg,
        total: 0,
      };

      dailyFG.total += qty;
      daily.summaryPerFinishedGood.set(fgId, dailyFG);
      dailySummary.set(dateKey, daily);
    }

    return {
      success: true,
      message: "Fetch successful",
      startDate,
      endDate,
      dailySummary: Array.from(dailySummary.values()).map((d) => ({
        date: d.date,
        dailyTotal: d.dailyTotal,
        summaryPerFinishedGood: Array.from(d.summaryPerFinishedGood.values()),
      })),
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
