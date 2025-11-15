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
  ProcessStatus,
} from "../schemas/manufacturing-order-process.schema";
import {
  ManufacturingOrder,
  ManufacturingOrderDocument,
  OrderStatus,
} from "../schemas/manufacturing-order.schema";
import { PurchaseOrderItemDocument } from "../schemas/purchase-order-item.schema";
import { isRefPopulated } from "@/common/utils/populate-check";
import { UpdateManufacturingOrderProcessDto } from "./dto/update-manufacturing-order-process.dto";
import {
  CorrugatorProcess,
  CorrugatorProcessDocument,
  CorrugatorProcessStatus,
} from "../schemas/corrugator-process.schema";

@Injectable()
export class ManufacturingOrderProcessService {
  constructor(
    @InjectModel(ManufacturingOrderProcess.name)
    private readonly mopModel: Model<ManufacturingOrderProcessDocument>,

    @InjectModel(ManufacturingOrder.name)
    private readonly moModel: Model<ManufacturingOrderDocument>,

    @InjectModel(CorrugatorProcess.name)
    private readonly corrugatorProcessModel: Model<CorrugatorProcessDocument>,
  ) {} /**
   * Cập nhật một công đoạn (status hoặc amount)
   */

  async updateOneProcess(
    processId: string,
    dto: UpdateManufacturingOrderProcessDto,
  ): Promise<ManufacturingOrderProcessDocument> {
    const { manufacturedAmount, status: newStatusFromDto } = dto; // 1. Lấy công đoạn cần cập nhật

    const targetProcess = await this.mopModel.findById(processId);
    if (!targetProcess) {
      throw new NotFoundException("Không tìm thấy công đoạn này.");
    }

    const originalStatus = targetProcess.status;
    const originalAmount = targetProcess.manufacturedAmount; // Ràng buộc: Không cập nhật số lượng khi PAUSED/CANCELLED/COMPLETED

    if (
      (originalStatus === ProcessStatus.PAUSED ||
        originalStatus === ProcessStatus.CANCELLED ||
        originalStatus === ProcessStatus.COMPLETED) &&
      manufacturedAmount !== undefined
    ) {
      throw new ForbiddenException(
        `Không thể cập nhật số lượng khi công đoạn đang ở trạng thái '${originalStatus}'.`,
      );
    } // 2. Lấy MO cha, PO Item, VÀ Quy trình sóng

    const parentMO = await this.moModel
      .findById(targetProcess.manufacturingOrder)
      .populate("purchaseOrderItem")
      .populate("corrugatorProcess");

    if (!parentMO) {
      throw new NotFoundException("Không tìm thấy Lệnh sản xuất cha.");
    } // Lấy số lượng mục tiêu từ PO Item

    if (!isRefPopulated(parentMO.purchaseOrderItem)) {
      throw new NotFoundException(
        "Không tìm thấy PO Item liên kết với Lệnh sản xuất này.",
      );
    }
    const poItem =
      parentMO.purchaseOrderItem as unknown as PurchaseOrderItemDocument;
    const targetAmount = poItem.amount; // Lấy Quy trình sóng

    if (!isRefPopulated(parentMO.corrugatorProcess)) {
      throw new NotFoundException(
        "Không tìm thấy Quy trình sóng liên kết với Lệnh sản xuất này.",
      );
    }
    const corrugatorProcess =
      parentMO.corrugatorProcess as unknown as CorrugatorProcessDocument; // Lấy tất cả công đoạn con

    const allProcesses = (
      await this.mopModel.find({
        manufacturingOrder: parentMO._id,
      })
    ).sort((a, b) => a.processNumber - b.processNumber); // Ràng buộc: MO ở NOTSTARTED

    if (
      parentMO.overallStatus === OrderStatus.NOTSTARTED &&
      newStatusFromDto &&
      newStatusFromDto !== ProcessStatus.RUNNING
    ) {
      throw new ForbiddenException(
        `Không thể đặt trạng thái '${newStatusFromDto}' khi Lệnh sản xuất (MO) chưa bắt đầu.`,
      );
    } // 2.5. RÀNG BUỘC (Kiểm tra Sóng)

    const isTryingToRun =
      newStatusFromDto === ProcessStatus.RUNNING ||
      (manufacturedAmount !== undefined &&
        manufacturedAmount > 0 &&
        targetProcess.status === ProcessStatus.NOTSTARTED);

    if (targetProcess.processNumber === 1 && isTryingToRun) {
      if (
        corrugatorProcess.status !== CorrugatorProcessStatus.RUNNING &&
        corrugatorProcess.status !== CorrugatorProcessStatus.COMPLETED
      ) {
        throw new ForbiddenException(
          'Không thể bắt đầu công đoạn 1 khi Quy trình sóng (Corrugator) chưa ở trạng thái "RUNNING" hoặc "COMPLETED".',
        );
      }
    } // 3. RÀNG BUỘC (Kiểm tra công đoạn trước)

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
    } // 4. --- LOGIC CẬP NHẬT TRẠNG THÁI & SỐ LƯỢNG ---

