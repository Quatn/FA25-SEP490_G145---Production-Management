import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import {
  ManufacturingOrderProcess,
  ManufacturingOrderProcessDocument,
  ProcessStatus, // <-- IMPORT ProcessStatus
} from "./schemas/manufacturing-order-process.schema";
import {
  ManufacturingOrder,
  ManufacturingOrderDocument,
  OrderStatus, // <-- IMPORT OrderStatus
} from "../manufacturing-order/schemas/manufacturing-order.schema";
import { PurchaseOrderItemDocument } from "../../purchase-order-item/schemas/purchase-order-item.schema";
import { UpdateManufacturingOrderProcessDto } from "./dto/update-manufacturing-order-process.dto";
import {
  CorrugatorProcess,
  CorrugatorProcessDocument,
  CorrugatorProcessStatus,
} from "@/modules/corrugator-process/schemas/corrugator-process.schema";

@Injectable()
export class ManufacturingOrderProcessService {
  constructor(
    @InjectModel(ManufacturingOrderProcess.name)
    private readonly mopModel: Model<ManufacturingOrderProcessDocument>,

    @InjectModel(ManufacturingOrder.name)
    private readonly moModel: Model<ManufacturingOrderDocument>,

    @InjectModel(CorrugatorProcess.name)
    private readonly corrugatorProcessModel: Model<CorrugatorProcessDocument>,
  ) {}

