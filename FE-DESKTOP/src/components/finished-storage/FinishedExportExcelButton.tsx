import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Helper for safe property access (lodash-like get)
const safeGet = (obj: any, path: string, fallback = "-") => {
  return path.split('.').reduce((o, k) => (o || {})[k], obj) || fallback;
};

// Helper for date formatting
const fmtDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

export const exportFinishedDailyReport = (
  dailySummary: any[],
  transactionType: "IMPORT" | "EXPORT"
) => {
  // 1. Calculate Grand Total (displayed in the last column header)
  const totalQuantity = dailySummary
    .flatMap((day) => day.summaryPerFinishedGood)
    .reduce((sum, fgSummary) => sum + (fgSummary.total ?? 0), 0);

  const typeText = transactionType === "IMPORT" ? "NHẬP" : "XUẤT";

  // 2. Define Headers
  // Row 0: Main Title
  const row0 = [
    "", "", // Empty for STT, Date
    `BÁO CÁO CHI TIẾT ${typeText} THEO NGÀY`, // Merged Title
    "", "", "", "", "", "", "", "", "", // Placeholders for merge
    `TỔNG ${typeText}` // Label above the total number
  ];

  // Row 1: Column Headers
  const row1 = [
    "STT",
    "Ngày",
    "Lệnh",
    "Mã đơn hàng",
    "Khách hàng",
    "Mã hàng",
    "Số lớp",
    "Kích thước", "", "", // Spans 3 columns
    "Số lượng", // PO Amount
    "Ngày giao hàng",
    totalQuantity // The calculated total as a header
  ];

  // Row 2: Sub-headers for Dimensions
  const row2 = [
    "", "", "", "", "", "", "", // Empty for row-spanned cols
    "Dài", "Rộng", "Cao",
    "", "", ""
  ];

  // 3. Flatten Data
  const dataRows: any[] = [];
  let stt = 1;

  dailySummary.forEach((day) => {
    day.summaryPerFinishedGood.forEach((fgSummary: any) => {
      const fg = fgSummary.finishedGood;
      const mo = fg.manufacturingOrder;
      const poItem = mo?.purchaseOrderItem;

      const row = [
        stt++,
        fmtDate(day.date),
        mo?.code ?? "-",
        safeGet(poItem, "subPurchaseOrder.purchaseOrder.code"),
        safeGet(poItem, "subPurchaseOrder.purchaseOrder.customer.code"),
        safeGet(poItem, "ware.code"),
        safeGet(poItem, "ware.fluteCombination.code"),
        safeGet(poItem, "ware.wareLength"),
        safeGet(poItem, "ware.wareWidth"),
        safeGet(poItem, "ware.wareHeight"),
        poItem?.amount ?? 0,
        fmtDate(safeGet(poItem, "subPurchaseOrder.deliveryDate", "")),
        fgSummary.total ?? 0 // The daily/item total
      ];
      dataRows.push(row);
    });
  });

  // 4. Create Worksheet
  const wsData = [row0, row1, row2, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // 5. Define Merges
  // Format: s (start), e (end), r (row), c (col)
  ws["!merges"] = [
    // --- Row 0 (Titles) ---
    // Main Title: Merges from Col 2 (Lệnh) to Col 11 (DelDate)
    { s: { r: 0, c: 2 }, e: { r: 0, c: 11 } },

    // --- Row 1 & 2 (Headers) ---
    // Vertical Merges (Row Span 2)
    { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } }, // STT
    { s: { r: 1, c: 1 }, e: { r: 2, c: 1 } }, // Ngày
    { s: { r: 1, c: 2 }, e: { r: 2, c: 2 } }, // Lệnh
    { s: { r: 1, c: 3 }, e: { r: 2, c: 3 } }, // Mã ĐH
    { s: { r: 1, c: 4 }, e: { r: 2, c: 4 } }, // Khách
    { s: { r: 1, c: 5 }, e: { r: 2, c: 5 } }, // Mã hàng
    { s: { r: 1, c: 6 }, e: { r: 2, c: 6 } }, // Số lớp
    { s: { r: 1, c: 10 }, e: { r: 2, c: 10 } }, // Số lượng
    { s: { r: 1, c: 11 }, e: { r: 2, c: 11 } }, // Ngày giao
    { s: { r: 1, c: 12 }, e: { r: 2, c: 12 } }, // Total Value

    // Horizontal Merge (Dimensions)
    { s: { r: 1, c: 7 }, e: { r: 1, c: 9 } }, // Kích thước spans Dài, Rộng, Cao
  ];

  // 6. Set Column Widths
  ws["!cols"] = [
    { wch: 5 },  // STT
    { wch: 12 }, // Date
    { wch: 10 }, // MO
    { wch: 15 }, // PO
    { wch: 15 }, // Customer
    { wch: 15 }, // Item
    { wch: 8 },  // Flute
    { wch: 6 },  // L
    { wch: 6 },  // W
    { wch: 6 },  // H
    { wch: 10 }, // Amount
    { wch: 12 }, // DelDate
    { wch: 12 }, // Total
  ];

  // 7. Export
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Báo cáo ${typeText}`);

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  saveAs(blob, `Bao_cao_${typeText}_${new Date().toISOString().split('T')[0]}.xlsx`);
};