import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants";
import { EndpointBuilder } from "@reduxjs/toolkit/query";

const baseQuery = fetchBaseQuery({ baseUrl: BASE_URL, credentials: "include" });


const tagTypes = [
  "User",
  "Auth",
  "PaperSupplier",
  "PaperColor",
  "PaperType",
  "PaperRoll",
  "PaperRollTransaction",
  "ManufacturingOrder",
  "ManufacturingOrderTracking",
  "ManufacturingOrderProcess",
  "CorrugatorProcess",
  "WareManufacturingProcessType",
  "WareFinishingProcessType",
  "ProductType",
  "PurchaseOrder",
  "FluteCombination",
  "PaperRoll",
  "PaperRollTransaction",
  "Product",
  "Ware",
  "Customer",
  "SubPurchaseOrder",
  "PrintColor",
  "ManufacturingProcess",
  "SemiFinishedGood",
  "SemiFinishedGoodTransaction",
  "FinishedGood",
  "FinishedGoodTransaction",
  "PurchaseOrderItem",
  "Employee",
  "Role",
  "DeliveryNote",
  "OrderFinishingProcess",
];

export const apiSlice = createApi({
  baseQuery,
  tagTypes,
  endpoints: () => ({}),
});

export type ApiBaseQuery = typeof baseQuery;

export type ApiBuilder = EndpointBuilder<
  ApiBaseQuery,
  typeof tagTypes[number],
  "api"
>;
