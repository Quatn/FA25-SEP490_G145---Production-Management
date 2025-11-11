export const ordersWithUnmanufacturedItemsLeanPipe = [
  // 0️⃣ Only non-deleted PurchaseOrderItems
  { $match: { isDeleted: false } },

  // 1️⃣ Lookup ManufacturingOrders
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

  // 2️⃣ Compute a flag for whether this item is manufactured
  {
    $addFields: {
      isManufactured: {
        $cond: [{ $gt: [{ $size: "$manufacturingOrder" }, 0] }, true, false],
      },
    },
  },

  // 3️⃣ Lookup SubPurchaseOrder
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

  // 4️⃣ Lookup PurchaseOrder
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

  // 5️⃣ Group by SubPurchaseOrder to aggregate item counts
  {
    $group: {
      _id: "$subPurchaseOrder._id",
      purchaseOrder: { $first: "$purchaseOrder" },
      subPurchaseOrder: { $first: "$subPurchaseOrder" },
      manufacturedItemCount: {
        $sum: { $cond: ["$isManufactured", 1, 0] },
      },
      unmanufacturedItemCount: {
        $sum: { $cond: ["$isManufactured", 0, 1] },
      },
    },
  },

  // 6️⃣ Group by PurchaseOrder to aggregate sub-orders
  {
    $group: {
      _id: "$purchaseOrder._id",
      purchaseOrder: { $first: "$purchaseOrder" },
      subPurchaseOrders: { $addToSet: "$_id" },
      manufacturedItemCount: { $sum: "$manufacturedItemCount" },
      unmanufacturedItemCount: { $sum: "$unmanufacturedItemCount" },
    },
  },

  // 7️⃣ Final projection
  {
    $project: {
      _id: 0,
      purchaseOrder: 1,
      subPurchaseOrders: 1,
      manufacturedItemCount: 1,
      unmanufacturedItemCount: 1,
    },
  },
];
