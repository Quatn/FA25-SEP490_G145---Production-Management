import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFinishedGoodTransactionDto } from './dto/create-finished-good-transaction.dto';
import { UpdateFinishedGoodTransactionDto } from './dto/update-finished-good-transaction.dto';
import { SoftDeleteDocument } from '@/common/types/soft-delete-document';
import { FinishedGoodTransaction, FinishedGoodTransactionDocument, FinishedGoodTransactionSchema } from '../schemas/finished-good-transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FinishedGood, FinishedGoodDocument, FinishedGoodSchema } from '../schemas/finished-good.schema';
import { TransactionType } from '../enums/transaction-type.enum';
import { ManufacturingOrderSchema } from '@/modules/production/schemas/manufacturing-order.schema';
import { PurchaseOrderItemSchema } from '@/modules/production/schemas/purchase-order-item.schema';
import { WareSchema } from '@/modules/production/schemas/ware.schema';
import { SubPurchaseOrderSchema } from '@/modules/production/schemas/sub-purchase-order.schema';
import { PurchaseOrderSchema } from '@/modules/production/schemas/purchase-order.schema';

type SoftFGTransaction = FinishedGoodTransaction & SoftDeleteDocument;
@Injectable()
export class FinishedGoodTransactionService {
  constructor(
    @InjectModel(FinishedGoodTransaction.name) private readonly fgTransactionModel: Model<FinishedGoodTransactionDocument>,
    @InjectModel(FinishedGood.name) private readonly finishedModel: Model<FinishedGoodDocument>,
  ) { }

  async findPaginated(page = 1, limit = 10, finishedGood: string, search?: string, transactionType?: TransactionType) {
    const skip = (page - 1) * limit;

    const empPath = FinishedGoodTransactionSchema.path('employee');
    const finishedGoodPath = FinishedGoodTransactionSchema.path('finishedGood');

    const populate = [
      {
        path: empPath.path,
      },
      {
        path: finishedGoodPath.path,
      }
    ]

    const match: any = { finishedGood: finishedGood };

    if (transactionType) {
      match.transactionType = transactionType;
    }

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), "i");

      match.$or = [
        { transactionType: regex },
        { note: regex },
        { "finishedGood.note": regex }
      ];
    }

    const [totalItems, data] = await Promise.all([
      this.fgTransactionModel.countDocuments(match),
      this.fgTransactionModel
        .find(match)
        .skip(skip)
        .limit(limit)
        .populate(populate)
        .sort({ updatedAt: -1 })
        .lean(),
    ]);

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
    const moId = new Types.ObjectId(dto.manufacturingOrder);
    let finishedGood = await this.finishedModel.findOne({ manufacturingOrder: moId }).exec();
    if (!finishedGood) {
      finishedGood = await this.finishedModel.create({ manufacturingOrder: moId, importedQuantity: 0 });
    }

    const initialQuantity = finishedGood.currentQuantity ?? 0;
    let finalQuantity = initialQuantity;
    if (dto.transactionType === 'IMPORT') {
      finalQuantity = initialQuantity + dto.quantity;
      finishedGood.importedQuantity += dto.quantity;
    }
    else if (dto.transactionType === 'EXPORT') {
      finalQuantity = initialQuantity - dto.quantity;
      finishedGood.exportedQuantity += dto.quantity;
    }

    finishedGood.currentQuantity = finalQuantity;
    await finishedGood.save();

    const doc = new this.fgTransactionModel({
      finishedGood: finishedGood._id,
      employee: dto.employee ? new Types.ObjectId(dto.employee) : undefined,
      transactionType: dto.transactionType,
      initialQuantity,
      finalQuantity,
      note: dto.note,
      currentStatus: 'CANCEL'
    });
    const inserted = await doc.save();

    const empPath = FinishedGoodTransactionSchema.path('employee');
    const finishedGoodPath = FinishedGoodTransactionSchema.path("finishedGood");

    const [data] = await Promise.all([
      this.fgTransactionModel
        .find({ _id: inserted._id })
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
    const inputSD = new Date(startDate);
    const inputED = new Date(endDate);

    const start = new Date(inputSD);
    start.setHours(0, 0, 0, 0);

    const end = new Date(inputED);
    end.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (start > end) throw new BadRequestException("Invalid date range");
    if (start > today) throw new BadRequestException("Invalid date range");

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
      .find({
        createdAt: { $gte: start, $lte: end },
        transactionType,
      })
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
      const date = new Date(doc.createdAt ?? new Date());
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
