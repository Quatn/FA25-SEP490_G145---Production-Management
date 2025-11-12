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
} from "./schemas/manufacturing-order-process.schema";
import {
  ManufacturingOrder,
  ManufacturingOrderDocument,
} from "../manufacturing-order/schemas/manufacturing-order.schema";
// Import schema PO Item để lấy 'amount' mục tiêu
import { PurchaseOrderItemDocument } from "../../purchase-order-item/schemas/purchase-order-item.schema";
import { UpdateManufacturingOrderProcessDto } from "./dto/update-manufacturing-order-process.dto";
import { OrderStatus } from "../manufacturing-order/schemas/manufacturing-order.schema";
import { ProcessStatus } from "./schemas/manufacturing-order-process.schema";

@Injectable()
export class ManufacturingOrderProcessService {
  constructor(
    @InjectModel(ManufacturingOrderProcess.name)
    private readonly mopModel: Model<ManufacturingOrderProcessDocument>,

    @InjectModel(ManufacturingOrder.name)
    private readonly moModel: Model<ManufacturingOrderDocument>,
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

    // (Giữ nguyên) Ràng buộc: Không cập nhật số lượng khi PAUSED/CANCELLED/COMPLETED
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

    // 2. Lấy MO cha VÀ PO Item liên quan
    const parentMO = await this.moModel
      .findById(targetProcess.manufacturingOrder)
      .populate("purchaseOrderItem");

    if (!parentMO) {
      throw new NotFoundException("Không tìm thấy Lệnh sản xuất cha.");
    }

    // (Giữ nguyên) Lấy số lượng mục tiêu từ PO Item
    const poItem = parentMO.purchaseOrderItem as PurchaseOrderItemDocument;
    if (!poItem) {
      throw new NotFoundException(
        "Không tìm thấy PO Item liên kết với Lệnh sản xuất này.",
      );
    }
    const targetAmount = poItem.amount;
    const maxAllowedAmount = targetAmount * 1.1;
    const hardCapAmount = targetAmount * 1.2;

    // (Giữ nguyên) Lấy tất cả công đoạn con
    const allProcesses = (
      await this.mopModel.find({
        manufacturingOrder: parentMO._id,
      })
    ).sort((a, b) => a.processNumber - b.processNumber);

    // (Giữ nguyên) Ràng buộc: MO ở NOTSTARTED
    if (
      parentMO.overallStatus === OrderStatus.NOTSTARTED &&
      newStatusFromDto &&
      newStatusFromDto !== ProcessStatus.RUNNING
    ) {
      throw new ForbiddenException(
        `Không thể đặt trạng thái '${newStatusFromDto}' khi Lệnh sản xuất (MO) chưa bắt đầu.`,
      );
    }

    // 3. --- ÁP DỤNG RÀNG BUỘC CŨ (Kiểm tra công đoạn trước) ---
    if (
      manufacturedAmount !== undefined &&
      manufacturedAmount > originalAmount
    ) {
      if (targetProcess.processNumber > 1) {
        const previousProcess = allProcesses.find(
          (p) => p.processNumber === targetProcess.processNumber - 1,
        );

        // --- THAY ĐỔI: Cho phép RUNNING hoặc COMPLETED ---
        if (
          !previousProcess ||
          (previousProcess.status !== ProcessStatus.RUNNING &&
            previousProcess.status !== ProcessStatus.COMPLETED) // <-- ĐÃ THÊM COMPLETED
        ) {
          throw new ForbiddenException(
            'Công đoạn trước chưa ở trạng thái "Chạy" hoặc "Hoàn thành". Không thể cập nhật số lượng.', // <-- Cập nhật thông báo lỗi
          );
        }
        // --- HẾT THAY ĐỔI ---
      }
    }

    // 4. --- LOGIC CẬP NHẬT TRẠNG THÁI & SỐ LƯỢNG ---
    // (Toàn bộ logic bên dưới được giữ nguyên)

    let newCalculatedStatus = originalStatus;
    let newAmount = manufacturedAmount ?? originalAmount;
    let amountDrivenStatus: ProcessStatus | null = null; 

    // A. Xử lý logic tự động dựa trên SỐ LƯỢNG (nếu được cung cấp)
    if (manufacturedAmount !== undefined) {
      
      // 1. Tự động VƯỢT MỨC (check 110%)
      if (newAmount > maxAllowedAmount) {
        amountDrivenStatus = ProcessStatus.OVERCOMPLETED;
      } 
      
      // 2. Tự động CHẠY
      else if (newAmount > 0) {
         if (originalStatus === ProcessStatus.NOTSTARTED || originalStatus === ProcessStatus.OVERCOMPLETED) {
            amountDrivenStatus = ProcessStatus.RUNNING;
         }
      }

      if (amountDrivenStatus) {
        newCalculatedStatus = amountDrivenStatus;
      }
    }


    // B. Xử lý logic thủ công dựa trên TRẠNG THÁI (nếu được cung cấp)
    if (newStatusFromDto) {
      
      if (newStatusFromDto === ProcessStatus.RUNNING) {
        if (newAmount <= 0) {
          throw new BadRequestException(
            "Không thể chuyển sang 'RUNNING' khi 'manufacturedAmount' bằng 0.",
          );
        }
        newCalculatedStatus = ProcessStatus.RUNNING;
      } 
      else if (newStatusFromDto === ProcessStatus.NOTSTARTED) {
        if (newAmount > 0) {
          throw new ForbiddenException(
            "Không thể chuyển về 'NOTSTARTED' khi đã có số lượng sản xuất.",
          );
        }
        newCalculatedStatus = ProcessStatus.NOTSTARTED;
      } 
      else if (newStatusFromDto === ProcessStatus.PAUSED) {
        const canPause = newCalculatedStatus === ProcessStatus.RUNNING || originalStatus === ProcessStatus.RUNNING;
        if (!canPause) {
          throw new ForbiddenException(
            `Chỉ có thể chuyển sang 'PAUSED' từ trạng thái 'RUNNING'.`,
          );
        }
        newCalculatedStatus = ProcessStatus.PAUSED;
      } 
      else if (newStatusFromDto === ProcessStatus.CANCELLED) {
        throw new ForbiddenException(
          "Không thể cập nhật trạng thái sang 'CANCELLED' qua hàm này.",
        );
      } 
      // Hoàn thành thủ công
      else if (newStatusFromDto === ProcessStatus.COMPLETED) {
        // Yêu cầu 1: (>= 100%)
        if (newAmount < targetAmount) {
           throw new BadRequestException(
             `Không thể hoàn thành thủ công khi số lượng (${newAmount}) chưa đạt mục tiêu (${targetAmount}).`
           );
        }
        
        // Yêu cầu 2: (<= 120%)
        if (newAmount > hardCapAmount) {
           throw new BadRequestException(
             `Không thể hoàn thành do số lượng (${newAmount}) vượt quá 20% mức cho phép (${hardCapAmount}).`
           );
        }
        
        newCalculatedStatus = ProcessStatus.COMPLETED;
      }
      // Vượt mức thủ công (check 110%)
      else if (newStatusFromDto === ProcessStatus.OVERCOMPLETED) {
         if (newAmount <= maxAllowedAmount) {
           throw new BadRequestException(
             `Số lượng (${newAmount}) chưa vượt quá 110% (${maxAllowedAmount}) để set 'Vượt mức'.`
           );
         }
         newCalculatedStatus = ProcessStatus.OVERCOMPLETED;
      }
      else {
        newCalculatedStatus = newStatusFromDto;
      }
    }

    // Cập nhật vào đối tượng và lưu
    targetProcess.status = newCalculatedStatus;
    targetProcess.manufacturedAmount = newAmount;
    await targetProcess.save();

    // (Giữ nguyên) RÀNG BUỘC (3) - PAUSED DÂY CHUYỀN
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

    // (Giữ nguyên) LOGIC CẬP NHẬT TRẠNG THÁI TỔNG THỂ (MO)
    if (
      targetProcess.processNumber === 1 &&
      targetProcess.status === ProcessStatus.RUNNING &&
      parentMO.overallStatus === OrderStatus.NOTSTARTED
    ) {
      parentMO.overallStatus = OrderStatus.RUNNING;
      await parentMO.save();
    }

    // (Giữ nguyên) LOGIC CẬP NHẬT: TỰ ĐỘNG HOÀN THÀNH (hoặc VƯỢT MỨC) MO
    const updatedProcesses = await this.mopModel.find({
      manufacturingOrder: parentMO._id,
    });

    const allDone = updatedProcesses.every(
      (p) => p.status === ProcessStatus.COMPLETED || p.status === ProcessStatus.OVERCOMPLETED,
    );

    if (allDone) {
      const anyOvercompleted = updatedProcesses.some(
        (p) => p.status === ProcessStatus.OVERCOMPLETED,
      );

      if (anyOvercompleted) {
        parentMO.overallStatus = OrderStatus.OVERCOMPLETED;
      } else {
        parentMO.overallStatus = OrderStatus.COMPLETED;
      }
      await parentMO.save();
    }

    return targetProcess;
  }
}