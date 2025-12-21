import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import { CorrugatorLine } from "@/types/enums/CorrugatorLine";
import { CorrugatorProcessStatus } from "@/types/enums/CorrugatorProcessStatus";
import { ManufacturingOrderApprovalStatus } from "@/types/enums/ManufacturingOrderApprovalStatus";
import { ManufacturingOrderOperativeStatus } from "@/types/enums/ManufacturingOrderOperativeStatus";
import { OrderFinishingProcessStatus } from "@/types/enums/OrderFinishingProcessStatus";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { OrderFinishingProcess } from "@/types/OrderFinishingProcess";
import check from "check-types";

const getPopulatedPoi = (mo: Serialized<ManufacturingOrder>) => {
  if (check.string(mo.purchaseOrderItem)) throw new UnpopulatedFieldError("mo.purchaseOrderItem must be populated")
  return mo.purchaseOrderItem
}

const getPopulatedSubPo = (mo: Serialized<ManufacturingOrder>) => {
  if (check.string(mo.purchaseOrderItem) || check.undefined(mo.purchaseOrderItem.subPurchaseOrder) || check.string(mo.purchaseOrderItem.subPurchaseOrder)
  ) throw new UnpopulatedFieldError("mo.purchaseOrderItem must be populated: purchaseOrderItem -> subPurchaseOrder");
  return mo.purchaseOrderItem.subPurchaseOrder
}

const getPopulatedPo = (mo: Serialized<ManufacturingOrder>) => {
  if (check.string(mo.purchaseOrderItem)
    || check.string(mo.purchaseOrderItem.subPurchaseOrder)
    || check.string(mo.purchaseOrderItem.subPurchaseOrder?.purchaseOrder)
  ) throw new UnpopulatedFieldError("mo.purchaseOrderItem must be populated: purchaseOrderItem -> subPurchaseOrder -> purchaseOrder");
  return mo.purchaseOrderItem.subPurchaseOrder?.purchaseOrder
}

const getPopulatedCustomer = (mo: Serialized<ManufacturingOrder>) => {
  if (check.string(mo.purchaseOrderItem)
    || check.string(mo.purchaseOrderItem.subPurchaseOrder)
    || check.string(mo.purchaseOrderItem.subPurchaseOrder?.purchaseOrder)
    || check.string(mo.purchaseOrderItem.subPurchaseOrder?.purchaseOrder?.customer)
  ) throw new UnpopulatedFieldError("mo.purchaseOrderItem must be populated: purchaseOrderItem -> subPurchaseOrder -> purchaseOrder -> customer");
  return mo.purchaseOrderItem.subPurchaseOrder?.purchaseOrder?.customer
}

const getPopulatedWare = (mo: Serialized<ManufacturingOrder>) => {
  if (check.string(mo.purchaseOrderItem)
    || check.string(mo.purchaseOrderItem.ware)
  ) throw new UnpopulatedFieldError("mo.purchaseOrderItem must be populated: purchaseOrderItem -> ware");
  return mo.purchaseOrderItem.ware
}

const OrderStatusNameMap: Record<ManufacturingOrderOperativeStatus, string> = {
  NOTSTARTED: "Chưa bắt đầu",
  RUNNING: "Đang chạy",
  PAUSED: "Tạm dừng",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Hủy",
}

const OrderApprovalStatusNameMap: Record<ManufacturingOrderApprovalStatus, string> = {
  DRAFT: "Nháp",
  PENDINGAPPROVAL: "Chờ duyệt",
  APPROVED: "Duyệt",
}

const getOrderStatus = (mo: Serialized<ManufacturingOrder>, processes: Serialized<OrderFinishingProcess>[]) => {
  if (mo.corrugatorProcess.status === CorrugatorProcessStatus.NOTSTARTED) {
    return ManufacturingOrderOperativeStatus.NOTSTARTED;
  }

  // All is either completed or "overcompleted", not sure if overcompleted will be used
  if (
    (mo.corrugatorProcess.status === CorrugatorProcessStatus.COMPLETED || mo.corrugatorProcess.status === CorrugatorProcessStatus.OVERCOMPLETED)
    && processes.every(p => p.status === OrderFinishingProcessStatus.FinishedProduction || p.status === OrderFinishingProcessStatus.QualityCheck || p.status === OrderFinishingProcessStatus.Completed)) {
    return ManufacturingOrderOperativeStatus.COMPLETED;
  }

  if (mo.corrugatorProcess.status === CorrugatorProcessStatus.RUNNING || processes.some(p => p.status === OrderFinishingProcessStatus.InProduction)) {
    return ManufacturingOrderOperativeStatus.RUNNING;
  }

  // Nothing is running, but something is paused or all is paused
  if (mo.corrugatorProcess.status === CorrugatorProcessStatus.PAUSED || processes.some(p => p.status === OrderFinishingProcessStatus.Paused)) {
    return ManufacturingOrderOperativeStatus.PAUSED;
  }

  if (mo.corrugatorProcess.status === CorrugatorProcessStatus.CANCELLED && processes.every(p => p.status === OrderFinishingProcessStatus.Cancelled)) {
    return ManufacturingOrderOperativeStatus.CANCELLED;
  }

  // Nothing is running, but something (not) all is cancelled, this could mean that some temporary changes are comming, set to paused and await cancellation
  if (mo.corrugatorProcess.status === CorrugatorProcessStatus.CANCELLED || processes.some(p => p.status === OrderFinishingProcessStatus.Cancelled)) {
    return ManufacturingOrderOperativeStatus.PAUSED;
  }

  return ManufacturingOrderOperativeStatus.PAUSED;
}

const CorrugatorProcessStatusNameMap: Record<CorrugatorProcessStatus, string> = {
  NOTSTARTED: "Chưa bắt đầu",
  RUNNING: "Đang chạy",
  PAUSED: "Tạm dừng",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Hủy",
  OVERCOMPLETED: "Đã hoàn thành",
}

// Temporarily pegging some values as others until things gets more sophisticated
const OrderFinishingProcessStatusNameMap: Record<OrderFinishingProcessStatus, string> = {
  PENDINGAPPROVAL: "Chờ duyệt",
  APPROVED: "Duyệt",
  // SCHEDULED: "Chờ sản xuất",
  SCHEDULED: "Đang chờ",
  INPRODUCTION: "Đang sản xuất",
  ONHOLD: "Đang chờ",
  PAUSED: "Tạm dừng",
  // FINISHEDPRODUCTION: "Đã sản xuất xong",
  FINISHEDPRODUCTION: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
  QUALITYCHECK: "Đang kiểm tra chất lượng",
  COMPLETED: "Đã hoàn thành",
}

const CorrugatorLineNameMap: Record<CorrugatorLine, string> = {
  LINE5: "Dàn 5",
  LINE7: "Dàn 7",
}

export const manufacturingOrderComponentUtils = {
  getPopulatedPoi,
  getPopulatedSubPo,
  getPopulatedPo,
  getPopulatedCustomer,
  getPopulatedWare,
  OrderStatusNameMap,
  getOrderStatus,
  OrderApprovalStatusNameMap,
  CorrugatorProcessStatusNameMap,
  CorrugatorLineNameMap,
  OrderFinishingProcessStatusNameMap,
}
