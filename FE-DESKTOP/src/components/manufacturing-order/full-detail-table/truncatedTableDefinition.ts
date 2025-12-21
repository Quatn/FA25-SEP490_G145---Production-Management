import { ColumnDef } from "@tanstack/react-table";
import type { ManufacturingOrder } from "@/types/ManufacturingOrder";
import check from "check-types";
import { WareFinishingProcessType } from "@/types/WareFinishingProcessType";
import { getDataTableColumnHelper } from "@/components/ui/data-table/utils/getDataTableColumnHelper";
import { DataTableCellType } from "@/components/ui/data-table/Cell";
import { ManufacturingOrderDirectives } from "@/types/enums/ManufacturingOrderDirectives";
import { createListCollection } from "@chakra-ui/react";
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import { CorrugatorLine } from "@/types/enums/CorrugatorLine";
import ManufacturingOrderTableActionColumn from "./ActionColumn";
import { manufacturingOrderComponentUtils as utils } from "../utils"
import { ManufacturingOrderApprovalStatus } from "@/types/enums/ManufacturingOrderApprovalStatus";
import { formatDateTohhmmDDMMYYYY } from "@/utils/dateUtils";

const { getPopulatedCustomer, getPopulatedPo, getPopulatedWare, getPopulatedSubPo, OrderStatusNameMap, OrderApprovalStatusNameMap } = utils

export type TruncatedManufacturingOrderTableData = {
  _id: string,
  code: string,
  manufacturingDirective: ManufacturingOrderDirectives | null,
  approvalStatus: ManufacturingOrderApprovalStatus,
  customerCode: string,
  wareCode: string,
  purchaseOrderCode: string,
  fluteCombinationCode: string,
  wareWidth: number,
  wareLength: number,
  wareHeight: number | null,
  inventory: number,
  amount: number,
  orderDate: Date,
  deliveryDate: Date,
  manufacturingDate: Date,
  requestedDatetime: Date | null,
  manufacturingDateAdjustment: Date | null,
  corrugatorLine: CorrugatorLine,
  corrugatorLineAdjustment: CorrugatorLine | null,
  wareManufacturingProcessType: Omit<WareFinishingProcessType, "createdAt" | "updatedAt">,
  // Refers to ware finishing processes, this is to display the processes listed on the ware, not the actual created order manufacturing processes. Use `processes` provided by getOrder() for that.
  finishingProcesses: Omit<WareFinishingProcessType, "createdAt" | "updatedAt">[],
  wareNote: string,
  note: string,
  getOrder: (id: string) => { order: Serialized<ManufacturingOrder> } | undefined,
  purchaseOrderItemId: string,
  orderStatusDisplay: string,
}

