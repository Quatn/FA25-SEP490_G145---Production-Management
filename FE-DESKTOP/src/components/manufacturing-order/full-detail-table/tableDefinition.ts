import { CellContext, ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { ManufacturingOrder, OrderStatus } from "@/types/ManufacturingOrder";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";
import check from "check-types";
import type { ManufacturingTableTabType } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { manufacturingOrderTableCells } from "./tableCellNodes";
import { PrintColor } from "@/types/PrintColor";
import { WareFinishingProcessType } from "@/types/WareFinishingProcessType";
import { getDataTableColumnHelper } from "@/components/ui/data-table/utils/getDataTableColumnHelper";

export type ManufacturingOrderTableDataType = Serialized<ManufacturingOrder> & { isEdited: boolean }

const columnHelper = getDataTableColumnHelper<Serialized<ManufacturingOrder>>()

const orderStatusNameMap: Record<OrderStatus, string> = {
  NOTSTARTED: "Chưa bắt đầu",
  RUNNING: "Đang chạy",
  COMPLETED: "Đã hoàn thành",
  OVERCOMPLETED: "Đã hoàn thành",
  PAUSED: "Tạm dừng",
  CANCELLED: "Đã hủy",
}

const colSize = {
  sm: {
    minSize: 50,
    size: 75,
    maxSize: 100,
  },
  md: {
    minSize: 100,
    size: 150,
    maxSize: 200,
  },
  lg: {
    minSize: 200,
    size: 300,
    maxSize: 400,
  },
}

export const manufacturingOrderColumns: (ColumnDef<Serialized<ManufacturingOrder>>)[] = [
  columnHelper.defineDataTableDisplayColumn({
    id: "manufacturingDirective",
    header: "KH Giao",
    enablePinning: true,
    ...colSize.md,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "code",
    header: "Mã lệnh",
    enablePinning: true,
    ...colSize.sm,
    cell: (context: CellContext<ManufacturingOrderTableDataType, unknown>) => manufacturingOrderTableCells.highlight({
      context,
      value: context.row.original.code
    }),
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "customerCode",
    header: "Khách hàng",
    cell: (context: CellContext<ManufacturingOrderTableDataType, unknown>) => manufacturingOrderTableCells.highlight({
      context,
      value: context.row.original.purchaseOrderItem?.subPurchaseOrder?.purchaseOrder?.customer
        ?.code,
    }),

  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "wareCode",
    header: "Mã hàng",
    cell: (context: CellContext<ManufacturingOrderTableDataType, unknown>) => manufacturingOrderTableCells.highlight({
      context,
      value: context.row.original.purchaseOrderItem?.ware?.code
    }),

  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "overallStatus",
    header: "Trạng thái chạy",
    cell: ({ row }) => orderStatusNameMap[row.original.overallStatus],
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "fluteCombo",
    header: "Sóng",
    cell: ({ row }) => {
      const fc = row.original.purchaseOrderItem?.ware?.fluteCombination
      return check.string(fc) ? fc : fc?.code;
    }
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "wareManufacturingProcessType",
    header: "Kiểu gia công",
    cell: ({ row }) => {
      const fc = row.original.purchaseOrderItem?.ware?.wareManufacturingProcessType
      return check.string(fc) ? fc : fc?.name;
    }
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "wareWidth",
    header: "Dài / Khổ",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.wareWidth,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "wareLength",
    header: "Rộng",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.wareLength,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "wareHeight",
    header: "Cao",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.wareHeight,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "amount",
    header: "Số lượng",
    ...colSize.md,
    cell: (context: CellContext<ManufacturingOrderTableDataType, unknown>) => manufacturingOrderTableCells.amount({ context }),

  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "orderDate",
    header: "Ngày nhận",
    ...colSize.md,
    cell: ({ row }) =>
      formatDateToDDMMYYYY(
        row.original.purchaseOrderItem?.subPurchaseOrder?.purchaseOrder
          ?.orderDate,
      ),
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "deliveryDate",
    header: "Ngày giao",
    ...colSize.md,
    cell: ({ row }) =>
      formatDateToDDMMYYYY(
        row.original.purchaseOrderItem?.subPurchaseOrder?.deliveryDate,
      ),
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "purchaseOrderCode",
    header: "Đơn hàng",
    cell: (context: CellContext<ManufacturingOrderTableDataType, unknown>) => manufacturingOrderTableCells.highlight({
      context,
      value: context.row.original.purchaseOrderItem?.subPurchaseOrder?.purchaseOrder?.code
    }),

  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "blankWidth",
    header: "Khổ",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.blankWidth,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "blankLength",
    header: "Cắt dài",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.blankLength,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "flapLength",
    header: "Cánh",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.flapLength,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "warePerBlank",
    header: "Số SP",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.warePerBlank,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "numberOfBlanks",
    header: "Số tấm",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.numberOfBlanks,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "longitudinalCutCount",
    header: "Tấm chặt",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.longitudinalCutCount,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "runningLength",
    header: "Mét dài",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.runningLength,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "crossCutCount",
    header: "Part SX",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.crossCutCount,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "paperWidth",
    header: "Khổ giấy",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.paperWidth,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "margin",
    header: "Lề biên",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.margin,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "faceLayerPaperType",
    header: "Mặt SP",
    ...colSize.md,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.faceLayerPaperType,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "EFlutePaperType",
    header: "Sóng E",
    ...colSize.md,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.EFlutePaperType,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "EBLinerLayerPaperType",
    header: "Lớp giữa",
    ...colSize.md,
    cell: ({ row }) =>
      row.original.purchaseOrderItem?.ware?.EBLinerLayerPaperType,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "BFlutePaperType",
    header: "Sóng B",
    ...colSize.md,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.BFlutePaperType,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "BACLinerLayerPaperType",
    header: "Lớp giữa",
    ...colSize.md,
    cell: ({ row }) =>
      row.original.purchaseOrderItem?.ware?.BACLinerLayerPaperType,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "ACFlutePaperType",
    header: "Sóng A/C",
    ...colSize.md,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.ACFlutePaperType,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "backLayerPaperType",
    header: "Mặt trong",
    ...colSize.md,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.backLayerPaperType,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "purchaseOrderItemNote",
    header: "Ghi chú cố định",
    ...colSize.lg,
    cell: ({ row }) => row.original.purchaseOrderItem?.note,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "note",
    header: "Ghi chú tạm thời",
    ...colSize.lg,
    cell: (context: CellContext<ManufacturingOrderTableDataType, unknown>) => manufacturingOrderTableCells.note({ context }),
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "manufacturingDateAdjustment",
    header: "Ngày SX",
    cell: (context: CellContext<ManufacturingOrderTableDataType, unknown>) => manufacturingOrderTableCells.manufacturingDate({ context }),

  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "requestedDatetime",
    header: "Ngày và giờ cần",
    cell: (context: CellContext<ManufacturingOrderTableDataType, unknown>) => manufacturingOrderTableCells.requestedDatetime({ context }),

  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "corrugatorLineAdjustment",
    header: "Dàn",
    cell: (context: CellContext<ManufacturingOrderTableDataType, unknown>) => manufacturingOrderTableCells.corrugatorLine({ context }),
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "faceLayerPaperWeight",
    header: "Mặt SP",
    cell: ({ row }) => row.original.purchaseOrderItem?.faceLayerPaperWeight?.toFixed(4),
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "EFlutePaperWeight",
    header: "Sóng E",
    cell: ({ row }) => row.original.purchaseOrderItem?.EFlutePaperWeight?.toFixed(4),
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "EBLinerLayerPaperWeight",
    header: "Lớp giữa",
    cell: ({ row }) =>
      row.original.purchaseOrderItem?.EBLinerLayerPaperWeight?.toFixed(4),
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "BFlutePaperWeight",
    header: "Sóng B",
    cell: ({ row }) => row.original.purchaseOrderItem?.BFlutePaperWeight?.toFixed(4),
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "BACLinerLayerPaperWeight",
    header: "Lớp giữa",
    cell: ({ row }) =>
      row.original.purchaseOrderItem?.BACLinerLayerPaperWeight?.toFixed(4),
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "ACFlutePaperWeight",
    header: "Sóng A/C",
    cell: ({ row }) => row.original.purchaseOrderItem?.ACFlutePaperWeight?.toFixed(4),
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "backLayerPaperWeight",
    header: "Mặt trong",
    cell: ({ row }) => row.original.purchaseOrderItem?.backLayerPaperWeight?.toFixed(4),
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "totalVolume",
    header: "Khối",
    cell: ({ row }) => row.original.purchaseOrderItem?.totalVolume,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "totalWeight",
    header: "Tổng trọng lượng",
    cell: ({ row }) => row.original.purchaseOrderItem?.totalWeight.toFixed(4),
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "typeOfPrinter",
    header: "Máy In",
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.typeOfPrinter,
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "printColors",
    header: "Màu In",
    cell: ({ row }) => {
      const pcs = row.original.purchaseOrderItem?.ware?.printColors
      if (check.undefined(pcs)) return undefined
      return (check.array.of.string(pcs)) ? pcs.join(", ") : pcs?.map((c) => (c as Serialized<PrintColor>).code).join(", ")
    }

  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "processes",
    header: "Công đoạn gia công",
    cell: ({ row }) => {
      const fps = row.original.purchaseOrderItem?.ware?.finishingProcesses
      if (check.undefined(fps)) return undefined
      return (check.array.of.string(fps)) ? fps.join(", ") : fps?.map((p) => (p as Serialized<WareFinishingProcessType>).name).join(", ")
    }
  }),
  columnHelper.defineDataTableDisplayColumn({
    id: "actions-column",
    header: undefined,
    cell: () => undefined,
  }),
];

export const manufacturingOrderColumnsByTabs: Record<
  ManufacturingTableTabType,
  ReturnType<typeof columnHelper.display>[]
> = {
  all: manufacturingOrderColumns,

  order: manufacturingOrderColumns.filter((col) =>
    check.in(col.id, [
      "manufacturingDirective",
      "code",
      "customerCode",
      "wareCode",
      "fluteCombo",
      "wareWidth",
      "wareLength",
      "wareHeight",
      "amount",
      "actions-column",
    ])
  ),

  manufacture: manufacturingOrderColumns.filter((col) =>
    check.in(col.id, [
      "manufacturingDirective",
      "overallStatus",
      "code",
      "amount",
      "orderDate",
      "deliveryDate",
      "purchaseOrderCode",
      "wareManufacturingProcessType",
      "blankWidth",
      "blankLength",
      "flapLength",
      "warePerBlank",
      "numberOfBlanks",
      "longitudinalCutCount",
      "runningLength",
      "crossCutCount",
      "paperWidth",
      "margin",
      "actions-column",
    ])
  ),

  layers: manufacturingOrderColumns.filter((col) =>
    check.in(col.id, [
      "manufacturingDirective",
      "code",
      "faceLayerPaperType",
      "EFlutePaperType",
      "EBLinerLayerPaperType",
      "BFlutePaperType",
      "BACLinerLayerPaperType",
      "ACFlutePaperType",
      "backLayerPaperType",
      "actions-column",
    ])
  ),

  notes: manufacturingOrderColumns.filter((col) =>
    check.in(col.id, [
      "manufacturingDirective",
      "code",
      "purchaseOrderItemNote",
      "note",
      "manufacturingDateAdjustment",
      "requestedDatetime",
      "corrugatorLineAdjustment",
      "actions-column",
    ])
  ),

  weight: manufacturingOrderColumns.filter((col) =>
    check.in(col.id, [
      "manufacturingDirective",
      "code",
      "faceLayerPaperWeight",
      "EFlutePaperWeight",
      "EBLinerLayerPaperWeight",
      "BFlutePaperWeight",
      "BACLinerLayerPaperWeight",
      "ACFlutePaperWeight",
      "backLayerPaperWeight",
      "totalVolume",
      "totalWeight",
      "actions-column",
    ])
  ),

  processes: manufacturingOrderColumns.filter((col) =>
    check.in(col.id, [
      "manufacturingDirective",
      "code",
      "typeOfPrinter",
      "printColors",
      "processes",
      "actions-column",
    ])
  ),
};
