import { Injectable, ForbiddenException } from "@nestjs/common";
import { Model, Types, FilterQuery } from "mongoose"; // Import thêm FilterQuery
import { InjectModel } from "@nestjs/mongoose";
import {
  ManufacturingOrder,
  ManufacturingOrderDocument,
} from "./schemas/manufacturing-order.schema";
import { CreateManufacturingOrderRequestDto } from "./dto/create-order-request.dto";
import { UpdateOverallStatusDto } from "./dto/update-overall-status.dto";
import { OrderStatus } from "./schemas/manufacturing-order.schema";
import { ProcessStatus } from "../manufacturing-order-process/schemas/manufacturing-order-process.schema";
import {
  ManufacturingOrderProcessDocument,
  ManufacturingOrderProcess,
} from "../manufacturing-order-process/schemas/manufacturing-order-process.schema";

// Import DTO truy vấn mới
import { FindAllMoQueryDto } from "./dto/find-all-mo-query.dto";

@Injectable()
export class ManufacturingOrderService {
  constructor(
    @InjectModel(ManufacturingOrder.name)
    private readonly moModel: Model<ManufacturingOrderDocument>,

    @InjectModel("ManufacturingOrderProcess")
    private readonly mopModel: Model<ManufacturingOrderProcess>,
  ) {}

  /**
   * Lấy danh sách MO đã populate đầy đủ dữ liệu (có phân trang và filter)
   */
  async findAllPopulated(queryDto: FindAllMoQueryDto) {
    const {
      page = 1,
      limit = 10,
      search_code,
      corrugatorLine,
      mfg_date_from,
      mfg_date_to,
      req_date_from,
      req_date_to,
    } = queryDto;

    const skip = (page - 1) * limit;

    // 1. Xây dựng đối tượng filter động
    const filter: FilterQuery<ManufacturingOrderDocument> = {};

    // Search theo code (regex không phân biệt hoa thường)
    if (search_code) {
      filter.code = { $regex: search_code, $options: "i" };
    }

    // Filter theo corrugatorLine (khớp chính xác)
    if (corrugatorLine) {
      filter.corrugatorLine = corrugatorLine;
    }

    // Filter theo khoảng ngày manufacturingDate
    if (mfg_date_from || mfg_date_to) {
      filter.manufacturingDate = {};
      if (mfg_date_from) {
        filter.manufacturingDate.$gte = mfg_date_from;
      }
      if (mfg_date_to) {
        filter.manufacturingDate.$lte = mfg_date_to;
      }
    }

    // Filter theo khoảng ngày requestedDatetime
    if (req_date_from || req_date_to) {
      filter.requestedDatetime = {};
      if (req_date_from) {
        filter.requestedDatetime.$gte = req_date_from;
      }
      if (req_date_to) {
        filter.requestedDatetime.$lte = req_date_to;
      }
    }

    // 2. Lấy tổng số document khớp với filter (để phân trang)
    const total = await this.moModel.countDocuments(filter);

    // 3. Lấy dữ liệu theo filter, sắp xếp, phân trang và populate
    const data = await this.moModel
      .find(filter) // Áp dụng filter
      .sort({ manufacturingDate: -1 }) // Sắp xếp (có thể thay đổi)
      .skip(skip) // Phân trang
      .limit(limit) // Phân trang
      .populate({
        path: "purchaseOrderItem",
        populate: {
          path: "ware",
          populate: { path: "manufacturingProcesses" },
        },
      })
      .populate({
        path: "processes",
        model: "ManufacturingOrderProcess",
        options: { sort: { processNumber: 1 } },
        populate: {
          path: "processDefinition",
        },
      })
      .exec();

    // 4. Trả về kết quả chuẩn cho phân trang
    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Cập nhật trạng thái tổng thể (chỉ cho PAUSED hoặc CANCELLED)
   * và đồng bộ xuống tất cả công đoạn con.
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

    //  Nếu đang NOTSTARTED → không cho đổi
    if (current === OrderStatus.NOTSTARTED) {
      throw new ForbiddenException(
        "Lệnh ở trạng thái Chưa bắt đầu không thể thay đổi.",
      );
    }

    //  Nếu đang RUNNING → chỉ cho đổi sang PAUSED hoặc CANCELLED
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

    //  Nếu đang CANCELLED hoặc PAUSED → chỉ cho đổi sang RUNNING hoặc NOTSTARTED
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

    mo.overallStatus = newStatus;

    let newProcessStatus: ProcessStatus | null = null;

    if (newStatus === OrderStatus.CANCELLED) {
      newProcessStatus = ProcessStatus.CANCELLED;
    } else if (newStatus === OrderStatus.PAUSED) {
      newProcessStatus = ProcessStatus.PAUSED;
    } else if (newStatus === OrderStatus.RUNNING) {
      newProcessStatus = ProcessStatus.RUNNING;
    } else if (newStatus === OrderStatus.NOTSTARTED) {
      newProcessStatus = ProcessStatus.NOTSTARTED;
    }

    if (
      newProcessStatus === ProcessStatus.PAUSED ||
      newProcessStatus === ProcessStatus.CANCELLED
    ) {
      await this.mopModel.updateMany(
        { manufacturingOrder: new Types.ObjectId(moId) },
        { $set: { status: newProcessStatus } },
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