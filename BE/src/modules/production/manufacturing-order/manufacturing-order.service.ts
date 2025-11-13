import { Injectable, ForbiddenException } from "@nestjs/common";
import { Model, Types, FilterQuery } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import {
  ManufacturingOrder,
  ManufacturingOrderDocument,
  OrderStatus, // <-- IMPORT OrderStatus
} from "./schemas/manufacturing-order.schema";
import { CreateManufacturingOrderRequestDto } from "./dto/create-order-request.dto";
import { UpdateOverallStatusDto } from "./dto/update-overall-status.dto";
import { ProcessStatus } from "../manufacturing-order-process/schemas/manufacturing-order-process.schema";
import {
  ManufacturingOrderProcessDocument,
  ManufacturingOrderProcess,
} from "../manufacturing-order-process/schemas/manufacturing-order-process.schema";
import { FindAllMoQueryDto } from "./dto/find-all-mo-query.dto";

// <-- THAY ĐỔI: Import schema và status của Corrugator Process
import {
  CorrugatorProcess,
  CorrugatorProcessDocument,
  CorrugatorProcessStatus,
} from "../../corrugator-process/schemas/corrugator-process.schema";

@Injectable()
export class ManufacturingOrderService {
  constructor(
    @InjectModel(ManufacturingOrder.name)
    private readonly moModel: Model<ManufacturingOrderDocument>,

    @InjectModel(ManufacturingOrderProcess.name) // <-- Tên model MOP
    private readonly mopModel: Model<ManufacturingOrderProcessDocument>, // <-- Kiểu MOP Document

    // <-- THAY ĐỔI: Inject Corrugator Process Model
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

    // Tính lại total sau khi filter corrugatorProcessStatus
    let total = await this.moModel.countDocuments(filter);
    if (corrugatorProcessStatus) {
      // Nếu có filter corrugatorProcessStatus, cần count lại sau khi lookup
      const countPipeline = [
        { $match: filter },
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
        {
          $match: {
            "corrugatorProcessData.status": corrugatorProcessStatus,
          },
        },
        { $count: "total" },
      ];
      const countResult = await this.moModel.aggregate(countPipeline).exec();
      total = countResult[0]?.total || 0;
    }

    const aggregatedData = await this.moModel.aggregate(pipeline).exec();

    // ... (Giữ nguyên logic populate) ...
    const data = await this.moModel.populate(aggregatedData, [
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

    const mo = await this.moModel.findById(moId);
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
      await this.mopModel.updateMany(
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
  async createOne(dto: CreateManufacturingOrderRequestDto) {
    const doc = new this.moModel(dto);
    return await doc.save();
  }
}
