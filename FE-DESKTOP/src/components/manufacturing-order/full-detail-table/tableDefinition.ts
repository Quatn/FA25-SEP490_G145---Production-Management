import { CellContext, createColumnHelper } from "@tanstack/react-table";
import type { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";
import check from "check-types";
import type { ManufacturingTableTabType } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { useEffect, useState } from "react";
import { manufacturingOrderTableCells } from "./tableCellNodes";

const columnHelper = createColumnHelper<Serialized<ManufacturingOrder>>();

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

export const manufacturingOrderColumns = [
  columnHelper.display({
    id: "manufacturingDirective",
    header: "KH Giao",
    enablePinning: true,
    ...colSize.md,
    cell: (context: CellContext<Serialized<ManufacturingOrder>, unknown>) => manufacturingOrderTableCells.manufacturingDirective({ context }),
  }),
  columnHelper.display({
    id: "code",
    header: "Mã lệnh",
    enablePinning: true,
    ...colSize.sm,
    cell: ({ row }) =>
      row.original.code,
  }),
  columnHelper.display({
    id: "customerCode",
    header: "Khách hàng",
    cell: ({ row }) =>
      row.original.purchaseOrderItem?.subPurchaseOrder?.purchaseOrder?.customer
        ?.code,
  }),
  columnHelper.display({
    id: "wareCode",
    header: "Mã hàng",
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.code,
  }),
  columnHelper.display({
    id: "fluteCombo",
    header: "Sóng",
    cell: ({ row }) =>
      row.original.purchaseOrderItem?.ware?.fluteCombination?.code,
  }),
  columnHelper.display({
    id: "wareWidth",
    header: "Dài / Khổ",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.wareWidth,
  }),
  columnHelper.display({
    id: "wareLength",
    header: "Rộng",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.wareLength,
  }),
  columnHelper.display({
    id: "wareHeight",
    header: "Cao",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.wareHeight,
  }),
  columnHelper.display({
    id: "amount",
    header: "Số lượng",
    ...colSize.md,
    cell: (context: CellContext<Serialized<ManufacturingOrder>, unknown>) => manufacturingOrderTableCells.amount({ context }),

  }),
  columnHelper.display({
    id: "orderDate",
    header: "Ngày nhận",
    ...colSize.md,
    cell: ({ row }) =>
      formatDateToDDMMYYYY(
        row.original.purchaseOrderItem?.subPurchaseOrder?.purchaseOrder
          ?.orderDate,
      ),
  }),
  columnHelper.display({
    id: "deliveryDate",
    header: "Ngày giao",
    ...colSize.md,
    cell: ({ row }) =>
      formatDateToDDMMYYYY(
        row.original.purchaseOrderItem?.subPurchaseOrder?.deliveryDate,
      ),
  }),
  columnHelper.display({
    id: "purchaseOrderCode",
    header: "Đơn hàng",
    cell: ({ row }) =>
      row.original.purchaseOrderItem?.subPurchaseOrder?.purchaseOrder?.code,
  }),
  columnHelper.display({
    id: "blankWidth",
    header: "Khổ",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.blankWidth,
  }),
  columnHelper.display({
    id: "blankLength",
    header: "Cắt dài",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.blankLength,
  }),
  columnHelper.display({
    id: "flapLength",
    header: "Cánh",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.flapLength,
  }),
  columnHelper.display({
    id: "warePerBlank",
    header: "Số SP",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.warePerBlank,
  }),
  columnHelper.display({
    id: "numberOfBlanks",
    header: "Số tấm",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.numberOfBlanks,
  }),
  columnHelper.display({
    id: "longitudinalCutCount",
    header: "Tấm chặt",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.longitudinalCutCount,
  }),
  columnHelper.display({
    id: "runningLength",
    header: "Mét dài",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.runningLength,
  }),
  columnHelper.display({
    id: "crossCutCount",
    header: "Part SX",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.crossCutCount,
  }),
  columnHelper.display({
    id: "paperWidth",
    header: "Khổ giấy",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.paperWidth,
  }),
  columnHelper.display({
    id: "margin",
    header: "Lề biên",
    ...colSize.sm,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.margin,
  }),
  columnHelper.display({
    id: "faceLayerPaperType",
    header: "Mặt SP",
    ...colSize.md,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.faceLayerPaperType,
  }),
  columnHelper.display({
    id: "EFlutePaperType",
    header: "Sóng E",
    ...colSize.md,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.EFlutePaperType,
  }),
  columnHelper.display({
    id: "EBLinerLayerPaperType",
    header: "Lớp giữa",
    ...colSize.md,
    cell: ({ row }) =>
      row.original.purchaseOrderItem?.ware?.EBLinerLayerPaperType,
  }),
  columnHelper.display({
    id: "BFlutePaperType",
    header: "Sóng B",
    ...colSize.md,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.BFlutePaperType,
  }),
  columnHelper.display({
    id: "BACLinerLayerPaperType",
    header: "Lớp giữa",
    ...colSize.md,
    cell: ({ row }) =>
      row.original.purchaseOrderItem?.ware?.BACLinerLayerPaperType,
  }),
  columnHelper.display({
    id: "ACFlutePaperType",
    header: "Sóng A/C",
    ...colSize.md,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.ACFlutePaperType,
  }),
  columnHelper.display({
    id: "backLayerPaperType",
    header: "Mặt trong",
    ...colSize.md,
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.backLayerPaperType,
  }),
  columnHelper.display({
    id: "purchaseOrderItemNote",
    header: "Ghi chú cố định",
    ...colSize.lg,
    cell: ({ row }) => row.original.purchaseOrderItem?.note,
  }),
  columnHelper.display({
    id: "note",
    header: "Ghi chú tạm thời",
    ...colSize.lg,
    cell: (context: CellContext<Serialized<ManufacturingOrder>, unknown>) => manufacturingOrderTableCells.note({ context }),
  }),
  columnHelper.display({
    id: "manufacturingDateAdjustment",
    header: "Ngày SX",
    cell: (context: CellContext<Serialized<ManufacturingOrder>, unknown>) => manufacturingOrderTableCells.manufacturingDate({ context }),

  }),
  columnHelper.display({
    id: "requestedDatetime",
    header: "Ngày và giờ cần",
    cell: (context: CellContext<Serialized<ManufacturingOrder>, unknown>) => manufacturingOrderTableCells.requestedDatetime({ context }),

  }),
  columnHelper.display({
    id: "corrugatorLineAdjustment",
    header: "Dàn",
    cell: (context: CellContext<Serialized<ManufacturingOrder>, unknown>) => manufacturingOrderTableCells.corrugatorLine({ context }),
  }),
  columnHelper.display({
    id: "faceLayerPaperWeight",
    header: "Mặt SP",
    cell: ({ row }) => row.original.purchaseOrderItem?.faceLayerPaperWeight,
  }),
  columnHelper.display({
    id: "EFlutePaperWeight",
    header: "Sóng E",
    cell: ({ row }) => row.original.purchaseOrderItem?.EFlutePaperWeight,
  }),
  columnHelper.display({
    id: "EBLinerLayerPaperWeight",
    header: "Lớp giữa",
    cell: ({ row }) =>
      row.original.purchaseOrderItem?.EBLinerLayerPaperWeight,
  }),
  columnHelper.display({
    id: "BFlutePaperWeight",
    header: "Sóng B",
    cell: ({ row }) => row.original.purchaseOrderItem?.BFlutePaperWeight,
  }),
  columnHelper.display({
    id: "BACLinerLayerPaperWeight",
    header: "Lớp giữa",
    cell: ({ row }) =>
      row.original.purchaseOrderItem?.BACLinerLayerPaperWeight,
  }),
  columnHelper.display({
    id: "ACFlutePaperWeight",
    header: "Sóng A/C",
    cell: ({ row }) => row.original.purchaseOrderItem?.ACFlutePaperWeight,
  }),
  columnHelper.display({
    id: "backLayerPaperWeight",
    header: "Mặt trong",
    cell: ({ row }) => row.original.purchaseOrderItem?.backLayerPaperWeight,
  }),
  columnHelper.display({
    id: "totalVolume",
    header: "Khối",
    cell: ({ row }) => row.original.purchaseOrderItem?.totalVolume,
  }),
  columnHelper.display({
    id: "totalWeight",
    header: "Tổng trọng lượng",
    cell: ({ row }) => row.original.purchaseOrderItem?.totalWeight,
  }),
  columnHelper.display({
    id: "typeOfPrinter",
    header: "Máy In",
    cell: ({ row }) => row.original.purchaseOrderItem?.ware?.typeOfPrinter,
  }),
  columnHelper.display({
    id: "printColors",
    header: "Màu In",
    cell: ({ row }) =>
      row.original.purchaseOrderItem?.ware?.printColors
        ?.map((c) => c.code)
        .join(", "),
  }),
  columnHelper.display({
    id: "processes",
    header: "Công đoạn gia công",
    cell: ({ row }) =>
      row.original.purchaseOrderItem?.ware?.finishingProcesses
        ?.map((c) => c.name)
        .join(", "),
  }),
  columnHelper.display({
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
      "code",
      "orderDate",
      "deliveryDate",
      "purchaseOrderCode",
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
