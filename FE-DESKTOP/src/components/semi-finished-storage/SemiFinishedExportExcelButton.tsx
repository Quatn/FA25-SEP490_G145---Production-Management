import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportDailyReportToExcel = (data: any[], date: string) => {
  const worksheetData = data.map((item, index) => ({
    STT: index + 1,
    "Mã lệnh": item.semiFinishedGood?.manufacturingOrder?.code ?? "-",
    "Thao tác": item.transactionType == "IMPORT" ? "Nhập" : "Xuất",
    "Số lượng": item.transactionType == "IMPORT" ? item.finalQuantity - item.initialQuantity : item.initialQuantity - item.finalQuantity,
    "Tồn đầu": item.initialQuantity,
    "Tồn cuối": item.finalQuantity,
    "Ghi chú": item.note ?? "",
    "Nhân viên": item.employee?.name ?? "",
    "Thời gian": new Date(item.createdAt).toLocaleString("vi-VN"),
  }));

  const ws = XLSX.utils.json_to_sheet(worksheetData);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Báo cáo ${date}`);

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  saveAs(blob, `Bao_cao_ngay_${date}.xlsx`);
};

export default exportDailyReportToExcel;