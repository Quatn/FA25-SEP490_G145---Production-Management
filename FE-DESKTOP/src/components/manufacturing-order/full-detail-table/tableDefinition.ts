import { ColumnDef } from "@tanstack/react-table";
import type { ManufacturingOrder } from "@/types/ManufacturingOrder";
import check from "check-types";
import type { ManufacturingTableTabType } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { PrintColor } from "@/types/PrintColor";
import { WareFinishingProcessType } from "@/types/WareFinishingProcessType";
import { getDataTableColumnHelper } from "@/components/ui/data-table/utils/getDataTableColumnHelper";
import { DataTableCellType } from "@/components/ui/data-table/Cell";
import { ManufacturingOrderDirectives } from "@/types/enums/ManufacturingOrderDirectives";
import { createListCollection } from "@chakra-ui/react";
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import { CorrugatorLine } from "@/types/enums/CorrugatorLine";
import ManufacturingOrderTableActionColumn from "./ActionColumn";
import { OrderFinishingProcess } from "@/types/OrderFinishingProcess";
import { manufacturingOrderComponentUtils as utils } from "../utils"

const { getPopulatedPoi, getPopulatedCustomer, getPopulatedPo, getPopulatedWare, getPopulatedSubPo, getOrderStatus, OrderStatusNameMap } = utils

export type ManufacturingOrderTableDataType = Serialized<ManufacturingOrder> & { finishingProcesses: Serialized<OrderFinishingProcess>[], isEdited: boolean }

const columnHelper = getDataTableColumnHelper<Serialized<ManufacturingOrder> & { finishingProcesses: Serialized<OrderFinishingProcess>[] }>()

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

export const manufacturingOrderMergedHeaders = [
  ["manufacturingDirective", "1_manufacturingDirective_manufacturingDirective"],
  ["code", "1_code_code"],
  ["customerCode", "1_customerCode_customerCode"],
  ["wareCode", "1_wareCode_wareCode"],
  ["orderStatusDisplay", "1_orderStatusDisplay_orderStatusDisplay"],
  ["fluteCombination", "1_fluteCombination_fluteCombination"],
  ["wareManufacturingProcessType", "1_wareManufacturingProcessType_wareManufacturingProcessType"],
  ["amount", "1_amount_amount"],
  ["purchaseOrderCode", "1_purchaseOrderCode_purchaseOrderCode"],
  ["wareNote", "1_wareNote_wareNote"],
  ["note", "1_note_note"],
  ["manufacturingDateAdjustment", "1_manufacturingDateAdjustment_manufacturingDateAdjustment"],
  ["requestedDatetime", "1_requestedDatetime_requestedDatetime"],
  ["corrugatorLineAdjustment", "1_corrugatorLineAdjustment_corrugatorLineAdjustment"],
  ["typeOfPrinter", "1_typeOfPrinter_typeOfPrinter"],
  ["printColors", "1_printColors_printColors"],
  ["finishingProcesses", "1_finishingProcesses_finishingProcesses"],
  ["actions-column", "1_actions-column_actions-column"],
]

