import { ManufacturingTableTabType } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { FullDetailManufacturingOrderDTO } from "@/types/DTO/FullDetailManufactureOrder";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";
import check from "check-types";

export type ManufacturingOrderTableColumnsType = {
  key: string;
  header: string;
  render: (
    order: Serialized<FullDetailManufacturingOrderDTO>,
  ) => string | number | null | undefined;
};

export const manufacturingOrderTableColumns:
  ManufacturingOrderTableColumnsType[] = [
    {
      key: "customerCode",
      header: "Khách hàng",
      render: (order) => order.customerCode,
    },
    { key: "wareCode", header: "Mã hàng", render: (order) => order.wareCode },
    {
      key: "fluteCombo",
      header: "Sóng",
      render: (order) => order.fluteCombinationCode,
    },
    {
      key: "wareWidth",
      header: "Dài / Khổ",
      render: (order) => order.wareWidth,
    },
    { key: "wareLength", header: "Rộng", render: (order) => order.wareLength },
    { key: "wareHeight", header: "Cao", render: (order) => order.wareHeight },
    { key: "amount", header: "Số lượng", render: (order) => order.amount },
    {
      key: "orderDate",
      header: "Ngày nhận",
      render: (order) => formatDateToDDMMYYYY(order.orderDate),
    },
    {
      key: "deliveryDate",
      header: "Ngày giao",
      render: (order) => formatDateToDDMMYYYY(order.deliveryDate),
    },
    {
      key: "purchaseOrderId",
      header: "Đơn hàng",
      render: (order) => order.purchaseOrderId,
    },
    { key: "blankWidth", header: "Khổ", render: (order) => order.blankWidth },
    {
      key: "blankLength",
      header: "Cắt dài",
      render: (order) => order.blankLength,
    },
    { key: "flapLength", header: "Cánh", render: (order) => order.flapLength },
    {
      key: "warePerBlank",
      header: "Số SP",
      render: (order) => order.warePerBlank,
    },
    {
      key: "numberOfBlanks",
      header: "Số tấm",
      render: (order) => order.numberOfBlanks,
    },
    {
      key: "longitudinalCutCount",
      header: "Tấm chặt",
      render: (order) => order.longitudinalCutCount,
    },
    {
      key: "runningLength",
      header: "Mét dài",
      render: (order) => order.runningLength,
    },
    {
      key: "crossCutCount",
      header: "Part SX",
      render: (order) => order.crossCutCount,
    },
    {
      key: "paperWidth",
      header: "Khổ giấy",
      render: (order) => order.paperWidth,
    },
    { key: "margin", header: "Lề biên", render: (order) => order.margin },
    {
      key: "faceLayerPaperType",
      header: "Mặt SP",
      render: (order) => order.faceLayerPaperType,
    },
    {
      key: "EFlutePaperType",
      header: "Sóng E",
      render: (order) => order.EFlutePaperType,
    },
    {
      key: "EBLinerLayerPaperType",
      header: "Lớp giữa",
      render: (order) => order.EBLinerLayerPaperType,
    },
    {
      key: "BFlutePaperType",
      header: "Sóng B",
      render: (order) => order.BFlutePaperType,
    },
    {
      key: "BACLinerLayerPaperType",
      header: "Lớp giữa",
      render: (order) => order.BACLinerLayerPaperType,
    },
    {
      key: "ACFlutePaperType",
      header: "Sóng A/C",
      render: (order) => order.ACFlutePaperType,
    },
    {
      key: "backLayerPaperType",
      header: "Mặt trong",
      render: (order) => order.backLayerPaperType,
    },
    {
      key: "purchaseOrderItemNote",
      header: "Ghi chú cố định",
      render: (order) => order.purchaseOrderItemNote,
    },
    { key: "note", header: "Ghi chú tạm thời", render: (order) => order.note },
    {
      key: "manufacturingDate",
      header: "Ngày SX",
      render: (order) => formatDateToDDMMYYYY(order.manufacturingDate),
    },
    {
      key: "requestedDatetime",
      header: "Ngày và giờ cần",
      render: (order) => formatDateToDDMMYYYY(order.requestedDatetime),
    },
    {
      key: "corrugatorLine",
      header: "Dàn",
      render: (order) => order.corrugatorLine,
    },
    {
      key: "faceLayerPaperWeight",
      header: "Mặt SP",
      render: (order) => order.faceLayerPaperWeight,
    },
    {
      key: "EFlutePaperWeight",
      header: "Sóng E",
      render: (order) => order.EFlutePaperWeight,
    },
    {
      key: "EBLinerLayerPaperWeight",
      header: "Lớp giữa",
      render: (order) => order.EBLinerLayerPaperWeight,
    },
    {
      key: "BFlutePaperWeight",
      header: "Sóng B",
      render: (order) => order.BFlutePaperWeight,
    },
    {
      key: "BACLinerLayerPaperWeight",
      header: "Lớp giữa",
      render: (order) => order.BACLinerLayerPaperWeight,
    },
    {
      key: "ACFlutePaperWeight",
      header: "Sóng A/C",
      render: (order) => order.ACFlutePaperWeight,
    },
    {
      key: "backLayerPaperWeight",
      header: "Mặt trong",
      render: (order) => order.backLayerPaperWeight,
    },
    {
      key: "totalVolume",
      header: "Khối",
      render: (order) => order.totalVolume,
    },
    {
      key: "totalWeight",
      header: "Tổng trọng lượng",
      render: (order) => order.totalWeight,
    },
    {
      key: "typeOfPrinter",
      header: "Máy In",
      render: (order) => order.typeOfPrinter,
    },
    {
      key: "printColor1",
      header: "Màu 1",
      render: (order) => order.printColors?.at(0),
    },
    {
      key: "printColor2",
      header: "Màu 2",
      render: (order) => order.printColors?.at(1),
    },
    {
      key: "printColor3",
      header: "Màu 3",
      render: (order) => order.printColors?.at(2),
    },
    {
      key: "printColor4",
      header: "Màu 4",
      render: (order) => order.printColors?.at(3),
    },
    {
      key: "process1",
      header: "Công đoạn gia công 1",
      render: (order) => order.manufacturingProcesses?.at(1),
    },
    {
      key: "process2",
      header: "Công đoạn gia công 2",
      render: (order) => order.manufacturingProcesses?.at(2),
    },
    {
      key: "process3",
      header: "Công đoạn gia công 3",
      render: (order) => order.manufacturingProcesses?.at(3),
    },
    {
      key: "process4",
      header: "Công đoạn gia công 4",
      render: (order) => order.manufacturingProcesses?.at(4),
    },
  ];

