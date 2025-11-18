"use client";

import React from "react";
import { Table } from "react-bootstrap";
import {
  formatNumber,
  getRowStyles,
  getStatus,
  formatShortDate,
  AMOUNT_CELL_STYLE,
} from "./trackingUtils"; // <-- Import file mới

export default function CorrugatorDeptView({ data, isLoading, isFetching }) {
  if (isLoading) {
    return null; // Component cha sẽ lo việc hiển thị loading
  }

  // Nếu không fetching và không có data, component cha sẽ hiển thị Empty State
  if (!isFetching && data.length === 0) {
    return null;
  }

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
      {/* TODO: XÓA DIV DƯỚI VÀ THAY BẰNG BẢNG CHO BỘ PHẬN SÓNG               */}
      {/* =================================================================== */}
      <Table bordered hover responsive style={{ fontSize: "13.5px" }}>
        <thead
          className="text-center align-middle"
          style={{ backgroundColor: "#e3f2fd", fontWeight: "bold" }}
        >
          <tr>
            <th>Lệnh SX</th>
            <th>Khách Hàng</th>
            <th>Mã Hàng</th>
            <th>Sóng</th>
            <th>Trạng Thái</th>
            <th>Tấm Chặt</th>
            <th>Số Lượng Đã SX</th>
            <th>Mét SX</th>
            <th>Khổ Giấy</th>
            <th>Giấy Mặt SP</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const rowStyles = getRowStyles(item);
            const ware = item?.purchaseOrderItem?.ware;
            const customer =
              item?.purchaseOrderItem?.subPurchaseOrder?.purchaseOrder
                ?.customer;

            return (
              <tr key={item.id} style={rowStyles}>
                <td className="text-center" style={{ ...rowStyles }}>
                  {item.code}
                </td>
                <td className="text-center" style={{ ...rowStyles }}>
                  {customer?.code || "-"}
                </td>
                <td style={{ ...rowStyles, width: "150px" }}>
                  {ware?.code || "-"}
                </td>
                <td className="text-center" style={{ ...rowStyles }}>
                  {typeof ware?.fluteCombination === "object" &&
                  ware?.fluteCombination?.code
                    ? ware.fluteCombination.code
                    : "-"}
                </td>
                <td className="text-center" style={{ ...rowStyles }}>
                  {getStatus(item.corrugatorProcess?.status)}
                </td>
                <td
                  className="text-center"
                  style={{ ...AMOUNT_CELL_STYLE, ...rowStyles }}
                >
                  {formatNumber(item.purchaseOrderItem?.longitudinalCutCount)}
                </td>
                <td
                  className="text-center"
                  style={{ ...AMOUNT_CELL_STYLE, ...rowStyles }}
                >
                  {formatNumber(item.corrugatorProcess?.manufacturedAmount)}
                </td>
                <td
                  className="text-center"
                  style={{ ...AMOUNT_CELL_STYLE, ...rowStyles }}
                >
                  {formatNumber(item.purchaseOrderItem?.runningLength)}
                </td>
                <td
                  className="text-center"
                  style={{ ...AMOUNT_CELL_STYLE, color: "blue", ...rowStyles }}
                >
                  {formatNumber(ware?.paperWidth || "-")}
                </td>
                <td className="text-center" style={{ ...rowStyles }}>
                  {ware?.faceLayerPaperType || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}