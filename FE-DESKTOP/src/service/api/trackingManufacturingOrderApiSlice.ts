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
  corrugatorProcess?: any; // Đây giờ là một object lồng
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

// --- SỬA ĐỔI ---
export type UpdateCorrugatorProcessPayload = {
  moId: string; // <-- Đổi tên từ 'id' sang 'moId' cho rõ ràng
  status?: CorrugatorProcessStatus;
  manufacturedAmount?: number;
};

export type RunCorrugatorProcessesPayload = {
  moIds: string[];
};

// --- SỬA ĐỔI ---
export type UpdateManyCorrugatorProcessesPayload = {
  moIds: string[]; // <-- Đổi tên từ 'processIds' sang 'moIds'
  status: "RUNNING" | "PAUSED" | "CANCELLED" | "COMPLETED";
};

// --- SỬA ĐỔI ---
// Logic normalize cho object lồng (embedded object)
const normalizeCorrugatorProcess = (
  corrugatorProcess: any
): CorrugatorProcessDTO | undefined => {
  if (!corrugatorProcess) {
    return undefined;
  }


  return {
    manufacturedAmount: corrugatorProcess.manufacturedAmount ?? 0,
    status: corrugatorProcess.status ?? "NOTSTARTED",
    note: corrugatorProcess.note ?? "",
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
  // ... (Giữ nguyên logic này)
  if (!poItem) {
    return undefined;
  }

  // Normalize fluteCombination: có thể là ObjectId string hoặc populated object
  const normalizedFluteCombination = poItem.ware?.fluteCombination
    ? typeof poItem.ware.fluteCombination === "object" &&
      poItem.ware.fluteCombination !== null
      ? {
          id:
            poItem.ware.fluteCombination._id ??
            poItem.ware.fluteCombination.id,
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
    subPurchaseOrder: poItem.subPurchaseOrder,
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
  corrugatorProcess: normalizeCorrugatorProcess(order.corrugatorProcess), // <-- Đã cập nhật
  manufacturingDate: order.manufacturingDate,
  requestedDatetime: order.requestedDatetime,
  corrugatorLine: order.corrugatorLine,
  manufacturedAmount: order.manufacturedAmount,
  manufacturingDirective: order.manufacturingDirective,
  note: order.note,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

// ... (toPaginatedList, buildQueryParams, buildMockResponse giữ nguyên) ...
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
              url: `${MANUFACTURING_ORDER_URL}/tracking-list`, // <-- URL này đã đúng
              method: "GET",
              params: buildQueryParams(params),
              credentials: "include",
            }),
            transformResponse: toPaginatedList,
          }),
      providesTags: (result) => {
        // ... (Giữ nguyên logic providesTags,
        // NHƯNG XÓA BỎ tag 'CorrugatorProcess')
        if (!result) {
          return [{ type: "ManufacturingOrderTracking" as const, id: "LIST" }];
        }

        const tags: {
          type: "ManufacturingOrderTracking" | "ManufacturingOrderProcess";
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
          // Xóa bỏ tag CorrugatorProcess
        });

        return tags;
      },
    }),

    updateManufacturingOrderStatus: builder.mutation<
      Serialized<ManufacturingOrderTrackingDTO>,
      UpdateManufacturingOrderStatusPayload
    >({
      // ... (Giữ nguyên)
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
      // ... (Giữ nguyên)
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

    // --- SỬA ĐỔI ---
    updateCorrugatorProcess: builder.mutation<
      Serialized<ManufacturingOrderTrackingDTO>, // <-- Trả về MO đã được normalize
      UpdateCorrugatorProcessPayload
    >({
      query: ({ moId, status, manufacturedAmount }) => ({
        // URL mới, dùng moId
        url: `${MANUFACTURING_ORDER_URL}/${moId}/corrugator-process`,
        method: "PATCH",
        body: {
          ...(status ? { status } : {}),
          ...(manufacturedAmount !== undefined ? { manufacturedAmount } : {}),
        },
        credentials: "include",
      }),
      // Backend trả về toàn bộ MO
      transformResponse: (response: BaseResponse<RawManufacturingOrder>) => {
        return normalizeManufacturingOrder(
          response.data
        ) as Serialized<ManufacturingOrderTrackingDTO>;
      },
      // Invalidate MO cha
      invalidatesTags: (_, error, { moId }) => {
        if (error) {
          return [];
        }

        const tags: {
          type: "ManufacturingOrderTracking";
          id: string;
        }[] = [{ type: "ManufacturingOrderTracking", id: moId }];

        tags.push({ type: "ManufacturingOrderTracking", id: "LIST" });

        return tags;
      },
    }),

    // --- SỬA ĐỔI ---
    runCorrugatorProcesses: builder.mutation<
      { modifiedCount: number },
      RunCorrugatorProcessesPayload
    >({
      query: ({ moIds }) => ({
        url: `${MANUFACTURING_ORDER_URL}/run-corrugator`, // <-- URL mới
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

        // Xóa tag 'CorrugatorProcess'
        const tags: Array<{
          type: "ManufacturingOrderTracking";
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

    // --- SỬA ĐỔI ---
    updateManyCorrugatorProcesses: builder.mutation<
      { successCount: number; failedCount: number; errors: string[] },
      UpdateManyCorrugatorProcessesPayload
    >({
      query: ({ moIds, status }) => ({
        url: `${MANUFACTURING_ORDER_URL}/update-many-corrugator`, // <-- URL mới
        method: "PATCH",
        body: { moIds, status }, // <-- body mới
        credentials: "include",
      }),
      transformResponse: (
        response: BaseResponse<{
          successCount: number;
          failedCount: number;
          errors: string[];
        }>
      ) => response.data,
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
  useUpdateCorrugatorProcessMutation, // <-- Tên hook không đổi
  useRunCorrugatorProcessesMutation, // <-- Tên hook không đổi
  useUpdateManyCorrugatorProcessesMutation, // <-- Tên hook không đổi
} = trackingManufacturingOrderApiSlice;