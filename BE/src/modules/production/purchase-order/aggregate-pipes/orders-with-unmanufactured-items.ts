import {
  PurchaseOrderItemSchema,
  PurchaseOrderItemStatus,
} from "../../schemas/purchase-order-item.schema";
import { PurchaseOrderStatus } from "../../schemas/purchase-order.schema";

// TODO: Optimize or something, ts is definitely not optimized
export const ordersWithUnmanufacturedItemsLeanPipe = (
  page: number = 1,
  limit: number = 20,
  searchTerm: string = "",
) => {
  const poiFields: Record<string, string> = {};

  Object.keys(PurchaseOrderItemSchema.paths).forEach((f) => {
    poiFields[f] = `$${f}`;
  });

  return [
    // Only non-deleted PO items
    {
      $match: {
        isDeleted: { $ne: true },
        status: PurchaseOrderItemStatus.Approved,
        amount: { $gt: 0 },
      },
    },

    // Lookup manufacturing orders for each item (keep full objects)
    {
      $lookup: {
        from: "manufacturingorders",
        let: { itemId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$purchaseOrderItem", "$$itemId"] } } },
          { $match: { isDeleted: { $ne: true } } },
        ],
        as: "manufacturingOrder",
      },
    },

    // Flag if item is manufactured
    {
      $addFields: {
        isManufactured: { $gt: [{ $size: "$manufacturingOrder" }, 0] },
      },
    },

    // Group by SubPurchaseOrder — push small item objects (keep id + manufacturing info)
    {
      $group: {
        _id: "$subPurchaseOrder",
        purchaseOrderItems: {
          $push: {
            ...poiFields,
            // keep any fields you need to re-attach later (we keep manufacturing order)

            manufacturingOrder: "$manufacturingOrder",
            isManufactured: "$isManufactured",
          },
        },
        manufacturedItemCount: { $sum: { $cond: ["$isManufactured", 1, 0] } },
        unmanufacturedItemCount: { $sum: { $cond: ["$isManufactured", 0, 1] } },
      },
    },

    // Lookup SubPurchaseOrder doc to get parent purchaseOrder
    {
      $lookup: {
        from: "subpurchaseorders",
        localField: "_id",
        foreignField: "_id",
        as: "subPurchaseOrder",
      },
    },
    { $unwind: "$subPurchaseOrder" },
    { $match: { "subPurchaseOrder.isDeleted": { $ne: true } } },

    // Group by PurchaseOrder — assemble subPurchaseOrders with item-id objects
    {
      $group: {
        _id: "$subPurchaseOrder.purchaseOrder",
        subPurchaseOrders: {
          $push: {
            subPurchaseOrder: "$subPurchaseOrder",
            purchaseOrderItems: "$purchaseOrderItems", // array of {_id, manufacturingOrder, isManufactured}
            manufacturedItemCount: "$manufacturedItemCount",
            unmanufacturedItemCount: "$unmanufacturedItemCount",
          },
        },
        manufacturedItemCount: { $sum: "$manufacturedItemCount" },
        unmanufacturedItemCount: { $sum: "$unmanufacturedItemCount" },
      },
    },

    // Lookup PurchaseOrder doc
    {
      $lookup: {
        from: "purchaseorders",
        localField: "_id",
        foreignField: "_id",
        as: "purchaseOrder",
      },
    },
    { $unwind: "$purchaseOrder" },
    {
      $match: {
        isDeleted: { $ne: true },
        "purchaseOrder.status": PurchaseOrderStatus.Approved,
        "purchaseOrder.isDeleted": { $ne: true },
      },
    },

    {
      $match: {
        unmanufacturedItemCount: { $gt: 0 },
      },
    },

    {
      $match: {
        $or: [
          { code: { $regex: searchTerm, $options: "i" } },
          { "purchaseOrder.code": { $regex: searchTerm, $options: "i" } },
          {
            "subPurchaseOrders.subPurchaseOrder.code": {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            "subPurchaseOrders.purchaseOrderItems.code": {
              $regex: searchTerm,
              $options: "i",
            },
          },
          // add other fields as needed
        ],
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ];
};
