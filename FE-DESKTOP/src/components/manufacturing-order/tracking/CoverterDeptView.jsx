"use client";

import React from "react";
import { Table } from "react-bootstrap";
import {
  formatNumber,
  getRowStyles,
  getStatus,
  formatShortDate,
  SCROLL_HEADER_BG,
  AMOUNT_CELL_STYLE,
} from "./trackingUtils";

export default function CoverterDeptView({ data, isLoading, isFetching }) {
  if (isLoading) {
    return null; // Component cha sẽ lo việc hiển thị loading
  }

  // Nếu không fetching và không có data, component cha sẽ hiển thị Empty State
  if (!isFetching && data.length === 0) {
    return null;
  }

  return (
    <div
      className="d-block d-lg-flex"
      style={{
        border: "1px solid #dee2e6",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        opacity: isFetching ? 0.6 : 1, // Làm mờ khi đang fetch
      }}
    >
      {/* FIXED COLUMNS */}
      <div
        style={{
          flexShrink: 0,
          backgroundColor: "#fff",
          minWidth: "400px",
        }}
      >
        <Table bordered hover style={{ margin: 0, fontSize: "13.5px" }}>
          <thead
            className="text-center align-middle"
            style={{
              fontSize: "14px",
              backgroundColor: "#f8f9fa",
              color: "black",
              fontWeight: "bold",
            }}
          >
            <tr>
              <th rowSpan={2} style={{ height: "75.6px", fontSize: "13.5px" }}>
                Lệnh SX
              </th>
              <th rowSpan={2} style={{ height: "75.6px", fontSize: "13.5px" }}>
                Khách Hàng
              </th>
              <th rowSpan={2} style={{ height: "75.6px", fontSize: "13.5px" }}>
                Mã Hàng
              </th>
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
                <tr key={item.id || item._id}>
                  <td className="text-center" style={{ ...rowStyles }}>
                    {item?.code || "-"}
                  </td>
                  <td className="text-center" style={{ ...rowStyles }}>
                    {typeof customer === "object" && customer?.code
                      ? customer.code
                      : typeof customer === "string"
                      ? customer
                      : "-"}
                  </td>
                  <td style={{ ...rowStyles, width: "150px" }}>
                    {ware?.code || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* SCROLLABLE COLUMNS */}
      <div
        style={{
          overflowX: "auto",
          flexGrow: 1,
          maxWidth: "calc(100vw - 40px - 400px)",
        }}
      >
        <Table
          bordered
          hover
          style={{
            margin: 0,
            fontSize: "13.5px",
            minWidth: "1200px",
          }}
        >
          <thead
            className="text-center align-middle"
            style={{
              fontSize: "14px",
              backgroundColor: SCROLL_HEADER_BG,
              color: "black",
            }}
          >
            <tr>
              <th colSpan={3} className="fw-bold">
                BP In Máy
              </th>
              <th colSpan={12} className="fw-bold">
                BP Chế Biến
              </th>
            </tr>
            <tr>
              <th>Máy SX</th>
              <th>Trạng thái</th>
              <th>Đã SX</th>

              <th>Công Đoạn 1</th>
              <th>Trạng thái</th>
              <th>Đã SX</th>

              <th>Công Đoạn 2</th>
              <th>Trạng thái</th>
              <th>Đã SX</th>

              <th>Công Đoạn 3</th>
              <th>Trạng thái</th>
              <th>Đã SX</th>

              <th>Công Đoạn 4</th>
              <th>Trạng thái</th>
              <th>Đã SX</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const rowStyles = getRowStyles(item);
              const ware = item?.purchaseOrderItem?.ware;
              const processes = item?.processes || [];

              // Tìm process có code "IN" (In máy)
              const inProcess = processes.find(
                (p) => p?.processDefinition?.code === "IN"
              );

              // Lấy các process chế biến (bỏ qua process IN nếu có)
              const manufacturingProcesses = processes.filter(
                (p) => p?.processDefinition?.code !== "IN"
              );

              return (
                <tr key={`scroll-${item.id || item._id}`} className="text-center">
                  {/* BP In Máy - Máy SX */}
                  <td style={{ ...rowStyles }}>
                    {ware?.typeOfPrinter || "-"}
                  </td>

                  {/* BP In Máy - Trạng thái */}
                  <td style={{ ...rowStyles }}>
                    {inProcess ? getStatus(inProcess?.status) : "-"}
                  </td>

                  {/* BP In Máy - Đã SX */}
                  <td
                    style={
                      inProcess?.manufacturedAmount !== undefined &&
                      inProcess?.manufacturedAmount !== null
                        ? { ...AMOUNT_CELL_STYLE, ...rowStyles }
                        : { ...rowStyles }
                    }
                  >
                    {inProcess?.manufacturedAmount !== undefined &&
                    inProcess?.manufacturedAmount !== null
                      ? formatNumber(inProcess.manufacturedAmount)
                      : "-"}
                  </td>

                  {/* BP Chế Biến - 4 công đoạn */}
                  {Array.from({ length: 4 }).map((_, i) => {
                    const process = manufacturingProcesses[i];
                    const hasAmount =
                      process?.manufacturedAmount !== undefined &&
                      process?.manufacturedAmount !== null;

                    return (
                      <React.Fragment key={`process-${i}`}>
                        {/* Tên công đoạn */}
                        <td style={{ ...rowStyles }}>
                          {process?.processDefinition?.name || "-"}
                        </td>

                        {/* Trạng thái */}
                        <td style={{ ...rowStyles }}>
                          {process ? getStatus(process?.status) : "-"}
                        </td>

                        {/* Đã SX */}
                        <td
                          style={
                            hasAmount
                              ? { ...AMOUNT_CELL_STYLE, ...rowStyles }
                              : { ...rowStyles }
                          }
                        >
                          {hasAmount
                            ? formatNumber(process.manufacturedAmount)
                            : "-"}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
