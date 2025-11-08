import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import { getDb } from "./mockDb";
import { Ware } from "@/types/Ware";
import check from "check-types";

const conditionalMeasurement = (n: number | undefined | null) => {
  return (check.null(n)) ? 0 : (check.number(n) && n > 0) ? n : NaN;
};

const paperConsumptionCalculation = (
  runningLength: number,
  paperType: string,
): number => {
  const lastThree = paperType.slice(-3);
  const parsed = parseInt(lastThree, 10);

  if (!check.number(parsed)) return NaN;

  return parsed * runningLength / 1000000;
};

export function recalculatePurchaseOrderItem(
  item: Serialized<PurchaseOrderItem>,
): Serialized<PurchaseOrderItem> {
  refreshWares();
  const { wares } = getDb();
  const ware = wares.find((w) => w.code == item.wareCode);

  if (check.undefined(ware)) {
    throw "Error while trying to recalculate po item data: ware not found";
  }

  const numberOfBlanks = Math.ceil(item.amount / ware.warePerBlank);
  const longitudinalCutCount = Math.ceil(numberOfBlanks / ware.crossCutCount);
  const runningLength = Math.floor(
    longitudinalCutCount * ware.blankLength / 1000,
  );

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
    ...item,
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
    totalVolume: ware.volume * item.amount,
    totalWeight: conditionalMeasurement(faceLayerPaperWeight) +
      conditionalMeasurement(EFlutePaperWeight) +
      conditionalMeasurement(EBLinerLayerPaperWeight) +
      conditionalMeasurement(BFlutePaperWeight) +
      conditionalMeasurement(BACLinerLayerPaperWeight) +
      conditionalMeasurement(ACFlutePaperWeight) +
      conditionalMeasurement(backLayerPaperWeight),
  };
}

