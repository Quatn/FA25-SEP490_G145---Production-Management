// TODO: Optimize or something, ts is definitely not optimized
export const ordersWithUnmanufacturedItemsLeanPipe = (
  page: number = 1,
  limit: number = 20,
  searchTerm: string = "",
) => {
  return [
    // Only non-deleted PO items
    { $match: { isDeleted: false } },

    // Lookup manufacturing orders for each item (keep full objects)
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
            _id: "$_id",
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

    // Group by PurchaseOrder — assemble subPurchaseOrders with item-id objects
    {
      $group: {
        _id: "$subPurchaseOrder.purchaseOrder",
        subPurchaseOrders: {
          $push: {
            subPurchaseOrder: "$_id",
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

    // Flatten all purchaseOrderItem ids into a single array for lookup
    {
      $addFields: {
        allItemIds: {
          $reduce: {
            input: "$subPurchaseOrders",
            initialValue: [],
            in: {
              $concatArrays: [
                "$$value",
                {
                  $map: {
                    input: "$$this.purchaseOrderItems",
                    as: "it",
                    in: "$$it._id",
                  },
                },
              ],
            },
          },
        },
      },
    },

    // Lookup all PurchaseOrderItem documents for those ids (filter deleted just in case)
    {
      $lookup: {
        from: "purchaseorderitems",
        localField: "allItemIds",
        foreignField: "_id",
        as: "purchaseOrderItemsPopulated",
      },
    },

    // Optionally filter out deleted PO items from the populated array
    {
      $addFields: {
        purchaseOrderItemsPopulated: {
          $filter: {
            input: "$purchaseOrderItemsPopulated",
            as: "pitem",
            cond: { $eq: ["$$pitem.isDeleted", false] },
          },
        },
      },
    },

    // Lookup subPurchaseOrders docs to merge into subPurchaseOrders array (your earlier trick)
    {
      $lookup: {
        from: "subpurchaseorders",
        localField: "subPurchaseOrders.subPurchaseOrder",
        foreignField: "_id",
        as: "subPurchaseOrdersPopulated",
      },
    },

    // Merge subPurchaseOrders with their full documents
    {
      $addFields: {
        subPurchaseOrders: {
          $map: {
            input: "$subPurchaseOrders",
            as: "sub",
            in: {
              $mergeObjects: [
                "$$sub",
                {
                  subPurchaseOrder: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$subPurchaseOrdersPopulated",
                          as: "pop",
                          cond: {
                            $eq: ["$$pop._id", "$$sub.subPurchaseOrder"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },

    // Now replace each purchaseOrderItems array of {_id, manufacturingOrder, isManufactured}
    // with the actual populated item doc merged with the stored manufacturingOrder
    {
      $addFields: {
        subPurchaseOrders: {
          $map: {
            input: "$subPurchaseOrders",
            as: "sub",
            in: {
              $mergeObjects: [
                "$$sub",
                {
                  purchaseOrderItems: {
                    $map: {
                      input: "$$sub.purchaseOrderItems",
                      as: "itemRef",
                      in: {
                        $let: {
                          vars: {
                            fullItemDoc: {
                              $arrayElemAt: [
                                {
                                  $filter: {
                                    input: "$purchaseOrderItemsPopulated",
                                    as: "popItem",
                                    cond: {
                                      $eq: ["$$popItem._id", "$$itemRef._id"],
                                    },
                                  },
                                },
                                0,
                              ],
                            },
                          },
                          in: {
                            // If fullItemDoc exists, merge it with the earlier saved manufacturing info
                            $cond: [
                              { $ifNull: ["$$fullItemDoc", false] },
                              {
                                $mergeObjects: [
                                  "$$fullItemDoc",
                                  {
                                    manufacturingOrder:
                                      "$$itemRef.manufacturingOrder",
                                    isManufactured: "$$itemRef.isManufactured",
                                  },
                                ],
                              },
                              // else (missing full doc) return a minimal fallback object
                              {
                                _id: "$$itemRef._id",
                                manufacturingOrder:
                                  "$$itemRef.manufacturingOrder",
                                isManufactured: "$$itemRef.isManufactured",
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },

    // Cleanup temporary arrays
    {
      $project: {
        subPurchaseOrdersPopulated: 0,
        purchaseOrderItemsPopulated: 0,
        allItemIds: 0,
        _id: 0,
      },
    },

    // Final shape: purchaseOrder root with counts and nested subPurchaseOrders/purchaseOrderItems
    {
      $project: {
        purchaseOrder: 1,
        manufacturedItemCount: 1,
        unmanufacturedItemCount: 1,
        subPurchaseOrders: 1,
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
