"use client";

import React from "react";
import { Table } from "react-bootstrap";
import {
  formatNumber,
  getRowStyles,
  getStatus,
  formatShortDate,
  AMOUNT_CELL_STYLE,
} from "./trackingUtils";

// ==============================================================================
// HƯỚNG DẪN: ĐÂY LÀ TAB DÀNH CHO BỘ PHẬN SÓNG
// ==============================================================================
//
// Chào bạn, đây là component dành riêng cho tab "Bộ Phận Sóng".
//
// 1. DỮ LIỆU:
//    - Bạn nhận được prop `data` (chính là `rawDataList` từ file cha).
//    - `data` là một MẢNG (array) các Lệnh Sản Xuất (Manufacturing Orders).
//    - Mỗi `item` trong `data` có cấu trúc đầy đủ như bạn đã dùng ở `PlanningDeptView`.
//
// 2. NHIỆM VỤ:
//    - Bạn không cần hiển thị toàn bộ 2 cái bảng (cố định + cuộn) như bên Kế Hoạch.
//    - Bạn chỉ cần TẠO MỘT BẢNG MỚI (Table) đơn giản hơn, chỉ chứa các cột
//      mà Bộ Phận Sóng quan tâm.
//
// 3. CÁC CỘT GỢI Ý CHO BỘ PHẬN SÓNG:
//    - Lệnh SX: `item.code`
//    - Mã Hàng: `item.purchaseOrderItem.ware.code`
//    - Sóng (Flute): `item.purchaseOrderItem.ware.fluteCombination.code`
//    - Dàn (Line): `item.corrugatorLine` (sẽ là 5 hoặc 7)
//    - Trạng thái Sóng: `getStatus(item.corrugatorProcess?.status)`
//    - SL Lệnh: `formatNumber(item.purchaseOrderItem.amount)`
//    - SL Đã Chạy: `formatNumber(item.corrugatorProcess?.manufacturedAmount)`
//    - Ngày Nhận: `formatShortDate(item.manufacturingDate)`
//    - ... (Bạn có thể thêm/bớt các cột khác từ `item`)
//
// 4. HÀNH ĐỘNG:
//    - Hãy xóa `div` placeholder bên dưới và thay bằng component <Table>
//      của `react-bootstrap` để hiển thị dữ liệu.
//    - Bạn có thể dùng lại các hàm helpers (formatNumber, getStatus...)
//      và `getRowStyles(item)` để tô màu hàng y như cũ.
//
// Chúc bạn thành công!
// ==============================================================================

export default function CorrugatorDeptView({ data, isLoading, isFetching }) {
  if (isLoading) {
    return null; // Component cha sẽ lo việc hiển thị loading
  }

  // Nếu không fetching và không có data, component cha sẽ hiển thị Empty State
  if (!isFetching && data.length === 0) {
    return null;
  }

  // LỌC DỮ LIỆU:
  // Ví dụ: Nếu bộ phận Sóng chỉ muốn xem các lệnh CHƯA HOÀN THÀNH
  // Bạn có thể lọc lại `data` ở đây.
  const filteredDataForCorrugator = data.filter(
    (item) =>
      item.overallStatus === "RUNNING" || item.overallStatus === "NOTSTARTED"
  );
  // *** Lưu ý: Nếu bạn muốn xem tất cả, hãy dùng `data` thay vì `filteredDataForCorrugator` ***

  return (
    <div
      style={{
        border: "1px solid #dee2e6",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        opacity: isFetching ? 0.6 : 1, // Làm mờ khi đang fetch
      }}
    >
      {/* =================================================================== */}
      {/* TODO: XÓA DIV DƯỚI VÀ THAY BẰNG BẢNG CHO BỘ PHẬN SÓNG               */}
      {/* =================================================================== */}
      <Table bordered hover responsive style={{ fontSize: "13.5px" }}>
        <thead
          className="text-center align-middle"
          style={{ backgroundColor: "#e3f2fd", fontWeight: "bold" }}
        >
          <tr>
            <th>Lệnh SX</th>
            <th>Ngày Nhận</th>
            <th>Mã Hàng</th>
            <th>Sóng</th>
            <th>Dàn</th>
            <th>Trạng thái Sóng</th>
            <th>SL Lệnh</th>
            <th>SL Đã Chạy</th>
          </tr>
        </thead>
        <tbody>
          {/* Sử dụng `data` hoặc `filteredDataForCorrugator` ở đây.
            Ví dụ này dùng `data` (hiển thị tất cả).
          */}
          {data.map((item) => {
            const rowStyles = getRowStyles(item);
            const ware = item?.purchaseOrderItem?.ware;

            return (
              <tr key={item.id} style={rowStyles}>
                <td className="text-center">{item.code}</td>
                <td className="text-center">
                  {formatShortDate(item.manufacturingDate)}
                </td>
                <td>{ware?.code || "-"}</td>
                <td className="text-center">
                  {typeof ware?.fluteCombination === "object" &&
                  ware?.fluteCombination?.code
                    ? ware.fluteCombination.code
                    : "-"}
                </td>
                <td className="text-center fw-bold">
                  {item.corrugatorLine || "-"}
                </td>
                <td className="text-center">
                  {getStatus(item.corrugatorProcess?.status)}
                </td>
                <td className="text-center" style={AMOUNT_CELL_STYLE}>
                  {formatNumber(item.purchaseOrderItem?.amount)}
                </td>
                <td className="text-center" style={AMOUNT_CELL_STYLE}>
                  {formatNumber(item.corrugatorProcess?.manufacturedAmount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}