  /**
   * Cập nhật một công đoạn (status hoặc amount)
   */
  async updateOneProcess(
    processId: string,
    dto: UpdateManufacturingOrderProcessDto,
  ): Promise<ManufacturingOrderProcessDocument> {
    const { manufacturedAmount, status: newStatusFromDto } = dto;

    // 1. Lấy công đoạn cần cập nhật
    const targetProcess = await this.mopModel.findById(processId);
    if (!targetProcess) {
      throw new NotFoundException("Không tìm thấy công đoạn này.");
    }

    const originalStatus = targetProcess.status;
    const originalAmount = targetProcess.manufacturedAmount;

    // Ràng buộc: Không cập nhật số lượng khi PAUSED/CANCELLED/COMPLETED
    if (
      (originalStatus === ProcessStatus.PAUSED ||
        originalStatus === ProcessStatus.CANCELLED ||
        originalStatus === ProcessStatus.COMPLETED) &&
      manufacturedAmount !== undefined
    ) {
      throw new ForbiddenException(
        `Không thể cập nhật số lượng khi công đoạn đang ở trạng thái '${originalStatus}'.`,
      );
    }

    // 2. Lấy MO cha, PO Item, VÀ Quy trình sóng
    const parentMO = await this.moModel
      .findById(targetProcess.manufacturingOrder)
      .populate("purchaseOrderItem")
      .populate("corrugatorProcess"); // <-- THAY ĐỔI: Thêm populate corrugatorProcess

    if (!parentMO) {
      throw new NotFoundException("Không tìm thấy Lệnh sản xuất cha.");
    }

    // Lấy số lượng mục tiêu từ PO Item
    const poItem = parentMO.purchaseOrderItem as PurchaseOrderItemDocument;
    if (!poItem) {
      throw new NotFoundException(
        "Không tìm thấy PO Item liên kết với Lệnh sản xuất này.",
      );
    }
    const targetAmount = poItem.amount;
    // <-- THAY ĐỔI: Đã xóa maxAllowedAmount (110%) và hardCapAmount (120%)

    // Lấy Quy trình sóng
    const corrugatorProcess =
      parentMO.corrugatorProcess as CorrugatorProcessDocument; // <-- THAY ĐỔI: Lấy corrugatorProcess
    if (!corrugatorProcess) {
      throw new NotFoundException(
        "Không tìm thấy Quy trình sóng (Corrugator Process) liên kết với MO này.",
      );
    }

    // Lấy tất cả công đoạn con
    const allProcesses = (
      await this.mopModel.find({
        manufacturingOrder: parentMO._id,
      })
    ).sort((a, b) => a.processNumber - b.processNumber);

    // Ràng buộc: MO ở NOTSTARTED
    if (
      parentMO.overallStatus === OrderStatus.NOTSTARTED &&
      newStatusFromDto &&
      newStatusFromDto !== ProcessStatus.RUNNING
    ) {
      throw new ForbiddenException(
        `Không thể đặt trạng thái '${newStatusFromDto}' khi Lệnh sản xuất (MO) chưa bắt đầu.`,
      );
    }

    // 2.5. --- THAY ĐỔI: RÀNG BUỘC MỚI (YÊU CẦU 3) ---
    // MOP#1 chỉ được chạy khi Quy trình Sóng đang chạy
    const isTryingToRun =
      newStatusFromDto === ProcessStatus.RUNNING ||
      (manufacturedAmount !== undefined &&
        manufacturedAmount > 0 &&
        targetProcess.status === ProcessStatus.NOTSTARTED);

    if (targetProcess.processNumber === 1 && isTryingToRun) {
      if (corrugatorProcess.status !== CorrugatorProcessStatus.RUNNING) {
        throw new ForbiddenException(
          'Không thể bắt đầu công đoạn 1 khi Quy trình sóng (Corrugator) chưa ở trạng thái "RUNNING".',
        );
      }
    }
    // --- HẾT THAY ĐỔI (2.5) ---

    // 3. ÁP DỤNG RÀNG BUỘC CŨ (Kiểm tra công đoạn trước)
    // (Logic này giữ nguyên: công đoạn sau phải chờ công đoạn trước RUNNING hoặc COMPLETED)
    if (
      manufacturedAmount !== undefined &&
      manufacturedAmount > originalAmount
    ) {
      if (targetProcess.processNumber > 1) {
        const previousProcess = allProcesses.find(
          (p) => p.processNumber === targetProcess.processNumber - 1,
        );

        if (
          !previousProcess ||
          (previousProcess.status !== ProcessStatus.RUNNING &&
            previousProcess.status !== ProcessStatus.COMPLETED)
        ) {
          throw new ForbiddenException(
            'Công đoạn trước chưa ở trạng thái "Chạy" hoặc "Hoàn thành". Không thể cập nhật số lượng.',
          );
        }
      }
    }

    // 4. --- LOGIC CẬP NHẬT TRẠNG THÁI & SỐ LƯỢNG ---

    let newCalculatedStatus = originalStatus;
    let newAmount = manufacturedAmount ?? originalAmount;
    let amountDrivenStatus: ProcessStatus | null = null;

    // A. Xử lý logic tự động dựa trên SỐ LƯỢNG
    if (manufacturedAmount !== undefined) {
      // 1. <-- THAY ĐỔI: Đã xóa logic tự động VƯỢT MỨC (OVERCOMPLETED)

      // 2. Tự động CHẠY
      if (newAmount > 0) {
        if (
          originalStatus === ProcessStatus.NOTSTARTED
          // <-- THAY ĐỔI: Đã xóa || originalStatus === ProcessStatus.OVERCOMPLETED
        ) {
          amountDrivenStatus = ProcessStatus.RUNNING;
        }
      }

      if (amountDrivenStatus) {
        newCalculatedStatus = amountDrivenStatus;
      }
    }

    // B. Xử lý logic thủ công dựa trên TRẠNG THÁI
    if (newStatusFromDto) {
      if (newStatusFromDto === ProcessStatus.RUNNING) {
        if (newAmount <= 0) {
          throw new BadRequestException(
            "Không thể chuyển sang 'RUNNING' khi 'manufacturedAmount' bằng 0.",
          );
        }
        newCalculatedStatus = ProcessStatus.RUNNING;
      } else if (newStatusFromDto === ProcessStatus.NOTSTARTED) {
        if (newAmount > 0) {
          throw new ForbiddenException(
            "Không thể chuyển về 'NOTSTARTED' khi đã có số lượng sản xuất.",
          );
        }
        newCalculatedStatus = ProcessStatus.NOTSTARTED;
      } else if (newStatusFromDto === ProcessStatus.PAUSED) {
        // Allow PAUSED transition from RUNNING OR from CANCELLED (user requested PAUSED <-> CANCELLED)
        const canPause =
          newCalculatedStatus === ProcessStatus.RUNNING ||
          originalStatus === ProcessStatus.RUNNING ||
          originalStatus === ProcessStatus.CANCELLED;
        if (!canPause) {
          throw new ForbiddenException(
            `Chỉ có thể chuyển sang 'PAUSED' từ trạng thái 'RUNNING' hoặc từ 'CANCELLED'.`,
          );
        }
        newCalculatedStatus = ProcessStatus.PAUSED;
      } else if (newStatusFromDto === ProcessStatus.CANCELLED) {
        // Allow CANCELLED when coming from PAUSED (and permit idempotent CANCELLED)
        if (
          originalStatus !== ProcessStatus.PAUSED &&
          originalStatus !== ProcessStatus.CANCELLED
        ) {
          throw new ForbiddenException(
            `Chỉ có thể chuyển sang 'CANCELLED' từ trạng thái 'PAUSED' (hoặc nếu đã là 'CANCELLED').`,
          );
        }
        newCalculatedStatus = ProcessStatus.CANCELLED;
      }
      // Hoàn thành thủ công
      else if (newStatusFromDto === ProcessStatus.COMPLETED) {
        // Yêu cầu 1: (>= 100%)
        if (newAmount < targetAmount) {
          throw new BadRequestException(
            `Không thể hoàn thành thủ công khi số lượng (${newAmount}) chưa đạt mục tiêu (${targetAmount}).`,
          );
        }
        // <-- THAY ĐỔI: Đã xóa Yêu cầu 2 (check 120% hardCapAmount)

        newCalculatedStatus = ProcessStatus.COMPLETED;
      }
      // <-- THAY ĐỔI: Đã xóa toàn bộ logic 'else if (newStatusFromDto === ProcessStatus.OVERCOMPLETED)'
      else {
        // Áp dụng các trạng thái khác nếu có (ví dụ: CUSTOM)
        newCalculatedStatus = newStatusFromDto;
      }
    }

    // Cập nhật vào đối tượng và lưu
    targetProcess.status = newCalculatedStatus;
    targetProcess.manufacturedAmount = newAmount;
    await targetProcess.save();

    // RÀNG BUỘC (3) - PAUSED DÂY CHUYỀN (Giữ nguyên)
    if (
      targetProcess.status === ProcessStatus.PAUSED &&
      originalStatus !== ProcessStatus.PAUSED
    ) {
      const subsequentProcessIds = allProcesses
        .filter((p) => p.processNumber > targetProcess.processNumber)
        .map((p) => p._id);

      if (subsequentProcessIds.length > 0) {
        await this.mopModel.updateMany(
          { _id: { $in: subsequentProcessIds } },
          { $set: { status: ProcessStatus.PAUSED } },
        );
      }
    }

    // Nếu chuyển sang CANCELLED thì đồng bộ các công đoạn sau là CANCELLED
    if (
      targetProcess.status === ProcessStatus.CANCELLED &&
      originalStatus !== ProcessStatus.CANCELLED
    ) {
      const subsequentProcessIds = allProcesses
        .filter((p) => p.processNumber > targetProcess.processNumber)
        .map((p) => p._id);

      if (subsequentProcessIds.length > 0) {
        await this.mopModel.updateMany(
          { _id: { $in: subsequentProcessIds } },
          { $set: { status: ProcessStatus.CANCELLED } },
        );
      }

      // Nếu là công đoạn #1, đồng bộ trạng thái MO
      if (targetProcess.processNumber === 1) {
        parentMO.overallStatus = OrderStatus.CANCELLED;
        await parentMO.save();
      }
    }

    // LOGIC CẬP NHẬT TRẠNG THÁI TỔNG THỂ (MO)
    // <-- THAY ĐỔI: Logic này chỉ chạy khi MOP#1 chạy, nhưng MOP#1 chỉ chạy khi Sóng chạy,
    // vậy nên logic Sóng chạy -> MO chạy đã được xử lý ở corrugator-process.service.ts
    // Tuy nhiên, chúng ta vẫn cần logic này phòng trường hợp Sóng chạy rồi nhưng MOP#1 chưa chạy.
    if (
      targetProcess.processNumber === 1 &&
      targetProcess.status === ProcessStatus.RUNNING &&
      parentMO.overallStatus === OrderStatus.NOTSTARTED
    ) {
      parentMO.overallStatus = OrderStatus.RUNNING;
      await parentMO.save();
    }

    // LOGIC CẬP NHẬT: TỰ ĐỘNG HOÀN THÀNH MO
    // <-- THAY ĐỔI: Đã CẬP NHẬT logic hoàn thành
    const updatedProcesses = await this.mopModel.find({
      manufacturingOrder: parentMO._id,
    });

    const allMOPsDone = updatedProcesses.every(
      (p) => p.status === ProcessStatus.COMPLETED, // <-- Chỉ check COMPLETED
    );

    // 2. Lấy và kiểm tra Corrugator Process
    // (Chúng ta đã lấy 'corrugatorProcess' ở trên)
    const isCorrugatorDone =
      corrugatorProcess.status === CorrugatorProcessStatus.COMPLETED; // <-- Chỉ check COMPLETED

    // 3. Kiểm tra điều kiện hoàn thành tổng thể
    if (allMOPsDone && isCorrugatorDone) {
      // <-- THAY ĐỔI: Logic đơn giản hóa
      parentMO.overallStatus = OrderStatus.COMPLETED;
      await parentMO.save();
    }

    return targetProcess;
  }
}