    let newCalculatedStatus = originalStatus;
    let newAmount = manufacturedAmount ?? originalAmount;
    let amountDrivenStatus: ProcessStatus | null = null; // A. Xử lý logic tự động dựa trên SỐ LƯỢNG

    if (manufacturedAmount !== undefined) {
      // 2. Tự động CHẠY
      if (newAmount > 0) {
        if (originalStatus === ProcessStatus.NOTSTARTED) {
          amountDrivenStatus = ProcessStatus.RUNNING;
        }
      }

      if (amountDrivenStatus) {
        newCalculatedStatus = amountDrivenStatus;
      }
    } // B. Xử lý logic thủ công dựa trên TRẠNG THÁI

    if (newStatusFromDto) {
      if (newStatusFromDto === ProcessStatus.RUNNING) {
        // (Logic resume từ PAUSED/CANCELLED khi amount=0 đã được thêm)
        if (
          newAmount <= 0 &&
          originalStatus !== ProcessStatus.PAUSED &&
          originalStatus !== ProcessStatus.CANCELLED
        ) {
          throw new BadRequestException(
            "Không thể chuyển sang 'RUNNING' khi 'manufacturedAmount' bằng 0 (trừ khi resume từ 'PAUSED' hoặc 'CANCELLED').",
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
        // (Logic này giữ nguyên, cho phép CANCELLED -> PAUSED)
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
        // --- START: THAY ĐỔI THEO YÊU CẦU ---
        // YÊU CẦU MỚI: Cho phép chuyển từ RUNNING, PAUSED sang CANCELLED
        if (
          originalStatus !== ProcessStatus.RUNNING && // <-- Cho phép RUNNING
          originalStatus !== ProcessStatus.PAUSED &&
          originalStatus !== ProcessStatus.CANCELLED
        ) {
          throw new ForbiddenException(
            `Chỉ có thể chuyển sang 'CANCELLED' từ 'RUNNING', 'PAUSED' (hoặc nếu đã là 'CANCELLED').`,
          );
        }
        // --- END: THAY ĐỔI THEO YÊU CẦU ---

        newCalculatedStatus = ProcessStatus.CANCELLED;
      } else if (newStatusFromDto === ProcessStatus.COMPLETED) {
        // (Logic Hoàn thành thủ công giữ nguyên)
        if (newAmount < targetAmount) {
          throw new BadRequestException(
            `Không thể hoàn thành thủ công khi số lượng (${newAmount}) chưa đạt mục tiêu (${targetAmount}).`,
          );
        }
        newCalculatedStatus = ProcessStatus.COMPLETED;
      } else {
        newCalculatedStatus = newStatusFromDto;
      }
    } // Cập nhật vào đối tượng và lưu

    targetProcess.status = newCalculatedStatus;
    targetProcess.manufacturedAmount = newAmount;
    await targetProcess.save(); // RÀNG BUỘC (3) - PAUSED DÂY CHUYỀN (Giữ nguyên)

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
    } // Nếu chuyển sang CANCELLED thì đồng bộ các công đoạn sau là CANCELLED

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
      } // Nếu là công đoạn #1, đồng bộ trạng thái MO

      if (targetProcess.processNumber === 1) {
        parentMO.overallStatus = OrderStatus.CANCELLED;
        await parentMO.save();
      }
    } // LOGIC CẬP NHẬT TRẠNG THÁI TỔNG THỂ (MO)
    // (Khởi động MO khi MOP#1 chạy lần đầu)

    if (
      targetProcess.processNumber === 1 &&
      targetProcess.status === ProcessStatus.RUNNING &&
      parentMO.overallStatus === OrderStatus.NOTSTARTED
    ) {
      parentMO.overallStatus = OrderStatus.RUNNING;
      await parentMO.save();
    } // (Logic resume MO nếu MOP#1 resume từ PAUSED/CANCELLED)

    if (
      targetProcess.processNumber === 1 &&
      targetProcess.status === ProcessStatus.RUNNING &&
      (originalStatus === ProcessStatus.PAUSED ||
        originalStatus === ProcessStatus.CANCELLED)
    ) {
      // Chỉ resume MO nếu MO đang không chạy
      if (
        parentMO.overallStatus === OrderStatus.PAUSED ||
        parentMO.overallStatus === OrderStatus.CANCELLED
      ) {
        parentMO.overallStatus = OrderStatus.RUNNING;
        await parentMO.save();
      }
    } // LOGIC CẬP NHẬT: TỰ ĐỘNG HOÀN THÀNH MO

    const updatedProcesses = await this.mopModel.find({
      manufacturingOrder: parentMO._id,
    });

    const allMOPsDone = updatedProcesses.every(
      (p) => p.status === ProcessStatus.COMPLETED,
    ); // (Chúng ta đã lấy 'corrugatorProcess' ở trên)

    const isCorrugatorDone =
      corrugatorProcess.status === CorrugatorProcessStatus.COMPLETED; // 3. Kiểm tra điều kiện hoàn thành tổng thể

    if (allMOPsDone && isCorrugatorDone) {
      parentMO.overallStatus = OrderStatus.COMPLETED;
      await parentMO.save();
    }

    return targetProcess;
  }
}
