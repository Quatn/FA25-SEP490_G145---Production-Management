import check from "check-types";
import { QueryListFullDetailsManufacturingOrderRequestDto } from "../dto/query-list-full-details.dto";
import { FilterQuery } from "mongoose";
import { ManufacturingOrder } from "../../schemas/manufacturing-order.schema";

export const buildFullDetailsMOFilterFromDto = (
  query: QueryListFullDetailsManufacturingOrderRequestDto,
) => {
  const filter: {
    $and: FilterQuery<ManufacturingOrder>[];
  } = { $and: [] };

  if (check.string(query.query))
    filter.$and.push({
      $or: [
        { code: { $regex: query.query, $options: "i" } },
        {
          "purchaseOrderItem.code": {
            $regex: query.query,
            $options: "i",
          },
        },
        {
          "purchaseOrderItem.ware.code": {
            $regex: query.query,
            $options: "i",
          },
        },
        {
          "purchaseOrderItem.ware.fluteCombination.code": {
            $regex: query.query,
            $options: "i",
          },
        },
        {
          "purchaseOrderItem.subPurchaseOrder.purchaseOrder.code": {
            $regex: query.query,
            $options: "i",
          },
        },
        {
          "purchaseOrderItem.subPurchaseOrder.purchaseOrder.customer.code": {
            $regex: query.query,
            $options: "i",
          },
        },
      ],
    });

  if (check.array(query.corrugatorProcessStatuses))
    filter.$and.push({
      "corrugatorProcess.status": {
        $in: query.corrugatorProcessStatuses,
      },
    });

  return filter;
};
