import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import mongoose, { Model, MongooseError, Types, FilterQuery } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import {
  CorrugatorProcessStatus,
  ManufacturingOrder,
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
import { SubPurchaseOrderSchema } from "../schemas/sub-purchase-order.schema";
import { PurchaseOrderSchema } from "../schemas/purchase-order.schema";
import { Ware, WareSchema } from "../schemas/ware.schema";
import { MOCodeGenerator } from "./business-logics/mo-code-generator";
import { getManufacturingDate } from "./business-logics/mo-manufacturing-date-getter";
import { FullDetailPurchaseOrderItemDto } from "../purchase-order-item/dto/full-details-orders.dto";
import { getCorrugatorLine } from "./business-logics/mo-corrugator-line-getter";
import { CreateResult } from "@/common/dto/create-result.dto";
import {
  ManufacturingOrderProcess,
  ManufacturingOrderProcessDocument,
  ProcessStatus,
} from "../schemas/manufacturing-order-process.schema";
// import {
//   CorrugatorProcess,
//   CorrugatorProcessDocument,
//   CorrugatorProcessStatus,
// } from "../schemas/corrugator-process.schema";
import { FindAllMoQueryDto } from "./dto/find-all-mo-query.dto";
import { UpdateOverallStatusDto } from "./dto/update-overall-status.dto";
import { OrderFinishingProcess } from "../schemas/order-finishing-process.schema";
import { SoftDeleteDocument } from "@/common/types/soft-delete-document";
import { DeleteResult } from "@/common/dto/delete-result.dto";
import { PatchResult } from "@/common/dto/patch-result.dto";
import check from "check-types";
import { isRefPopulated } from "@/common/utils/populate-check";
import { UpdateManyCorrugatorProcessesDto } from "./dto/update-many-corrugator-processes.dto";
import { UpdateCorrugatorProcessDto } from "./dto/update-corrugator-process.dto";
import { fullDetailsFilterAggregationPipeline } from "./aggregate-pipes/full-details-filter";

type DocWithSoftDelete = ManufacturingOrder & SoftDeleteDocument;

@Injectable()
export class ManufacturingOrderService {
  constructor(
    @InjectModel(ManufacturingOrder.name)
    private readonly manufacturingOrderModel: Model<ManufacturingOrder>,
    @InjectModel(OrderFinishingProcess.name)
    private readonly orderFinishingProcessModel: Model<OrderFinishingProcess>,
    @InjectModel(ManufacturingOrderProcess.name)
    private readonly manufacturingOrderProcessModel: Model<ManufacturingOrderProcessDocument>,
    // @InjectModel(CorrugatorProcess.name)
    // private readonly corrugatorProcessModel: Model<CorrugatorProcessDocument>,
  ) {}

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

    return await this.manufacturingOrderModel.find().populate(populate);
  }

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
      customer,
      fluteCombination,
    } = queryDto;

    const skip = (page - 1) * limit;
    const filter: FilterQuery<ManufacturingOrderDocument> = {};

    let defaultStartDate: Date | undefined = undefined;
    let defaultEndDate: Date | undefined = undefined;

    if (!mfg_date_from && !mfg_date_to) {
      const today = new Date();

      const getMondayOfWeek = (date: Date, weekOffset: number) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1) + weekOffset * 7;
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
      };

      const getSundayOfWeek = (date: Date, weekOffset: number) => {
        const monday = getMondayOfWeek(date, weekOffset);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        return sunday;
      };

      defaultStartDate = getMondayOfWeek(today, -2); // Monday of week -2
      defaultEndDate = getSundayOfWeek(today, -1); // Sunday of week -1
    }

    // Apply default or user custom filter
    if (mfg_date_from || mfg_date_to || defaultStartDate !== undefined) {
      filter.manufacturingDate = {};

      filter.manufacturingDate.$gte = mfg_date_from
        ? new Date(mfg_date_from)
        : (defaultStartDate as Date);

      const toDate = mfg_date_to
        ? new Date(mfg_date_to)
        : (defaultEndDate as Date);

      toDate.setHours(23, 59, 59, 999);
      filter.manufacturingDate.$lte = toDate;
    }

    if (search_code) {
      filter.code = { $regex: search_code, $options: "i" };
    }
    if (corrugatorLine) {
      filter.corrugatorLine = corrugatorLine;
    }
    if (overallStatus) {
      filter.overallStatus = overallStatus;
    }

    if (corrugatorProcessStatus) {
      filter["corrugatorProcess.status"] = corrugatorProcessStatus;
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
      // Lookup purchaseOrderItem để filter theo ware.paperWidth và lấy subPurchaseOrder
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
      // Lookup fluteCombination để filter theo loại sóng
      {
        $lookup: {
          from: "flutecombinations",
          localField: "wareData.fluteCombination",
          foreignField: "_id",
          as: "fluteCombinationData",
        },
      },
      {
        $unwind: {
          path: "$fluteCombinationData",
          preserveNullAndEmptyArrays: true,
        },
      },
      //Hiện tại bỏ
      // Lookup corrugatorProcess để filter theo status
      // {
      //   $lookup: {
      //     from: "corrugatorprocesses",
      //     localField: "corrugatorProcess",
      //     foreignField: "_id",
      //     as: "corrugatorProcessData",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$corrugatorProcessData",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },

      // Lookup subPurchaseOrder để filter theo customer
      {
        $lookup: {
          from: "subpurchaseorders",
          localField: "purchaseOrderItemData.subPurchaseOrder",
          foreignField: "_id",
          as: "subPurchaseOrderData",
        },
      },
      {
        $unwind: {
          path: "$subPurchaseOrderData",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup purchaseOrder để filter theo customer
      {
        $lookup: {
          from: "purchaseorders",
          localField: "subPurchaseOrderData.purchaseOrder",
          foreignField: "_id",
          as: "purchaseOrderData",
        },
      },
      {
        $unwind: {
          path: "$purchaseOrderData",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup customer từ purchaseOrder
      {
        $lookup: {
          from: "customers",
          localField: "purchaseOrderData.customer",
          foreignField: "_id",
          as: "customerData",
        },
      },
      {
        $unwind: {
          path: "$customerData",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    // Filter theo paperWidth nếu có
    if (
      paperWidth !== undefined &&
      paperWidth !== null &&
      !isNaN(Number(paperWidth))
    ) {
      pipeline.push({
        $match: {
          "wareData.paperWidth": Number(paperWidth),
        },
      } as any);
    }

    // Hiện tại bỏ filter theo corrugatorProcessStatus nếu có
    // if (corrugatorProcessStatus) {
    //   pipeline.push({
    //     $match: {
    //       "corrugatorProcessData.status": corrugatorProcessStatus,
    //     },
    //   } as any);
    // }

    // Filter theo customer nếu có
    if (customer) {
      pipeline.push({
        $match: {
          "purchaseOrderData.customer": new mongoose.Types.ObjectId(customer),
        },
      } as any);
    }

    // Filter theo fluteCombination nếu có
    if (fluteCombination) {
      pipeline.push({
        $match: {
          "wareData.fluteCombination": new mongoose.Types.ObjectId(
            fluteCombination,
          ),
        },
      } as any);
    }

    // Tiếp tục với sort và pagination
    pipeline.push(
      {
        $addFields: {
          statusOrder: {
            $switch: {
              branches: [
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
      { $limit: limit },
    );

    // Tính lại total sau khi filter corrugatorProcessStatus, paperWidth, customer, và fluteCombination
    let total = await this.manufacturingOrderModel.countDocuments(filter);
    if (
      // corrugatorProcessStatus ||
      (paperWidth !== undefined && paperWidth !== null) ||
      customer ||
      fluteCombination
    ) {
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
        // Lookup fluteCombination để filter theo loại sóng
        {
          $lookup: {
            from: "flutecombinations",
            localField: "wareData.fluteCombination",
            foreignField: "_id",
            as: "fluteCombinationData",
          },
        },
        {
          $unwind: {
            path: "$fluteCombinationData",
            preserveNullAndEmptyArrays: true,
          },
        },
        //Bỏ lookup corrugatorProcess
        // {
        //   $lookup: {
        //     from: "corrugatorprocesses",
        //     localField: "corrugatorProcess",
        //     foreignField: "_id",
        //     as: "corrugatorProcessData",
        //   },
        // },
        // {
        //   $unwind: {
        //     path: "$corrugatorProcessData",
        //     preserveNullAndEmptyArrays: true,
        //   },
        // },

        // Lookup subPurchaseOrder để filter theo customer
        {
          $lookup: {
            from: "subpurchaseorders",
            localField: "purchaseOrderItemData.subPurchaseOrder",
            foreignField: "_id",
            as: "subPurchaseOrderData",
          },
        },
        {
          $unwind: {
            path: "$subPurchaseOrderData",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Lookup purchaseOrder để filter theo customer
        {
          $lookup: {
            from: "purchaseorders",
            localField: "subPurchaseOrderData.purchaseOrder",
            foreignField: "_id",
            as: "purchaseOrderData",
          },
        },
        {
          $unwind: {
            path: "$purchaseOrderData",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Lookup customer từ purchaseOrder
        {
          $lookup: {
            from: "customers",
            localField: "purchaseOrderData.customer",
            foreignField: "_id",
            as: "customerData",
          },
        },
        {
          $unwind: {
            path: "$customerData",
            preserveNullAndEmptyArrays: true,
          },
        },
      ];

      // Thêm filter paperWidth nếu có
      if (
        paperWidth !== undefined &&
        paperWidth !== null &&
        !isNaN(Number(paperWidth))
      ) {
        countPipeline.push({
          $match: {
            "wareData.paperWidth": Number(paperWidth),
          },
        });
      }

      // Bỏ filter corrugatorProcessStatus nếu có
      // if (corrugatorProcessStatus) {
      //   countPipeline.push({
      //     $match: {
      //       "corrugatorProcessData.status": corrugatorProcessStatus,
      //     },
      //   });
      // }

      // Thêm filter customer nếu có
      if (customer) {
        countPipeline.push({
          $match: {
            "purchaseOrderData.customer": new mongoose.Types.ObjectId(customer),
          },
        });
      }

      // Thêm filter fluteCombination nếu có
      if (fluteCombination) {
        countPipeline.push({
          $match: {
            "wareData.fluteCombination": new mongoose.Types.ObjectId(
              fluteCombination,
            ),
          },
        });
      }

      countPipeline.push({ $count: "total" });
      const countResult = await this.manufacturingOrderModel
        .aggregate(countPipeline)
        .exec();
      total = countResult[0]?.total || 0;
    }

    const aggregatedData = await this.manufacturingOrderModel
      .aggregate(pipeline)
      .exec();

    // Sử dụng schema paths để populate đúng cách (tương tự purchase-order-item.service.ts)
    const poiPath = ManufacturingOrderSchema.path("purchaseOrderItem");
    const subpoPath = PurchaseOrderItemSchema.path("subPurchaseOrder");
    const warePath = PurchaseOrderItemSchema.path("ware");
    const fluteCombinationPath = WareSchema.path("fluteCombination");
    const wareFinishingProcessTypePath = WareSchema.path("finishingProcesses");
    const printColorPath = WareSchema.path("printColors");
    const poPath = SubPurchaseOrderSchema.path("purchaseOrder");
    const productPath = SubPurchaseOrderSchema.path("product");
    const customerPath = PurchaseOrderSchema.path("customer");

    // Populate các field gốc từ aggregated data
    const data = await this.manufacturingOrderModel.populate(aggregatedData, [
      // { path: "corrugatorProcess" },
      {
        path: poiPath.path,
        populate: [
          {
            path: warePath.path,
            populate: [
              { path: fluteCombinationPath.path },
              { path: wareFinishingProcessTypePath.path },
              { path: printColorPath.path },
            ],
          },
          {
            path: subpoPath.path,
            populate: [
              {
                path: poPath.path,
                populate: { path: customerPath.path },
              },
              {
                path: productPath.path,
              },
            ],
          },
        ],
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

    // Cập nhật trạng thái chính của MO
    mo.overallStatus = newStatus;

    let newProcessStatus: ProcessStatus | null = null;
    let newCorrugatorStatus: CorrugatorProcessStatus | null = null;

    if (newStatus === OrderStatus.CANCELLED) {
      newProcessStatus = ProcessStatus.CANCELLED;
      newCorrugatorStatus = CorrugatorProcessStatus.CANCELLED;
    } else if (newStatus === OrderStatus.PAUSED) {
      newProcessStatus = ProcessStatus.PAUSED;
      newCorrugatorStatus = CorrugatorProcessStatus.PAUSED;
    } else if (newStatus === OrderStatus.RUNNING) {
      // Logic của bạn không đồng bộ RUNNING xuống, điều này là hợp lý.
      // Nếu muốn đồng bộ RUNNING, bạn cần sửa logic if bên dưới.
      newProcessStatus = ProcessStatus.RUNNING;
      newCorrugatorStatus = CorrugatorProcessStatus.RUNNING;
    } else if (newStatus === OrderStatus.NOTSTARTED) {
      newProcessStatus = ProcessStatus.NOTSTARTED;
      newCorrugatorStatus = CorrugatorProcessStatus.NOTSTARTED;
    }

    // Mở rộng logic đồng bộ
    if (
      newProcessStatus === ProcessStatus.PAUSED ||
      newProcessStatus === ProcessStatus.CANCELLED ||
      newProcessStatus === ProcessStatus.NOTSTARTED
    ) {
      // 1. Cập nhật MOPs (Finishing) - Giữ nguyên
      await this.manufacturingOrderProcessModel.updateMany(
        { manufacturingOrder: new Types.ObjectId(moId) },
        { $set: { status: newProcessStatus } },
      );

      if (newCorrugatorStatus) {
        mo.corrugatorProcess.status = newCorrugatorStatus;
      }
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

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const mappedData: FullDetailManufacturingOrderDto[] = data.map(
      (mo) => new FullDetailManufacturingOrderDto(mo as ManufacturingOrder),
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

    const draftId = new Types.ObjectId();

    const mos: FullDetailManufacturingOrderDto[] = purchaseOrderItems.map(
      (poi, index) => ({
        code: codeGenerator.getCode(index),
        purchaseOrderItem: poi,
        overallStatus: OrderStatus.NOTSTARTED,
        processes: [],
        corrugatorProcess: {
          _id: draftId,
          manufacturingOrder: draftId,
          manufacturedAmount: 0,
          status: CorrugatorProcessStatus.NOTSTARTED,
          isDeleted: false,
          note: "",
        }, // Will be set when creating actual order
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
        manufacturingDirective: "",
        note: "",
        recalculateFlag: false,
        isDeleted: false,
      }),
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

    const mos: ManufacturingOrder[] = dtos.map((poi, index) => ({
      code: codeGenerator.getCode(index),
      purchaseOrderItem: poi.purchaseOrderItemId,
      overallStatus: OrderStatus.NOTSTARTED,
      processes: [],
      corrugatorProcess: {
        manufacturedAmount: 0,
        status: CorrugatorProcessStatus.NOTSTARTED,
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
      manufacturingDirective: poi.manufacturingDirective,
      note: poi.note,
      recalculateFlag: false,
      isDeleted: false,
    }));

    const moCreateRes = await this.manufacturingOrderModel.create(mos);

    // TODO: create finishing processes
    // const finishingProcesses: WareFinishingProcessType[][] = moCreateRes.map((mo, index) => 
    //   mo.processes.map((p) => ({
    //     code: p,
    //     process,
    //     note: "",
    //     isDeleted: false,
    //   }))
    // );

    return {
      requestedAmount: dtos.length,
      createdAmount: moCreateRes.length,
      echo: {
        codes: moCreateRes.map((item) => item.code),
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

      Object.assign(doc, dto);
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

  async deleteOne(
    id: mongoose.Types.ObjectId,
  ): Promise<DeleteResult<{ code: string }>> {
    const doc = (await this.manufacturingOrderModel.findById(
      id,
    )) as DocWithSoftDelete;
    if (!doc) throw new NotFoundException("Manufacturing Order not found");
    const code = doc.code;
    await doc.softDelete();
    return {
      deletedAmount: 1,
      requestedAmount: 1,
      echo: { code },
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

  //Add corrugator process start heare

  async runSelectedCorrugatorProcesses(moIds: string[]): Promise<any> {
    const moObjectIds = moIds.map((id) => new Types.ObjectId(id));

    // 1. Cập nhật trạng thái corrugatorProcess bên trong MO
    const cpUpdateResult = await this.manufacturingOrderModel.updateMany(
      {
        _id: { $in: moObjectIds },
        "corrugatorProcess.status": CorrugatorProcessStatus.NOTSTARTED,
      },
      {
        $set: { "corrugatorProcess.status": CorrugatorProcessStatus.RUNNING },
      },
    );

    if (cpUpdateResult.matchedCount === 0) {
      throw new BadRequestException(
        "Không tìm thấy quy trình sóng nào ở trạng thái 'NOTSTARTED' cho các MO đã chọn.",
      );
    }

    // 2. Cập nhật trạng thái tổng thể của MO
    await this.manufacturingOrderModel.updateMany(
      { _id: { $in: moObjectIds }, overallStatus: OrderStatus.NOTSTARTED },
      { $set: { overallStatus: OrderStatus.RUNNING } },
    );

    return cpUpdateResult;
  }

  async updateCorrugatorProcess(
    moId: string, // <-- Nhận moId thay vì processId
    dto: UpdateCorrugatorProcessDto,
  ): Promise<ManufacturingOrderDocument> {
    const { manufacturedAmount, status: newStatusFromDto } = dto;

    // 1. Lấy MO cha và PO Item
    const parentMO = await this.manufacturingOrderModel // <-- Sửa tên model
      .findById(moId) // <-- Tìm bằng moId
      .populate("purchaseOrderItem");

    if (!parentMO) {
      throw new NotFoundException("Không tìm thấy Lệnh sản xuất.");
    }

    // 2. Lấy thông tin CP từ trong MO
    const targetProcess = parentMO.corrugatorProcess; // <-- Lấy object lồng
    const originalStatus = targetProcess.status;
    const originalAmount = targetProcess.manufacturedAmount;

    if (!isRefPopulated(parentMO.purchaseOrderItem)) {
      throw new NotFoundException(
        "Không tìm thấy PO Item liên kết với Lệnh sản xuất này.",
      );
    }
    const poItem =
      parentMO.purchaseOrderItem as unknown as PurchaseOrderItemDocument;
    const targetAmount = poItem.longitudinalCutCount;
    const maxAmountForCompletion = targetAmount * 1.1;

    // 3. Xử lý logic cập nhật (Logic giữ nguyên)
    let newCalculatedStatus = originalStatus;
    const newAmount = manufacturedAmount ?? originalAmount;

    if (
      manufacturedAmount !== undefined &&
      manufacturedAmount !== originalAmount
    ) {
      if (
        originalStatus === CorrugatorProcessStatus.PAUSED ||
        originalStatus === CorrugatorProcessStatus.CANCELLED
      ) {
        if (newStatusFromDto !== CorrugatorProcessStatus.RUNNING) {
          throw new ForbiddenException(
            `Không thể cập nhật số lượng khi quy trình đang ở trạng thái '${originalStatus}'.`,
          );
        }
      }
    }

    // A. Tự động chạy khi có số lượng
    if (
      manufacturedAmount !== undefined &&
      newAmount > 0 &&
      originalStatus === CorrugatorProcessStatus.NOTSTARTED
    ) {
      newCalculatedStatus = CorrugatorProcessStatus.RUNNING;
      // (Việc cập nhật overallStatus sẽ được xử lý ở logic đồng bộ bên dưới)
    }

    // B. Xử lý trạng thái thủ công
    if (newStatusFromDto) {
      if (newStatusFromDto === CorrugatorProcessStatus.COMPLETED) {
        if (originalStatus !== CorrugatorProcessStatus.RUNNING) {
          throw new ForbiddenException(
            `Chỉ có thể chuyển sang 'COMPLETED' từ trạng thái 'RUNNING'.`,
          );
        }
        if (newAmount < targetAmount) {
          throw new BadRequestException(
            `Không thể hoàn thành khi số lượng (${newAmount}) chưa đạt mục tiêu (${targetAmount}).`,
          );
        }
        if (newAmount > maxAmountForCompletion) {
          throw new BadRequestException(
            `Không thể hoàn thành do số lượng (${newAmount}) vượt quá 110% cho phép (${maxAmountForCompletion.toFixed(
              0,
            )}).`,
          );
        }
        newCalculatedStatus = CorrugatorProcessStatus.COMPLETED;
      } else if (
        newStatusFromDto === CorrugatorProcessStatus.PAUSED ||
        newStatusFromDto === CorrugatorProcessStatus.CANCELLED
      ) {
        if (
          originalStatus === CorrugatorProcessStatus.NOTSTARTED ||
          originalStatus === CorrugatorProcessStatus.COMPLETED
        ) {
          throw new ForbiddenException(
            `Không thể chuyển từ '${originalStatus}' sang '${newStatusFromDto}'.`,
          );
        }
        newCalculatedStatus = newStatusFromDto;
      } else if (newStatusFromDto === CorrugatorProcessStatus.RUNNING) {
        if (
          newAmount <= 0 &&
          originalStatus !== CorrugatorProcessStatus.CANCELLED &&
          originalStatus !== CorrugatorProcessStatus.PAUSED
        ) {
          throw new BadRequestException(
            `Không thể 'RUNNING' khi số lượng bằng 0 (trừ khi resume từ 'CANCELLED' hoặc 'PAUSED').`,
          );
        }
        newCalculatedStatus = CorrugatorProcessStatus.RUNNING;
      } else if (newStatusFromDto === CorrugatorProcessStatus.NOTSTARTED) {
        if (newAmount > 0) {
          throw new ForbiddenException(
            "Không thể về 'NOTSTARTED' khi đã có số lượng.",
          );
        }
        newCalculatedStatus = CorrugatorProcessStatus.NOTSTARTED;
      }
    }

    // 4. Cập nhật giá trị vào parentMO (chưa save)
    parentMO.corrugatorProcess.status = newCalculatedStatus;
    parentMO.corrugatorProcess.manufacturedAmount = newAmount;

    // 5. --- LOGIC ĐỒNG BỘ TRẠNG THÁI (ĐÃ TÁI CẤU TRÚC THEO YÊU CẦU) ---
    // Đồng bộ trạng thái từ Sóng (Corrugator) xuống MO và MOPs (Finishing)

    // A. Trường hợp Sóng PAUSED hoặc CANCELLED
    if (
      (newCalculatedStatus === CorrugatorProcessStatus.PAUSED ||
        newCalculatedStatus === CorrugatorProcessStatus.CANCELLED) &&
      originalStatus !== newCalculatedStatus // Chỉ khi trạng thái thay đổi
    ) {
      const mopStatusToSet =
        newCalculatedStatus === CorrugatorProcessStatus.PAUSED
          ? ProcessStatus.PAUSED
          : ProcessStatus.CANCELLED;

      // Đồng bộ xuống MOPs
      await this.manufacturingOrderProcessModel.updateMany(
        { manufacturingOrder: parentMO._id },
        { $set: { status: mopStatusToSet } },
      );

      // Đồng bộ lên MO
      parentMO.overallStatus =
        newCalculatedStatus === CorrugatorProcessStatus.PAUSED
          ? OrderStatus.PAUSED
          : OrderStatus.CANCELLED;
    }
    // B. Trường hợp Sóng RUNNING
    else if (
      newCalculatedStatus === CorrugatorProcessStatus.RUNNING &&
      (parentMO.overallStatus === OrderStatus.NOTSTARTED ||
        parentMO.overallStatus === OrderStatus.PAUSED ||
        parentMO.overallStatus === OrderStatus.CANCELLED)
    ) {
      // Nếu Sóng chạy (từ NOTSTARTED, PAUSED, CANCELLED) -> MO cũng chạy
      parentMO.overallStatus = OrderStatus.RUNNING;
      // (Không cần đồng bộ RUNNING xuống MOPs, vì MOPs có logic riêng)
    }
    // C. Trường hợp Sóng NOTSTARTED
    else if (
      newCalculatedStatus === CorrugatorProcessStatus.NOTSTARTED &&
      parentMO.overallStatus !== OrderStatus.COMPLETED // Không reset MO đã hoàn thành
    ) {
      // Nếu Sóng bị reset -> MO cũng bị reset
      parentMO.overallStatus = OrderStatus.NOTSTARTED;
      // Đồng bộ xuống MOPs
      await this.manufacturingOrderProcessModel.updateMany(
        { manufacturingOrder: parentMO._id },
        { $set: { status: ProcessStatus.NOTSTARTED } },
      );
    }
    // D. Trường hợp Sóng COMPLETED
    else if (newCalculatedStatus === CorrugatorProcessStatus.COMPLETED) {
      // Sóng hoàn thành, kiểm tra xem MOPs đã xong chưa
      const allMOPs = await this.manufacturingOrderProcessModel.find({
        manufacturingOrder: parentMO._id,
      });

      // .every() trả về true nếu allMOPs là mảng rỗng (không có MOPs)
      const allMOPsDone = allMOPs.every(
        (p) => p.status === ProcessStatus.COMPLETED,
      );

      // Nếu MOPs cũng xong (hoặc không có MOPs) -> MO hoàn thành
      if (allMOPsDone) {
        parentMO.overallStatus = OrderStatus.COMPLETED;
      }
      // Nếu MOPs chưa xong, MO vẫn ở trạng thái RUNNING (hoặc bất cứ trạng thái nào trước đó)
    }

    // Đánh dấu object lồng đã bị thay đổi (quan trọng)
    parentMO.markModified("corrugatorProcess");

    // Lưu MO cha một lần duy nhất
    await parentMO.save();
    return parentMO;
  }

  async updateManyCorrugatorProcesses(
    dto: UpdateManyCorrugatorProcessesDto,
  ): Promise<{ successCount: number; failedCount: number; errors: string[] }> {
    const { moIds, status: newStatus } = dto; // <-- Lấy moIds

    const processObjectIds = moIds.map((id) => new Types.ObjectId(id));
    // Tìm các MO (thay vì CP)
    const processes = await this.manufacturingOrderModel
      .find({
        _id: { $in: processObjectIds },
      })
      .populate("purchaseOrderItem");

    if (processes.length === 0) {
      throw new NotFoundException("Không tìm thấy Lệnh sản xuất nào.");
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Xử lý từng MO
    for (const parentMO of processes) {
      // <-- Loop qua MO
      try {
        const process = parentMO.corrugatorProcess; // <-- Lấy object lồng
        const originalStatus = process.status;

        // Validate chuyển đổi trạng thái (Logic giữ nguyên)
        if (newStatus === CorrugatorProcessStatus.COMPLETED) {
          if (originalStatus !== CorrugatorProcessStatus.RUNNING) {
            throw new ForbiddenException(
              `Chỉ có thể chuyển sang 'COMPLETED' từ trạng thái 'RUNNING'.`,
            );
          }
          if (!isRefPopulated(parentMO.purchaseOrderItem)) {
            throw new NotFoundException(
              "Không tìm thấy PO Item liên kết với Lệnh sản xuất này.",
            );
          }
          const poItem =
            parentMO.purchaseOrderItem as unknown as PurchaseOrderItemDocument;
          const targetAmount = poItem.longitudinalCutCount;
          const maxAmountForCompletion = targetAmount * 1.1;

          if (process.manufacturedAmount < targetAmount) {
            throw new BadRequestException(
              `Không thể hoàn thành khi số lượng (${process.manufacturedAmount}) chưa đạt mục tiêu (${targetAmount}).`,
            );
          }
          if (process.manufacturedAmount > maxAmountForCompletion) {
            throw new BadRequestException(
              `Không thể hoàn thành do số lượng (${process.manufacturedAmount}) vượt quá 110% cho phép (${maxAmountForCompletion.toFixed(0)}).`,
            );
          }
        } else if (newStatus === CorrugatorProcessStatus.RUNNING) {
          if (originalStatus === CorrugatorProcessStatus.COMPLETED) {
            throw new ForbiddenException(
              `Không thể chuyển từ 'COMPLETED' sang 'RUNNING'.`,
            );
          }
          if (
            process.manufacturedAmount <= 0 &&
            originalStatus !== CorrugatorProcessStatus.CANCELLED
          ) {
            throw new ForbiddenException(
              `Không thể chuyển từ '${originalStatus}' sang 'RUNNING' khi số lượng bằng 0 (trừ khi resume từ 'CANCELLED').`,
            );
          }
        } else if (
          newStatus === CorrugatorProcessStatus.PAUSED ||
          newStatus === CorrugatorProcessStatus.CANCELLED
        ) {
          if (
            originalStatus === CorrugatorProcessStatus.NOTSTARTED ||
            originalStatus === CorrugatorProcessStatus.COMPLETED
          ) {
            throw new ForbiddenException(
              `Không thể chuyển từ '${originalStatus}' sang '${newStatus}'.`,
            );
          }
        }

        // Cập nhật trạng thái
        parentMO.corrugatorProcess.status = newStatus; // <-- Cập nhật object lồng
        parentMO.markModified("corrugatorProcess");

        // Đồng bộ với MO và MOPs
        if (
          newStatus === CorrugatorProcessStatus.PAUSED ||
          newStatus === CorrugatorProcessStatus.CANCELLED
        ) {
          parentMO.overallStatus =
            newStatus === CorrugatorProcessStatus.PAUSED
              ? OrderStatus.PAUSED
              : OrderStatus.CANCELLED;

          const mopStatusToSet =
            newStatus === CorrugatorProcessStatus.PAUSED
              ? ProcessStatus.PAUSED
              : ProcessStatus.CANCELLED;
          await this.manufacturingOrderProcessModel.updateMany(
            { manufacturingOrder: parentMO._id },
            { $set: { status: mopStatusToSet } },
          );
        } else if (newStatus === CorrugatorProcessStatus.COMPLETED) {
          parentMO.overallStatus = OrderStatus.COMPLETED;
        } else if (
          newStatus === CorrugatorProcessStatus.RUNNING &&
          (parentMO.overallStatus === OrderStatus.NOTSTARTED ||
            parentMO.overallStatus === OrderStatus.CANCELLED ||
            parentMO.overallStatus === OrderStatus.PAUSED)
        ) {
          parentMO.overallStatus = OrderStatus.RUNNING;
        }

        await parentMO.save(); // <-- Save MO 1 lần
        successCount++;
      } catch (error) {
        failedCount++;
        errors.push(
          `MO ${parentMO._id.toString()}: ${(error as { message: string }).message || "Lỗi không xác định"}`,
        );
      }
    }

    return { successCount, failedCount, errors };
  }

  // --- END: CÁC HÀM MỚI ---
}
