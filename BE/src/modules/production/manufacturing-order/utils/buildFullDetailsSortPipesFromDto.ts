import check from "check-types";
import { QueryListFullDetailsManufacturingOrderRequestSortOptions as Options } from "../dto/query-list-full-details.dto";
import { PipelineStage, SortOrder } from "mongoose";
import { enumObjectToPrioritySortPipe } from "@/common/utils/enum-object-to-priority-sort-pipe";
import {
  ManufacturingOrderApprovalStatus,
  ManufacturingOrderDirectives,
  ManufacturingOrderOperativeStatus,
} from "../../schemas/manufacturing-order.schema";

// Had to make this else n in $sort would be counted as a number, which forces you to waste time adding an assertion
const valAssert = (n: number): 1 | -1 => {
  return n > 0 ? 1 : -1;
};

export const buildFullDetailsMOSortPipesFromDto = (
  options: {
    option: Options;
    value: 1 | -1;
  }[],
) => {
  const precedeStages: PipelineStage[] = [];
  const sortStage: Record<string, 1 | -1> = {};
  const cleanupStages: PipelineStage[] = [];

  options.forEach((o) => {
    switch (o.option) {
      case Options.Code:
        precedeStages.push(
          {
            $addFields: {
              parts: { $split: ["$code", "/"] },
            },
          },
          {
            $addFields: {
              n: {
                $convert: {
                  input: { $arrayElemAt: ["$parts", 0] },
                  to: "int",
                  onError: -1, // fallback value for bad format
                  onNull: -1,
                },
              },
              m: {
                $convert: {
                  input: { $arrayElemAt: ["$parts", 1] },
                  to: "int",
                  onError: -1,
                  onNull: -1,
                },
              },
            },
          },
        );

        Object.assign(sortStage, {
          m: o.value,
          n: o.value,
        });

        cleanupStages.push({
          $unset: ["parts", "m", "n"],
        });
        break;

      case Options.Directive:
        {
          const stages = enumObjectToPrioritySortPipe(
            "$manufacturingDirective",
            [
              ManufacturingOrderDirectives.Mandatory,
              ManufacturingOrderDirectives.Pause,
              ManufacturingOrderDirectives.Cancel,
              ManufacturingOrderDirectives.Compensate,
            ],
            o.value,
          );

          if (stages) {
            precedeStages.push(...stages.precedeStages);
            Object.assign(sortStage, stages.sortStage);
            cleanupStages.push(...stages.cleanupStages);
          }
        }
        break;

      case Options.ApprovalStatus:
        {
          const stages = enumObjectToPrioritySortPipe(
            "$approvalStatus",
            [
              ManufacturingOrderApprovalStatus.PendingApproval,
              ManufacturingOrderApprovalStatus.Draft,
              ManufacturingOrderApprovalStatus.Approved,
            ],
            o.value,
          );
          if (stages) {
            precedeStages.push(...stages.precedeStages);
            Object.assign(sortStage, stages.sortStage);
            cleanupStages.push(...stages.cleanupStages);
          }
        }
        break;

      case Options.OperativeStatus:
        {
          const stages = enumObjectToPrioritySortPipe(
            "$operativeStatus",
            [
              ManufacturingOrderOperativeStatus.RUNNING,
              ManufacturingOrderOperativeStatus.PAUSED,
              ManufacturingOrderOperativeStatus.NOTSTARTED,
              ManufacturingOrderOperativeStatus.COMPLETED,
              ManufacturingOrderOperativeStatus.CANCELLED,
            ],
            o.value,
          );
          if (stages) {
            precedeStages.push(...stages.precedeStages);
            Object.assign(sortStage, stages.sortStage);
            cleanupStages.push(...stages.cleanupStages);
          }
        }
        break;

      case Options.Amount:
        Object.assign(sortStage, {
          amount: valAssert(o.value),
        });
        break;

      case Options.Inventory:
        Object.assign(sortStage, {
          "finishedGoodRecord.currentQuantity": valAssert(o.value),
        });
        break;

      case Options.OrderDate:
        Object.assign(sortStage, {
          "purchaseOrderItem.subPurchaseOrder.purchaseOrder.orderDate":
            valAssert(o.value),
        });
        break;

      case Options.DeliveryDate:
        Object.assign(sortStage, {
          "purchaseOrderItem.subPurchaseOrder.deliveryDate": valAssert(o.value),
        });
        break;

      case Options.ManufacturingDate:
        precedeStages.push({
          $addFields: {
            effectiveManufacturingDate: {
              $ifNull: ["$manufacturingDateAdjustment", "$manufacturingDate"],
            },
          },
        });

        Object.assign(sortStage, {
          effectiveManufacturingDate: valAssert(o.value),
        });

        cleanupStages.push({
          $unset: ["effectiveManufacturingDate"],
        });

        break;

      default:
        return [];
    }
  });

  if (Object.keys(sortStage).length) {
    return [...precedeStages, { $sort: sortStage }, ...cleanupStages];
  }

  return [];
};
