import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FinishedGoodDailyItem } from "@/types/FinishedGoodTransaction";
import { safeGet } from "@/utils/storagesUtils";
import { formatDate } from "@/utils/dateUtils";

export const exportFinishedDailyReport = (
  transactionType: string,
  startDate: string,
  endDate: string,
  rows: FinishedGoodDailyItem[]
) => {
  const typeText = transactionType === "IMPORT" ? "NHẬP" : "XUẤT";

  const totalQuantity = rows.reduce(
    (sum, item) => sum + (item.totalQuantity ?? 0),
    0
  );

  // Row 0: Report Title
  const row0 = [
    "",
    "",
    `BÁO CÁO CHI TIẾT ${typeText} KHO THÀNH PHẨM THEO NGÀY (${startDate} - ${endDate})`,
  ];

  // Row 1: Main Headers
  const row1 = [
    "STT",
    "Lệnh",
    "Mã đơn hàng",
    "Khách hàng",
    "Mã hàng",
    "Số lớp",
    "Kích thước",
    "",
    "",
    "Số lượng",
    "Ngày giao hàng",
    "Tổng xuất",
  ];

  // Row 2: Dimension Sub-headers
  const row2 = [
    "", "", "", "", "", "",
    "Dài",
    "Rộng",
    "Cao",
    "",
    "",
    "",
  ];

  // 3. MAP DATA ROWS
  const dataRows = rows.map((item, idx) => {
    const mo = item.finishedGood.manufacturingOrder;
    const poItem = mo?.purchaseOrderItem;
    const amount = poItem?.amount ?? 0;

    return [
      idx + 1,
      mo?.code ?? "-",
      safeGet(poItem, "subPurchaseOrder.purchaseOrder.code"),
      safeGet(poItem, "subPurchaseOrder.purchaseOrder.customer.code"),
      safeGet(poItem, "ware.code"),
      safeGet(poItem, "ware.fluteCombination.code"),
      safeGet(poItem, "ware.wareLength"),
      safeGet(poItem, "ware.wareWidth"),
      safeGet(poItem, "ware.wareHeight"),
      amount,
      formatDate(safeGet(poItem, "subPurchaseOrder.deliveryDate")),
      item.totalQuantity,
    ];
  });

  // 4. FOOTER ROW (Grand Total)

  const footerRow = [
    "TỔNG CỘNG",
    "", "", "", "", "", "", "", "", "", "",
    totalQuantity,
    ""
  ];


  const wsData = [row0, row1, row2, ...dataRows, footerRow];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws["!merges"] = [
    // Title Row (Row 0): Merge across all columns
    { s: { r: 0, c: 2 }, e: { r: 0, c: 10 } },

    // Headers (Rows 1-2) Vertical Merges
    { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } }, // STT
    { s: { r: 1, c: 1 }, e: { r: 2, c: 1 } }, // Lệnh
    { s: { r: 1, c: 2 }, e: { r: 2, c: 2 } }, // Mã đơn hàng
    { s: { r: 1, c: 3 }, e: { r: 2, c: 3 } }, // Khách hàng
    { s: { r: 1, c: 4 }, e: { r: 2, c: 4 } }, // Mã hàng
    { s: { r: 1, c: 5 }, e: { r: 2, c: 5 } }, // Số lớp

    // Headers (Rows 1-2) Horizontal Merges (Dimensions)
    { s: { r: 1, c: 6 }, e: { r: 1, c: 8 } },

    // Headers (Rows 1-2) Remaining Vertical Merges
    { s: { r: 1, c: 9 }, e: { r: 2, c: 9 } }, // Số lượng
    { s: { r: 1, c: 10 }, e: { r: 2, c: 10 } }, // Ngày giao
    { s: { r: 1, c: 11 }, e: { r: 2, c: 11 } }, // Tổng xuất

    // Footer Merge 
    { s: { r: wsData.length - 1, c: 0 }, e: { r: wsData.length - 1, c: 10 } }
  ];

  ws["!cols"] = [
    { wch: 6 },  // STT
    { wch: 15 }, // Lệnh
    { wch: 15 }, // Mã đơn
    { wch: 20 }, // Khách
    { wch: 15 }, // Mã hàng
    { wch: 8 },  // Số lớp
    { wch: 8 },  // Dài
    { wch: 8 },  // Rộng
    { wch: 8 },  // Cao
    { wch: 12 }, // Qty
    { wch: 15 }, // Date
    { wch: 12 }, // Txuat
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Báo cáo ${typeText}`);

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  saveAs(blob, `Bao_cao_${typeText}_kho_thanh_pham_${startDate}_${endDate}.xlsx`);
};