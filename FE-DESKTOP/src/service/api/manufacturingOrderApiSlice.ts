import { apiSlice } from "./apiSlice";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { PageResponse } from "@/types/DTO/PageResponse";
import { createApiEndpoint } from "@/utils/endpointFactory";
import { MANUFACTURING_ORDER_URL } from "../constants";
import { BaseResponse } from "@/types/DTO/BaseResponse";
import {
  CreateManyManufacturingOrdersRequestDto,
  CreateManyManufacturingOrdersResponseDto,
} from "@/types/DTO/manufacturing-order/CreateManyManufacturingOrdersDto";
import { DeleteManufacturingOrderRequestDto, DeleteManufacturingOrderResponseDto } from "@/types/DTO/manufacturing-order/DeleteManufacturingOrderDto";
import { UpdateManyManufacturingOrdersRequestDto, UpdateManyManufacturingOrdersResponseDto } from "@/types/DTO/manufacturing-order/UpdateManyManufacturingOrdersDto";
import { CorrugatorProcessStatus } from "@/types/enums/CorrugatorProcessStatus";
import { ManufacturingOrderApprovalStatus } from "@/types/enums/ManufacturingOrderApprovalStatus";
import { CorrugatorLine } from "@/types/enums/CorrugatorLine";
import { QueryAllMOStatusesByDateRangeRequestDto, QueryAllMOStatusesByDateRangeResponseDto } from "@/types/DTO/manufacturing-order/QueryAllMOStatusesByDateRangeRequestDto";
import check from "check-types";
import { formatDateToYYYYMMDD } from "@/utils/dateUtils";
import { QueryAllMOProductionOutputByDateRangeRequestDto, QueryAllMOProductionOutputByDateRangeResponseDto } from "@/types/DTO/manufacturing-order/QueryAllMOProductionOutputByDateRangeDto";
import { CancelManufacturingOrderRequestDto, CancelManufacturingOrderResponseDto } from "@/types/DTO/manufacturing-order/CancelManufacturingOrderDto";

const relevantListTags = [
  "ManufacturingOrder",
  "ManufacturingOrderTracking",
  "ManufacturingOrderProcess",
  "CorrugatorProcess",
  "PurchaseOrder",
  "FluteCombination",
  "PaperRoll",
  "PaperRollTransaction",
  "Product",
  "Ware",
  "SubPurchaseOrder",
  "PrintColor",
  "ManufacturingProcess",
  "SemiFinishedGood",
  "SemiFinishedGoodTransaction",
  "PurchaseOrderItem",
]

