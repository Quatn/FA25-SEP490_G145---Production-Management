import { CellContext, ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { ManufacturingOrder, OrderStatus } from "@/types/ManufacturingOrder";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";
import check from "check-types";
import type { ManufacturingTableTabType } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { manufacturingOrderTableCells } from "./tableCellNodes";
import { PrintColor } from "@/types/PrintColor";
import { WareFinishingProcessType } from "@/types/WareFinishingProcessType";
import { getDataTableColumnHelper } from "@/components/ui/data-table/utils/getDataTableColumnHelper";
import { DataTableCellType } from "@/components/ui/data-table/Cell";
import { ManufacturingOrderDirectives } from "@/types/enums/ManufacturingOrderDirectives";
import { createListCollection } from "@chakra-ui/react";
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import { CorrugatorLine } from "@/types/enums/CorrugatorLine";
import ManufacturingOrderTableActionColumn from "./ActionColumn";

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

const manufacturingDirectives: { label: string, value: string }[] = [
  { label: "Hủy", value: ManufacturingOrderDirectives.Cancel },
  { label: "Tạm dừng", value: ManufacturingOrderDirectives.Pause },
  { label: "Bắt buộc", value: ManufacturingOrderDirectives.Mandatory },
  { label: "Bù lệnh", value: ManufacturingOrderDirectives.Compensate },
]

const manufacturingDirectivesCol = createListCollection({
  items: manufacturingDirectives,
})

const corrugatorLines: { label: string, value: string }[] = [
  { label: "Dàn 5", value: CorrugatorLine.L5 },
  { label: "Dàn 7", value: CorrugatorLine.L7 },
]

const corrugatorLinesCol = createListCollection({
  items: corrugatorLines,
})

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

const getPopulatedPoi = (mo: Serialized<ManufacturingOrder>) => {
  if (check.string(mo.purchaseOrderItem)) throw new UnpopulatedFieldError("mo.purchaseOrderItem must be populated")
  return mo.purchaseOrderItem
}

const getPopulatedSubPo = (mo: Serialized<ManufacturingOrder>) => {
  if (check.string(mo.purchaseOrderItem) || check.string(mo.purchaseOrderItem.subPurchaseOrder)
  ) throw new UnpopulatedFieldError("mo.purchaseOrderItem must be populated: purchaseOrderItem -> subPurchaseOrder");
  return mo.purchaseOrderItem.subPurchaseOrder
}

const getPopulatedPo = (mo: Serialized<ManufacturingOrder>) => {
  if (check.string(mo.purchaseOrderItem)
    || check.string(mo.purchaseOrderItem.subPurchaseOrder)
    || check.string(mo.purchaseOrderItem.subPurchaseOrder?.purchaseOrder)
  ) throw new UnpopulatedFieldError("mo.purchaseOrderItem must be populated: purchaseOrderItem -> subPurchaseOrder -> purchaseOrder");
  return mo.purchaseOrderItem.subPurchaseOrder?.purchaseOrder
}

const getPopulatedCustomer = (mo: Serialized<ManufacturingOrder>) => {
  if (check.string(mo.purchaseOrderItem)
    || check.string(mo.purchaseOrderItem.subPurchaseOrder)
    || check.string(mo.purchaseOrderItem.subPurchaseOrder?.purchaseOrder)
    || check.string(mo.purchaseOrderItem.subPurchaseOrder?.purchaseOrder?.customer)
  ) throw new UnpopulatedFieldError("mo.purchaseOrderItem must be populated: purchaseOrderItem -> subPurchaseOrder -> purchaseOrder -> customer");
  return mo.purchaseOrderItem.subPurchaseOrder?.purchaseOrder?.customer
}

const getPopulatedWare = (mo: Serialized<ManufacturingOrder>) => {
  if (check.string(mo.purchaseOrderItem)
    || check.string(mo.purchaseOrderItem.ware)
  ) throw new UnpopulatedFieldError("mo.purchaseOrderItem must be populated: purchaseOrderItem -> ware");
  return mo.purchaseOrderItem.ware
}

export const manufacturingOrderColumns: (ColumnDef<Serialized<ManufacturingOrder> & { isEdited: boolean }>)[] = [
  columnHelper.defineDataTableAccessorColumn({
    id: "manufacturingDirective",
    accessorKey: "manufacturingDirective",
    header: "KH Giao",
    enablePinning: true,
    cellType: DataTableCellType.Select,
    selectCollection: manufacturingDirectivesCol,
    ...colSize.md,
  }),
  columnHelper.defineDataTableAccessorColumn({
    id: "code",
    accessorKey: "code",
    header: "Mã lệnh",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),
  columnHelper.defineDataTableAccessorColumn({
    id: "customerCode",
    accessorFn: (mo) => {
      return getPopulatedCustomer(mo)?.code
    },
    header: "Khách hàng",
    enablePinning: true,
    cellType: DataTableCellType.Highlight,
    ...colSize.md,
  }),
  columnHelper.defineDataTableAccessorColumn({
    id: "wareCode",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.code
    },
    header: "Mã hàng",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),
  columnHelper.defineDataTableAccessorColumn({
    id: "overallStatus",
    accessorKey: "overallStatus",
    header: "Trạng thái chạy",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),
  columnHelper.defineDataTableAccessorColumn({
    id: "fluteCombination",
    accessorFn: (mo) => {
      const ware = getPopulatedWare(mo)
      if (check.string(ware?.fluteCombination)) throw new UnpopulatedFieldError("mo.purchaseOrderItem must be populated: purchaseOrderItem -> ware -> fluteCombination");
      return ware?.fluteCombination.code
    },
    header: "Sóng",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),
  columnHelper.defineDataTableAccessorColumn({
    id: "wareManufacturingProcessType",
    accessorFn: (mo) => {
      const ware = getPopulatedWare(mo)
      if (check.string(ware?.wareManufacturingProcessType)) throw new UnpopulatedFieldError("mo.purchaseOrderItem must be populated: purchaseOrderItem -> ware -> wareManufacturingProcessType");
      return ware?.wareManufacturingProcessType.name
    },
    header: "Kiểu gia công",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),
  columnHelper.defineDataTableAccessorColumn({
    id: "wareWidth",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.wareWidth
    },
    header: "Dài / Khổ",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),
  columnHelper.defineDataTableAccessorColumn({
    id: "wareLength",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.wareLength
    },
    header: "Rộng",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),
  columnHelper.defineDataTableAccessorColumn({
    id: "wareHeight",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.wareHeight
    },
    header: "Cao",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),
  columnHelper.defineDataTableAccessorColumn({
    id: "amount",
    accessorKey: "amount",
    header: "Số lượng",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),
  columnHelper.defineDataTableAccessorColumn({
    id: "orderDate",
    accessorFn: (mo) => {
      return getPopulatedPo(mo)?.orderDate
    },
    header: "Ngày nhận",
    enablePinning: true,
    cellType: DataTableCellType.Date,
    ...colSize.md,
  }),
  columnHelper.defineDataTableAccessorColumn({
    id: "deliveryDate",
    accessorFn: (mo) => {
      return getPopulatedSubPo(mo)?.deliveryDate
    },
    header: "Ngày giao",
    enablePinning: true,
    cellType: DataTableCellType.Date,
    ...colSize.md,
  }),
  columnHelper.defineDataTableAccessorColumn({
    id: "purchaseOrderCode",
    accessorFn: (mo) => {
      return getPopulatedPo(mo)?.code
    },
    header: "Đơn hàng",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "blankWidth",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.blankWidth
    },
    header: "Khổ",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),
  columnHelper.defineDataTableAccessorColumn({
    id: "blankLength",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.blankLength
    },
    header: "Cắt dài",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),
  columnHelper.defineDataTableAccessorColumn({
    id: "flapLength",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.flapLength
    },
    header: "Cánh",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),
  columnHelper.defineDataTableAccessorColumn({
    id: "warePerBlank",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.warePerBlank
    },
    header: "Số SP",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "numberOfBlanks",
    accessorFn: (mo) => {
      return getPopulatedPoi(mo)?.numberOfBlanks
    },
    header: "Số tấm",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "longitudinalCutCount",
    accessorFn: (mo) => {
      return getPopulatedPoi(mo)?.longitudinalCutCount
    },
    header: "Tấm chặt",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "runningLength",
    accessorFn: (mo) => {
      return getPopulatedPoi(mo)?.runningLength
    },
    header: "Mét dài",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "crossCutCount",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.crossCutCount
    },
    header: "Số SP",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "paperWidth",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.paperWidth
    },
    header: "Khổ giấy",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "margin",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.margin
    },
    header: "Lề biên",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "faceLayerPaperType",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.faceLayerPaperType
    },
    header: "Mặt SP",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "EFlutePaperType",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.EFlutePaperType
    },
    header: "Sóng E",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "EBLinerLayerPaperType",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.EBLinerLayerPaperType
    },
    header: "Lớp giữa",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "BFlutePaperType",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.BFlutePaperType
    },
    header: "Sóng B",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "BACLinerLayerPaperType",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.BACLinerLayerPaperType
    },
    header: "Lớp giữa",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "ACFlutePaperType",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.ACFlutePaperType
    },
    header: "Sóng A/C",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "backLayerPaperType",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.backLayerPaperType
    },
    header: "Mặt trong",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "purchaseOrderItemNote",
    accessorFn: (mo) => {
      return getPopulatedPoi(mo)?.note
    },
    header: "Ghi chú cố định",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "note",
    accessorKey: "note",
    header: "Ghi chú cố định",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "manufacturingDateAdjustment",
    accessorKey: "manufacturingDateAdjustment",
    header: "Ngày SX",
    enablePinning: true,
    cellType: DataTableCellType.Date,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "requestedDatetime",
    accessorKey: "requestedDatetime",
    header: "Ngày và giờ cần",
    enablePinning: true,
    cellType: DataTableCellType.Date,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "corrugatorLineAdjustment",
    accessorKey: "corrugatorLineAdjustment",
    header: "Dàn sóng",
    enablePinning: true,
    cellType: DataTableCellType.Select,
    selectCollection: corrugatorLinesCol,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "faceLayerPaperWeight",
    accessorKey: "faceLayerPaperWeight",
    header: "Mặt SP",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "EFlutePaperWeight",
    accessorKey: "EFlutePaperWeight",
    header: "Sóng E",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "EBLinerLayerPaperWeight",
    accessorKey: "EBLinerLayerPaperWeight",
    header: "Lớp giữa",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "BFlutePaperWeight",
    accessorKey: "BFlutePaperWeight",
    header: "Sóng B",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "BACLinerLayerPaperWeight",
    accessorKey: "BACLinerLayerPaperWeight",
    header: "Lớp giữa",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "ACFlutePaperWeight",
    accessorKey: "ACFlutePaperWeight",
    header: "Sóng A/C",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "backLayerPaperWeight",
    accessorKey: "backLayerPaperWeight",
    header: "Mặt trong",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "totalVolume",
    accessorKey: "totalVolume",
    header: "Khối",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "totalWeight",
    accessorKey: "totalWeight",
    header: "Tổng trọng lượng",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "typeOfPrinter",
    accessorKey: "typeOfPrinter",
    header: "Máy In",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "printColors",
    accessorFn: (mo) => {
      const printColors = getPopulatedWare(mo)?.printColors
      return check.array.of.string(printColors) ? printColors.join(", ") : printColors?.map((c) => (c as Serialized<PrintColor>).code).join(", ")
    },
    header: "Màu in",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "finishingProcesses",
    accessorFn: (mo) => {
      const finishingProcesses = getPopulatedWare(mo)?.finishingProcesses
      return check.array.of.string(finishingProcesses) ? finishingProcesses.join(", ") : finishingProcesses?.map((p) => (p as Serialized<WareFinishingProcessType>).name).join(", ")
    },
    header: "Công đoạn gia công",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableDisplayColumn({
    id: "actions-column",
    header: undefined,
    cell: ({ cell, table }) => ManufacturingOrderTableActionColumn({ rowId: cell.row.id, isEdited: cell.row.original.isEdited, mo: cell.row.original, meta: table.options.meta })
  }),
];

export const manufacturingOrderColumnsByTabs: Record<
  ManufacturingTableTabType,
  ColumnDef<Serialized<ManufacturingOrder> & { isEdited: boolean }>[]
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
