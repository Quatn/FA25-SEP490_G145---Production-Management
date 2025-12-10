import { Injectable, NotFoundException } from "@nestjs/common";
import mongoose, { Model, MongooseError, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import {
  CorrugatorProcess,
  CorrugatorProcessStatus,
  ManufacturingOrder,
  ManufacturingOrderApprovalStatus,
  ManufacturingOrderDocument,
  ManufacturingOrderSchema,
  OrderStatus,
} from "../schemas/manufacturing-order.schema";
import {
  AssembledCreateManufacturingOrderRequestDto,
  CreateManufacturingOrderRequestDto,
} from "./dto/create-order-request.dto";
import {
  AssembledUpdateManufacturingOrderRequestDto,
  UpdateManufacturingOrderRequestDto,
} from "./dto/update-order-request.dto";
import { PaginatedList } from "@/common/dto/paginated-list.dto";
import { FullDetailManufacturingOrderDto } from "./dto/full-details-orders.dto";
import {
  PurchaseOrderItem,
  PurchaseOrderItemDocument,
  PurchaseOrderItemSchema,
} from "../schemas/purchase-order-item.schema";
import {
  SubPurchaseOrderDocument,
  SubPurchaseOrderSchema,
} from "../schemas/sub-purchase-order.schema";
import { PurchaseOrderSchema } from "../schemas/purchase-order.schema";
import { Ware, WareDocument, WareSchema } from "../schemas/ware.schema";
import { MOCodeGenerator } from "./business-logics/mo-code-generator";
import { getManufacturingDate } from "./business-logics/mo-manufacturing-date-getter";
import { FullDetailPurchaseOrderItemDto } from "../purchase-order-item/dto/full-details-orders.dto";
import { getCorrugatorLine } from "./business-logics/mo-corrugator-line-getter";
import { CreateResult } from "@/common/dto/create-result.dto";
import {
  OrderFinishingProcess,
  OrderFinishingProcessStatus,
} from "../schemas/order-finishing-process.schema";
import { SoftDeleteDocument } from "@/common/types/soft-delete-document";
import { DeleteResult } from "@/common/dto/delete-result.dto";
import { PatchResult } from "@/common/dto/patch-result.dto";
import check from "check-types";
import { fullDetailsFilterAggregationPipeline } from "./aggregate-pipes/full-details-filter";
import { FinishedGood } from "@/modules/warehouse/schemas/finished-good.schema";
import { IllogicalError } from "@/common/errors/illogical.error";
import { recalculateManufacturingOrder } from "./business-logics/recalculate-manufacturing-orders";
import { isRefPopulated } from "@/common/utils/populate-check";
import { UnpopulatedFieldError } from "@/common/errors/unpopulated-field.error";
import { ProductionRecalculateService } from "../common/recalculate/recalculate.service";
import { WareFinishingProcessType } from "../schemas/ware-finishing-process-type.schema";
import { queryAllByPaperTypesUsagePipeline } from "./aggregate-pipes/query-all-by-paper-types-usage";

type DocWithSoftDelete = ManufacturingOrder & SoftDeleteDocument;

@Injectable()
export class ManufacturingOrderService {
  constructor(
    @InjectModel(ManufacturingOrder.name)
    private readonly manufacturingOrderModel: Model<ManufacturingOrder>,
    @InjectModel(OrderFinishingProcess.name)
    private readonly orderFinishingProcessModel: Model<OrderFinishingProcess>,
    @InjectModel(FinishedGood.name)
    private readonly finishedGoodProcessModel: Model<FinishedGood>,
    private recalcService: ProductionRecalculateService,
  ) { }

  async recalCheckDocs(docs: ManufacturingOrderDocument[]) {
    // Record of resulting docs after the would check and recalc process
    const resultRocs: ManufacturingOrderDocument[] = [];
    // Record of ids of pois that will be recalculated
    const previouslyRecalcPOIs: string[] = [];

    for (const moDoc of docs) {
      const poi = moDoc.purchaseOrderItem as PurchaseOrderItemDocument;
      const ware = poi.ware as WareDocument;
      if (
        !previouslyRecalcPOIs.includes(poi._id.toString()) &&
        (poi.recalculateFlag || ware.recalculateFlag)
      ) {
        previouslyRecalcPOIs.push(poi._id.toString());
      }

      const alreadyRecalcedPOI = resultRocs.find((co) =>
        (co.purchaseOrderItem as PurchaseOrderItemDocument)._id.equals(
          (moDoc.purchaseOrderItem as PurchaseOrderItemDocument)._id,
        ),
      );

      // If the poi is found on a previously recalculated mo in resultRocs, take that (presumably already recalculated) poi and reuse it instead of recalculating the poi once again
      if (alreadyRecalcedPOI) {
        moDoc.purchaseOrderItem = alreadyRecalcedPOI.purchaseOrderItem;
      } else {
        // If not then check the wares to see which can be reused from a previously recalculated MO, similar to the poi check
        const moDocWithSameWare = resultRocs.find((co) => {
          return (
            (co.purchaseOrderItem as PurchaseOrderItemDocument)
              .ware as WareDocument
          )._id.equals(
            (
              (moDoc.purchaseOrderItem as PurchaseOrderItemDocument)
                .ware as WareDocument
            )._id,
          );
        });
        const alreadyRecalcedWare = (
          moDocWithSameWare?.purchaseOrderItem as PurchaseOrderItemDocument
        )?.ware;

        if (alreadyRecalcedWare) {
          (moDoc.purchaseOrderItem as PurchaseOrderItemDocument).ware =
            alreadyRecalcedWare;
        }
      }

      // By now all pois or wares should have been recalculated or reused from the resultRocs array, however if the poi or ware recalculated then the mo must also be recalculated, so if the current mo's poi or ware have just been recalculated or was reused from the resultRocs array, set the mo's recalculateFlag to true.
      if (previouslyRecalcPOIs.includes(poi._id.toString())) {
        moDoc.set("recalculateFlag", true);
      }
      const recaledMoDoc =
        await this.recalcService.checkAndRecalculateManufacturingOrderDoc(
          moDoc,
        );

      resultRocs.push(recaledMoDoc);
    }

    return resultRocs;
  }

  async findAll() {
    const poiPath = ManufacturingOrderSchema.path("purchaseOrderItem");
    const subpoPath = PurchaseOrderItemSchema.path("subPurchaseOrder");
    const poPath = SubPurchaseOrderSchema.path("purchaseOrder");
    const customerPath = PurchaseOrderSchema.path("customer");

    const populate = {
      path: poiPath.path,
      populate: [
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
    };

    return await this.manufacturingOrderModel
      .find({
        "corrugatorProcess.manufacturedAmount": { $gt: 0 },
      })
      .populate(populate);
  }

  async getLastOrder() {
    const order = await this.manufacturingOrderModel
      .find()
      .sort({
        _id: -1,
      })
      .limit(1);
    if (order.length < 1) {
      throw Error("Cannot get last order since no orders exist in the system");
    }
    return order[0];
  }

  async queryListFullDetails({
    page,
    limit,
    filter = {},
  }: {
    page: number;
    limit: number;
    filter?: object;
  }): Promise<PaginatedList<FullDetailManufacturingOrderDto>> {
    const skip = (page - 1) * limit;

    const pipeline = fullDetailsFilterAggregationPipeline({
      filter,
      skip,
      limit,
    });

    const [data, countArr] = await Promise.all([
      this.manufacturingOrderModel.aggregate([...pipeline]),
      this.manufacturingOrderModel.aggregate([
        ...pipeline.filter((stage) => !("$skip" in stage || "$limit" in stage)),
        { $count: "total" },
      ]),
    ]);
    const totalItems =
      (countArr[0] as { total: number } | undefined)?.total ?? 0;

    // console.log(data);

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const moDocs = (data as ManufacturingOrderDocument[]).map((mo) =>
      this.manufacturingOrderModel.hydrate(mo),
    );

    const recalCheckedOrders = await this.recalCheckDocs(moDocs);

    const ids = recalCheckedOrders.map((mo) => mo._id);

    const finishedGoodRecords = await this.finishedGoodProcessModel.find({
      manufacturingOrder: { $in: ids },
    });

    const mappedData: FullDetailManufacturingOrderDto[] =
      recalCheckedOrders.map((mo) => {
        return new FullDetailManufacturingOrderDto({
          ...mo.toJSON(),
          finishedGoodRecord: finishedGoodRecords.find((record) =>
            (record.manufacturingOrder as Types.ObjectId).equals(mo._id),
          ),
        });
      });

    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage,
      hasPrevPage,
      data: mappedData,
    };
  }

  async draftOrderByFullDetailsPois({
    purchaseOrderItems,
  }: {
    purchaseOrderItems: FullDetailPurchaseOrderItemDto[];
  }): Promise<FullDetailManufacturingOrderDto[]> {
    const lastOrder = await this.getLastOrder()
      .then((order) => order)
      .catch(() => undefined);
    const codeGenerator = new MOCodeGenerator(lastOrder?.code);

    const mos: FullDetailManufacturingOrderDto[] = purchaseOrderItems.map(
      (poi, index): FullDetailManufacturingOrderDto => ({
        code: codeGenerator.getCode(index),
        purchaseOrderItem: poi,
        approvalStatus: ManufacturingOrderApprovalStatus.Draft,
        overallStatus: OrderStatus.NOTSTARTED,
        corrugatorProcess: {
          manufacturedAmount: 0,
          status: CorrugatorProcessStatus.NOTSTARTED,
          actualPaperWidth: 0,
          actualRunningLength: 0,
          note: "",
        },
        manufacturingDate: getManufacturingDate(
          poi.subPurchaseOrder.deliveryDate,
          poi.subPurchaseOrder.purchaseOrder.customer.code,
        ),
        manufacturingDateAdjustment: null,
        requestedDatetime: null,
        corrugatorLine: getCorrugatorLine(
          poi.ware.fluteCombination.code,
          poi.subPurchaseOrder.purchaseOrder.customer.code,
        ),
        corrugatorLineAdjustment: null,
        amount: poi.amount,
        numberOfBlanks: 0,
        longitudinalCutCount: 0,
        runningLength: 0,
        faceLayerPaperWeight: null,
        EFlutePaperWeight: null,
        EBLinerLayerPaperWeight: null,
        BFlutePaperWeight: null,
        BACLinerLayerPaperWeight: null,
        ACFlutePaperWeight: null,
        backLayerPaperWeight: null,
        totalVolume: 0,
        totalWeight: 0,
        manufacturingDirective: null,
        note: "",
        recalculateFlag: true,
        isDeleted: false,
      }),
    );

    return mos;
  }

  // This might not work, just use createMany for everything
  async createOne(dto: CreateManufacturingOrderRequestDto) {
    const doc = new this.manufacturingOrderModel(dto);
    return await doc.save();
  }

  async createMany(
    dtos: AssembledCreateManufacturingOrderRequestDto[],
  ): Promise<
    CreateResult<{
      codes: string[];
      processesCreateResult: CreateResult<{ codes: string[] }>;
    }>
  > {
    const lastOrder = await this.getLastOrder()
      .then((order) => order)
      .catch(() => undefined);
    const codeGenerator = new MOCodeGenerator(lastOrder?.code);

    const mos: (ManufacturingOrder & { _id: Types.ObjectId })[] = dtos.map(
      (poi, index) => {
        const moId = new Types.ObjectId();
        const code = codeGenerator.getCode(index);

        return {
          _id: moId,
          code,
          approvalStatus: ManufacturingOrderApprovalStatus.Draft,
          purchaseOrderItem: poi.purchaseOrderItemId,
          overallStatus: OrderStatus.NOTSTARTED,
          corrugatorProcess: {
            manufacturedAmount: 0,
            status: CorrugatorProcessStatus.NOTSTARTED,
            actualPaperWidth: 0,
            actualRunningLength: 0,
            note: "",
          },
          manufacturingDate: getManufacturingDate(
            poi.purchaseOrderItem.subPurchaseOrder.deliveryDate,
            poi.purchaseOrderItem.subPurchaseOrder.purchaseOrder.customer.code,
          ),
          manufacturingDateAdjustment: poi.manufacturingDateAdjustment,
          requestedDatetime: poi.requestedDatetime,
          corrugatorLine: getCorrugatorLine(
            poi.purchaseOrderItem.ware.fluteCombination.code,
            poi.purchaseOrderItem.subPurchaseOrder.purchaseOrder.customer.code,
          ),
          corrugatorLineAdjustment: poi.corrugatorLineAdjustment,
          amount: poi.purchaseOrderItem.amount,
          numberOfBlanks: 0,
          longitudinalCutCount: 0,
          runningLength: 0,
          faceLayerPaperWeight: null,
          EFlutePaperWeight: null,
          EBLinerLayerPaperWeight: null,
          BFlutePaperWeight: null,
          BACLinerLayerPaperWeight: null,
          ACFlutePaperWeight: null,
          backLayerPaperWeight: null,
          totalVolume: 0,
          totalWeight: 0,
          manufacturingDirective: poi.manufacturingDirective,
          note: poi.note,
          recalculateFlag: true,
          isDeleted: false,
        };
      },
    );

    const moCreateRes = await this.manufacturingOrderModel.create(mos);

    const finishingProcessesCreateRes = await Promise.all(
      moCreateRes.map(async (mo) => {
        const ware = dtos.find(
          (dto) =>
            dto.purchaseOrderItemId.toString() ===
            (mo.purchaseOrderItem as Types.ObjectId).toString(),
        )?.purchaseOrderItem.ware;

        if (check.undefined(ware)) {
          throw new IllogicalError(
            "An ware from moCreateRes somehow not found in createManyOrdersDto",
          );
        }

        const processes: OrderFinishingProcess[] = ware.finishingProcesses.map(
          (type, index) => {
            return {
              code: `${mo.code}-${index + 1}`,
              manufacturingOrder: mo._id,
              wareFinishingProcessType: type,
              sequenceNumber: index + 1,
              requiredAmount: mo.amount,
              completedAmount: 0,
              status: OrderFinishingProcessStatus.PendingApproval,
              note: "",
              isDeleted: false,
            };
          },
        );

        return await this.orderFinishingProcessModel.create(processes);
      }),
    );

    const finishingProcessesCreatedAmount = finishingProcessesCreateRes
      .map((res) => res.length)
      .reduce((acc, res) => acc + res, 0);

    const finishingProcessesRequestedAmount = dtos
      .map((dto) => dto.purchaseOrderItem.ware.finishingProcesses.length)
      .reduce((acc, res) => acc + res, 0);

    return {
      requestedAmount: dtos.length,
      createdAmount: moCreateRes.length,
      echo: {
        codes: moCreateRes.map((item) => item.code),
        processesCreateResult: {
          createdAmount: finishingProcessesCreatedAmount,
          requestedAmount: finishingProcessesRequestedAmount,
          echo: {
            codes: finishingProcessesCreateRes.flatMap((res) =>
              res.map((res2) => res2.code),
            ),
          },
        },
      },
    };
  }

  // TODO, or just use updateMany for single updates, idk
  async updateOne(dto: UpdateManufacturingOrderRequestDto) {
    // const doc = new this.manufacturingOrderModel(dto);
    // return await doc.save();
  }

  async updateMany(
    dtos: AssembledUpdateManufacturingOrderRequestDto[],
  ): Promise<PatchResult<{ codes: string[] }>> {
    const poiPath = ManufacturingOrderSchema.path("purchaseOrderItem");
    const subpoPath = PurchaseOrderItemSchema.path("subPurchaseOrder");
    const warePath = PurchaseOrderItemSchema.path("ware");
    const fluteCombinationPath = WareSchema.path("fluteCombination");
    const finishingProcessesPath = WareSchema.path("finishingProcesses");
    const poPath = SubPurchaseOrderSchema.path("purchaseOrder");
    const productPath = SubPurchaseOrderSchema.path("product");
    const customerPath = PurchaseOrderSchema.path("customer");
    const wareManufacturingProcessTypePath = WareSchema.path(
      "wareManufacturingProcessType",
    );

    const populate = {
      path: poiPath.path,
      populate: [
        {
          path: warePath.path,
          populate: [
            fluteCombinationPath,
            finishingProcessesPath,
            wareManufacturingProcessTypePath,
          ],
        },
        {
          path: subpoPath.path,
          populate: [
            productPath,
            {
              path: poPath.path,
              populate: { path: customerPath.path },
            },
          ],
        },
      ],
    };

    const items = await this.manufacturingOrderModel
      .find({
        _id: { $in: dtos.map((d) => d.id) },
      })
      .populate(populate);

    for (const dto of dtos) {
      const doc = items.find((x) => x.id === dto.id);
      if (!doc) continue;

      const poi = doc.purchaseOrderItem as FullDetailPurchaseOrderItemDto;

      doc.manufacturingDate = getManufacturingDate(
        poi.subPurchaseOrder.deliveryDate,
        poi.subPurchaseOrder.purchaseOrder.customer.code,
      );
      doc.corrugatorLine = getCorrugatorLine(
        poi.ware.fluteCombination.code,
        poi.subPurchaseOrder.purchaseOrder.customer.code,
      );

      if (dto.approvalStatus === ManufacturingOrderApprovalStatus.Approved) {
        const currentCount =
          await this.orderFinishingProcessModel.countDocuments({
            manufacturingOrder: doc._id,
          });
        if (currentCount < 1) {
          const ware = poi.ware as Ware;

          const processes: OrderFinishingProcess[] = (
            ware.finishingProcesses as WareFinishingProcessType[]
          ).map((type, index) => {
            return {
              code: `${doc.code}-${index + 1}`,
              manufacturingOrder: doc._id,
              wareFinishingProcessType: type,
              sequenceNumber: index + 1,
              requiredAmount: doc.amount,
              completedAmount: 0,
              status: OrderFinishingProcessStatus.Scheduled,
              note: "",
              isDeleted: false,
            };
          });

          await this.orderFinishingProcessModel.create(processes);
        } else {
          const processes = await this.orderFinishingProcessModel.find({
            manufacturingOrder: doc._id,
          });

          processes.forEach((pro) => {
            if (
              pro.status === OrderFinishingProcessStatus.PendingApproval ||
              pro.status === OrderFinishingProcessStatus.Approved
            ) {
              pro.set("status", OrderFinishingProcessStatus.Scheduled);
            }
          });

          await Promise.all(processes.map((pro) => pro.save()));
        }
      }

      if (dto.corrugatorProcess) {
        if (
          check.in(doc.corrugatorProcess?.status, [
            CorrugatorProcessStatus.NOTSTARTED,
            CorrugatorProcessStatus.PAUSED,
          ])
        ) {
          if (
            check.greater(
              parseInt(dto.corrugatorProcess.manufacturedAmount + ""),
              parseInt(doc.corrugatorProcess.manufacturedAmount + ""),
            )
          ) {
            dto.corrugatorProcess.status = CorrugatorProcessStatus.RUNNING;
          }
        }

        if (
          !check.in(doc.corrugatorProcess?.status, [
            CorrugatorProcessStatus.COMPLETED,
            CorrugatorProcessStatus.CANCELLED,
            CorrugatorProcessStatus.OVERCOMPLETED,
          ])
        ) {
          if (
            check.greaterOrEqual(
              parseInt(dto.corrugatorProcess.manufacturedAmount + ""),
              parseInt(doc.numberOfBlanks + ""),
            )
          ) {
            dto.corrugatorProcess.status = CorrugatorProcessStatus.COMPLETED;
          }
        }

        doc.set("corrugatorProcess", dto.corrugatorProcess);
      }
      const { corrugatorProcess: _, ...dtoWOCorruProgress } = dto;
      Object.assign(doc, dtoWOCorruProgress);

      await this.orderFinishingProcessModel.updateMany(
        { manufacturingOrder: doc._id },
        {
          $set: { requiredAmount: doc.amount },
        },
      );

      await doc.save();
    }

    return {
      requestedAmount: dtos.length,
      patchedAmount: items.length,
      echo: {
        codes: items.map((item) => item.code),
      },
    };
  }

  async deleteOne(id: mongoose.Types.ObjectId): Promise<
    DeleteResult<{
      code: string;
      orderProcessDeleteResult: DeleteResult;
    }>
  > {
    const doc = (await this.manufacturingOrderModel.findById(
      id,
    )) as DocWithSoftDelete;
    if (!doc) throw new NotFoundException("Manufacturing Order not found");
    const code = doc.code;
    await doc.softDelete();

    const processDeleteCount =
      await this.orderFinishingProcessModel.countDocuments({
        manufacturingOrder: id,
      });
    const processDeleteRes = await this.orderFinishingProcessModel.updateMany(
      { manufacturingOrder: id },
      { $set: { isDeleted: true } },
    );

    return {
      deletedAmount: 1,
      requestedAmount: 1,
      echo: {
        code,
        orderProcessDeleteResult: {
          requestedAmount: processDeleteCount,
          deletedAmount: processDeleteRes.upsertedCount,
        },
      },
    };
  }

  async restoreOne(
    id: mongoose.Types.ObjectId,
  ): Promise<PatchResult<{ code: string }>> {
    try {
      const doc = (await this.manufacturingOrderModel.findById(
        id,
      )) as DocWithSoftDelete;
      if (!doc) throw new NotFoundException("Manufacturing Order not found");
      const code = doc.code;
      await doc.restore();
      return {
        patchedAmount: 1,
        requestedAmount: 1,
        echo: { code },
      };
    } catch (e) {
      if (check.instance(e, MongooseError)) {
        console.log(e);
      }
      return {
        patchedAmount: 1,
        requestedAmount: 1,
      };
    }
  }

  async queryAllByPaperTypesUsage({
    paperTypes,
  }: {
    paperTypes: string[];
  }): Promise<FullDetailManufacturingOrderDto[]> {
    const pipeline = queryAllByPaperTypesUsagePipeline({
      paperTypes
    });

    const data = await this.manufacturingOrderModel.aggregate([...pipeline])

    const moDocs = (data as ManufacturingOrderDocument[]).map((mo) =>
      this.manufacturingOrderModel.hydrate(mo),
    );

    const recalCheckedOrders = await this.recalCheckDocs(moDocs);

    const ids = recalCheckedOrders.map((mo) => mo._id);

    const finishedGoodRecords = await this.finishedGoodProcessModel.find({
      manufacturingOrder: { $in: ids },
    });

    const mappedData: FullDetailManufacturingOrderDto[] =
      recalCheckedOrders.map((mo) => {
        return new FullDetailManufacturingOrderDto({
          ...mo.toJSON(),
          finishedGoodRecord: finishedGoodRecords.find((record) =>
            (record.manufacturingOrder as Types.ObjectId).equals(mo._id),
          ),
        });
      });

    return mappedData;
  }
}
