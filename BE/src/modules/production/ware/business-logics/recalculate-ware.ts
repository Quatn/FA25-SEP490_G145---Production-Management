import { BusinessLogicError } from "@/common/errors/business-logic.error";
import check from "check-types";
import { UnpopulatedFieldError } from "@/common/errors/unpopulated-field.error";
import { isRefPopulated } from "@/common/utils/populate-check";
import { Ware } from "../../schemas/ware.schema";
import { IllogicalError } from "@/common/errors/illogical.error";

// All of the wareManufacturingProcessType codes that this recalculate script currently handle, the recalc function should throw if something other than these values is passed into it
enum CurrentWareManufacturingProcessTypes {
  "GHEP",
  "GHEP1NAP",
  "GHEPCHONGNAP",
  "KHAY",
  "LIEN",
  "LIEN1NAP",
  "LIENCHONGNAP",
  "TAM",
  "TAM1LAN",
  "VACHU",
}

enum CurrentFluteCombinations {
  "3B",
  "3C",
  "3E",
  "4BC",
  "5BE",
  "5BC",
  "5CB",
  "7CBE",
  "7BCB",
  "3A",
  "4BE",
  "3BE",
  "NL-3B",
}

const conditionalMeasurement = (n: number | undefined | null, alt?: number) => {
  return check.number(n) && n > 0 ? n : (alt ?? 0);
};

