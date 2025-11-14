import { Injectable, ForbiddenException } from "@nestjs/common";
import mongoose,{ Model, Types, FilterQuery } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import {
  ManufacturingOrder,
  ManufacturingOrderDocument,
  ManufacturingOrderSchema,
  OrderStatus,
} from "../schemas/manufacturing-order.schema";
import {
  AssembledCreateManufacturingOrderRequestDto,
  CreateManufacturingOrderRequestDto,
} from "./dto/create-order-request.dto";
import { UpdateManufacturingOrderRequestDto } from "./dto/update-order-request.dto";
import { PaginatedList } from "@/common/dto/paginated-list.dto";
import { FullDetailManufacturingOrderDto } from "./dto/full-details-orders.dto";
import {
  PurchaseOrderItem,
  PurchaseOrderItemSchema,
} from "../schemas/purchase-order-item.schema";
import { SubPurchaseOrderSchema } from "../schemas/sub-purchase-order.schema";
import { PurchaseOrderSchema } from "../schemas/purchase-order.schema";
import { Ware, WareSchema } from "../schemas/ware.schema";
import { MOCodeGenerator } from "./business-logics/mo-code-generator";
import { getManufacturingDate } from "./business-logics/mo-manufacturing-date-getter";
import { FullDetailPurchaseOrderItemDto } from "../purchase-order-item/dto/full-details-orders.dto";
import { getCorrugatorLine } from "./business-logics/mo-corrugator-line-getter";
import { CreateResult } from "@/common/dto/create-result.dto";
import { ManufacturingOrderProcess, ManufacturingOrderProcessDocument, ProcessStatus } from "../schemas/manufacturing-order-process.schema";
import { CorrugatorProcess, CorrugatorProcessDocument, CorrugatorProcessStatus } from "../schemas/corrugator-process.schema";
import { FindAllMoQueryDto } from "./dto/find-all-mo-query.dto";
import { UpdateOverallStatusDto } from "./dto/update-overall-status.dto";

@Injectable()
export class ManufacturingOrderService {
  constructor(
   
    @InjectModel(
      ManufacturingOrder.name,
    ) private readonly manufacturingOrderModel: Model<ManufacturingOrder>,
 

    @InjectModel(ManufacturingOrderProcess.name) 
    private readonly manufacturingOrderProcessModel: Model<ManufacturingOrderProcessDocument>, 

    @InjectModel(CorrugatorProcess.name)
    private readonly corrugatorProcessModel: Model<CorrugatorProcessDocument>,
  ) {}

