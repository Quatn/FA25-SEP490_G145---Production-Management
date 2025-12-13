import check from "check-types";
import { QueryListFullDetailsManufacturingOrderRequestSortOptions as Options } from "../dto/query-list-full-details.dto";
import { PipelineStage } from "mongoose";
import { enumObjectToPrioritySortPipe } from "@/common/utils/enum-object-to-priority-sort-pipe";
import {
  CorrugatorProcess,
  CorrugatorProcessStatus,
  ManufacturingOrderApprovalStatus,
  ManufacturingOrderDirectives,
  ManufacturingOrderOperativeStatus,
} from "../../schemas/manufacturing-order.schema";
import { OrderFinishingProcessStatus } from "../../schemas/order-finishing-process.schema";

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
  const sorts: PipelineStage[] = options
    .map((o) => {
      switch (o.option) {
        case Options.Code:
          return [
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
            {
              $sort: {
                m: o.value,
                n: o.value,
              },
            },
            {
              $unset: ["parts", "m", "n"],
            },
          ] as PipelineStage[];
        case Options.Directive:
          return enumObjectToPrioritySortPipe(
            "$manufacturingDirective",
            [
              ManufacturingOrderDirectives.Mandatory,
              ManufacturingOrderDirectives.Pause,
              ManufacturingOrderDirectives.Cancel,
              ManufacturingOrderDirectives.Compensate,
            ],
            o.value,
          );
        case Options.ApprovalStatus:
          return enumObjectToPrioritySortPipe(
            "$approvalStatus",
            [
              ManufacturingOrderApprovalStatus.PendingApproval,
              ManufacturingOrderApprovalStatus.Draft,
              ManufacturingOrderApprovalStatus.Approved,
            ],
            o.value,
          );
        case Options.OperativeStatus:
          return enumObjectToPrioritySortPipe(
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
        case Options.Amount:
          return {
            $sort: {
              amount: valAssert(o.value),
            },
          };
        case Options.Inventory:
          return [
            {
              $sort: {
                "finishedGoodRecord.currentQuantity": valAssert(o.value),
              },
            },
          ];
        case Options.OrderDate:
          return [
            {
              $sort: {
                "purchaseOrderItem.subPurchaseOrder.purchaseOrder.orderDate":
                  valAssert(o.value),
              },
            },
          ];
        case Options.DeliveryDate:
          return [
            {
              $sort: {
                "purchaseOrderItem.subPurchaseOrder.deliveryDate": valAssert(
                  o.value,
                ),
              },
            },
          ];
        case Options.ManufacturingDate:
          return [
            {
              $sort: {
                manufacturingDate: valAssert(o.value),
              },
            },
          ];
        default:
          return [];
      }
    })
    .flat();
  return sorts;
};
