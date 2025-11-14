// src/modules/production/corrugator-process/corrugator-process.service.ts

import {
  Injectable,
  BadRequestException,
  ForbiddenException, // <-- THÊM MỚI
  NotFoundException, // <-- THÊM MỚI
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  CorrugatorProcess,
  CorrugatorProcessDocument,
  CorrugatorProcessStatus,
} from "./schemas/corrugator-process.schema";
import {
  ManufacturingOrder,
  ManufacturingOrderDocument,
  OrderStatus,
} from "@/modules/production/manufacturing-order/schemas/manufacturing-order.schema";
// <-- THÊM MỚI: Import MOP và PO Item
import {
  ManufacturingOrderProcess,
  ManufacturingOrderProcessDocument,
  ProcessStatus,
} from "@/modules/production/manufacturing-order-process/schemas/manufacturing-order-process.schema";
import { PurchaseOrderItemDocument } from "@/modules/purchase-order-item/schemas/purchase-order-item.schema";
// <-- THÊM MỚI: Import DTO (Giả sử bạn tạo DTO này)
import { UpdateCorrugatorProcessDto } from "./dto/update-corrugator-process.dto";
import { UpdateManyCorrugatorProcessesDto } from "./dto/update-many-corrugator-processes.dto";

@Injectable()
export class CorrugatorProcessService {
  constructor(
    @InjectModel(CorrugatorProcess.name)
    private readonly corrugatorProcessModel: Model<CorrugatorProcessDocument>,

    @InjectModel(ManufacturingOrder.name)
    private readonly moModel: Model<ManufacturingOrderDocument>,

    // <-- THÊM MỚI: Inject MOP Model để đồng bộ PAUSE/CANCEL
    @InjectModel(ManufacturingOrderProcess.name)
    private readonly mopModel: Model<ManufacturingOrderProcessDocument>,
  ) {}

  /**
   * (Giữ nguyên) Chạy các quy trình sóng đã chọn (chuyển từ NOTSTARTED sang RUNNING)
   */
  async runSelectedProcesses(moIds: string[]): Promise<any> {
    const moObjectIds = moIds.map((id) => new Types.ObjectId(id));

    // 1. Tìm các Corrugator Process (CP) liên quan đến MOs
    const processesToRun = await this.corrugatorProcessModel.find({
      manufacturingOrder: { $in: moObjectIds },
      status: CorrugatorProcessStatus.NOTSTARTED,
    });

    if (processesToRun.length === 0) {
      throw new BadRequestException(
        "Không tìm thấy quy trình sóng nào ở trạng thái 'NOTSTARTED' cho các MO đã chọn.",
      );
    }

    const processIdsToUpdate = processesToRun.map((p) => p._id);
    const relatedMoIds = processesToRun.map((p) => p.manufacturingOrder);

    // 2. Cập nhật trạng thái CP sang RUNNING
    const cpUpdateResult = await this.corrugatorProcessModel.updateMany(
      { _id: { $in: processIdsToUpdate } },
      { $set: { status: CorrugatorProcessStatus.RUNNING } },
    );

    // 3. Cập nhật trạng thái tổng thể của MO (MO.overallStatus) sang RUNNING
    await this.moModel.updateMany(
      { _id: { $in: relatedMoIds }, overallStatus: OrderStatus.NOTSTARTED },
      { $set: { overallStatus: OrderStatus.RUNNING } },
    );

    return cpUpdateResult;
  }

