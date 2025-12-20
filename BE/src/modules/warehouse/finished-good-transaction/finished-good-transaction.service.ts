import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFinishedGoodTransactionDto } from './dto/create-finished-good-transaction.dto';
import { UpdateFinishedGoodTransactionDto } from './dto/update-finished-good-transaction.dto';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { FinishedGoodTransaction, FinishedGoodTransactionDocument, FinishedGoodTransactionSchema } from '../schemas/finished-good-transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage, Types } from 'mongoose';
import { FinishedGood, FinishedGoodDocument } from '../schemas/finished-good.schema';
import { GetFinishedGoodTransactionsDto } from './dto/get-finished-good-transaction.dto';
import { FinishedGoodDailyReportResponse } from '@/common/types/finished-good-types';
import { GetFinishedGoodDailyReportDto } from './dto/get-finished-good-daily-report.dto';
import { ManufacturingOrder } from '@/modules/production/schemas/manufacturing-order.schema';
import { PurchaseOrderItem, PurchaseOrderItemStatus } from '@/modules/production/schemas/purchase-order-item.schema';

type SoftFGTransaction = FinishedGoodTransaction & SoftDeleteDocument;
@Injectable()
export class FinishedGoodTransactionService {
  constructor(
    @InjectModel(FinishedGoodTransaction.name) private readonly fgTransactionModel: Model<FinishedGoodTransactionDocument>,
    @InjectModel(FinishedGood.name) private readonly finishedModel: Model<FinishedGoodDocument>,
    @InjectModel(ManufacturingOrder.name) private readonly moModel: Model<ManufacturingOrder>,
    @InjectModel(PurchaseOrderItem.name) private readonly poiModel: Model<PurchaseOrderItem>,
  ) { }