export const convertSerializedMOToTruncatedManufacturingOrderTableData = (
  mo: Serialized<ManufacturingOrder>,
  getOrder: (id: string) => { order: Serialized<ManufacturingOrder> } | undefined): TruncatedManufacturingOrderTableData => {
  const customer = getPopulatedCustomer(mo)
  const ware = getPopulatedWare(mo)
  const subPo = getPopulatedSubPo(mo)
  const po = getPopulatedPo(mo)
  const poi = getPopulatedPo(mo)

  if (!check.object(ware?.wareManufacturingProcessType)) {
    throw new UnpopulatedFieldError(
      "ware.wareManufacturingProcessType should be populated before reaching convertSerializedMOToTruncatedManufacturingOrderTableData"
    )
  }

  if (!check.array.of.object(ware.finishingProcesses)) {
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
    manufacturingDirective: mo.manufacturingDirective ?? null,
    approvalStatus: mo.approvalStatus,
    customerCode: customer?.code ?? "",
    wareCode: ware?.code ?? "",
    purchaseOrderCode: po?.code ?? "",
    fluteCombinationCode: check.string(ware?.fluteCombination) ? ware.fluteCombination : ware?.fluteCombination.code ?? "",
    wareWidth: ware?.wareWidth ?? 0,
    wareLength: ware?.wareLength ?? 0,
    wareHeight: ware?.wareHeight ?? null,
    inventory: (check.object(mo.finishedGoodRecord) && check.number(mo.finishedGoodRecord.currentQuantity)) ? mo.finishedGoodRecord.currentQuantity : 0,
    amount: mo.amount,
    orderDate: new Date(po?.orderDate ?? ""),
    deliveryDate: new Date(subPo?.deliveryDate ?? ""),
    manufacturingDate: new Date(mo.manufacturingDate),
    requestedDatetime: (!check.null(mo.requestedDatetime) && check.date(new Date(mo.requestedDatetime))) ? new Date(mo.requestedDatetime) : null,
    manufacturingDateAdjustment: (!check.null(mo.manufacturingDateAdjustment) && check.date(new Date(mo.manufacturingDateAdjustment ?? ""))) ? new Date(mo.manufacturingDateAdjustment) : null,
    corrugatorLine: mo.corrugatorLine,
    corrugatorLineAdjustment: mo.corrugatorLineAdjustment ?? null,
    wareManufacturingProcessType: ware.wareManufacturingProcessType,
    finishingProcesses: (ware.finishingProcesses as Omit<WareFinishingProcessType, "createdAt" | "updatedAt">[]),
    wareNote: ware.note,
    note: mo.note,
    getOrder,
    purchaseOrderItemId: poi._id,
    orderStatusDisplay: mo.operativeStatus ? OrderStatusNameMap[mo.operativeStatus] : ""
  }
}

const columnHelper = getDataTableColumnHelper<TruncatedManufacturingOrderTableData>()

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

