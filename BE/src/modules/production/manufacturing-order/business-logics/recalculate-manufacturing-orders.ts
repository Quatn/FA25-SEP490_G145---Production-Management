import { BusinessLogicError } from "@/common/errors/business-logic.error";
import check from "check-types";
import { PurchaseOrderItem } from "../../schemas/purchase-order-item.schema";
import { isRefPopulated } from "@/common/utils/populate-check";
import { UnpopulatedFieldError } from "@/common/errors/unpopulated-field.error";
import { NeedRecalculateError } from "@/common/errors/need-recalculate.error";
import { ManufacturingOrder } from "../../schemas/manufacturing-order.schema";
import { getManufacturingDate } from "./mo-manufacturing-date-getter";
import { getCorrugatorLine } from "./mo-corrugator-line-getter";

const paperConsumptionCalculation = (
  runningLength: number,
  paperType: string,
): number => {
  const lastThree = paperType.slice(-3);
  const parsed = parseInt(lastThree, 10);

  if (!check.number(parsed))
    throw new BusinessLogicError(
      `Unable to parse paper weight information from paper type value ${paperType}`,
    );

  return (parsed * runningLength) / 1000000;
};

export function recalculateManufacturingOrder(
  mo: ManufacturingOrder,
): ManufacturingOrder {
  if (!isRefPopulated(mo.purchaseOrderItem)) {
    throw new UnpopulatedFieldError(
      "mo.purchaseOrderItem must be populated before it is passed to mo recalculate function",
    );
  }

  const item = mo.purchaseOrderItem;

  if (!isRefPopulated(item.ware)) {
    throw new UnpopulatedFieldError(
      "mo.poi.ware must be populated before it is passed to mo recalculate function",
    );
  }

  if (!isRefPopulated(item.subPurchaseOrder)) {
    throw new UnpopulatedFieldError(
      "mo.poi.subPurchaseOrder must be populated before it is passed to mo recalculate function",
    );
  }

  if (!isRefPopulated(item.subPurchaseOrder.purchaseOrder)) {
    throw new UnpopulatedFieldError(
      "mo.poi.subPurchaseOrder.purchaseOrder must be populated before it is passed to mo recalculate function",
    );
  }

  if (!isRefPopulated(item.subPurchaseOrder.purchaseOrder.customer)) {
    throw new UnpopulatedFieldError(
      "mo.poi.subPurchaseOrder.purchaseOrder.customer must be populated before it is passed to mo recalculate function",
    );
  }

  const ware = item.ware;

  if (ware.recalculateFlag) {
    throw new NeedRecalculateError(
      "poi.ware was found to have recalculateFlag set to true, please ensure all fields are properly recalculated and set the flag to false",
    );
  }

  if (!isRefPopulated(ware.fluteCombination)) {
    throw new NeedRecalculateError(
      "poi.ware must be populated before it is passed to mo recalculate function",
    );
  }

  const subpo = item.subPurchaseOrder;

  if (ware.recalculateFlag) {
    throw new NeedRecalculateError(
      "poi.ware was found to have recalculateFlag set to true, please ensure all fields are properly recalculated and set the flag to false",
    );
  }

  const manufacturingDate =
    mo.manufacturingDateAdjustment ??
    getManufacturingDate(
      subpo.deliveryDate,
      item.subPurchaseOrder.purchaseOrder.customer.code,
    );

  const corrugatorLine =
    mo.corrugatorLineAdjustment ??
    getCorrugatorLine(
      ware.fluteCombination.code,
      item.subPurchaseOrder.purchaseOrder.customer.code,
    );

  const numberOfBlanks = Math.ceil(mo.amount / ware.warePerBlank);
  const longitudinalCutCount = Math.ceil(numberOfBlanks / ware.crossCutCount);
  const runningLength = (longitudinalCutCount * ware.blankLength) / 1000;

  const faceLayerPaperWeight = check.null(ware.faceLayerPaperType)
    ? null
    : paperConsumptionCalculation(runningLength, ware.faceLayerPaperType);
  const EFlutePaperWeight = check.null(ware.EFlutePaperType)
    ? null
    : paperConsumptionCalculation(runningLength, ware.EFlutePaperType) * 1.1;
  const EBLinerLayerPaperWeight = check.null(ware.EBLinerLayerPaperType)
    ? null
    : paperConsumptionCalculation(runningLength, ware.EBLinerLayerPaperType);
  const BFlutePaperWeight = check.null(ware.BFlutePaperType)
    ? null
    : paperConsumptionCalculation(runningLength, ware.BFlutePaperType) * 1.2;
  const BACLinerLayerPaperWeight = check.null(ware.BACLinerLayerPaperType)
    ? null
    : paperConsumptionCalculation(runningLength, ware.BACLinerLayerPaperType);
  const ACFlutePaperWeight = check.null(ware.ACFlutePaperType)
    ? null
    : paperConsumptionCalculation(runningLength, ware.ACFlutePaperType) * 1.35;
  const backLayerPaperWeight = check.null(ware.backLayerPaperType)
    ? null
    : paperConsumptionCalculation(runningLength, ware.backLayerPaperType);

  return {
    ...mo,
    recalculateFlag: false,
    manufacturingDate,
    corrugatorLine,
    numberOfBlanks,
    longitudinalCutCount,
    runningLength,
    faceLayerPaperWeight,
    EFlutePaperWeight,
    EBLinerLayerPaperWeight,
    BFlutePaperWeight,
    BACLinerLayerPaperWeight,
    ACFlutePaperWeight,
    backLayerPaperWeight,
    totalVolume: ware.volume * mo.amount,
    totalWeight:
      (faceLayerPaperWeight ?? 0) +
      (EFlutePaperWeight ?? 0) +
      (EBLinerLayerPaperWeight ?? 0) +
      (BFlutePaperWeight ?? 0) +
      (BACLinerLayerPaperWeight ?? 0) +
      (ACFlutePaperWeight ?? 0) +
      (backLayerPaperWeight ?? 0),
  };
}
