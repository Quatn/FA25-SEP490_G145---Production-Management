"use client";

import React from "react";
import { Table } from "react-bootstrap";
import {
  formatNumber,
  getRowStyles,
  getStatus,
  formatShortDate,
  SCROLL_HEADER_BG,
  FIXED_HEADERS,
  AMOUNT_CELL_STYLE,
} from "./trackingUtils";

export default function PlanningDeptView({ data, isLoading, isFetching }) {
  // Không render gì nếu đang loading và chưa có data
  if (isLoading) {
    return null;
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
          minWidth: "550px",
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
              {FIXED_HEADERS.map((header) => (
                <th
                  key={header}
                  rowSpan={2}
                  style={{ height: "75.6px", fontSize: "13.5px" }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const rowStyles = getRowStyles(item);
              const ware = item?.purchaseOrderItem?.ware;

              return (
                <tr key={item.id}>
                  <td className="text-center" style={{ ...rowStyles }}>
                    {item?.code || "-"}
                  </td>
                  <td style={{ ...rowStyles }}>{ware?.code || "-"}</td>
                  <td className="text-center" style={{ ...rowStyles }}>
                    {typeof ware?.fluteCombination === "object" &&
                    ware?.fluteCombination?.code
                      ? ware.fluteCombination.code
                      : typeof ware?.fluteCombination === "string"
                      ? "-"
                      : "-"}
                  </td>
                  <td className="text-center" style={{ ...rowStyles }}>
                    {ware?.wareLength || "-"}
                  </td>
                  <td className="text-center" style={{ ...rowStyles }}>
                    {ware?.wareWidth || "-"}
                  </td>
                  <td className="text-center" style={{ ...rowStyles }}>
                    {ware?.wareHeight || "-"}
                  </td>
                  <td
                    className="text-center"
                    style={{
                      ...rowStyles,
                      ...AMOUNT_CELL_STYLE,
                    }}
                  >
                    {formatNumber(item?.purchaseOrderItem?.amount)}
                  </td>
                  <td className="text-center" style={{ ...rowStyles }}>
                    {getStatus(item?.overallStatus)}
                  </td>
                  <td className="text-center" style={{ ...rowStyles }}>
                    {formatShortDate(item?.requestedDatetime)}
                  </td>
                  <td className="text-center" style={{ ...rowStyles }}>
                    {formatShortDate(item?.manufacturingDate)}
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
          maxWidth: "calc(100vw - 40px - 550px)",
        }}
      >
        <Table
          bordered
          hover
          style={{
            margin: 0,
            fontSize: "13.5px",
            minWidth: "1500px",
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
              <th colSpan={4} className="fw-bold">
                Quy Trình Sóng
              </th>
              <th colSpan={12} className="fw-bold">
                Công Đoạn Chế Biến
              </th>
            </tr>
            <tr>
              <th>Dàn 5L</th>
              <th>Đã SX</th>
              <th>Dàn 7L</th>
              <th>Đã SX</th>
              {Array.from({ length: 4 }).map((_, i) => (
                <React.Fragment key={`chebien-h-${i}`}>
                  <th>Công Đoạn {i + 1}</th>
                  <th>Trạng thái</th>
                  <th>Đã SX</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const rowStyles = getRowStyles(item);
              const processes = item?.processes || [];

              return (
                <tr key={`scroll-${item.id}`} className="text-center">
                  <td style={{ ...rowStyles }}>
                    {item?.corrugatorLine === 5
                      ? getStatus(item?.corrugatorProcess?.status)
                      : "-"}
                  </td>
                  <td
                    style={{
                      ...rowStyles,
                      ...(item?.corrugatorLine === 5 ? AMOUNT_CELL_STYLE : {}),
                    }}
                  >
                    {item?.corrugatorLine === 5
                      ? formatNumber(
                          item?.corrugatorProcess?.manufacturedAmount
                        )
                      : "-"}
                  </td>
                  <td
                    style={{
                      ...rowStyles,
                    }}
                  >
                    {item?.corrugatorLine === 7
                      ? getStatus(item?.corrugatorProcess?.status)
                      : "-"}
                  </td>
                  <td
                    style={{
                      ...rowStyles,
                      ...(item?.corrugatorLine === 7 ? AMOUNT_CELL_STYLE : {}),
                    }}
                  >
                    {item?.corrugatorLine === 7
                      ? formatNumber(
                          item?.corrugatorProcess?.manufacturedAmount
                        )
                      : "-"}
                  </td>
                  {Array.from({ length: 4 }).map((_, i) => {
                    const pitem = processes[i];
                    const hasAmount =
                      pitem?.manufacturedAmount !== undefined &&
                      pitem?.manufacturedAmount !== null;

                    return (
                      <React.Fragment key={`pitem-${i}`}>
                        <td style={rowStyles}>
                          {pitem?.processDefinition?.name || "-"}
                        </td>
                        <td style={rowStyles}>
                          {getStatus(pitem?.status)}
                        </td>
                        <td
                          style={{
                            ...rowStyles,
                            ...(hasAmount ? AMOUNT_CELL_STYLE : {}),
                          }}
                        >
                          {hasAmount
                            ? formatNumber(pitem?.manufacturedAmount)
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