  // --- THAY ĐỔI: HÀM MỚI ĐỂ CẬP NHẬT TRẠNG THÁI/SỐ LƯỢNG SÓNG ---
  /**
   * Cập nhật trạng thái (PAUSED, CANCELLED, COMPLETED) hoặc số lượng
   * cho một Quy trình sóng.
   */
  async updateOneProcess(
    processId: string,
    dto: UpdateCorrugatorProcessDto, // Giả sử DTO này chứa: { status?, manufacturedAmount? }
  ): Promise<CorrugatorProcessDocument> {
    const { manufacturedAmount, status: newStatusFromDto } = dto;

    // 1. Lấy quy trình sóng
    const targetProcess = await this.corrugatorProcessModel.findById(processId);
    if (!targetProcess) {
      throw new NotFoundException("Không tìm thấy quy trình sóng.");
    }

    const originalStatus = targetProcess.status;
    const originalAmount = targetProcess.manufacturedAmount; // Giả sử schema có trường này

    // 2. Lấy MO cha và PO Item để lấy targetAmount
    const parentMO = await this.moModel
      .findById(targetProcess.manufacturingOrder)
      .populate("purchaseOrderItem");

    if (!parentMO) {
      throw new NotFoundException("Không tìm thấy Lệnh sản xuất cha.");
    }

    const poItem = parentMO.purchaseOrderItem as PurchaseOrderItemDocument;
    if (!poItem) {
      throw new NotFoundException(
        "Không tìm thấy PO Item liên kết với Lệnh sản xuất này.",
      );
    }
    const targetAmount = poItem.longitudinalCutCount; // Sử dụng tấm chặt thay vì amount
    const maxAmountForCompletion = targetAmount * 1.1; // Yêu cầu 5: <= 110%

    // 3. Xử lý logic cập nhật
    let newCalculatedStatus = originalStatus;
    let newAmount = manufacturedAmount ?? originalAmount;

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
      // Đồng bộ MO sang RUNNING nếu MO đang NOTSTARTED
      if (parentMO.overallStatus === OrderStatus.NOTSTARTED) {
        parentMO.overallStatus = OrderStatus.RUNNING;
        await parentMO.save();
      }
    }

    // B. Xử lý trạng thái thủ công (Yêu cầu 4 & 5)
    if (newStatusFromDto) {
      if (newStatusFromDto === CorrugatorProcessStatus.COMPLETED) {
        // Yêu cầu 5: COMPLETED
        // Phải từ RUNNING
        if (originalStatus !== CorrugatorProcessStatus.RUNNING) {
          throw new ForbiddenException(
            `Chỉ có thể chuyển sang 'COMPLETED' từ trạng thái 'RUNNING'.`,
          );
        } // Phải đủ số lượng
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
        // Yêu cầu 4 + Yêu cầu mới: PAUSED <-> CANCELLED
        // Không thể PAUSE/CANCEL từ NOTSTARTED hoặc COMPLETED.
        if (
          originalStatus === CorrugatorProcessStatus.NOTSTARTED ||
          originalStatus === CorrugatorProcessStatus.COMPLETED
        ) {
          throw new ForbiddenException(
            `Không thể chuyển từ '${originalStatus}' sang '${newStatusFromDto}'.`,
          );
        } // (Cho phép RUNNING -> PAUSED, RUNNING -> CANCELLED, PAUSED -> CANCELLED, CANCELLED -> PAUSED)
        newCalculatedStatus = newStatusFromDto;
      } else if (newStatusFromDto === CorrugatorProcessStatus.RUNNING) {
        // (Giữ nguyên logic cũ)
        // Có thể là resume từ PAUSED hoặc chạy lần đầu (nếu amount > 0)
        if (newAmount <= 0) {
          throw new BadRequestException(
            "Không thể 'RUNNING' khi số lượng bằng 0.",
          );
        }
        newCalculatedStatus = CorrugatorProcessStatus.RUNNING;
      } else if (newStatusFromDto === CorrugatorProcessStatus.NOTSTARTED) {
        // (Giữ nguyên logic cũ)
        // (Không cho phép chuyển về NOTSTARTED nếu đã có số lượng)
        if (newAmount > 0) {
          throw new ForbiddenException(
            "Không thể về 'NOTSTARTED' khi đã có số lượng.",
          );
        }
        newCalculatedStatus = CorrugatorProcessStatus.NOTSTARTED;
      }
    }

    // 4. Lưu
    targetProcess.status = newCalculatedStatus;
    targetProcess.manufacturedAmount = newAmount;
    await targetProcess.save();

    // 5. ĐỒNG BỘ XUỐNG MOPs (Rất quan trọng)
    // Nếu Sóng (công đoạn 0) PAUSED hoặc CANCELLED, tất cả MOPs phải theo
    if (
      (newCalculatedStatus === CorrugatorProcessStatus.PAUSED ||
        newCalculatedStatus === CorrugatorProcessStatus.CANCELLED) &&
      originalStatus !== newCalculatedStatus
    ) {
      const mopStatusToSet =
        newCalculatedStatus === CorrugatorProcessStatus.PAUSED
          ? ProcessStatus.PAUSED
          : ProcessStatus.CANCELLED;

      await this.mopModel.updateMany(
        { manufacturingOrder: parentMO._id },
        { $set: { status: mopStatusToSet } },
      );

      // Đồng bộ MO cha
      parentMO.overallStatus =
        newCalculatedStatus === CorrugatorProcessStatus.PAUSED
          ? OrderStatus.PAUSED
          : OrderStatus.CANCELLED;
      await parentMO.save();
    }

