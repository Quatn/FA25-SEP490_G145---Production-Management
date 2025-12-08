import { ColumnDef } from "@tanstack/react-table";
import type { ManufacturingOrder } from "@/types/ManufacturingOrder";
import check from "check-types";
import { getDataTableColumnHelper } from "@/components/ui/data-table/utils/getDataTableColumnHelper";
import { DataTableCellType } from "@/components/ui/data-table/Cell";
import { ManufacturingOrderDirectives } from "@/types/enums/ManufacturingOrderDirectives";
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import { OrderFinishingProcess } from "@/types/OrderFinishingProcess";
import { manufacturingOrderComponentUtils as utils } from "../utils"
import { CorrugatorProcess } from "@/types/CorrugatorProcess";
import { CorrugatorProcessStatus } from "@/types/enums/CorrugatorProcessStatus";
import { createListCollection } from "@chakra-ui/react";

const { getPopulatedPo, getPopulatedWare, getPopulatedSubPo, corrugatorProcessStatusNameMap } = utils

export type ManufacturingOrderCorrugatorOperatePageTableData = {
  _id: string,
  code: string,
  corrugatorProcess: CorrugatorProcess,
  corrugatorProcessStatus: CorrugatorProcessStatus,
  manufacturingDirective: ManufacturingOrderDirectives | null,
  wareCode: string,
  purchaseOrderCode: string,
  fluteCombinationCode: string,
  calculatedPaperWidth: number,
  calculatedRunningLength: number,
  actualPaperWidth: number,
  actualRunningLength: number,
  amount: number,
  manufacturedAmount: number,
  deliveryDate: Date,
  manufacturingDate: Date,
  requestedDatetime: Date | null,
  manufacturingDateAdjustment: Date | null,
  getOrder: (id: string) => { order: Serialized<ManufacturingOrder>, processes: Serialized<OrderFinishingProcess>[] } | undefined,
  purchaseOrderItemId: string,
}

export const convertSerializedMOToManufacturingOrderCorrugatorOperatePageTableData = (
  mo: Serialized<ManufacturingOrder>,
  getOrder: (id: string) => { order: Serialized<ManufacturingOrder>, processes: Serialized<OrderFinishingProcess>[] } | undefined): ManufacturingOrderCorrugatorOperatePageTableData => {
  const ware = getPopulatedWare(mo)
  const subPo = getPopulatedSubPo(mo)
  const po = getPopulatedPo(mo)
  const poi = getPopulatedPo(mo)

  if (!check.array.of.object(ware?.finishingProcesses)) {
    throw new UnpopulatedFieldError(
      "ware.finishingProcesses hould be populated before reaching convertSerializedMOToTruncatedManufacturingOrderTableData"
    )
  }

  if (!check.object(poi)) {
    throw new UnpopulatedFieldError(
      "poi should be populated before reaching convertSerializedMOToTruncatedManufacturingOrderTableData"
    )
  }

  return {
    _id: mo._id,
    code: mo.code,
    corrugatorProcess: mo.corrugatorProcess,
    corrugatorProcessStatus: mo.corrugatorProcess.status,
    manufacturingDirective: mo.manufacturingDirective ?? null,
    wareCode: ware?.code ?? "",
    purchaseOrderCode: po?.code ?? "",
    fluteCombinationCode: check.string(ware?.fluteCombination) ? ware.fluteCombination : ware?.fluteCombination.code ?? "",
    calculatedPaperWidth: ware.paperWidth,
    calculatedRunningLength: mo.runningLength,
    actualPaperWidth: mo.corrugatorProcess.actualPaperWidth,
    actualRunningLength: mo.corrugatorProcess.actualRunningLength,
    amount: mo.amount,
    manufacturedAmount: mo.corrugatorProcess.manufacturedAmount,
    deliveryDate: new Date(subPo?.deliveryDate ?? ""),
    manufacturingDate: new Date(mo.manufacturingDate),
    requestedDatetime: (!check.null(mo.requestedDatetime) && check.date(new Date(mo.requestedDatetime))) ? new Date(mo.requestedDatetime) : null,
    manufacturingDateAdjustment: (!check.null(mo.manufacturingDateAdjustment) && check.date(new Date(mo.manufacturingDateAdjustment ?? ""))) ? new Date(mo.manufacturingDateAdjustment) : null,
    getOrder,
    purchaseOrderItemId: poi._id,
  }
}

const columnHelper = getDataTableColumnHelper<ManufacturingOrderCorrugatorOperatePageTableData>()

const manufacturingDirectives: { label: string, value: string }[] = [
  { label: "Hủy", value: ManufacturingOrderDirectives.Cancel },
  { label: "Tạm dừng", value: ManufacturingOrderDirectives.Pause },
  { label: "Bắt buộc", value: ManufacturingOrderDirectives.Mandatory },
  { label: "Bù lệnh", value: ManufacturingOrderDirectives.Compensate },
]

const CorrugatorProcessStatuses: { label: string, value: string }[] = [
  { label: "Chưa bắt đầu", value: CorrugatorProcessStatus.NOTSTARTED },
  { label: "Đang chạy", value: CorrugatorProcessStatus.RUNNING },
  { label: "Tạm dừng", value: CorrugatorProcessStatus.PAUSED },
  { label: "Hoàn thành", value: CorrugatorProcessStatus.COMPLETED },
  { label: "Hủy", value: CorrugatorProcessStatus.CANCELLED },
  { label: "Hoàn thành", value: CorrugatorProcessStatus.OVERCOMPLETED },
]