  async findAdjustmentTransaction(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const populateOptions = [
      {
        path: 'finishedGood',
        populate: {
          path: 'manufacturingOrder',
          populate: [
            {
              path: 'purchaseOrderItem',
              populate: [
                { path: 'ware' },
                {
                  path: 'subPurchaseOrder',
                  populate: {
                    path: 'purchaseOrder',
                    populate: { path: 'customer' }
                  }
                }
              ]
            }
          ]
        }
      },
      { path: 'employee' }
    ];

    let data: any = [];
    let totalItems = 0;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      const aggregateResult = await this.fgTransactionModel.aggregate([
        { $match: { transactionType: 'ADJUSTMENT' } },

        { $lookup: { from: 'employees', localField: 'employee', foreignField: '_id', as: 'emp' } },
        { $unwind: { path: '$emp', preserveNullAndEmptyArrays: true } },

        { $lookup: { from: 'finishedGoods', localField: 'finishedGood', foreignField: '_id', as: 'fg' } },
        { $unwind: { path: '$fg', preserveNullAndEmptyArrays: true } },

        { $lookup: { from: 'manufacturingorders', localField: 'fg.manufacturingOrder', foreignField: '_id', as: 'mo' } },
        { $unwind: { path: '$mo', preserveNullAndEmptyArrays: true } },

        { $lookup: { from: 'purchaseorderitems', localField: 'mo.purchaseOrderItem', foreignField: '_id', as: 'poi' } },
        { $unwind: { path: '$poi', preserveNullAndEmptyArrays: true } },

        { $lookup: { from: 'wares', localField: 'poi.ware', foreignField: '_id', as: 'ware' } },
        { $unwind: { path: '$ware', preserveNullAndEmptyArrays: true } },

        { $lookup: { from: 'subpurchaseorders', localField: 'poi.subPurchaseOrder', foreignField: '_id', as: 'subpo' } },
        { $unwind: { path: '$subpo', preserveNullAndEmptyArrays: true } },

        { $lookup: { from: 'purchaseorders', localField: 'subpo.purchaseOrder', foreignField: '_id', as: 'po' } },
        { $unwind: { path: '$po', preserveNullAndEmptyArrays: true } },

        { $lookup: { from: 'customers', localField: 'po.customer', foreignField: '_id', as: 'customer' } },
        { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },

        {
          $match: {
            $or: [
              { 'mo.code': regex },
              { 'ware.code': regex },
              { 'po.code': regex },
              { 'customer.code': regex },
              { 'emp.code': regex }
            ]
          }
        },

        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              { $sort: { updatedAt: -1 } },
              { $skip: skip },
              { $limit: limit },
              { $project: { _id: 1 } }
            ]
          }
        }
      ]);

      const result = aggregateResult[0];
      totalItems = result.metadata[0]?.total || 0;
      const ids = result.data.map((item: any) => item._id);

      if (ids.length > 0) {
        data = await this.fgTransactionModel
          .find({ _id: { $in: ids } })
          .populate(populateOptions)
          .sort({ updatedAt: -1 });
      }

    } else {

      const query = { transactionType: 'ADJUSTMENT' };

      [data, totalItems] = await Promise.all([
        this.fgTransactionModel
          .find(query)
          .skip(skip)
          .limit(limit)
          .populate(populateOptions)
          .sort({ updatedAt: -1 })
          .exec(),
        this.fgTransactionModel.countDocuments(query),
      ]);
    }

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
    const [result] = await this.createMany([dto]);
    return result;
  }

  async createMany(dtos: CreateFinishedGoodTransactionDto[]) {
    if (!dtos?.length) {
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
      return results;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  private async _createOneInternal(
    dto: CreateFinishedGoodTransactionDto,
    session: mongoose.ClientSession
  ) {
    const moId = new Types.ObjectId(dto.manufacturingOrder);

    let finishedGood = await this.finishedModel
      .findOne({ manufacturingOrder: moId })
      .session(session);

    if (!finishedGood) {
      [finishedGood] = await this.finishedModel.create(
        [{ manufacturingOrder: moId, importedQuantity: 0, exportedQuantity: 0, currentQuantity: 0 }],
        { session }
      );
    }

    const initialQuantity = finishedGood!.currentQuantity ?? 0;
    let finalQuantity = initialQuantity;

    if (finishedGood) {
      switch (dto.transactionType) {
        case 'IMPORT':
          finalQuantity += dto.quantity;
          finishedGood.importedQuantity += dto.quantity;
          break;

        case 'EXPORT':

          if (initialQuantity < dto.quantity) {
            throw new BadRequestException(
              `Lỗi xuất kho vượt quá số lượng tồn. Tồn kho: ${initialQuantity}, Yêu cầu xuất: ${dto.quantity}`
            );
          }

          finalQuantity -= dto.quantity;
          finishedGood.exportedQuantity += dto.quantity;

          await this._checkAndCompletePurchaseOrderItem(moId, finishedGood.exportedQuantity, session);
          break;

        case 'ADJUSTMENT':
          finalQuantity = dto.quantity;
          break;
      }
    }

    if (dto.transactionType != 'ADJUSTMENT' && finishedGood) {
      finishedGood.currentQuantity = finalQuantity;
      await finishedGood.save({ session });
    }

    const [transaction] = await this.fgTransactionModel.create(
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
    );

    const populated = await this.fgTransactionModel
      .findById(transaction._id)
      .populate(['employee', 'finishedGood'])
      .session(session)
      .lean();

    if (!populated) throw new NotFoundException('Transaction record creation failed');
    return populated;
  }

  private async _checkAndCompletePurchaseOrderItem(
    moId: Types.ObjectId,
    totalExported: number,
    session: mongoose.ClientSession
  ) {
    const mo = await this.moModel
      .findById(moId)
      .select('purchaseOrderItem')
      .session(session)
      .lean();

    if (!mo || !mo.purchaseOrderItem) return;

    const poi = await this.poiModel
      .findById(mo.purchaseOrderItem)
      .session(session);

    if (poi && totalExported >= poi.amount) {
      poi.status = PurchaseOrderItemStatus.Completed;
      await poi.save({ session });
    }
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

  async getDailyReport(dto: GetFinishedGoodDailyReportDto): Promise<FinishedGoodDailyReportResponse> {
    const { startDate, endDate, transactionType, search } = dto;
    const isPaginated = dto.page !== undefined && dto.limit !== undefined;

    const page = isPaginated ? Number(dto.page) : 1;
    const limit = isPaginated ? Number(dto.limit) : 0;
    const skip = isPaginated ? (page - 1) * limit : 0;

    const facetStage = isPaginated
      ? {
        $facet: {
          metadata: [{ $count: 'totalFinishedGoods' }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      }
      : {
        $facet: {
          metadata: [{ $count: 'totalFinishedGoods' }],
          data: [],
        },
      };

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const safeMatch: Record<string, any> = {};
    if (transactionType) safeMatch.transactionType = transactionType;

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (start > today) throw new BadRequestException('startDate must be earlier than or equal to today');
      safeMatch.transactionDate = { ...safeMatch.transactionDate, $gte: start };
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      safeMatch.transactionDate = { ...safeMatch.transactionDate, $lte: end };
    }

    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      if (s > e) throw new BadRequestException('startDate must be earlier than or equal to endDate');
    }

    const regex = search && search.trim() !== '' ? new RegExp(search.trim(), 'i') : null;

    const pipeline: any[] = [
      { $match: safeMatch },

      // 1. Finished Good
      { $lookup: { from: 'finishedgoods', localField: 'finishedGood', foreignField: '_id', as: 'fg' } },
      { $unwind: { path: '$fg', preserveNullAndEmptyArrays: false } },

      // 2. Manufacturing Order
      { $lookup: { from: 'manufacturingorders', localField: 'fg.manufacturingOrder', foreignField: '_id', as: 'mo' } },
      { $unwind: { path: '$mo', preserveNullAndEmptyArrays: true } },

      // 3. Purchase Order Item
      { $lookup: { from: 'purchaseorderitems', localField: 'mo.purchaseOrderItem', foreignField: '_id', as: 'poi' } },
      { $unwind: { path: '$poi', preserveNullAndEmptyArrays: true } },

      // 4. Ware
      { $lookup: { from: 'wares', localField: 'poi.ware', foreignField: '_id', as: 'ware' } },
      { $unwind: { path: '$ware', preserveNullAndEmptyArrays: true } },

      // 5. Flute
      { $lookup: { from: 'flutecombinations', localField: 'ware.fluteCombination', foreignField: '_id', as: 'flute' } },
      { $unwind: { path: '$flute', preserveNullAndEmptyArrays: true } },

      // 6. Sub PO
      { $lookup: { from: 'subpurchaseorders', localField: 'poi.subPurchaseOrder', foreignField: '_id', as: 'subpo' } },
      { $unwind: { path: '$subpo', preserveNullAndEmptyArrays: true } },

      // 7. PO
      { $lookup: { from: 'purchaseorders', localField: 'subpo.purchaseOrder', foreignField: '_id', as: 'po' } },
      { $unwind: { path: '$po', preserveNullAndEmptyArrays: true } },

      // 8. Customer
      { $lookup: { from: 'customers', localField: 'po.customer', foreignField: '_id', as: 'customer' } },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },

      {
        $addFields: {
          dateKey: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate' } },
          qty: {
            $cond: {
              if: { $eq: ['$transactionType', 'IMPORT'] },
              then: { $subtract: ['$finalQuantity', '$initialQuantity'] },
              else: { $subtract: ['$initialQuantity', '$finalQuantity'] },
            },
          },
        },
      },

      ...(regex
        ? [
          {
            $match: {
              $or: [
                { 'mo.code': regex },
                { 'ware.code': regex },
                { 'po.code': regex },
                { 'customer.name': regex },
                { 'flute.code': regex },
              ],
            },
          },
        ]
        : []),

      {
        $addFields: {
          'fg.manufacturingOrder': '$mo',
        }
      },
      {
        $addFields: {
          'fg.manufacturingOrder.purchaseOrderItem': '$poi',
        }
      },
      {
        $addFields: {
          'fg.manufacturingOrder.purchaseOrderItem.ware': '$ware',
          'fg.manufacturingOrder.purchaseOrderItem.subPurchaseOrder': '$subpo',
        }
      },
      {
        $addFields: {
          'fg.manufacturingOrder.purchaseOrderItem.ware.fluteCombination': '$flute',
          'fg.manufacturingOrder.purchaseOrderItem.subPurchaseOrder.purchaseOrder': '$po',
        }
      },
      {
        $addFields: {
          'fg.manufacturingOrder.purchaseOrderItem.subPurchaseOrder.purchaseOrder.customer': '$customer',
        }
      },

      // --- Grouping ---
      // 1. Group by FG + Date
      {
        $group: {
          _id: { fgId: '$fg._id', date: '$dateKey' },
          quantity: { $sum: '$qty' },
          finishedGood: { $first: '$fg' },
        },
      },

      // 2. Group by FG (aggregate dates)
      {
        $group: {
          _id: '$_id.fgId',
          finishedGood: { $first: '$finishedGood' },
          totalQuantity: { $sum: '$quantity' },
          breakdownPerDate: {
            $push: {
              date: '$_id.date',
              quantity: '$quantity',
            },
          },
        },
      },

      { $sort: { 'finishedGood.updatedAt': -1 } },

    ];

    const aggResult = await this.fgTransactionModel.aggregate([...pipeline, facetStage,]).exec();
    const metadata = aggResult?.[0]?.metadata?.[0] ?? { totalFinishedGoods: 0 };
    const dataRaw = aggResult?.[0]?.data ?? [];

    return {
      fromDate: startDate,
      toDate: endDate,
      page: isPaginated ? page : null,
      limit: isPaginated ? limit : null,
      totalFinishedGoods: metadata.totalFinishedGoods,
      totalPages: isPaginated ? Math.ceil(metadata.totalFinishedGoods / limit) : 1,
      data: dataRaw,
    };
  }

  async softDelete(id: string) {
    const doc = await this.fgTransactionModel.findById(id) as SoftFGTransaction;
    if (!doc) throw new NotFoundException('Transaction not found');
    await doc.softDelete();
    return { success: true };
  }

  async restore(id: string) {
    const doc = await this.fgTransactionModel.findOne({
      _id: id,
      isDeleted: true
    }) as SoftFGTransaction;
    if (!doc) throw new NotFoundException('Transaction not found');
    await doc.restore();
    return { success: true };
  }

  async removeHard(id: string) {
    const res = await this.fgTransactionModel.findOne({
      _id: id,
      isDeleted: true
    });
    if (!res) throw new NotFoundException('Transaction not found');
    return { success: true };
  }
}
