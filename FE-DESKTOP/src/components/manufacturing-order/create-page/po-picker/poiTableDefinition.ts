import { PurchaseOrderItemPickerTabType } from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import check from "check-types";

export type PurchaseOrderItemTableColumnsType = {
  key: string;
  header: string;
  render: (
    poi: Serialized<PurchaseOrderItem>,
  ) => string | number | null | undefined;
};

export const purchaseOrderItemTableColumns:
  PurchaseOrderItemTableColumnsType[] = [
    {
      key: "fluteCombo",
      header: "Sóng",
      render: (poi) => check.string(poi.ware?.fluteCombination) ? poi.ware?.fluteCombination : poi.ware?.fluteCombination?.code,
    },
    {
      key: "wareWidth",
      header: "Dài / Khổ",
      render: (poi) => poi.ware?.wareWidth,
    },
    {
      key: "wareLength",
      header: "Rộng",
      render: (poi) => poi.ware?.wareLength,
    },
    {
      key: "wareHeight",
      header: "Cao",
      render: (poi) => poi.ware?.wareHeight,
    },
    {
      key: "amount",
      header: "Số lượng",
      render: (poi) => poi.amount,
    },
    {
      key: "blankWidth",
      header: "Khổ",
      render: (poi) => poi.ware?.blankWidth,
    },
    {
      key: "blankLength",
      header: "Cắt dài",
      render: (poi) => poi.ware?.blankLength,
    },
    {
      key: "flapLength",
      header: "Cánh",
      render: (poi) => poi.ware?.flapLength,
    },
    {
      key: "warePerBlank",
      header: "Số SP",
      render: (poi) => poi.ware?.warePerBlank,
    },
    {
      key: "numberOfBlanks",
      header: "Số tấm",
      render: (poi) => poi.numberOfBlanks,
    },
    {
      key: "longitudinalCutCount",
      header: "Tấm chặt",
      render: (poi) => poi.longitudinalCutCount,
    },
    {
      key: "runningLength",
      header: "Mét dài",
      render: (poi) => poi.runningLength,
    },
    {
      key: "crossCutCount",
      header: "Part SX",
      render: (poi) => poi.ware?.crossCutCount,
    },
    {
      key: "paperWidth",
      header: "Khổ giấy",
      render: (poi) => poi.ware?.paperWidth,
    },
    {
      key: "margin",
      header: "Lề biên",
      render: (poi) => poi.ware?.margin,
    },
    {
      key: "faceLayerPaperType",
      header: "Mặt SP",
      render: (poi) => poi.ware?.faceLayerPaperType,
    },
    {
      key: "EFlutePaperType",
      header: "Sóng E",
      render: (poi) => poi.ware?.EFlutePaperType,
    },
    {
      key: "EBLinerLayerPaperType",
      header: "Lớp giữa",
      render: (poi) => poi.ware?.EBLinerLayerPaperType,
    },
    {
      key: "BFlutePaperType",
      header: "Sóng B",
      render: (poi) => poi.ware?.BFlutePaperType,
    },
    {
      key: "BACLinerLayerPaperType",
      header: "Lớp giữa",
      render: (poi) => poi.ware?.BACLinerLayerPaperType,
    },
    {
      key: "ACFlutePaperType",
      header: "Sóng A/C",
      render: (poi) => poi.ware?.ACFlutePaperType,
    },
    {
      key: "backLayerPaperType",
      header: "Mặt trong",
      render: (poi) => poi.ware?.backLayerPaperType,
    },
    {
      key: "purchaseOrderItemNote",
      header: "Ghi chú",
      render: (poi) => poi.note,
    },
    {
      key: "faceLayerPaperWeight",
      header: "Mặt SP",
      render: (poi) => poi.faceLayerPaperWeight,
    },
    {
      key: "EFlutePaperWeight",
      header: "Sóng E",
      render: (poi) => poi.EFlutePaperWeight,
    },
    {
      key: "EBLinerLayerPaperWeight",
      header: "Lớp giữa",
      render: (poi) => poi.EBLinerLayerPaperWeight,
    },
    {
      key: "BFlutePaperWeight",
      header: "Sóng B",
      render: (poi) => poi.BFlutePaperWeight,
    },
    {
      key: "BACLinerLayerPaperWeight",
      header: "Lớp giữa",
      render: (poi) => poi.BACLinerLayerPaperWeight,
    },
    {
      key: "ACFlutePaperWeight",
      header: "Sóng A/C",
      render: (poi) => poi.ACFlutePaperWeight,
    },
    {
      key: "backLayerPaperWeight",
      header: "Mặt trong",
      render: (poi) => poi.backLayerPaperWeight,
    },
    {
      key: "totalVolume",
      header: "Khối",
      render: (poi) => poi.totalVolume,
    },
    {
      key: "totalWeight",
      header: "Tổng trọng lượng",
      render: (poi) => poi.totalWeight,
    },
    {
      key: "typeOfPrinter",
      header: "Máy In",
      render: (poi) => poi.ware?.typeOfPrinter,
    },
    {
      key: "printColors",
      header: "Màu In",
      render: (poi) => poi.ware?.printColors?.map((c) => check.string(c) ? c : c.code).join(", "),
    },
    {
      key: "finishingProcesses",
      header: "Công đoạn gia công",
      render: (poi) =>
        poi.ware?.finishingProcesses?.map((c) => check.string(c) ? c : c.name)
          .join(", "),
    },
    {
      key: "manufactureProcess",
      header: "Kiểu gia công",
      render: (poi) => check.string(poi.ware?.wareManufacturingProcessType) ? poi.ware?.wareManufacturingProcessType : poi.ware?.wareManufacturingProcessType?.name,
    },
  ];

export const purchaseOrderItemTableColumnsByTabs: Record<
  PurchaseOrderItemPickerTabType,
  PurchaseOrderItemTableColumnsType[]
> = {
  all: purchaseOrderItemTableColumns,
  ware: purchaseOrderItemTableColumns.filter((col) =>
    check.in(col.key, [
      "wareCode",
      "fluteCombo",
      "wareWidth",
      "wareLength",
      "wareHeight",
      "amount",
    ])
  ),

  manufacture: purchaseOrderItemTableColumns.filter((col) =>
    check.in(col.key, [
      "warePerBlank",
      "manufactureProcess",
      "blankWidth",
      "blankLength",
      "flapLength",
      "longitudinalCutCount",
      "runningLength",
      "crossCutCount",
      "margin",
      "paperWidth",
    ])
  ),
  layers: purchaseOrderItemTableColumns.filter((col) =>
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
  notes: purchaseOrderItemTableColumns.filter((col) =>
    check.in(col.key, [
      "purchaseOrderItemNote",
      "note",
      "manufacturingDate",
      "requestedDatetime",
      "corrugatorLine",
    ])
  ),
  weight: purchaseOrderItemTableColumns.filter((col) =>
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
  processes: purchaseOrderItemTableColumns.filter((col) =>
    check.in(col.key, [
      "typeOfPrinter",
      "printColors",
      "finishingProcesses",
    ])
  ),
};
