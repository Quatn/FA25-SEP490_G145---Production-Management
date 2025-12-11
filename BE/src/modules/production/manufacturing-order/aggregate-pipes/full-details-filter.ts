import check from "check-types";
import { PipelineStage } from "mongoose";
import {
  CorrugatorProcessStatus,
  ManufacturingOrderOperativeStatus,
} from "../../schemas/manufacturing-order.schema";
import { OrderFinishingProcessStatus } from "../../schemas/order-finishing-process.schema";
import { CompileMOOperativeStatusPipe } from "./compile-operative-status-pipe";

export function fullDetailsFilterAggregationPipeline({
  filter = {},
  skip = 0,
  limit = 20,
  sort = [],
}: {
  filter: Record<string, unknown>;
  skip: number;
  limit: number;
  sort?: PipelineStage[];
}) {
  const pipeline: PipelineStage[] = [];

  pipeline.push(
    // from mo
    {
      $lookup: {
        from: "purchaseorderitems",
        localField: "purchaseOrderItem",
        foreignField: "_id",
        as: "purchaseOrderItem",
      },
    },
    {
      $unwind: { path: "$purchaseOrderItem", preserveNullAndEmptyArrays: true },
    },
    {
      $match: {
        "purchaseOrderItem.isDeleted": {
          $ne: true,
        },
      },
    },
    {
      $lookup: {
        from: "finishedgoods",
        localField: "_id",
        foreignField: "manufacturingOrder",
        as: "finishedGoodRecord",
      },
    },
    {
      $unwind: {
        path: "$finishedGoodRecord",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "orderfinishingprocesses",
        localField: "_id",
        foreignField: "manufacturingOrder",
        as: "finishingProcesses",
      },
    },
    ...CompileMOOperativeStatusPipe,

    // from poi
    {
      $lookup: {
        from: "wares",
        localField: "purchaseOrderItem.ware",
        foreignField: "_id",
        as: "purchaseOrderItem.ware",
      },
    },
    {
      $unwind: {
        path: "$purchaseOrderItem.ware",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        "purchaseOrderItem.ware.isDeleted": {
          $ne: true,
        },
      },
    },

    // from ware
    {
      $lookup: {
        from: "flutecombinations",
        localField: "purchaseOrderItem.ware.fluteCombination",
        foreignField: "_id",
        as: "purchaseOrderItem.ware.fluteCombination",
      },
    },
    {
      $unwind: {
        path: "$purchaseOrderItem.ware.fluteCombination",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        "purchaseOrderItem.ware.fluteCombination.isDeleted": {
          $ne: true,
        },
      },
    },

    {
      $lookup: {
        from: "warefinishingprocesstypes",
        localField: "purchaseOrderItem.ware.finishingProcesses",
        foreignField: "_id",
        as: "purchaseOrderItem.ware.finishingProcesses",
      },
    },
    {
      $match: {
        "purchaseOrderItem.ware.finishingProcesses": {
          $all: [{ $elemMatch: { $ne: true } }],
        },
      },
    },

    {
      $lookup: {
        from: "waremanufacturingprocesstypes",
        localField: "purchaseOrderItem.ware.wareManufacturingProcessType",
        foreignField: "_id",
        as: "purchaseOrderItem.ware.wareManufacturingProcessType",
      },
    },
    {
      $unwind: {
        path: "$purchaseOrderItem.ware.wareManufacturingProcessType",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        "purchaseOrderItem.ware.wareManufacturingProcessType.isDeleted": {
          $ne: true,
        },
      },
    },
    {
      $lookup: {
        from: "printcolors",
        localField: "purchaseOrderItem.ware.printColors",
        foreignField: "_id",
        as: "purchaseOrderItem.ware.printColors",
      },
    },

    // from poi
    {
      $lookup: {
        from: "subpurchaseorders",
        localField: "purchaseOrderItem.subPurchaseOrder",
        foreignField: "_id",
        as: "purchaseOrderItem.subPurchaseOrder",
      },
    },
    {
      $unwind: {
        path: "$purchaseOrderItem.subPurchaseOrder",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        "purchaseOrderItem.subPurchaseOrder.isDeleted": {
          $ne: true,
        },
      },
    },

    // from spo
    {
      $lookup: {
        from: "products",
        localField: "purchaseOrderItem.subPurchaseOrder.product",
        foreignField: "_id",
        as: "purchaseOrderItem.subPurchaseOrder.product",
      },
    },
    {
      $unwind: {
        path: "$purchaseOrderItem.subPurchaseOrder.product",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        "purchaseOrderItem.subPurchaseOrder.product.isDeleted": {
          $ne: true,
        },
      },
    },
    {
      $lookup: {
        from: "purchaseorders",
        localField: "purchaseOrderItem.subPurchaseOrder.purchaseOrder",
        foreignField: "_id",
        as: "purchaseOrderItem.subPurchaseOrder.purchaseOrder",
      },
    },
    {
      $unwind: {
        path: "$purchaseOrderItem.subPurchaseOrder.purchaseOrder",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        "purchaseOrderItem.subPurchaseOrder.purchaseOrder.isDeleted": {
          $ne: true,
        },
      },
    },

    // from po
    {
      $lookup: {
        from: "customers",
        localField: "purchaseOrderItem.subPurchaseOrder.purchaseOrder.customer",
        foreignField: "_id",
        as: "purchaseOrderItem.subPurchaseOrder.purchaseOrder.customer",
      },
    },
    {
      $unwind: {
        path: "$purchaseOrderItem.subPurchaseOrder.purchaseOrder.customer",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        "purchaseOrderItem.subPurchaseOrder.purchaseOrder.customer.isDeleted": {
          $ne: true,
        },
      },
    },
    ...sort,
  );

  const mainFilters: Record<string, unknown> = {};
  const nestedFilters: Record<string, unknown> = {};

  for (const key in filter) {
    if (!key.includes(".")) mainFilters[key] = filter[key];
    else nestedFilters[key] = filter[key];
  }

  if (Object.keys(mainFilters).length > 0) {
    pipeline.push({ $match: mainFilters });
  }

  if (Object.keys(nestedFilters).length) {
    const nestedMatch = {};
    for (const key in nestedFilters) {
      nestedMatch[key] = nestedFilters[key];
    }
    pipeline.push({ $match: nestedMatch });
  }

  if (skip) pipeline.push({ $skip: skip });
  if (limit) pipeline.push({ $limit: limit });

  return pipeline;
}