export const manufacturingOrderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFullDetailManufacturingOrders: createApiEndpoint<
      PageResponse<Serialized<ManufacturingOrder>>,
      {
        page: number,
        limit: number,
        query?: string,
        approvalStatuses?: ManufacturingOrderApprovalStatus[];
        corrugatorLines?: CorrugatorLine[];
        corrugatorProcessStatuses?: CorrugatorProcessStatus[],
        sort?: string[],
      }
    >(builder, {
      query: ({ page, limit, query, approvalStatuses, corrugatorLines, corrugatorProcessStatuses, sort }) => ({
        url: `${MANUFACTURING_ORDER_URL}/query/full-details`,
        method: "GET",
        params: { page, limit, query, approvalStatuses, corrugatorLines, corrugatorProcessStatuses, sort },
        credentials: "include",
      }),
      providesTags: relevantListTags,
      // mockFn: ({ page = 1, limit = 20 }) => mockManufacturingOrderQuery({ page, limit }),
    }),

    getDraftFullDetailManufacturingOrdersByPoiIds: createApiEndpoint<
      BaseResponse<Serialized<ManufacturingOrder>[]>,
      { ids: string[] }
    >(builder, {
      query: ({ ids }) => ({
        url: `${MANUFACTURING_ORDER_URL}/draft-orders-by-poi-ids`,
        method: "GET",
        params: { ids },
        credentials: "include",
      }),
      providesTags: relevantListTags,
    }),

    createManyManufacturingOrders: builder.mutation<
      CreateManyManufacturingOrdersResponseDto,
      CreateManyManufacturingOrdersRequestDto
    >({
      query: (body) => ({
        url: `${MANUFACTURING_ORDER_URL}/create-many`,
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: relevantListTags,
    }),

    updateManyManufacturingOrders: builder.mutation<
      UpdateManyManufacturingOrdersResponseDto,
      UpdateManyManufacturingOrdersRequestDto
    >({
      query: (body) => ({
        url: `${MANUFACTURING_ORDER_URL}/update-many`,
        method: "PATCH",
        body,
        credentials: "include",
      }),
      invalidatesTags: relevantListTags,
    }),

    deleteManufacturingOrder: builder.mutation<
      DeleteManufacturingOrderResponseDto,
      DeleteManufacturingOrderRequestDto
    >({
      query: (params) => ({
        url: `${MANUFACTURING_ORDER_URL}/id/${params.id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: relevantListTags,
    }),

    getAllManufacturingOrders: builder.query<{ success: boolean; message: string; data: ManufacturingOrder[] }, void>({
      query: () => ({
        url: `${MANUFACTURING_ORDER_URL}/list-all`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: relevantListTags,
    }),

    getAllByPaperTypesUsage: createApiEndpoint<
      BaseResponse<Serialized<ManufacturingOrder>[]>,
      { paperTypes: string[] }
    >(builder, {
      query: ({ paperTypes }) => ({
        url: `${MANUFACTURING_ORDER_URL}/query/all-by-paper-types-usage`,
        method: "GET",
        params: { paperTypes },
        credentials: "include",
      }),
      providesTags: relevantListTags,
    }),

    getAllMOStatusesByDateRange: builder.query<
      BaseResponse<QueryAllMOStatusesByDateRangeResponseDto[]>,
      Serialized<QueryAllMOStatusesByDateRangeRequestDto>
    >({
      query: ({ startDate, endDate }) => ({
        url: `${MANUFACTURING_ORDER_URL}/query/all-statuses-by-date-range`,
        method: "GET",
        params: {
          startDate: check.string(startDate) ? formatDateToYYYYMMDD(startDate) : undefined,
          endDate: check.string(endDate) ? formatDateToYYYYMMDD(endDate) : undefined
        },
        credentials: "include",
      }),
      providesTags: relevantListTags,
    }),


    getAllMOProductionOutputByDateRange: builder.query<
      BaseResponse<QueryAllMOProductionOutputByDateRangeResponseDto[]>,
      Serialized<QueryAllMOProductionOutputByDateRangeRequestDto>
    >({
      query: ({ startDate, endDate }) => ({
        url: `${MANUFACTURING_ORDER_URL}/query/all-production-output-by-date-range`,
        method: "GET",
        params: {
          startDate: check.string(startDate) ? formatDateToYYYYMMDD(startDate) : undefined,
          endDate: check.string(endDate) ? formatDateToYYYYMMDD(endDate) : undefined
        },
        credentials: "include",
      }),
      providesTags: relevantListTags,
    }),

    getByIdFullDetails: builder.query<
      BaseResponse<Serialized<ManufacturingOrder>>,
      { id: string }
    >({
      query: (params) => ({
        url: `${MANUFACTURING_ORDER_URL}/find/full-details/${params.id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: relevantListTags,
    }),

    cancelManufacturingOrder: builder.mutation<
      CancelManufacturingOrderResponseDto,
      CancelManufacturingOrderRequestDto
    >({
      query: (params) => ({
        url: `${MANUFACTURING_ORDER_URL}/cancel/${params.id}`,
        method: "PATCH",
        credentials: "include",
      }),
      invalidatesTags: relevantListTags,
    }),
  }),
});

export const {
  useGetFullDetailManufacturingOrdersQuery,
  useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery,
  useCreateManyManufacturingOrdersMutation,
  useDeleteManufacturingOrderMutation,
  useUpdateManyManufacturingOrdersMutation,
  useGetAllManufacturingOrdersQuery,
  useGetAllByPaperTypesUsageQuery,
  useGetAllMOStatusesByDateRangeQuery,
  useGetAllMOProductionOutputByDateRangeQuery,
  useGetByIdFullDetailsQuery,
  useCancelManufacturingOrderMutation,
} = manufacturingOrderApiSlice;