export function recalculateWare(ware: Ware): Ware {
  const wareHeight = check.greater(ware.wareHeight as number, 0)
    ? ware.wareHeight
    : null;
  const warePerBlankAdjustment = check.greater(
    ware.warePerBlankAdjustment as number,
    0,
  )
    ? ware.warePerBlankAdjustment
    : null;
  const crossCutCountAdjustment = check.greater(
    ware.crossCutCountAdjustment as number,
    0,
  )
    ? ware.crossCutCountAdjustment
    : null;

  if (!isRefPopulated(ware.wareManufacturingProcessType)) {
    throw new UnpopulatedFieldError(
      "ware.wareManufacturingProcessType must be populated before it is passed to ware recalculate function",
    );
  }

  if (!isRefPopulated(ware.fluteCombination)) {
    throw new UnpopulatedFieldError(
      "ware.fluteCombination must be populated before it is passed to ware recalculate function",
    );
  }

  if (
    !check.in(
      ware.wareManufacturingProcessType.code,
      Object.keys(CurrentWareManufacturingProcessTypes),
    )
  ) {
    throw new BusinessLogicError(
      `Ware recalculate function received unsupported value of ${ware.wareManufacturingProcessType.code}. The current recalculate function only supports one of the following values: ${Object.keys(CurrentWareManufacturingProcessTypes).join(", ")}`,
    );
  }

  const manuType = ware.wareManufacturingProcessType
    .code as unknown as CurrentWareManufacturingProcessTypes;
  const fluteType = ware.fluteCombination
    .code as unknown as CurrentFluteCombinations;

  const warePerBlank = check.number(warePerBlankAdjustment)
    ? warePerBlankAdjustment
    : check.in(manuType, [
      CurrentWareManufacturingProcessTypes.GHEP,
      CurrentWareManufacturingProcessTypes.GHEP1NAP,
      CurrentWareManufacturingProcessTypes.GHEPCHONGNAP,
    ])
      ? 0.5
      : 1;

  const flapLength: number | null = (() => {
    if (manuType === CurrentWareManufacturingProcessTypes.TAM) return null;

    if (
      check.in(manuType, [
        CurrentWareManufacturingProcessTypes.LIEN,
        CurrentWareManufacturingProcessTypes.LIEN1NAP,
        CurrentWareManufacturingProcessTypes.GHEP,
        CurrentWareManufacturingProcessTypes.GHEP1NAP,
      ])
    ) {
      const E2 = ware.wareLength / 2;
      if (check.number(ware.flapOverlapAdjustment)) {
        return E2 + ware.flapOverlapAdjustment;
      }

      if (
        check.in(fluteType, [
          CurrentFluteCombinations["5AB"],
          CurrentFluteCombinations["5BC"],
          CurrentFluteCombinations["5CB"],
          CurrentFluteCombinations["5CE"],
          CurrentFluteCombinations["5BE"],
          CurrentFluteCombinations["3A"],
          CurrentFluteCombinations["3C"],
        ])
      )
        return E2 + 2;
      else if (fluteType === CurrentFluteCombinations["3B"]) return E2 + 1;
      else if (fluteType === CurrentFluteCombinations["3E"]) return E2;
      else if (fluteType === CurrentFluteCombinations["7CBE"]) return E2 + 2.5;
      else return NaN;
    }

    if (
      check.in(manuType, [
        CurrentWareManufacturingProcessTypes.KHAY,
        CurrentWareManufacturingProcessTypes.TAM1LAN,
        CurrentWareManufacturingProcessTypes.VACHU,
      ])
    ) {
      return ware.wareLength;
    }

    if (
      check.in(manuType, [
        CurrentWareManufacturingProcessTypes.LIENCHONGNAP,
        CurrentWareManufacturingProcessTypes.GHEPCHONGNAP,
      ])
    ) {
      return (
        ware.wareLength + conditionalMeasurement(ware.flapOverlapAdjustment)
      );
    }

    return null;
  })();

  const blankLength: number = (() => {
    if (
      check.in(manuType, [
        CurrentWareManufacturingProcessTypes.LIEN,
        CurrentWareManufacturingProcessTypes.LIEN1NAP,
        CurrentWareManufacturingProcessTypes.LIENCHONGNAP,
      ])
    ) {
      return (
        (ware.wareWidth + ware.wareLength) * 2 +
        conditionalMeasurement(ware.flapAdjustment, 35)
      );
    }

    if (check.in(manuType, ["GHEP", "GHEP1NAP", "GHEPCHONGNAP"])) {
      return (
        ware.wareWidth +
        ware.wareLength +
        conditionalMeasurement(ware.flapAdjustment, 35)
      );
    }

    if (manuType === CurrentWareManufacturingProcessTypes.TAM) {
      return ware.wareLength;
    }

    if (manuType === CurrentWareManufacturingProcessTypes.KHAY) {
      return ware.wareWidth + 2 * ware.wareLength;
    }

    if (
      check.in(manuType, [
        CurrentWareManufacturingProcessTypes.TAM1LAN,
        CurrentWareManufacturingProcessTypes.VACHU,
      ])
    ) {
      return ware.wareWidth + conditionalMeasurement(ware.flapAdjustment, 35);
    }

    return 1;
  })();

  const blankWidth: number = (() => {
    if (
      check.in(manuType, [
        CurrentWareManufacturingProcessTypes.LIEN,
        CurrentWareManufacturingProcessTypes.GHEP,
        CurrentWareManufacturingProcessTypes.LIENCHONGNAP,
        CurrentWareManufacturingProcessTypes.GHEPCHONGNAP,
      ])
    ) {
      return (
        conditionalMeasurement(wareHeight) +
        conditionalMeasurement(flapLength) * 2
      );
    }
    if (
      check.in(manuType, [
        CurrentWareManufacturingProcessTypes.LIEN1NAP,
        CurrentWareManufacturingProcessTypes.GHEP1NAP,
      ])
    ) {
      return (
        conditionalMeasurement(wareHeight) + conditionalMeasurement(flapLength)
      );
    }
    if (manuType === CurrentWareManufacturingProcessTypes.TAM) {
      return ware.wareWidth;
    }
    if (
      check.in(manuType, [
        CurrentWareManufacturingProcessTypes.KHAY,
        CurrentWareManufacturingProcessTypes.VACHU,
      ])
    ) {
      return (
        conditionalMeasurement(wareHeight) +
        conditionalMeasurement(ware.wareLength) * 2
      );
    }
    if (manuType === CurrentWareManufacturingProcessTypes.TAM1LAN) {
      return (
        conditionalMeasurement(wareHeight) +
        conditionalMeasurement(ware.wareLength)
      );
    }
    return 1;
  })();

  const crossCutCount = check.number(crossCutCountAdjustment)
    ? crossCutCountAdjustment
    : Math.min(Math.floor(1750 / blankWidth), 4);

  const paperWidth = (() => {
    const width =
      blankWidth * crossCutCount +
      (fluteType === CurrentFluteCombinations["7CBE"]
        ? 30
        : check.in(fluteType, [
          CurrentFluteCombinations["2E"],
          CurrentFluteCombinations["3E"],
          CurrentFluteCombinations["2B"],
          CurrentFluteCombinations["3B"],
        ])
          ? 20
          : 25);

    const thresholds = [
      900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400, 1450,
      1500, 1550, 1600, 1650, 1700, 1750,
    ];

    for (const t of thresholds) {
      if (width <= t) return t;
    }

    throw new IllogicalError(
      "Paper Width calculation somehow got over the thresholds check",
    );
  })();

  const margin = (paperWidth - blankWidth * crossCutCount) / 2;

  return {
    ...ware,
    recalculateFlag: false,
    warePerBlank,
    blankWidth,
    blankLength,
    flapLength,
    crossCutCount,
    paperWidth,
    margin,
  };
}
