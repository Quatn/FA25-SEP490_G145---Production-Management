import { PipelineStage } from "mongoose";
import { CorrugatorProcessStatus } from "../../schemas/manufacturing-order.schema";

export function queryAllByPaperTypesUsagePipeline({
  paperTypes,
}: {
  paperTypes: string[];
}) {
  const pipeline: PipelineStage[] = [];

  pipeline.push(
    {
      $match: {
        "corrugatorProcess.status": {
          $in: [
            CorrugatorProcessStatus.NOTSTARTED,
            CorrugatorProcessStatus.RUNNING,
            CorrugatorProcessStatus.PAUSED,
          ],
        },
      },
    },

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
    {
      $match: {
        $or: [
          {
            "purchaseOrderItem.ware.faceLayerPaperType": {
              $in: paperTypes,
            },
          },
          {
            "purchaseOrderItem.ware.EFlutePaperType": {
              $in: paperTypes,
            },
          },
          {
            "purchaseOrderItem.ware.EBLinerLayerPaperType": {
              $in: paperTypes,
            },
          },
          {
            "purchaseOrderItem.ware.BFlutePaperType": {
              $in: paperTypes,
            },
          },
          {
            "purchaseOrderItem.ware.BACLinerLayerPaperType": {
              $in: paperTypes,
            },
          },
          {
            "purchaseOrderItem.ware.ACFlutePaperType": {
              $in: paperTypes,
            },
          },
          {
            "purchaseOrderItem.ware.backLayerPaperType": {
              $in: paperTypes,
            },
          },
        ],
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

  return pipeline;
}