export const manufacturingOrderTableColumnsByTabs: Record<
  ManufacturingTableTabType,
  ManufacturingOrderTableColumnsType[]
> = {
  all: manufacturingOrderTableColumns,
  order: manufacturingOrderTableColumns.filter((col) =>
    check.in(col.key, [
      "customerCode",
      "wareCode",
      "fluteCombo",
      "wareWidth",
      "wareLength",
      "wareHeight",
      "amount",
    ])
  ),

  manufacture: manufacturingOrderTableColumns.filter((col) =>
    check.in(col.key, [
      "orderDate",
      "deliveryDate",
      "purchaseOrderId",
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
    ])
  ),
  layers: manufacturingOrderTableColumns.filter((col) =>
    check.in(col.key, [
      "faceLayerPaperType",
      "EFlutePaperType",
      "EBLinerLayerPaperType",
      "BFlutePaperType",
      "BACLinerLayerPaperType",
      "ACFlutePaperType",
      "backLayerPaperType",
    ])
  ),
  notes: manufacturingOrderTableColumns.filter((col) =>
    check.in(col.key, [
      "purchaseOrderItemNote",
      "note",
      "manufacturingDate",
      "requestedDatetime",
      "corrugatorLine",
    ])
  ),
  weight: manufacturingOrderTableColumns.filter((col) =>
    check.in(col.key, [
      "faceLayerPaperWeight",
      "EFlutePaperWeight",
      "EBLinerLayerPaperWeight",
      "BFlutePaperWeight",
      "BACLinerLayerPaperWeight",
      "ACFlutePaperWeight",
      "backLayerPaperWeight",
      "totalVolume",
      "totalWeight",
    ])
  ),
  processes: manufacturingOrderTableColumns.filter((col) =>
    check.in(col.key, [
      "typeOfPrinter",
      "printColor1",
      "printColor2",
      "printColor3",
      "printColor4",
      "process1",
      "process2",
      "process3",
      "process4",
    ])
  ),
};
