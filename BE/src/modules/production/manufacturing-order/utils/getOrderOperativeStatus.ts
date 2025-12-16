import {
  CorrugatorProcessStatus,
  ManufacturingOrder,
  ManufacturingOrderOperativeStatus,
} from "../../schemas/manufacturing-order.schema";
import {
  OrderFinishingProcess,
  OrderFinishingProcessStatus,
} from "../../schemas/order-finishing-process.schema";

export const getOrderOperativeStatus = (
  mo: ManufacturingOrder,
  processes: OrderFinishingProcess[],
) => {
  if (mo.corrugatorProcess.status === CorrugatorProcessStatus.NOTSTARTED) {
    return ManufacturingOrderOperativeStatus.NOTSTARTED;
  }

  // All is either completed or "overcompleted", not sure if overcompleted will be used
  if (
    (mo.corrugatorProcess.status === CorrugatorProcessStatus.COMPLETED ||
      mo.corrugatorProcess.status === CorrugatorProcessStatus.OVERCOMPLETED) &&
    processes.every(
      (p) =>
        p.status === OrderFinishingProcessStatus.FinishedProduction ||
        p.status === OrderFinishingProcessStatus.QualityCheck ||
        p.status === OrderFinishingProcessStatus.Completed,
    )
  ) {
    return ManufacturingOrderOperativeStatus.COMPLETED;
  }

  if (
    mo.corrugatorProcess.status === CorrugatorProcessStatus.RUNNING ||
    processes.some((p) => p.status === OrderFinishingProcessStatus.InProduction)
  ) {
    return ManufacturingOrderOperativeStatus.RUNNING;
  }

  // Nothing is running, but something is paused or all is paused
  if (
    mo.corrugatorProcess.status === CorrugatorProcessStatus.PAUSED ||
    processes.some((p) => p.status === OrderFinishingProcessStatus.Paused)
  ) {
    return ManufacturingOrderOperativeStatus.PAUSED;
  }

  if (
    mo.corrugatorProcess.status === CorrugatorProcessStatus.CANCELLED &&
    processes.every((p) => p.status === OrderFinishingProcessStatus.Cancelled)
  ) {
    return ManufacturingOrderOperativeStatus.CANCELLED;
  }

  // Nothing is running, but something (not) all is cancelled, this could mean that some temporary changes are comming, set to paused and await cancellation
  if (
    mo.corrugatorProcess.status === CorrugatorProcessStatus.CANCELLED ||
    processes.some((p) => p.status === OrderFinishingProcessStatus.Cancelled)
  ) {
    return ManufacturingOrderOperativeStatus.PAUSED;
  }

  return ManufacturingOrderOperativeStatus.PAUSED;
};