    // (Kiểm tra logic hoàn thành tổng thể MO đã có trong mop.service.ts)

    return targetProcess;
  }

  /**
   * Cập nhật trạng thái cho nhiều quy trình sóng cùng lúc
   * Cho phép RUNNING, PAUSED, CANCELLED, COMPLETED
   */
  async updateManyProcesses(
    dto: UpdateManyCorrugatorProcessesDto,
  ): Promise<{ successCount: number; failedCount: number; errors: string[] }> {
    const { processIds, status: newStatus } = dto;

    const processObjectIds = processIds.map((id) => new Types.ObjectId(id));
    const processes = await this.corrugatorProcessModel.find({
      _id: { $in: processObjectIds },
    }).populate({
      path: "manufacturingOrder",
      populate: { path: "purchaseOrderItem" },
    });

    if (processes.length === 0) {
      throw new NotFoundException("Không tìm thấy quy trình sóng nào.");
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Xử lý từng process
    for (const process of processes) {
      try {
        const originalStatus = process.status;
        const parentMO = process.manufacturingOrder as ManufacturingOrderDocument;

        // Validate chuyển đổi trạng thái
        if (newStatus === CorrugatorProcessStatus.COMPLETED) {
          // COMPLETED: chỉ cho phép từ RUNNING và phải đủ số lượng
          if (originalStatus !== CorrugatorProcessStatus.RUNNING) {
            throw new ForbiddenException(
              `Chỉ có thể chuyển sang 'COMPLETED' từ trạng thái 'RUNNING'.`,
            );
          }

          // Kiểm tra số lượng
          const poItem = parentMO.purchaseOrderItem as PurchaseOrderItemDocument;
          if (!poItem) {
            throw new NotFoundException(
              "Không tìm thấy PO Item liên kết với Lệnh sản xuất này.",
            );
          }
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
          // RUNNING: chỉ cho phép từ PAUSED, CANCELLED, hoặc NOTSTARTED (nếu có số lượng > 0)
          if (
            originalStatus === CorrugatorProcessStatus.COMPLETED ||
            (originalStatus === CorrugatorProcessStatus.NOTSTARTED &&
              process.manufacturedAmount <= 0)
          ) {
            throw new ForbiddenException(
              `Không thể chuyển từ '${originalStatus}' sang 'RUNNING'.`,
            );
          }
        } else if (
          newStatus === CorrugatorProcessStatus.PAUSED ||
          newStatus === CorrugatorProcessStatus.CANCELLED
        ) {
          // PAUSED/CANCELLED: không cho phép từ NOTSTARTED hoặc COMPLETED
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
        process.status = newStatus;
        await process.save();

        // Đồng bộ với MO và MOPs
        if (parentMO) {
          // Đồng bộ MO status
          if (
            newStatus === CorrugatorProcessStatus.PAUSED ||
            newStatus === CorrugatorProcessStatus.CANCELLED
          ) {
            parentMO.overallStatus =
              newStatus === CorrugatorProcessStatus.PAUSED
                ? OrderStatus.PAUSED
                : OrderStatus.CANCELLED;
            await parentMO.save();

            // Đồng bộ MOPs
            const mopStatusToSet =
              newStatus === CorrugatorProcessStatus.PAUSED
                ? ProcessStatus.PAUSED
                : ProcessStatus.CANCELLED;
            await this.mopModel.updateMany(
              { manufacturingOrder: parentMO._id },
              { $set: { status: mopStatusToSet } },
            );
          } else if (newStatus === CorrugatorProcessStatus.COMPLETED) {
            // COMPLETED: đồng bộ MO status
            parentMO.overallStatus = OrderStatus.COMPLETED;
            await parentMO.save();
          } else if (
            newStatus === CorrugatorProcessStatus.RUNNING &&
            parentMO.overallStatus === OrderStatus.NOTSTARTED
          ) {
            parentMO.overallStatus = OrderStatus.RUNNING;
            await parentMO.save();
          }
        }

        successCount++;
      } catch (error) {
        failedCount++;
        errors.push(
          `Process ${process._id}: ${error.message || "Lỗi không xác định"}`,
        );
      }
    }

    return { successCount, failedCount, errors };
  }
}
