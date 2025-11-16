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
  "FluteCombination",
  "PaperRoll",
  "PaperRollTransaction",
  "PurchaseOrder",
  "Product",
  "Ware",
  "Customer",
  "SubPurchaseOrder",
  "PrintColor",
  "ManufacturingProcess",
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
