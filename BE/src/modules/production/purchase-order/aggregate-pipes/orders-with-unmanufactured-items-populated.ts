export const ordersWithUnmanufacturedItemsPopulatedPipe = [
  // 0️⃣ Only non-deleted items
  { $match: { isDeleted: false } },

  // 1️⃣ Lookup manufacturing orders (full objects, non-deleted)
  {
    $lookup: {
      from: "manufacturingorders",
      let: { itemId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$purchaseOrderItem", "$$itemId"] } } },
        { $match: { isDeleted: false } },
      ],
      as: "manufacturingOrder",
    },
  },

  // 2️⃣ Add derived fields
  {
    $addFields: {
      manufacturingOrderCode: {
        $arrayElemAt: ["$manufacturingOrder.code", 0],
      },
      isManufactured: {
        $cond: [{ $gt: [{ $size: "$manufacturingOrder" }, 0] }, true, false],
      },
    },
  },

  // 3️⃣ Lookup SubPurchaseOrder (full document)
  {
    $lookup: {
      from: "subpurchaseorders",
      let: { subId: "$subPurchaseOrder" },
      pipeline: [
        { $match: { $expr: { $eq: ["$_id", "$$subId"] } } },
        { $match: { isDeleted: false } },
      ],
      as: "subPurchaseOrder",
    },
  },
  { $unwind: "$subPurchaseOrder" },

  // 4️⃣ Lookup PurchaseOrder (full document)
  {
    $lookup: {
      from: "purchaseorders",
      let: { poId: "$subPurchaseOrder.purchaseOrder" },
      pipeline: [
        { $match: { $expr: { $eq: ["$_id", "$$poId"] } } },
        { $match: { isDeleted: false } },
      ],
      as: "purchaseOrder",
    },
  },
  { $unwind: "$purchaseOrder" },

  // 5️⃣ Group by SubPurchaseOrder — embed purchase order items
  {
    $group: {
      _id: "$subPurchaseOrder._id",
      subPurchaseOrder: { $first: "$subPurchaseOrder" },
      purchaseOrder: { $first: "$purchaseOrder" },
      purchaseOrderItems: {
        $push: {
          _id: "$_id",
          code: "$code",
          isManufactured: "$isManufactured",
          manufacturingOrderCode: "$manufacturingOrderCode",
        },
      },
      manufacturedItemCount: { $sum: { $cond: ["$isManufactured", 1, 0] } },
      unmanufacturedItemCount: { $sum: { $cond: ["$isManufactured", 0, 1] } },
    },
  },

  // 6️⃣ Group by PurchaseOrder — embed sub-orders inside the purchaseOrder
  {
    $group: {
      _id: "$purchaseOrder._id",
      purchaseOrder: { $first: "$purchaseOrder" },
      subPurchaseOrders: {
        $push: {
          _id: "$_id",
          code: "$subPurchaseOrder.code",
          purchaseOrderItems: "$purchaseOrderItems",
          manufacturedItemCount: "$manufacturedItemCount",
          unmanufacturedItemCount: "$unmanufacturedItemCount",
        },
      },
      manufacturedItemCount: { $sum: "$manufacturedItemCount" },
      unmanufacturedItemCount: { $sum: "$unmanufacturedItemCount" },
    },
  },

  // 7️⃣ Restructure so subPurchaseOrders live inside purchaseOrder
  {
    $addFields: {
      "purchaseOrder.subPurchaseOrders": "$subPurchaseOrders",
      "purchaseOrder.manufacturedItemCount": "$manufacturedItemCount",
      "purchaseOrder.unmanufacturedItemCount": "$unmanufacturedItemCount",
    },
  },

  // 8️⃣ Clean final projection
  {
    $replaceRoot: { newRoot: "$purchaseOrder" },
  },
];