const approvalStatusesCol = createListCollection({
  items: Object.keys(OrderApprovalStatusNameMap).map((k) => ({
    label: OrderApprovalStatusNameMap[k as ManufacturingOrderApprovalStatus], value: k
  }))
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

export const truncatedManufacturingOrderTableMergedHeaders = [
  ["manufacturingDirective", "1_manufacturingDirective_manufacturingDirective"],
  ["code", "1_code_code"],
  ["customerCode", "1_customerCode_customerCode"],
  ["wareCode", "1_wareCode_wareCode"],
  ["approvalStatus", "1_approvalStatus_approvalStatus"],
  ["purchaseOrderCode", "1_purchaseOrderCode_purchaseOrderCode"],
  ["orderStatusDisplay", "1_orderStatusDisplay_orderStatusDisplay"],
  ["fluteCombinationCode", "1_fluteCombination_fluteCombination"],
  ["wareManufacturingProcessType", "1_wareManufacturingProcessType_wareManufacturingProcessType"],
  ["fluteCombinationCode", "1_fluteCombinationCode_fluteCombinationCode"],
  ["inventory", "1_inventory_inventory"],
  ["amount", "1_amount_amount"],
  ["wareNote", "1_wareNote_wareNote"],
  ["note", "1_note_note"],
  ["manufacturingDateAdjustment", "1_manufacturingDateAdjustment_manufacturingDateAdjustment"],
  ["requestedDatetime", "1_requestedDatetime_requestedDatetime"],
  ["corrugatorLineAdjustment", "1_corrugatorLineAdjustment_corrugatorLineAdjustment"],
  ["finishingProcesses", "1_finishingProcesses_finishingProcesses"],
  ["actions-column", "1_actions-column_actions-column"],
]

export const truncatedManufacturingOrderTableColumns: (ColumnDef<TruncatedManufacturingOrderTableData & { isEdited: boolean }>)[] = [
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
    accessorKey: "customerCode",
    header: "Khách hàng",
    enablePinning: true,
    cellType: DataTableCellType.Highlight,
    ...colSize.md,
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
    id: "approvalStatus",
    accessorKey: "approvalStatus",
    header: "Trạng thái duyệt",
    enablePinning: true,
    cellType: DataTableCellType.Select,
    selectCollection: approvalStatusesCol,
    options: {
      getDisabled: (mo) => mo.approvalStatus === ManufacturingOrderApprovalStatus.Approved
    },
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "orderStatusDisplay",
    accessorKey: "orderStatusDisplay",
    header: "Trạng thái chạy",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
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
    id: "wareManufacturingProcessType",
    accessorFn: (mo) => {
      return mo.wareManufacturingProcessType.name
    },
    header: "Kiểu gia công",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.sm,
  }),

  columnHelper.defineHeaderGroup({
    id: "wareSize",
    header: () => "Kích thước sản phẩm",
    size: 250,
    columns: [
      columnHelper.defineDataTableAccessorColumn({
        id: "wareWidth",
        accessorKey: "wareWidth",
        header: "Dài / Khổ",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),
      columnHelper.defineDataTableAccessorColumn({
        id: "wareLength",
        accessorKey: "wareLength",
        header: "Rộng",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.sm,
      }),
      columnHelper.defineDataTableAccessorColumn({
        id: "wareHeight",
        accessorKey: "wareHeight",
        header: "Cao",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        options: {
          nullIfNumLessOrEqual: 0
        },
        ...colSize.sm,
      }),
    ],
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "inventory",
    accessorKey: "inventory",
    header: "Tồn kho",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.sm,
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
    size: 300,
    columns: [
      columnHelper.defineDataTableAccessorColumn({
        id: "orderDate",
        accessorKey: "orderDate",
        header: "Nhận đơn",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.md,
      }),
      columnHelper.defineDataTableAccessorColumn({
        id: "deliveryDate",
        accessorKey: "deliveryDate",
        header: "Giao đơn",
        enablePinning: true,
        cellType: DataTableCellType.Readonly,
        ...colSize.md,
      }),
    ]
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "wareNote",
    accessorKey: "wareNote",
    header: "Ghi chú cố định",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.lg,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "note",
    accessorKey: "note",
    header: "Ghi chú tạm thời",
    enablePinning: true,
    cellType: DataTableCellType.Text,
    options: {
      getDisabled: (mo) => mo.approvalStatus === ManufacturingOrderApprovalStatus.Approved
    },
    ...colSize.lg,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "manufacturingDateAdjustment",
    accessorFn: (mo) => {
      return check.assigned(mo.manufacturingDateAdjustment) ? mo.manufacturingDateAdjustment : mo.manufacturingDate
    },
    header: "Ngày SX",
    enablePinning: true,
    cellType: DataTableCellType.Date,
    options: {
      getDisabled: (mo) => mo.approvalStatus === ManufacturingOrderApprovalStatus.Approved
    },
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "requestedDatetime",
    accessorFn: (mo) => {
      return formatDateTohhmmDDMMYYYY(mo.requestedDatetime)
    },
    header: "Ngày và giờ cần",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    options: {
      getDisabled: (mo) => mo.approvalStatus === ManufacturingOrderApprovalStatus.Approved
    },
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
    options: {
      getDisabled: (mo) => mo.approvalStatus === ManufacturingOrderApprovalStatus.Approved
    },
    ...colSize.md,
  }),

  columnHelper.defineDataTableAccessorColumn({
    id: "finishingProcesses",
    accessorFn: (tmo) => {
      return tmo.finishingProcesses.map((p) => p.name).join(", ")
    },
    header: "Công đoạn gia công",
    enablePinning: true,
    cellType: DataTableCellType.Readonly,
    ...colSize.md,
  }),

  columnHelper.defineDataTableDisplayColumn({
    id: "actions-column",
    header: undefined,
    cell: ({ cell, table }) => ManufacturingOrderTableActionColumn({ rowId: cell.row.id, isEdited: cell.row.original.isEdited, getOrder: cell.row.original.getOrder, meta: table.options.meta })
  }),
];
