import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SemiFinishedGoodTransaction, SemiFinishedGoodTransactionDocument, SemiFinishedGoodTransactionSchema } from '../schemas/semi-finished-good-transaction.schema';
import { Model, PipelineStage, Types } from 'mongoose';
import { CreateSemiFinishedGoodTransactionDto } from './dto/create-semi-finished-good-transaction.dto';
import { UpdateSemiFinishedGoodTransactionDto } from './dto/update-semi-finished-good-transaction.dto';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { SemiFinishedGood, SemiFinishedGoodDocument } from '../schemas/semi-finished-good.schema';
import { TransactionType } from '../enums/transaction-type.enum';
import { GetSemiFinishedGoodTransactionsDto } from './dto/get-semi-finished-good-transaction.dto';
import { HourlyStockChart } from '@/common/types/semi-finished-good-types';

type SoftSFGTransaction = SemiFinishedGoodTransaction & SoftDeleteDocument;

@Injectable()
export class SemiFinishedGoodTransactionService {
  constructor(
    @InjectModel(SemiFinishedGoodTransaction.name) private readonly sfgTransactionModel: Model<SemiFinishedGoodTransactionDocument>,
    @InjectModel(SemiFinishedGood.name) private readonly semiModel: Model<SemiFinishedGoodDocument>,
  ) { }

  async findAdjustmentTransaction(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const populateOptions = [
      {
        path: 'semiFinishedGood',
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

      const aggregateResult = await this.sfgTransactionModel.aggregate([
        { $match: { transactionType: 'ADJUSTMENT' } },

        { $lookup: { from: 'employees', localField: 'employee', foreignField: '_id', as: 'emp' } },
        { $unwind: { path: '$emp', preserveNullAndEmptyArrays: true } },

        { $lookup: { from: 'semifinishedgoods', localField: 'semiFinishedGood', foreignField: '_id', as: 'sfg' } },
        { $unwind: { path: '$sfg', preserveNullAndEmptyArrays: true } },

        { $lookup: { from: 'manufacturingorders', localField: 'sfg.manufacturingOrder', foreignField: '_id', as: 'mo' } },
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
        data = await this.sfgTransactionModel
          .find({ _id: { $in: ids } })
          .populate(populateOptions)
          .sort({ updatedAt: -1 });
      }

    } else {

      const query = { transactionType: 'ADJUSTMENT' };

      [data, totalItems] = await Promise.all([
        this.sfgTransactionModel
          .find(query)
          .skip(skip)
          .limit(limit)
          .populate(populateOptions)
          .sort({ updatedAt: -1 })
          .exec(),
        this.sfgTransactionModel.countDocuments(query),
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

  async getDailyStatistics(dateString: string) {
    const startOfDay = new Date(dateString);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateString);
    endOfDay.setHours(23, 59, 59, 999);

    const openingStockResult = await this.sfgTransactionModel.aggregate([
      {
        $match: {
          createdAt: { $lt: startOfDay },
          isDeleted: false
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$semiFinishedGood',
          lastQuantity: { $first: '$finalQuantity' }
        }
      },
      {
        $group: {
          _id: null,
          totalOpeningStock: { $sum: '$lastQuantity' }
        }
      }
    ]);

    let currentGlobalStock = openingStockResult[0]?.totalOpeningStock || 0;

    const todayTransactions = await this.sfgTransactionModel
      .find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        isDeleted: false,
      })
      .sort({ createdAt: 1 })
      .lean();

    const chartData: HourlyStockChart[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const txInHour = todayTransactions.filter((tx) => {
        return new Date(tx.createdAt).getHours() === hour;
      });

      const importVol = txInHour
        .filter((tx) => tx.transactionType === 'IMPORT')
        .reduce((sum, tx) => sum + Math.abs(tx.finalQuantity - tx.initialQuantity), 0);

      const exportVol = txInHour
        .filter((tx) => tx.transactionType === 'EXPORT')
        .reduce((sum, tx) => sum + Math.abs(tx.finalQuantity - tx.initialQuantity), 0);

      txInHour.forEach(tx => {
        const netChange = tx.finalQuantity - tx.initialQuantity;
        currentGlobalStock += netChange;
      });

      chartData.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        import: importVol,
        export: exportVol,
        stock: currentGlobalStock,
      });
    }

    return chartData;
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
