import { PipelineStage } from "mongoose";

export function fullDetailsFilterAggregationPipeline({
  filter = {},
  skip = 0,
  limit = 20,
}) {
  const pipeline: PipelineStage[] = [];

  pipeline.push(
    // from mo
    {
      $lookup: {
        from: "manufacturingorderprocesses",
        localField: "processes",
        foreignField: "_id",
        as: "processes",
      },
    },
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
      $lookup: {
        from: "warefinishingprocesstypes",
        localField: "purchaseOrderItem.ware.finishingProcesses",
        foreignField: "_id",
        as: "purchaseOrderItem.ware.finishingProcesses",
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

    // sort by code
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
      $sort: { m: 1, n: 1 },
    },
  );

  const mainFilters: Record<string, unknown> = {};
  const nestedFilters: Record<string, unknown> = {};

  for (const key in filter) {
    if (!key.includes(".")) mainFilters[key] = filter[key] as unknown;
    else nestedFilters[key] = filter[key] as unknown;
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