function recalculateWare(ware: Serialized<Ware>): Serialized<Ware> {
  const warePerBlank = check.number(ware.warePerBlankAdjustment)
    ? ware.warePerBlankAdjustment
    : (check.in("GHEP", ware.wareManufacturingProcessType))
      ? 0.5
      : 1;

  const flapLength: number | null = (() => {
    if (ware.wareManufacturingProcessType === "TAM") return null;

    if (
      check.in(ware.wareManufacturingProcessType, [
        "LIEN",
        "LIEN1NAP",
        "GHEP",
        "GHEP1NAP",
      ])
    ) {
      const E2 = ware.wareLength / 2;
      if (check.number(ware.flapOverlapAdjustment)) {
        return E2 + ware.flapOverlapAdjustment;
      }

      if (
        check.in(ware.fluteCombinationCode, [
          "5AB",
          "5BC",
          "5CB",
          "5CE",
          "5BE",
          "3A",
          "3C",
        ])
      ) return E2 + 2;
      else if (ware.fluteCombinationCode === "3B") return E2 + 1;
      else if (ware.fluteCombinationCode === "3E") return E2;
      else if (ware.fluteCombinationCode === "7CBE") return E2 + 2.5;
      else return NaN;
    }

    if (
      check.in(ware.wareManufacturingProcessType, [
        "KHAY",
        "TAM1LAN",
        "VACHU",
      ])
    ) {
      return ware.wareLength;
    }

    if (
      check.in(ware.wareManufacturingProcessType, [
        "LIENCHONGNAP",
        "GHEPCHONGNAP",
      ])
    ) {
      return ware.wareLength +
        conditionalMeasurement(ware.flapOverlapAdjustment);
    }

    return null;
  })();

  const blankLength: number = (() => {
    if (
      check.in(ware.wareManufacturingProcessType, [
        "LIEN",
        "LIEN1NAP",
        "LIENCHONGNAP",
      ])
    ) {
      return (ware.wareWidth + ware.wareLength) * 2 +
        ((check.number(ware.flapAdjustment)) ? ware.flapAdjustment : 35);
    }

    if (
      check.in(ware.wareManufacturingProcessType, [
        "GHEP",
        "GHEP1NAP",
        "GHEPCHONGNAP",
      ])
    ) {
      return (ware.wareWidth + ware.wareLength) +
        ((check.number(ware.flapAdjustment)) ? ware.flapAdjustment : 35);
    }

    if (ware.wareManufacturingProcessType === "TAM") {
      return ware.wareLength;
    }

    if (ware.wareManufacturingProcessType === "KHAY") {
      return ware.wareWidth + 2 * ware.wareLength;
    }

    if (
      check.in(ware.wareManufacturingProcessType, [
        "TAM1LAN",
        "VACHU",
      ])
    ) {
      return ware.wareWidth +
        ((check.number(ware.flapAdjustment)) ? ware.flapAdjustment : 35);
    }

    return 1;
  })();

  const blankWidth: number = (() => {
    if (
      check.in(ware.wareManufacturingProcessType, [
        "LIEN",
        "GHEP",
        "LIENCHONGNAP",
        "GHEPCHONGNAP",
      ])
    ) {
      return conditionalMeasurement(ware.wareHeight) +
        conditionalMeasurement(flapLength) * 2;
    }
    if (
      check.in(ware.wareManufacturingProcessType, [
        "LIEN1NAP",
        "GHEP1NAP",
      ])
    ) {
      return conditionalMeasurement(ware.wareHeight) +
        conditionalMeasurement(flapLength);
    }
    if (ware.wareManufacturingProcessType === "TAM") {
      return ware.wareWidth;
    }
    if (
      check.in(ware.wareManufacturingProcessType, [
        "KHAY",
        "VACHU",
      ])
    ) {
      return conditionalMeasurement(ware.wareHeight) +
        conditionalMeasurement(ware.wareLength) * 2;
    }
    if (ware.wareManufacturingProcessType === "TAM1LAN") {
      return conditionalMeasurement(ware.wareHeight) +
        conditionalMeasurement(ware.wareLength);
    }
    return 1;
  })();

  const crossCutCount = check.number(ware.crossCutCountAdjustment)
    ? ware.crossCutCountAdjustment
    : Math.min(Math.floor(1750 / blankWidth), 4);

  const paperWidth = (() => {
    const width = blankWidth * crossCutCount +
      ((ware.fluteCombinationCode === "7CBE")
        ? 30
        : check.in(ware.fluteCombinationCode, ["2E", "3E", "2B", "3B"])
          ? 20
          : 25);

    const thresholds = [
      900,
      950,
      1000,
      1050,
      1100,
      1150,
      1200,
      1250,
      1300,
      1350,
      1400,
      1450,
      1500,
      1550,
      1600,
      1650,
      1700,
      1750,
    ];

    for (const t of thresholds) {
      if (width <= t) return t;
    }

    return NaN;
  })();

  const margin = (paperWidth - blankWidth * crossCutCount) / 2;

  return {
    ...ware,
    warePerBlank,
    blankWidth,
    blankLength,
    flapLength,
    crossCutCount,
    paperWidth,
    margin,
  };
}

/**
 * Ensure all purchase order items are up-to-date.
 */
export function refreshPurchaseOrderItems(): void {
  const { purchaseOrderItems } = getDb();
  for (let i = 0; i < purchaseOrderItems.length; i++) {
    const item = purchaseOrderItems[i];
    if (item.recalcFlag) {
      const updated = recalculatePurchaseOrderItem(item);
      purchaseOrderItems[i] = { ...updated, recalcFlag: false };
    }
  }
}

/**
 * Ensure all wares are up-to-date.
 */
export function refreshWares(): void {
  const { wares } = getDb();
  for (let i = 0; i < wares.length; i++) {
    const ware = wares[i];
    if (ware.recalcFlag) {
      const updated = recalculateWare(ware);
      wares[i] = { ...updated, recalcFlag: false };
    }
  }
}
