import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  CorrugatorProcess,
  CorrugatorProcessDocument,
  CorrugatorProcessStatus,
} from "../schemas/corrugator-process.schema";
import {
  ManufacturingOrder,
  ManufacturingOrderDocument,
  OrderStatus,
} from "@/modules/production/schemas/manufacturing-order.schema";
import {
  ManufacturingOrderProcess,
  ManufacturingOrderProcessDocument,
  ProcessStatus,
} from "@/modules/production/schemas/manufacturing-order-process.schema";
import { PurchaseOrderItemDocument } from "@/modules/production/schemas/purchase-order-item.schema";
import { isRefPopulated } from "@/common/utils/populate-check";
import { UpdateCorrugatorProcessDto } from "./dto/update-corrugator-process.dto";
import { UpdateManyCorrugatorProcessesDto } from "./dto/update-many-corrugator-processes.dto";

@Injectable()
export class CorrugatorProcessService {
  constructor(
    @InjectModel(CorrugatorProcess.name)
    private readonly corrugatorProcessModel: Model<CorrugatorProcessDocument>,

    @InjectModel(ManufacturingOrder.name)
    private readonly moModel: Model<ManufacturingOrderDocument>,

    @InjectModel(ManufacturingOrderProcess.name)
    private readonly mopModel: Model<ManufacturingOrderProcessDocument>,
  ) {} /**
   * (Giữ nguyên) Chạy các quy trình sóng đã chọn
   */

  async runSelectedProcesses(moIds: string[]): Promise<any> {
    const moObjectIds = moIds.map((id) => new Types.ObjectId(id)); // 1. Tìm các Corrugator Process (CP) liên quan đến MOs

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
    const relatedMoIds = processesToRun.map((p) => p.manufacturingOrder); // 2. Cập nhật trạng thái CP sang RUNNING

    const cpUpdateResult = await this.corrugatorProcessModel.updateMany(
      { _id: { $in: processIdsToUpdate } },
      { $set: { status: CorrugatorProcessStatus.RUNNING } },
    ); // 3. Cập nhật trạng thái tổng thể của MO (MO.overallStatus) sang RUNNING

    await this.moModel.updateMany(
      { _id: { $in: relatedMoIds }, overallStatus: OrderStatus.NOTSTARTED },
      { $set: { overallStatus: OrderStatus.RUNNING } },
    );

    return cpUpdateResult;
  } /**
   * Cập nhật trạng thái (PAUSED, CANCELLED, COMPLETED) hoặc số lượng
   * cho một Quy trình sóng.
   */

  async updateOneProcess(
    processId: string,
    dto: UpdateCorrugatorProcessDto,
  ): Promise<CorrugatorProcessDocument> {
    const { manufacturedAmount, status: newStatusFromDto } = dto; // 1. Lấy quy trình sóng

    const targetProcess = await this.corrugatorProcessModel.findById(processId);
    if (!targetProcess) {
      throw new NotFoundException("Không tìm thấy quy trình sóng.");
    }

    const originalStatus = targetProcess.status;
    const originalAmount = targetProcess.manufacturedAmount; // 2. Lấy MO cha và PO Item để lấy targetAmount

    const parentMO = await this.moModel
      .findById(targetProcess.manufacturingOrder)
      .populate("purchaseOrderItem");

    if (!parentMO) {
      throw new NotFoundException("Không tìm thấy Lệnh sản xuất cha.");
    }

    if (!isRefPopulated(parentMO.purchaseOrderItem)) {
      throw new NotFoundException(
        "Không tìm thấy PO Item liên kết với Lệnh sản xuất này.",
      );
    }
    const poItem =
      parentMO.purchaseOrderItem as unknown as PurchaseOrderItemDocument;
    const targetAmount = poItem.longitudinalCutCount;
    const maxAmountForCompletion = targetAmount * 1.1; // 3. Xử lý logic cập nhật

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
    } // A. Tự động chạy khi có số lượng
    if (
      manufacturedAmount !== undefined &&
      newAmount > 0 &&
      originalStatus === CorrugatorProcessStatus.NOTSTARTED
    ) {
      newCalculatedStatus = CorrugatorProcessStatus.RUNNING; // Đồng bộ MO sang RUNNING nếu MO đang NOTSTARTED
      if (parentMO.overallStatus === OrderStatus.NOTSTARTED) {
        parentMO.overallStatus = OrderStatus.RUNNING;
        await parentMO.save();
      }
    } // B. Xử lý trạng thái thủ công (Yêu cầu 4 & 5)

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
        // --- START: THAY ĐỔI THEO YÊU CẦU ---
        // YÊU CẦU MỚI: Cho phép chuyển từ CANCELLED sang RUNNING ngay cả khi số lượng = 0.
        // Chỉ cấm RUNNING (khi amount=0) nếu trạng thái gốc KHÔNG PHẢI là CANCELLED.
        if (
          newAmount <= 0 &&
          originalStatus !== CorrugatorProcessStatus.CANCELLED &&
          originalStatus !== CorrugatorProcessStatus.PAUSED
        ) {
          throw new BadRequestException(
            `Không thể 'RUNNING' khi số lượng bằng 0 (trừ khi resume từ 'CANCELLED' hoặc 'PAUSED').`,
          );
        }
        // --- END: THAY ĐỔI THEO YÊU CẦU ---

