import { ManufacturingTableTabType } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";
import check from "check-types";

export type ManufacturingOrderTableColumnsType = {
  key: string;
  header: string;
  render: (
    order: Serialized<ManufacturingOrder>,
  ) => string | number | null | undefined;
};

export const manufacturingOrderTableColumns:
  ManufacturingOrderTableColumnsType[] = [
    {
      key: "customerCode",
      header: "Khách hàng",
      render: (order) =>
        order.purchaseOrderItem?.subPurchaseOrder?.purchaseOrder?.customer
          ?.code,
    },
    {
      key: "wareCode",
      header: "Mã hàng",
      render: (order) => order.purchaseOrderItem?.ware?.code,
    },
    {
      key: "fluteCombo",
      header: "Sóng",
      render: (order) => order.purchaseOrderItem?.ware?.fluteCombination?.code,
    },
    {
      key: "wareWidth",
      header: "Dài / Khổ",
      render: (order) => order.purchaseOrderItem?.ware?.wareWidth,
    },
    {
      key: "wareLength",
      header: "Rộng",
      render: (order) => order.purchaseOrderItem?.ware?.wareLength,
    },
    {
      key: "wareHeight",
      header: "Cao",
      render: (order) => order.purchaseOrderItem?.ware?.wareHeight,
    },
    {
      key: "amount",
      header: "Số lượng",
      render: (order) => order.purchaseOrderItem?.amount,
    },
    {
      key: "orderDate",
      header: "Ngày nhận",
      render: (order) =>
        formatDateToDDMMYYYY(
          order.purchaseOrderItem?.subPurchaseOrder?.purchaseOrder?.orderDate,
        ),
    },
    {
      key: "deliveryDate",
      header: "Ngày giao",
      render: (order) =>
        formatDateToDDMMYYYY(
          order.purchaseOrderItem?.subPurchaseOrder?.deliveryDate,
        ),
    },
    {
      key: "purchaseOrderCode",
      header: "Đơn hàng",
      render: (order) =>
        order.purchaseOrderItem?.subPurchaseOrder?.purchaseOrder?.code,
    },
    {
      key: "blankWidth",
      header: "Khổ",
      render: (order) => order.purchaseOrderItem?.ware?.blankWidth,
    },
    {
      key: "blankLength",
      header: "Cắt dài",
      render: (order) => order.purchaseOrderItem?.ware?.blankLength,
    },
    {
      key: "flapLength",
      header: "Cánh",
      render: (order) => order.purchaseOrderItem?.ware?.flapLength,
    },
    {
      key: "warePerBlank",
      header: "Số SP",
      render: (order) => order.purchaseOrderItem?.ware?.warePerBlank,
    },
    {
      key: "numberOfBlanks",
      header: "Số tấm",
      render: (order) => order.purchaseOrderItem?.numberOfBlanks,
    },
    {
      key: "longitudinalCutCount",
      header: "Tấm chặt",
      render: (order) => order.purchaseOrderItem?.longitudinalCutCount,
    },
    {
      key: "runningLength",
      header: "Mét dài",
      render: (order) => order.purchaseOrderItem?.runningLength,
    },
    {
      key: "crossCutCount",
      header: "Part SX",
      render: (order) => order.purchaseOrderItem?.ware?.crossCutCount,
    },
    {
      key: "paperWidth",
      header: "Khổ giấy",
      render: (order) => order.purchaseOrderItem?.ware?.paperWidth,
    },
    {
      key: "margin",
      header: "Lề biên",
      render: (order) => order.purchaseOrderItem?.ware?.margin,
    },
    {
      key: "faceLayerPaperType",
      header: "Mặt SP",
      render: (order) => order.purchaseOrderItem?.ware?.faceLayerPaperType,
    },
    {
      key: "EFlutePaperType",
      header: "Sóng E",
      render: (order) => order.purchaseOrderItem?.ware?.EFlutePaperType,
    },
    {
      key: "EBLinerLayerPaperType",
      header: "Lớp giữa",
      render: (order) => order.purchaseOrderItem?.ware?.EBLinerLayerPaperType,
    },
    {
      key: "BFlutePaperType",
      header: "Sóng B",
      render: (order) => order.purchaseOrderItem?.ware?.BFlutePaperType,
    },
    {
      key: "BACLinerLayerPaperType",
      header: "Lớp giữa",
      render: (order) => order.purchaseOrderItem?.ware?.BACLinerLayerPaperType,
    },
    {
      key: "ACFlutePaperType",
      header: "Sóng A/C",
      render: (order) => order.purchaseOrderItem?.ware?.ACFlutePaperType,
    },
    {
      key: "backLayerPaperType",
      header: "Mặt trong",
      render: (order) => order.purchaseOrderItem?.ware?.backLayerPaperType,
    },
    {
      key: "purchaseOrderItemNote",
      header: "Ghi chú cố định",
      render: (order) => order.purchaseOrderItem?.note,
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
      render: (order) => order.purchaseOrderItem?.faceLayerPaperWeight,
    },
    {
      key: "EFlutePaperWeight",
      header: "Sóng E",
      render: (order) => order.purchaseOrderItem?.EFlutePaperWeight,
    },
    {
      key: "EBLinerLayerPaperWeight",
      header: "Lớp giữa",
      render: (order) => order.purchaseOrderItem?.EBLinerLayerPaperWeight,
    },
    {
      key: "BFlutePaperWeight",
      header: "Sóng B",
      render: (order) => order.purchaseOrderItem?.BFlutePaperWeight,
    },
    {
      key: "BACLinerLayerPaperWeight",
      header: "Lớp giữa",
      render: (order) => order.purchaseOrderItem?.BACLinerLayerPaperWeight,
    },
    {
      key: "ACFlutePaperWeight",
      header: "Sóng A/C",
      render: (order) => order.purchaseOrderItem?.ACFlutePaperWeight,
    },
    {
      key: "backLayerPaperWeight",
      header: "Mặt trong",
      render: (order) => order.purchaseOrderItem?.backLayerPaperWeight,
    },
    {
      key: "totalVolume",
      header: "Khối",
      render: (order) => order.purchaseOrderItem?.totalVolume,
    },
    {
      key: "totalWeight",
      header: "Tổng trọng lượng",
      render: (order) => order.purchaseOrderItem?.totalWeight,
    },
    {
      key: "typeOfPrinter",
      header: "Máy In",
      render: (order) => order.purchaseOrderItem?.ware?.typeOfPrinter,
    },
    {
      key: "printColors",
      header: "Màu In",
      render: (order) => order.purchaseOrderItem?.ware?.printColors?.join(", "),
    },
    {
      key: "processes",
      header: "Công đoạn gia công",
      render: (order) =>
        order.purchaseOrderItem?.ware?.finishingProcesses?.map(c => c.name).join(", "),
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
      "printColors",
      "processes",
    ])
  ),
};