export const manufacturingOrderColumns: (ColumnDef<ManufacturingOrderTableDataType>)[] = [
  columnHelper.defineDataTableAccessorColumn({
    id: "manufacturingDirective",
    accessorKey: "manufacturingDirective",
    header: "Kế hoạch giao",
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
    cellType: DataTableCellType.Highlight,
    ...colSize.sm,
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
    cellType: DataTableCellType.Highlight,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "orderStatusDisplay",
    accessorFn: (mo) => {
      const orderStatus = getOrderStatus(mo, mo.finishingProcesses)
      return orderStatus ? OrderStatusNameMap[orderStatus] : ""
    },
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
    cellType: DataTableCellType.Highlight,
    ...colSize.sm,
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
    ...colSize.sm,
  }),

  columnHelper.defineHeaderGroup({
    id: "wareSize",
    header: () => "Kích thước sản phẩm",
    columns: [
      columnHelper.defineDataTableAccessorColumn({
        id: "wareWidth",
        accessorFn: (mo) => {
          return getPopulatedWare(mo)?.wareWidth
        },
        header: "Dài / Khổ",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),
      columnHelper.defineDataTableAccessorColumn({
        id: "wareLength",
        accessorFn: (mo) => {
          return getPopulatedWare(mo)?.wareLength
        },
        header: "Rộng",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),
      columnHelper.defineDataTableAccessorColumn({
        id: "wareHeight",
        accessorFn: (mo) => {
          return getPopulatedWare(mo)?.wareHeight
        },
        header: "Cao",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),
    ],
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "amount",
    accessorKey: "amount",
    header: "Số lượng",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.sm,
  }),

  columnHelper.defineHeaderGroup({
    id: "orderDates",
    header: () => "Ngày",
    columns: [
      columnHelper.defineDataTableAccessorColumn({
        id: "orderDate",
        accessorFn: (mo) => {
          return getPopulatedPo(mo)?.orderDate
        },
        header: "Nhận đơn",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),
      columnHelper.defineDataTableAccessorColumn({
        id: "deliveryDate",
        accessorFn: (mo) => {
          return getPopulatedSubPo(mo)?.deliveryDate
        },
        header: "Giao đơn",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),
    ]
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "purchaseOrderCode",
    accessorFn: (mo) => {
      return getPopulatedPo(mo)?.code
    },
    header: "Đơn hàng",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.sm,
  }),

  columnHelper.defineHeaderGroup({
    id: "blankSize",
    header: () => "Kích thước gia công",
    size: 500,
    columns: [
      columnHelper.defineDataTableAccessorColumn({
        id: "blankWidth",
        accessorFn: (mo) => {
          return getPopulatedWare(mo)?.blankWidth
        },
        header: "Khổ",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),
      columnHelper.defineDataTableAccessorColumn({
        id: "blankLength",
        accessorFn: (mo) => {
          return getPopulatedWare(mo)?.blankLength
        },
        header: "Cắt dài",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),
      columnHelper.defineDataTableAccessorColumn({
        id: "flapLength",
        accessorFn: (mo) => {
          return getPopulatedWare(mo)?.flapLength
        },
        header: "Cánh",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),
    ]
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "warePerBlank",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.warePerBlank
    },
    header: "Số SP",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.sm,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "numberOfBlanks",
    accessorFn: (mo) => {
      return getPopulatedPoi(mo)?.numberOfBlanks
    },
    header: "Số tấm",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.sm,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "longitudinalCutCount",
    accessorFn: (mo) => {
      return getPopulatedPoi(mo)?.longitudinalCutCount
    },
    header: "Tấm chặt",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.sm,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "runningLength",
    accessorFn: (mo) => {
      return getPopulatedPoi(mo)?.runningLength
    },
    header: "Mét dài",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.sm,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "crossCutCount",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.crossCutCount
    },
    header: "Số SP",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.sm,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "paperWidth",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.paperWidth
    },
    header: "Khổ giấy",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.sm,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "margin",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.margin
    },
    header: "Lề biên",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.sm,
  }),

  columnHelper.defineHeaderGroup({
    id: "paperTypes",
    header: () => "Loại giấy",
    size: 700,
    columns: [
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
    ]
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "wareNote",
    accessorFn: (mo) => {
      return getPopulatedWare(mo)?.note
    },
    header: "Ghi chú cố định",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "note",
    accessorKey: "note",
    header: "Ghi chú tạm thời",
    enablePinning: true,
    cellType: DataTableCellType.Text,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "manufacturingDateAdjustment",
    accessorFn: (mo) => {
      return check.assigned(mo.manufacturingDateAdjustment) ? mo.manufacturingDateAdjustment : mo.manufacturingDate
    },
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
    accessorFn: (mo) => {
      return check.assigned(mo.corrugatorLineAdjustment) ? mo.corrugatorLineAdjustment : mo.corrugatorLine
    },
    header: "Dàn sóng",
    enablePinning: true,
    cellType: DataTableCellType.Select,
    selectCollection: corrugatorLinesCol,
    ...colSize.md,
  }),

  columnHelper.defineHeaderGroup({
    id: "paperWeights",
    header: () => "Trọng lượng",
    size: 500,
    columns: [
      columnHelper.defineDataTableAccessorColumn({
        id: "faceLayerPaperWeight",
        accessorKey: "faceLayerPaperWeight",
        header: "Mặt SP",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),

      columnHelper.defineDataTableAccessorColumn({
        id: "EFlutePaperWeight",
        accessorKey: "EFlutePaperWeight",
        header: "Sóng E",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),

      columnHelper.defineDataTableAccessorColumn({
        id: "EBLinerLayerPaperWeight",
        accessorKey: "EBLinerLayerPaperWeight",
        header: "Lớp giữa",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),

      columnHelper.defineDataTableAccessorColumn({
        id: "BFlutePaperWeight",
        accessorKey: "BFlutePaperWeight",
        header: "Sóng B",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),

      columnHelper.defineDataTableAccessorColumn({
        id: "BACLinerLayerPaperWeight",
        accessorKey: "BACLinerLayerPaperWeight",
        header: "Lớp giữa",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),

      columnHelper.defineDataTableAccessorColumn({
        id: "ACFlutePaperWeight",
        accessorKey: "ACFlutePaperWeight",
        header: "Sóng A/C",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),

      columnHelper.defineDataTableAccessorColumn({
        id: "backLayerPaperWeight",
        accessorKey: "backLayerPaperWeight",
        header: "Mặt trong",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),

      columnHelper.defineDataTableAccessorColumn({
        id: "totalVolume",
        accessorKey: "totalVolume",
        header: "Khối",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),

      columnHelper.defineDataTableAccessorColumn({
        id: "totalWeight",
        accessorKey: "totalWeight",
        header: "Tổng trọng lượng",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),
    ]
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
    cell: ({ cell, table }) => ManufacturingOrderTableActionColumn({ rowId: cell.row.id, isEdited: cell.row.original.isEdited, getOrder: () => ({ order: cell.row.original, processes: cell.row.original.finishingProcesses }), meta: table.options.meta })
  }),
];

export const manufacturingOrderColumnsByTabs: Record<
  ManufacturingTableTabType,
  ColumnDef<ManufacturingOrderTableDataType>[]
> = {
  all: manufacturingOrderColumns,

  order: manufacturingOrderColumns.filter((col) =>
    check.in(col.id, [
      "manufacturingDirective",
      "code",
      "customerCode",
      "wareCode",
      "fluteCombo",
      "wareSize",
      "amount",
      "actions-column",
    ])
  ),

  manufacture: manufacturingOrderColumns.filter((col) =>
    check.in(col.id, [
      "manufacturingDirective",
      "orderStatusDisplay",
      "code",
      "amount",
      "orderDates",
      "purchaseOrderCode",
      "wareManufacturingProcessType",
      "blankSize",
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
      "paperTypes",
      "actions-column",
    ])
  ),

  notes: manufacturingOrderColumns.filter((col) =>
    check.in(col.id, [
      "manufacturingDirective",
      "code",
      "wareNote",
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
      "paperWeights",
      "actions-column",
    ])
  ),

  processes: manufacturingOrderColumns.filter((col) =>
    check.in(col.id, [
      "manufacturingDirective",
      "code",
      "typeOfPrinter",
      "printColors",
      "finishingProcesses",
      "actions-column",
    ])
  ),
};