  /**
   * Lấy danh sách MO đã populate đầy đủ dữ liệu (có phân trang và filter)
   */
  async findAllPopulated(queryDto: FindAllMoQueryDto) {
    // ... (Giữ nguyên logic filter) ...
    const {
      page = 1,
      limit = 10,
      search_code,
      corrugatorLine,
      mfg_date_from,
      mfg_date_to,
      req_date_from,
      req_date_to,
      overallStatus,
      corrugatorProcessStatus,
      paperWidth,
    } = queryDto;

    const skip = (page - 1) * limit;
    const filter: FilterQuery<ManufacturingOrderDocument> = {};

    if (search_code) {
      filter.code = { $regex: search_code, $options: "i" };
    }
    if (corrugatorLine) {
      filter.corrugatorLine = corrugatorLine;
    }
    if (overallStatus) {
      filter.overallStatus = overallStatus;
    }
    if (mfg_date_from || mfg_date_to) {
      filter.manufacturingDate = {};
      if (mfg_date_from) {
        filter.manufacturingDate.$gte = new Date(mfg_date_from);
      }
      if (mfg_date_to) {
        const toDate = new Date(mfg_date_to);
        toDate.setHours(23, 59, 59, 999);
        filter.manufacturingDate.$lte = toDate;
      }
    }
    if (req_date_from || req_date_to) {
      filter.requestedDatetime = {};
      if (req_date_from) {
        filter.requestedDatetime.$gte = new Date(req_date_from);
      }
      if (req_date_to) {
        const toDate = new Date(req_date_to);
        toDate.setHours(23, 59, 59, 999);
        filter.requestedDatetime.$lte = toDate;
      }
    }
    // 3. Xây dựng pipeline aggregate
    const pipeline: any[] = [
      { $match: filter },
      // Lookup purchaseOrderItem để filter theo ware.paperWidth
      {
        $lookup: {
          from: "purchaseorderitems",
          localField: "purchaseOrderItem",
          foreignField: "_id",
          as: "purchaseOrderItemData",
        },
      },
      {
        $unwind: {
          path: "$purchaseOrderItemData",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup ware để filter theo paperWidth
      {
        $lookup: {
          from: "wares",
          localField: "purchaseOrderItemData.ware",
          foreignField: "_id",
          as: "wareData",
        },
      },
      {
        $unwind: {
          path: "$wareData",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup corrugatorProcess để filter theo status
      {
        $lookup: {
          from: "corrugatorprocesses",
          localField: "corrugatorProcess",
          foreignField: "_id",
          as: "corrugatorProcessData",
        },
      },
      {
        $unwind: {
          path: "$corrugatorProcessData",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    // Filter theo paperWidth nếu có
    if (paperWidth !== undefined && paperWidth !== null && !isNaN(Number(paperWidth))) {
      pipeline.push({
        $match: {
          "wareData.paperWidth": Number(paperWidth),
        },
      });
    }

    // Filter theo corrugatorProcessStatus nếu có
    if (corrugatorProcessStatus) {
      pipeline.push({
        $match: {
          "corrugatorProcessData.status": corrugatorProcessStatus,
        },
      });
    }

    // Tiếp tục với sort và pagination
    pipeline.push(
      {
        $addFields: {
          statusOrder: {
            $switch: {
              branches: [
                // <-- THAY ĐỔI: Đã xóa OVERCOMPLETED và sắp xếp lại
                {
                  case: { $eq: ["$overallStatus", OrderStatus.RUNNING] },
                  then: 1,
                },
                {
                  case: { $eq: ["$overallStatus", OrderStatus.PAUSED] },
                  then: 2,
                },
                {
                  case: { $eq: ["$overallStatus", OrderStatus.NOTSTARTED] },
                  then: 3,
                },
                {
                  case: { $eq: ["$overallStatus", OrderStatus.COMPLETED] },
                  then: 4,
                },
                {
                  case: { $eq: ["$overallStatus", OrderStatus.CANCELLED] },
                  then: 5,
                },
              ],
              default: 6, // Các trạng thái khác (nếu có)
            },
          },
        },
      },
      { $sort: { statusOrder: 1, manufacturingDate: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    // Tính lại total sau khi filter corrugatorProcessStatus và paperWidth
    let total = await this.manufacturingOrderModel.countDocuments(filter);
    if (corrugatorProcessStatus || (paperWidth !== undefined && paperWidth !== null)) {
      // Nếu có filter corrugatorProcessStatus hoặc paperWidth, cần count lại sau khi lookup
      const countPipeline: any[] = [
        { $match: filter },
        {
          $lookup: {
            from: "purchaseorderitems",
            localField: "purchaseOrderItem",
            foreignField: "_id",
            as: "purchaseOrderItemData",
          },
        },
        {
          $unwind: {
            path: "$purchaseOrderItemData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "wares",
            localField: "purchaseOrderItemData.ware",
            foreignField: "_id",
            as: "wareData",
          },
        },
        {
          $unwind: {
            path: "$wareData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "corrugatorprocesses",
            localField: "corrugatorProcess",
            foreignField: "_id",
            as: "corrugatorProcessData",
          },
        },
        {
          $unwind: {
            path: "$corrugatorProcessData",
            preserveNullAndEmptyArrays: true,
          },
        },
      ];

      // Thêm filter paperWidth nếu có
      if (paperWidth !== undefined && paperWidth !== null && !isNaN(Number(paperWidth))) {
        countPipeline.push({
          $match: {
            "wareData.paperWidth": Number(paperWidth),
          },
        });
      }

      // Thêm filter corrugatorProcessStatus nếu có
      if (corrugatorProcessStatus) {
        countPipeline.push({
          $match: {
            "corrugatorProcessData.status": corrugatorProcessStatus,
          },
        });
      }

      countPipeline.push({ $count: "total" });
      const countResult = await this.manufacturingOrderModel.aggregate(countPipeline).exec();
      total = countResult[0]?.total || 0;
    }

    const aggregatedData = await this.manufacturingOrderModel.aggregate(pipeline).exec();

    // ... (Giữ nguyên logic populate) ...
    const data = await this.manufacturingOrderModel.populate(aggregatedData, [
      { path: "corrugatorProcess" },
      {
        path: "purchaseOrderItem",
        populate: {
          path: "ware",
          populate: { path: "manufacturingProcesses" },
        },
      },
      {
        path: "processes",
        model: "ManufacturingOrderProcess",
        options: { sort: { processNumber: 1 } },
        populate: {
          path: "processDefinition",
        },
      },
    ]);

    return { data, total, page, limit };
  }

  /**
   * Cập nhật trạng thái tổng thể (PAUSED, CANCELLED, RUNNING, NOTSTARTED)
   * và đồng bộ xuống tất cả công đoạn con VÀ quy trình sóng.
   */
  async updateOverallStatus(
    moId: string,
    dto: UpdateOverallStatusDto,
  ): Promise<ManufacturingOrderDocument> {
    const { status: newStatus } = dto;

    const mo = await this.manufacturingOrderModel.findById(moId);
    if (!mo) {
      throw new ForbiddenException("Không tìm thấy lệnh sản xuất.");
    }

    const current = mo.overallStatus;

    // (Giữ nguyên logic kiểm tra chuyển đổi trạng thái)
    if (current === OrderStatus.NOTSTARTED) {
      throw new ForbiddenException(
        "Lệnh ở trạng thái Chưa bắt đầu không thể thay đổi.",
      );
    }
    if (current === OrderStatus.RUNNING) {
      if (
        newStatus !== OrderStatus.PAUSED &&
        newStatus !== OrderStatus.CANCELLED
      ) {
        throw new ForbiddenException(
          "Lệnh đang chạy chỉ được chuyển sang Tạm dừng hoặc Hủy.",
        );
      }
    }
    if (current === OrderStatus.CANCELLED || current === OrderStatus.PAUSED) {
      if (
        newStatus !== OrderStatus.RUNNING &&
        newStatus !== OrderStatus.NOTSTARTED
      ) {
        throw new ForbiddenException(
          "Lệnh đang Hủy hoặc Tạm dừng chỉ được chuyển sang Chạy hoặc Chưa bắt đầu.",
        );
      }
    }
    // (Kết thúc logic kiểm tra)

    mo.overallStatus = newStatus;

    let newProcessStatus: ProcessStatus | null = null;
    // <-- THAY ĐỔI: Thêm biến cho trạng thái Sóng
    let newCorrugatorStatus: CorrugatorProcessStatus | null = null;

    if (newStatus === OrderStatus.CANCELLED) {
      newProcessStatus = ProcessStatus.CANCELLED;
      newCorrugatorStatus = CorrugatorProcessStatus.CANCELLED; // <-- THAY ĐỔI
    } else if (newStatus === OrderStatus.PAUSED) {
      newProcessStatus = ProcessStatus.PAUSED;
      newCorrugatorStatus = CorrugatorProcessStatus.PAUSED; // <-- THAY ĐỔI
    } else if (newStatus === OrderStatus.RUNNING) {
      newProcessStatus = ProcessStatus.RUNNING;
      newCorrugatorStatus = CorrugatorProcessStatus.RUNNING; // <-- THAY ĐỔI
    } else if (newStatus === OrderStatus.NOTSTARTED) {
      newProcessStatus = ProcessStatus.NOTSTARTED;
      newCorrugatorStatus = CorrugatorProcessStatus.NOTSTARTED; // <-- THAY ĐỔI
    }

    // <-- THAY ĐỔI: Mở rộng logic đồng bộ
    // Nếu chuyển sang PAUSED, CANCELLED, hoặc NOTSTARTED, đồng bộ xuống tất cả MOP và Sóng
    if (
      newProcessStatus === ProcessStatus.PAUSED ||
      newProcessStatus === ProcessStatus.CANCELLED ||
      newProcessStatus === ProcessStatus.NOTSTARTED // <-- THÊM NOTSTARTED
    ) {
      // Cập nhật MOPs
      await this.manufacturingOrderProcessModel.updateMany(
        { manufacturingOrder: new Types.ObjectId(moId) },
        { $set: { status: newProcessStatus } },
      );

      // <-- THAY ĐỔI: Cập nhật cả Corrugator Process
      await this.corrugatorProcessModel.updateMany(
        { manufacturingOrder: new Types.ObjectId(moId) },
        { $set: { status: newCorrugatorStatus } },
      );
    }
    return await mo.save();
  }

  // Giữ nguyên hàm createOne của bạn
  async queryList({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<PaginatedList<ManufacturingOrder>> {
    const skip = (page - 1) * limit;

    // temp
    const filter = {};

    // temp
    const populate = [];

    const [totalItems, data] = await Promise.all([
      this.manufacturingOrderModel.countDocuments(filter),
      this.manufacturingOrderModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .populate(populate || []),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage,
      hasPrevPage,
      data,
    };
  }

  async getLastOrder() {
    const order = await this.manufacturingOrderModel.find().limit(1).sort({
      code: -1,
    });
    if (order.length < 1) {
      throw Error("Cannot get last order since no orders exist in the system");
    }
    return order[0];
  }

  async queryListFullDetails({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<PaginatedList<FullDetailManufacturingOrderDto>> {
    const skip = (page - 1) * limit;

    // temp
    const filter = {};

    const poiPath = ManufacturingOrderSchema.path("purchaseOrderItem");
    const subpoPath = PurchaseOrderItemSchema.path("subPurchaseOrder");
    const warePath = PurchaseOrderItemSchema.path("ware");
    const fluteCombinationPath = WareSchema.path("fluteCombination");
    const finishingProcessesPath = WareSchema.path("finishingProcesses");
    const poPath = SubPurchaseOrderSchema.path("purchaseOrder");
    const productPath = SubPurchaseOrderSchema.path("product");
    const customerPath = PurchaseOrderSchema.path("customer");

    const populate = {
      path: poiPath.path,
      populate: [
        {
          path: warePath.path,
          populate: [fluteCombinationPath, finishingProcessesPath],
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

    const [totalItems, data] = await Promise.all([
      this.manufacturingOrderModel.countDocuments(filter),
      this.manufacturingOrderModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .populate(populate)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const mappedData: FullDetailManufacturingOrderDto[] = data.map(
      (mo) => new FullDetailManufacturingOrderDto(mo),
    );

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
      (poi, index) => ({
        code: codeGenerator.getCode(index),
        purchaseOrderItem: poi,
        overallStatus: OrderStatus.NOTSTARTED,
        processes: [],
        corrugatorProcess: null as any, // Will be set when creating actual order
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
        manufacturedAmount: 0,
        manufacturingDirective: "",
        note: "",
        recalculateFlag: false,
        isDeleted: false,
      } as any),
    );

    return mos;
  }

  async createOne(dto: CreateManufacturingOrderRequestDto) {
    const doc = new this.manufacturingOrderModel(dto);
    return await doc.save();
  }

  async createMany(
    dtos: AssembledCreateManufacturingOrderRequestDto[],
  ): Promise<CreateResult<{ codes: string[] }>> {
    const lastOrder = await this.getLastOrder()
      .then((order) => order)
      .catch(() => undefined);
    const codeGenerator = new MOCodeGenerator(lastOrder?.code);

    const mos = dtos.map((poi, index) => ({
      code: codeGenerator.getCode(index),
      purchaseOrderItem: poi.purchaseOrderItemId,
      overallStatus: OrderStatus.NOTSTARTED,
      processes: [],
      corrugatorProcess: new Types.ObjectId(), // TODO: Get actual corrugatorProcess ID
      manufacturingDate: getManufacturingDate(
        poi.purchaseOrderItem.subPurchaseOrder.deliveryDate,
        poi.purchaseOrderItem.subPurchaseOrder.purchaseOrder.customer.code,
      ),
      manufacturingDateAdjustment: null,
      requestedDatetime: null,
      corrugatorLine: getCorrugatorLine(
        poi.purchaseOrderItem.ware.fluteCombination.code,
        poi.purchaseOrderItem.subPurchaseOrder.purchaseOrder.customer.code,
      ),
      corrugatorLineAdjustment: null,
      manufacturedAmount: 0,
      manufacturingDirective: "",
      note: "",
      recalculateFlag: false,
      isDeleted: false,
    } as any));

    const result = await this.manufacturingOrderModel.create(mos);

    // TODO: create finishing processes

    return {
      requestedAmount: dtos.length,
      createdAmount: result.length,
      echo: {
        codes: result.map((item) => item.code),
      },
    };
  }

  // TODO
  async updateOne(dto: UpdateManufacturingOrderRequestDto) {
    // const doc = new this.manufacturingOrderModel(dto);
    // return await doc.save();
  }
}