const corrugatorProcessStatusCol = createListCollection({
  items: CorrugatorProcessStatuses,
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

export const manufacturingOrderCorrugatorOperatePageTableMergedHeaders = [
  ["manufacturingDirective", "1_manufacturingDirective_manufacturingDirective"],
  ["code", "1_code_code"],
  ["corrugatorProcessStatus", "1_corrugatorProcessStatus_corrugatorProcessStatus"],
  ["customerCode", "1_customerCode_customerCode"],
  ["wareCode", "1_wareCode_wareCode"],
  ["purchaseOrderCode", "1_purchaseOrderCode_purchaseOrderCode"],
  ["orderStatusDisplay", "1_orderStatusDisplay_orderStatusDisplay"],
  ["fluteCombinationCode", "1_fluteCombination_fluteCombination"],
  ["wareManufacturingProcessType", "1_wareManufacturingProcessType_wareManufacturingProcessType"],
  ["fluteCombinationCode", "1_fluteCombinationCode_fluteCombinationCode"],
  ["inventory", "1_inventory_inventory"],
  ["amount", "1_amount_amount"],
  ["manufacturedAmount", "1_manufacturedAmount_manufacturedAmount"],
  ["wareNote", "1_wareNote_wareNote"],
  ["note", "1_note_note"],
  ["manufacturingDateAdjustment", "1_manufacturingDateAdjustment_manufacturingDateAdjustment"],
  ["requestedDatetime", "1_requestedDatetime_requestedDatetime"],
  ["corrugatorLineAdjustment", "1_corrugatorLineAdjustment_corrugatorLineAdjustment"],
  ["finishingProcesses", "1_finishingProcesses_finishingProcesses"],
  ["actions-column", "1_actions-column_actions-column"],
]

export const manufacturingOrderCorrugatorOperatePageTableColumns: (ColumnDef<ManufacturingOrderCorrugatorOperatePageTableData & { isEdited: boolean }>)[] = [
  columnHelper.defineDataTableAccessorColumn({
    id: "manufacturingDirective",
    accessorFn: (tmo) => {
      return manufacturingDirectives.find(md => md.value == tmo.manufacturingDirective)?.label
    },
    header: "Kế hoạch giao",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "corrugatorProcessStatus",
    accessorKey: "corrugatorProcessStatus",
    header: "Trạng thái chạy",
    enablePinning: true,
    cellType: DataTableCellType.Select,
    selectCollection: corrugatorProcessStatusCol,
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
    id: "purchaseOrderCode",
    accessorKey: "purchaseOrderCode",
    header: "Đơn hàng",
    enablePinning: true,
    cellType: DataTableCellType.Highlight,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "wareCode",
    accessorKey: "wareCode",
    header: "Mã hàng",
    enablePinning: true,
    cellType: DataTableCellType.Highlight,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "fluteCombinationCode",
    accessorFn: (tmo) => {
      return tmo.fluteCombinationCode
    },
    header: "Sóng",
    enablePinning: true,
    cellType: DataTableCellType.Highlight,
    ...colSize.sm,
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
    id: "manufacturedAmount",
    accessorFn: (mo) => {
      return mo.corrugatorProcess.manufacturedAmount
    },
    header: "Số lượng đã sản xuất",
    enablePinning: true,
    cellType: DataTableCellType.Number,
    ...colSize.md,
  }),

  columnHelper.defineHeaderGroup({
    id: "calculatedMeasurements",
    header: () => "Theo lệnh",
    size: 500,
    columns: [
      columnHelper.defineDataTableAccessorColumn({
        id: "calculatedPaperWidth",
        accessorKey: "calculatedPaperWidth",
        header: "Khổ giấy",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),

      columnHelper.defineDataTableAccessorColumn({
        id: "calculatedRunningLength",
        accessorKey: "calculatedRunningLength",
        header: "Mét dài",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),
    ]
  }),

  columnHelper.defineHeaderGroup({
    id: "actualMeasurements",
    header: () => "Thực",
    size: 500,
    columns: [
      columnHelper.defineDataTableAccessorColumn({
        id: "actualPaperWidth",
        accessorKey: "actualPaperWidth",
        header: "Khổ giấy",
        enablePinning: true,
        cellType: DataTableCellType.Number,
        ...colSize.sm,
      }),

      columnHelper.defineDataTableAccessorColumn({
        id: "actualRunningLength",
        accessorKey: "actualRunningLength",
        header: "Mét dài",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),
    ]
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "manufacturingDateAdjustment",
    accessorFn: (mo) => {
      return check.assigned(mo.manufacturingDateAdjustment) ? mo.manufacturingDateAdjustment : mo.manufacturingDate
    },
    header: "Ngày SX",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "requestedDatetime",
    accessorKey: "requestedDatetime",
    header: "Ngày và giờ cần",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  /*
  columnHelper.defineDataTableDisplayColumn({
    id: "actions-column",
    header: undefined,
    cell: ({ cell, table }) => ManufacturingOrderTableActionColumn({ rowId: cell.row.id, isEdited: cell.row.original.isEdited, getOrder: cell.row.original.getOrder, meta: table.options.meta })
  }),
  */
];
