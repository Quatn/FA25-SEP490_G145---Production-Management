import { apiSlice } from "./apiSlice";
import { MANUFACTURING_ORDER_URL, USE_MOCK_DATA } from "../constants";
import { PaginatedList } from "@/types/DTO/Response";
import {
  ManufacturingOrderProcessDTO,
  ManufacturingOrderProcessStatus,
  ManufacturingOrderStatus,
  ManufacturingOrderTrackingDTO,
  CorrugatorProcessDTO,
  CorrugatorProcessStatus,
} from "@/types/DTO/ManufacturingOrderTracking";

type BaseResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type RawManufacturingOrder = {
  _id: string;
  id?: string;
  code: string;
  purchaseOrderItem?: any;
  overallStatus: ManufacturingOrderStatus;
  processes?: any[];
  corrugatorProcess?: any;
  manufacturingDate?: string;
  requestedDatetime?: string;
  corrugatorLine?: number;
  manufacturedAmount?: number;
  manufacturingDirective?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

type TrackingListApiResponse = {
  data: RawManufacturingOrder[];
  total: number;
  page: number;
  limit: number;
};

export type TrackingListQueryParams = {
  page?: number;
  limit?: number;
  searchCode?: string;
  corrugatorLine?: number;
  overallStatus?: string;
  corrugatorProcessStatus?: string;
  manufacturingDateFrom?: string;
  manufacturingDateTo?: string;
  requestedDateFrom?: string;
  requestedDateTo?: string;
  paperWidth?: number;
  customer?: string;
  fluteCombination?: string;
};

export type UpdateManufacturingOrderStatusPayload = {
  id: string;
  status: ManufacturingOrderStatus;
};

export type UpdateManufacturingOrderProcessPayload = {
  processId: string;
  status?: ManufacturingOrderProcessStatus;
  manufacturedAmount?: number;
  manufacturingOrderId?: string;
};

export type UpdateCorrugatorProcessPayload = {
  id: string;
  status?: CorrugatorProcessStatus;
  manufacturedAmount?: number;
  manufacturingOrderId?: string;
};

export type RunCorrugatorProcessesPayload = {
  moIds: string[];
};

export type UpdateManyCorrugatorProcessesPayload = {
  processIds: string[];
  status: "RUNNING" | "PAUSED" | "CANCELLED" | "COMPLETED";
};

const normalizeCorrugatorProcess = (
  corrugatorProcess: any
): CorrugatorProcessDTO | string | undefined => {
  if (!corrugatorProcess) {
    return undefined;
  }

  // If it's already a string (ObjectId), return it as is
  if (typeof corrugatorProcess === "string") {
    return corrugatorProcess;
  }

  // If it's an object, normalize it
  return {
    id: corrugatorProcess._id ?? corrugatorProcess.id,
    manufacturingOrder:
      typeof corrugatorProcess.manufacturingOrder === "string"
        ? corrugatorProcess.manufacturingOrder
        : corrugatorProcess.manufacturingOrder?._id ??
          corrugatorProcess.manufacturingOrder?.id,
    manufacturedAmount: corrugatorProcess.manufacturedAmount ?? 0,
    status: corrugatorProcess.status ?? "NOTSTARTED",
    note: corrugatorProcess.note,
    createdAt: corrugatorProcess.createdAt,
    updatedAt: corrugatorProcess.updatedAt,
  };
};

const normalizeManufacturingProcess = (
  process: any
): ManufacturingOrderProcessDTO => {
  if (!process) {
    return {
      id: "",
      manufacturingOrder: "",
      processNumber: 0,
      status: "NOTSTARTED",
      manufacturedAmount: 0,
    };
  }

  const normalizedDefinition = process.processDefinition
    ? {
        id: process.processDefinition._id ?? process.processDefinition.id,
        code: process.processDefinition.code,
        name: process.processDefinition.name,
        description: process.processDefinition.description,
        note: process.processDefinition.note,
        createdAt: process.processDefinition.createdAt,
        updatedAt: process.processDefinition.updatedAt,
      }
    : undefined;

  return {
    id: process._id ?? process.id ?? "",
    manufacturingOrder:
      typeof process.manufacturingOrder === "string"
        ? process.manufacturingOrder
        : process.manufacturingOrder?._id ??
          process.manufacturingOrder?.id ??
          "",
    processDefinition: normalizedDefinition,
    processNumber: process.processNumber,
    status: process.status,
    manufacturedAmount: process.manufacturedAmount,
    note: process.note,
    createdAt: process.createdAt,
    updatedAt: process.updatedAt,
  };
};

const normalizePurchaseOrderItem = (poItem: any) => {
  if (!poItem) {
    return undefined;
  }

  // Normalize fluteCombination: có thể là ObjectId string hoặc populated object
  const normalizedFluteCombination = poItem.ware?.fluteCombination
    ? typeof poItem.ware.fluteCombination === "object" &&
      poItem.ware.fluteCombination !== null
      ? {
          id: poItem.ware.fluteCombination._id ?? poItem.ware.fluteCombination.id,
          code: poItem.ware.fluteCombination.code,
          description: poItem.ware.fluteCombination.description,
          note: poItem.ware.fluteCombination.note,
          createdAt: poItem.ware.fluteCombination.createdAt,
          updatedAt: poItem.ware.fluteCombination.updatedAt,
        }
      : poItem.ware.fluteCombination // Nếu là string ObjectId, giữ nguyên
    : undefined;

  const normalizedWare = poItem.ware
    ? {
        id: poItem.ware._id ?? poItem.ware.id,
        code: poItem.ware.code,
        unitPrice: poItem.ware.unitPrice,
        fluteCombinationCode:
          typeof poItem.ware.fluteCombination === "object" &&
          poItem.ware.fluteCombination !== null
            ? poItem.ware.fluteCombination.code
            : poItem.ware.fluteCombinationCode, // Fallback nếu không có populated object
        fluteCombination: normalizedFluteCombination, // Thêm object fluteCombination
        wareWidth: poItem.ware.wareWidth,
        wareLength: poItem.ware.wareLength,
        wareHeight: poItem.ware.wareHeight,
        wareManufacturingProcessType: poItem.ware.wareManufacturingProcessType,
        manufacturingProcesses: Array.isArray(
          poItem.ware.manufacturingProcesses
        )
          ? poItem.ware.manufacturingProcesses.map((proc: any) => ({
              id: proc._id ?? proc.id,
              code: proc.code,
              name: proc.name,
              description: proc.description,
              note: proc.note,
              createdAt: proc.createdAt,
              updatedAt: proc.updatedAt,
            }))
          : undefined,
        paperWidth: poItem.ware.paperWidth,
        blankWidth: poItem.ware.blankWidth,
        blankLength: poItem.ware.blankLength,
        flapLength: poItem.ware.flapLength,
        margin: poItem.ware.margin,
        crossCutCount: poItem.ware.crossCutCount,
        faceLayerPaperType: poItem.ware.faceLayerPaperType,
        EFlutePaperType: poItem.ware.EFlutePaperType,
        BFlutePaperType: poItem.ware.BFlutePaperType,
        CFlutePaperType: poItem.ware.CFlutePaperType,
        BCFlutePaperType: poItem.ware.BCFlutePaperType,
        EBFlutePaperType: poItem.ware.EBFlutePaperType,
        printColors: poItem.ware.printColors,
        typeOfPrinter: poItem.ware.typeOfPrinter,
        note: poItem.ware.note,
        recalcFlag: poItem.ware.recalcFlag,
        createdAt: poItem.ware.createdAt,
        updatedAt: poItem.ware.updatedAt,
      }
    : undefined;

  return {
    id: poItem._id ?? poItem.id,
    subPurchaseOrderId: poItem.subPurchaseOrderId,
    amount: poItem.amount,
    longitudinalCutCount: poItem.longitudinalCutCount,
    runningLength: poItem.runningLength,
    ware: normalizedWare,
    numberOfBlanks: poItem.numberOfBlanks,
    totalVolume: poItem.totalVolume,
    totalWeight: poItem.totalWeight,
    status: poItem.status,
    note: poItem.note,
    recalcFlag: poItem.recalcFlag,
    createdAt: poItem.createdAt,
    updatedAt: poItem.updatedAt,
  };
};

const normalizeManufacturingOrder = (
  order: RawManufacturingOrder
): ManufacturingOrderTrackingDTO => ({
  id: order._id ?? order.id,
  code: order.code,
  purchaseOrderItem: normalizePurchaseOrderItem(order.purchaseOrderItem),
  overallStatus: order.overallStatus,
  processes: Array.isArray(order.processes)
    ? order.processes.map(normalizeManufacturingProcess)
    : undefined,
  corrugatorProcess: normalizeCorrugatorProcess(order.corrugatorProcess),
  manufacturingDate: order.manufacturingDate,
  requestedDatetime: order.requestedDatetime,
  corrugatorLine: order.corrugatorLine,
  manufacturedAmount: order.manufacturedAmount,
  manufacturingDirective: order.manufacturingDirective,
  note: order.note,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

// 🔥 CẬP NHẬT LOGIC toPaginatedList giống ProductList
const toPaginatedList = (
  response: BaseResponse<TrackingListApiResponse>
): PaginatedList<Serialized<ManufacturingOrderTrackingDTO>> => {
  const rawList = response.data?.data ?? [];
  const normalizedList = rawList.map(normalizeManufacturingOrder);

  const totalItems = response.data?.total ?? normalizedList.length;
  const page = response.data?.page ?? 1;
  const limit = response.data?.limit ?? 50;
  
  // Tính toán pagination info
  const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data: normalizedList as Serialized<ManufacturingOrderTrackingDTO>[],
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
};

const buildQueryParams = ({
  page = 1,
  limit = 10,
  searchCode,
  corrugatorLine,
  manufacturingDateFrom,
  manufacturingDateTo,
  requestedDateFrom,
  requestedDateTo,
  overallStatus,
  corrugatorProcessStatus,
  paperWidth,
  customer,
  fluteCombination,
}: TrackingListQueryParams) => {
  const params: Record<string, string | number> = { page, limit };

  // Chỉ thêm các params có giá trị
  if (searchCode?.trim()) {
    params.search_code = searchCode.trim();
  }
  if (corrugatorLine !== undefined && corrugatorLine !== null) {
    params.corrugatorLine = corrugatorLine;
  }
  if (manufacturingDateFrom?.trim()) {
    params.mfg_date_from = manufacturingDateFrom.trim();
  }
  if (manufacturingDateTo?.trim()) {
    params.mfg_date_to = manufacturingDateTo.trim();
  }
  if (requestedDateFrom?.trim()) {
    params.req_date_from = requestedDateFrom.trim();
  }
  if (requestedDateTo?.trim()) {
    params.req_date_to = requestedDateTo.trim();
  }
  if (overallStatus?.trim()) {
    params.overallStatus = overallStatus.trim();
  }
  if (corrugatorProcessStatus?.trim()) {
    params.corrugatorProcessStatus = corrugatorProcessStatus.trim();
  }
  if (paperWidth !== undefined && paperWidth !== null) {
    params.paperWidth = paperWidth;
  }
  if (customer?.trim()) {
    params.customer = customer.trim();
  }
  if (fluteCombination?.trim()) {
    params.fluteCombination = fluteCombination.trim();
  }

  return params;
};

const buildMockResponse = (): PaginatedList<
  Serialized<ManufacturingOrderTrackingDTO>
> => {
  const mockData: ManufacturingOrderTrackingDTO[] = [];

  return {
    data: mockData as Serialized<ManufacturingOrderTrackingDTO>[],
    page: 1,
    limit: mockData.length || 1,
    totalItems: mockData.length,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };
};

export const trackingManufacturingOrderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getManufacturingOrderTracking: builder.query<
      PaginatedList<Serialized<ManufacturingOrderTrackingDTO>>,
      TrackingListQueryParams | void
    >({
      ...(USE_MOCK_DATA
        ? {
            queryFn: async () => ({
              data: buildMockResponse(),
            }),
          }
        : {
            query: (params: TrackingListQueryParams = {}) => ({
              url: `${MANUFACTURING_ORDER_URL}/tracking-list`,
              method: "GET",
              params: buildQueryParams(params),
              credentials: "include",
            }),
            transformResponse: toPaginatedList,
          }),
      providesTags: (result) => {
        if (!result) {
          return [{ type: "ManufacturingOrderTracking" as const, id: "LIST" }];
        }

        const tags: {
          type:
            | "ManufacturingOrderTracking"
            | "ManufacturingOrderProcess"
            | "CorrugatorProcess";
          id: string;
        }[] = [{ type: "ManufacturingOrderTracking", id: "LIST" }];

        result.data.forEach((order) => {
          if (order.id) {
            tags.push({ type: "ManufacturingOrderTracking", id: order.id });
          }
          order.processes?.forEach((process) => {
            if (process.id) {
              tags.push({ type: "ManufacturingOrderProcess", id: process.id });
            }
          });
          // Add corrugator process tags
          if (order.corrugatorProcess) {
            const cpId =
              typeof order.corrugatorProcess === "string"
                ? order.corrugatorProcess
                : order.corrugatorProcess.id;
            if (cpId) {
              tags.push({ type: "CorrugatorProcess", id: cpId });
            }
          }
        });

        return tags;
      },
    }),

    updateManufacturingOrderStatus: builder.mutation<
      Serialized<ManufacturingOrderTrackingDTO>,
      UpdateManufacturingOrderStatusPayload
    >({
      query: ({ id, status }) => ({
        url: `${MANUFACTURING_ORDER_URL}/${id}/status`,
        method: "PATCH",
        body: { status },
        credentials: "include",
      }),
      transformResponse: (response: BaseResponse<RawManufacturingOrder>) =>
        normalizeManufacturingOrder(
          response.data
        ) as Serialized<ManufacturingOrderTrackingDTO>,
      invalidatesTags: (_, error, { id }) =>
        error
          ? []
          : [
              { type: "ManufacturingOrderTracking", id },
              { type: "ManufacturingOrderTracking", id: "LIST" },
            ],
    }),

    updateManufacturingOrderProcess: builder.mutation<
      Serialized<ManufacturingOrderProcessDTO>,
      UpdateManufacturingOrderProcessPayload
    >({
      query: ({ processId, status, manufacturedAmount }) => ({
        url: `/manufacturing-order-process/${processId}`,
        method: "PATCH",
        body: {
          ...(status ? { status } : {}),
          ...(manufacturedAmount !== undefined ? { manufacturedAmount } : {}),
        },
        credentials: "include",
      }),
      transformResponse: (response: BaseResponse<any>) =>
        normalizeManufacturingProcess(
          response.data
        ) as Serialized<ManufacturingOrderProcessDTO>,
      invalidatesTags: (_, error, { processId, manufacturingOrderId }) => {
        if (error) {
          return [];
        }

        const tags: {
          type: "ManufacturingOrderTracking" | "ManufacturingOrderProcess";
          id: string;
        }[] = [{ type: "ManufacturingOrderProcess", id: processId }];

        if (manufacturingOrderId) {
          tags.push({
            type: "ManufacturingOrderTracking",
            id: manufacturingOrderId,
          });
        }

        tags.push({ type: "ManufacturingOrderTracking", id: "LIST" });

        return tags;
      },
    }),

    updateCorrugatorProcess: builder.mutation<
      Serialized<CorrugatorProcessDTO>,
      UpdateCorrugatorProcessPayload
    >({
      query: ({ id, status, manufacturedAmount }) => ({
        url: `/corrugator-process/${id}`,
        method: "PATCH",
        body: {
          ...(status ? { status } : {}),
          ...(manufacturedAmount !== undefined ? { manufacturedAmount } : {}),
        },
        credentials: "include",
      }),
      transformResponse: (response: BaseResponse<any>) => {
        const normalized = normalizeCorrugatorProcess(response.data);
        if (typeof normalized === "string") {
          // If it's just an ID, we need to return a minimal object
          return {
            id: normalized,
            manufacturingOrder: "",
            manufacturedAmount: 0,
            status: "NOTSTARTED" as CorrugatorProcessStatus,
          } as Serialized<CorrugatorProcessDTO>;
        }
        return normalized as Serialized<CorrugatorProcessDTO>;
      },
      invalidatesTags: (_, error, { id, manufacturingOrderId }) => {
        if (error) {
          return [];
        }

        const tags: {
          type: "ManufacturingOrderTracking" | "CorrugatorProcess";
          id: string;
        }[] = [{ type: "CorrugatorProcess", id }];

        if (manufacturingOrderId) {
          tags.push({
            type: "ManufacturingOrderTracking",
            id: manufacturingOrderId,
          });
        }

        tags.push({ type: "ManufacturingOrderTracking", id: "LIST" });

        return tags;
      },
    }),

    runCorrugatorProcesses: builder.mutation<
      { modifiedCount: number },
      RunCorrugatorProcessesPayload
    >({
      query: ({ moIds }) => ({
        url: `/corrugator-process/run`,
        method: "PATCH",
        body: { moIds },
        credentials: "include",
      }),
      transformResponse: (response: BaseResponse<{ modifiedCount: number }>) =>
        response.data,
      invalidatesTags: (_, error, { moIds }) => {
        if (error) {
          return [];
        }

        const tags: Array<{
          type: "ManufacturingOrderTracking" | "CorrugatorProcess";
          id: string;
        }> = [];

        // Invalidate all affected manufacturing orders
        moIds.forEach((moId) => {
          tags.push({ type: "ManufacturingOrderTracking", id: moId });
        });

        tags.push({ type: "ManufacturingOrderTracking", id: "LIST" });

        return tags;
      },
    }),

    updateManyCorrugatorProcesses: builder.mutation<
      { successCount: number; failedCount: number; errors: string[] },
      UpdateManyCorrugatorProcessesPayload
    >({
      query: ({ processIds, status }) => ({
        url: `/corrugator-process/update-many`,
        method: "PATCH",
        body: { processIds, status },
        credentials: "include",
      }),
      transformResponse: (response: BaseResponse<{
        successCount: number;
        failedCount: number;
        errors: string[];
      }>) => response.data,
      invalidatesTags: (_, error) => {
        if (error) {
          return [];
        }
        return [{ type: "ManufacturingOrderTracking", id: "LIST" }];
      },
    }),
  }),
});

export const {
  useGetManufacturingOrderTrackingQuery,
  useLazyGetManufacturingOrderTrackingQuery,
  useUpdateManufacturingOrderStatusMutation,
  useUpdateManufacturingOrderProcessMutation,
  useUpdateCorrugatorProcessMutation,
  useRunCorrugatorProcessesMutation,
  useUpdateManyCorrugatorProcessesMutation,
} = trackingManufacturingOrderApiSlice;