        newCalculatedStatus = CorrugatorProcessStatus.RUNNING;
      } else if (newStatusFromDto === CorrugatorProcessStatus.NOTSTARTED) {
        if (newAmount > 0) {
          throw new ForbiddenException(
            "Không thể về 'NOTSTARTED' khi đã có số lượng.",
          );
        }
        newCalculatedStatus = CorrugatorProcessStatus.NOTSTARTED;
      }
    } // 4. Lưu

    targetProcess.status = newCalculatedStatus;
    targetProcess.manufacturedAmount = newAmount;
    await targetProcess.save(); // 5. ĐỒNG BỘ XUỐNG MOPs (Rất quan trọng)
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
      ); // Đồng bộ MO cha

      parentMO.overallStatus =
        newCalculatedStatus === CorrugatorProcessStatus.PAUSED
          ? OrderStatus.PAUSED
          : OrderStatus.CANCELLED;
      await parentMO.save();
    } // LOGIC CẬP NHẬT: TỰ ĐỘNG HOÀN THÀNH MO
    // Kiểm tra nếu corrugator process và tất cả processes đều COMPLETED

    if (newCalculatedStatus === CorrugatorProcessStatus.COMPLETED) {
      const allMOPs = await this.mopModel.find({
        manufacturingOrder: parentMO._id,
      });

      const allMOPsDone = allMOPs.every(
        (p) => p.status === ProcessStatus.COMPLETED,
      );

      if (allMOPsDone) {
        parentMO.overallStatus = OrderStatus.COMPLETED;
        await parentMO.save();
      }
    }

    return targetProcess;
  } /**
   * Cập nhật trạng thái cho nhiều quy trình sóng cùng lúc
   */

  async updateManyProcesses(
    dto: UpdateManyCorrugatorProcessesDto,
  ): Promise<{ successCount: number; failedCount: number; errors: string[] }> {
    const { processIds, status: newStatus } = dto;

    const processObjectIds = processIds.map((id) => new Types.ObjectId(id));
    const processes = await this.corrugatorProcessModel
      .find({
        _id: { $in: processObjectIds },
      })
      .populate({
        path: "manufacturingOrder",
        populate: { path: "purchaseOrderItem" },
      });

    if (processes.length === 0) {
      throw new NotFoundException("Không tìm thấy quy trình sóng nào.");
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = []; // Xử lý từng process

    for (const process of processes) {
      try {
        const originalStatus = process.status;
        const parentMO =
          process.manufacturingOrder as ManufacturingOrderDocument; // Validate chuyển đổi trạng thái

        if (newStatus === CorrugatorProcessStatus.COMPLETED) {
          // COMPLETED: chỉ cho phép từ RUNNING và phải đủ số lượng
          if (originalStatus !== CorrugatorProcessStatus.RUNNING) {
            throw new ForbiddenException(
              `Chỉ có thể chuyển sang 'COMPLETED' từ trạng thái 'RUNNING'.`,
            );
          } // Kiểm tra số lượng

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
          // --- START: THAY ĐỔI THEO YÊU CẦU (Đồng bộ logic) ---
          // YÊU CẦU MỚI: Đồng bộ logic với updateOneProcess
          if (originalStatus === CorrugatorProcessStatus.COMPLETED) {
            throw new ForbiddenException(
              `Không thể chuyển từ 'COMPLETED' sang 'RUNNING'.`,
            );
          } // Cấm RUNNING nếu amount=0, TRỪ KHI resume từ CANCELLED

          if (
            process.manufacturedAmount <= 0 &&
            originalStatus !== CorrugatorProcessStatus.CANCELLED
          ) {
            throw new ForbiddenException(
              `Không thể chuyển từ '${originalStatus}' sang 'RUNNING' khi số lượng bằng 0 (trừ khi resume từ 'CANCELLED').`,
            );
          }
          // --- END: THAY ĐỔI THEO YÊU CẦU (Đồng bộ logic) ---
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
        } // Cập nhật trạng thái

        process.status = newStatus;
        await process.save(); // Đồng bộ với MO và MOPs

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
            await parentMO.save(); // Đồng bộ MOPs

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
            // (Logic kiểm tra hoàn thành tổng thể sẽ nằm ở MOP service
            // khi công đoạn cuối cùng hoàn thành, nên ở đây không cần
            // set MO sang COMPLETED vội, chỉ Sóng xong thôi)
            // (EDIT: Giữ logic cũ, vì có thể Sóng là cái cuối cùng hoàn thành)
            // Tạm thời comment logic này để MOP service quyết định
            // parentMO.overallStatus = OrderStatus.COMPLETED;
            // await parentMO.save();
            // (EDIT 2: Xóa bỏ comment, giữ lại logic cũ của bạn)
            // Nếu bạn muốn logic phức tạp hơn (chờ MOPs), bạn cần xóa
            // 2 dòng dưới và để MOP service xử lý.
            // Giữ lại theo file gốc:
            parentMO.overallStatus = OrderStatus.COMPLETED;
            await parentMO.save();
          } else if (
            newStatus === CorrugatorProcessStatus.RUNNING &&
            (parentMO.overallStatus === OrderStatus.NOTSTARTED ||
              parentMO.overallStatus === OrderStatus.CANCELLED || // Cho phép resume MO từ CANCELLED
              parentMO.overallStatus === OrderStatus.PAUSED)
          ) {
            // Cho phép resume MO từ PAUSED
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
