"use client";

import React, { useMemo, useState, useCallback } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Container, Table, Form, Row, Col, Button } from "react-bootstrap";
import { useGetManufacturingOrderTrackingQuery } from "@/service/api/trackingManufacturingOrderApiSlice";

// Hàm format số lượng thành định dạng 1.500
const formatNumber = (num) => {
  if (num === null || num === undefined) return "-";
  return new Intl.NumberFormat("vi-VN").format(num);
};

// Hàm lấy style cho toàn bộ hàng (ROW STYLE)
const getRowStyles = (item) => {
  const baseStyle = {
    fontWeight: "500",
    color: "#000000",
    textDecoration: "none",
    backgroundColor: "white",
  };

  switch (item?.overallStatus) {
    case "COMPLETED":
      return {
        ...baseStyle,
        backgroundColor: "#c8e6c9",
        fontWeight: "600",
        color: "#2e7d32",
      };
    case "RUNNING":
      return {
        ...baseStyle,
        backgroundColor: "#fff9c4",
      };
    case "NOTSTARTED":
      return {
        ...baseStyle,
        backgroundColor: "#e3f2fd",
      };
    case "OVERCOMPLETED":
      return {
        ...baseStyle,
        backgroundColor: "#ffcdd2",
      };
    case "CANCELLED":
      return {
        ...baseStyle,
        backgroundColor: "#fbe6e8",
        textDecoration: "line-through",
        color: "#c62828",
      };
    default:
      return baseStyle;
  }
};

const SCROLL_HEADER_BG = "#e3f2fd";

const getStatus = (status) => {
  switch (status) {
    case "NOTSTARTED":
      return "Chờ";
    case "RUNNING":
      return "Chạy";
    case "COMPLETED":
      return "Hoàn Thành";
    case "PAUSED":
      return "Dừng";
    case "CANCELLED":
      return "Hủy";
    case "OVERCOMPLETED":
      return "Vượt Mức";
    default:
      return "-";
  }
};

const formatShortDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date)) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}`;
};

export default function MOTrackingNew() {
  // --- STATE ---
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [overallStatusFilter, setOverallStatusFilter] = useState("all");
  const [manufacturingDateFrom, setManufacturingDateFrom] = useState("");
  const [manufacturingDateTo, setManufacturingDateTo] = useState("");

  const toLocalISOString = (dateStr) => {
    if (!dateStr) return undefined;
    const date = new Date(dateStr);
    // Cộng thêm 1 ngày nếu bạn muốn include toàn bộ ngày đó
    return new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString();
  };

  // --- BUILD QUERY ARGS ---
  const queryArgs = useMemo(
    () => ({
      page,
      limit,
      ...(searchTerm.trim() ? { searchCode: searchTerm.trim() } : {}),
      ...(overallStatusFilter !== "all"
        ? { overallStatus: overallStatusFilter }
        : {}),
      ...(manufacturingDateFrom
        ? { manufacturingDateFrom: manufacturingDateFrom }
        : {}),
      ...(manufacturingDateTo
        ? { manufacturingDateTo: manufacturingDateTo }
        : {}),
    }),
    [
      page,
      limit,
      searchTerm,
      overallStatusFilter,
      manufacturingDateFrom,
      manufacturingDateTo,
    ]
  );

  console.log(manufacturingDateFrom);

  // --- FETCH DATA ---
  const {
    data: trackingData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetManufacturingOrderTrackingQuery(queryArgs);

  const rawDataList = useMemo(() => trackingData?.data ?? [], [trackingData]);

  console.log(rawDataList);

  // --- PAGINATION INFO ---
  const totalItems = trackingData?.totalItems ?? 0;
  const totalPages = trackingData?.totalPages ?? 1;
  const hasNextPage = trackingData?.hasNextPage ?? false;
  const hasPrevPage = trackingData?.hasPrevPage ?? false;
  const currentPage = trackingData?.page ?? 1;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);
  const rangeDisplay = `${startItem} - ${endItem} of ${totalItems}`;

  const limitOptions = [1, 2, 3, 4];

  // --- HANDLERS ---
  const handlePageChange = (newPage) => {
    let finalPage = newPage;
    if (newPage < 1) finalPage = 1;
    if (newPage > totalPages) finalPage = totalPages;
    setPage(finalPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setOverallStatusFilter("all");
    setManufacturingDateFrom("");
    setManufacturingDateTo("");
    setPage(1);
  };

  // --- FIXED HEADERS ---
  const FIXED_HEADERS = [
    "Lệnh SX",
    "Mã Hàng",
    "Sóng",
    "Dài/Khổ",
    "Rộng/CD",
    "Cao",
    "SL",
    "Trạng thái",
    "Ngày Giao",
    "Ngày Nhận",
  ];

  const amountCellStyle = { textDecoration: "underline", fontWeight: "600" };

  // --- LOADING/ERROR STATES ---
  if (isError) {
    return (
      <Container fluid className="p-4">
        <div className="alert alert-danger">
          Không thể tải dữ liệu lệnh sản xuất.
          <Button variant="link" onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <h2 className="fw-bold mb-3">Theo dõi lệnh sản xuất</h2>

      {/* ======================= FILTER SECTION ======================= */}
      <Form className="mb-4 p-3 border rounded shadow-sm bg-light">
        <Row className="mb-3">
          {/* Search */}
          <Col xs={12} md={4} className="mb-3 mb-md-0">
            <Form.Group>
              <Form.Label className="fw-bold">Tìm kiếm</Form.Label>
              <div className="d-flex align-items-center border rounded">
                <span className="px-2">
                  <i className="bi bi-search"></i>
                </span>
                <Form.Control
                  type="text"
                  placeholder="Lệnh SX hoặc Mã Hàng..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  style={{ border: "none", boxShadow: "none" }}
                />
              </div>
            </Form.Group>
          </Col>

          {/* Status Filter */}
          <Col xs={12} md={2} className="mb-3 mb-md-0">
            <Form.Group>
              <Form.Label className="fw-bold">Trạng thái</Form.Label>
              <Form.Select
                value={overallStatusFilter}
                onChange={(e) => {
                  setOverallStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">-- Tất cả --</option>
                <option value="NOTSTARTED">Chờ</option>
                <option value="RUNNING">Chạy</option>
                <option value="COMPLETED">Hoàn Thành</option>
                {/* <option value="OVERCOMPLETED">Vượt Mức</option> */}
                <option value="CANCELLED">Hủy</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Manufacturing Date From */}
          <Col xs={12} md={2} className="mb-3 mb-md-0">
            <Form.Group>
              <Form.Label className="fw-bold">Ngày Nhận (Từ)</Form.Label>
              <Form.Control
                type="date"
                value={manufacturingDateFrom}
                onChange={(e) => {
                  setManufacturingDateFrom(e.target.value);
                  setPage(1);
                }}
              />
            </Form.Group>
          </Col>

          {/* Manufacturing Date To */}
          <Col xs={12} md={2} className="mb-3 mb-md-0">
            <Form.Group>
              <Form.Label className="fw-bold">Ngày Nhận (Đến)</Form.Label>
              <Form.Control
                type="date"
                value={manufacturingDateTo}
                onChange={(e) => {
                  setManufacturingDateTo(e.target.value);
                  setPage(1);
                }}
              />
            </Form.Group>
          </Col>

          {/* Clear Button */}
          <Col
            xs={12}
            md={2}
            className="d-flex align-items-end justify-content-center"
            // className="d-flex align-items-end "
          >
            <Button
              variant="outline-danger"
              onClick={handleClearFilters}
              className="w-100"
              style={{ alignItems: "center" }}
            >
              <i className="bi bi-funnel-fill me-2"></i>
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Loading Indicator */}
      {(isLoading || isFetching) && (
        <div className="text-muted mb-3">Đang tải dữ liệu...</div>
      )}

      {/* ======================= TABLE SECTION ======================= */}
      {!isFetching && rawDataList.length > 0 && (
        <div
          className="d-block d-lg-flex"
          style={{
            border: "1px solid #dee2e6",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
                {rawDataList.map((item) => {
                  const rowStyles = getRowStyles(item);
                  const ware = item?.purchaseOrderItem?.ware;

                  return (
                    <tr key={item.id}>
                      <td className="text-center" style={{ ...rowStyles }}>
                        {item?.code || "-"}
                      </td>
                      <td style={{ ...rowStyles }}>{ware?.code || "-"}</td>
                      <td className="text-center" style={{ ...rowStyles }}>
                        {typeof ware?.fluteCombination === "object" && ware?.fluteCombination?.code
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
                          ...amountCellStyle,
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
                {rawDataList.map((item) => {
                  const rowStyles = getRowStyles(item);
                  const processes = item?.processes || [];
                  const corrugatorStatus = getStatus(
                    item?.corrugatorLineStatus || item?.overallStatus
                  );

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
                          ...(item?.corrugatorLine === 5
                            ? amountCellStyle
                            : {}),
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
                          ...(item?.corrugatorLine === 7
                            ? amountCellStyle
                            : {}),
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
                                ...(hasAmount ? amountCellStyle : {}),
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
      )}

      {/* Empty State */}
      {!isFetching && rawDataList.length === 0 && !isError && (
        <div className="text-muted text-center mt-4">
          Không có lệnh sản xuất phù hợp với bộ lọc hiện tại.
        </div>
      )}

      {/* ======================= PAGINATION SECTION ======================= */}
      {totalItems > 0 && (
        <div
          className="d-flex flex-column flex-md-row justify-content-md-end align-items-center mt-4 gap-3"
          style={{
            width: "100%",
            margin: "0",
          }}
        >
          {/* Rows per page + Range */}
          <div className="d-flex align-items-center justify-content-center justify-content-md-end gap-4 flex-wrap">
            {/* Rows per page */}
            <div className="d-flex align-items-center gap-2">
              <Form.Label
                className="mb-0 text-muted"
                style={{ fontSize: "0.9rem" }}
              >
                Rows per page
              </Form.Label>
              <Form.Select
                style={{
                  width: "80px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  padding: "6px 10px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                }}
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                disabled={isFetching}
              >
                {limitOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Form.Select>
            </div>

            {/* Range display */}
            <span
              className="text-muted"
              style={{
                fontWeight: 500,
                whiteSpace: "nowrap",
                fontSize: "0.9rem",
              }}
            >
              {rangeDisplay}
            </span>
          </div>

          {/* Pagination buttons */}
          <div className="d-flex justify-content-center justify-content-md-end gap-2 mt-3 mt-md-0 ms-md-4">
            <Button
              variant="light"
              disabled={!hasPrevPage || isFetching}
              onClick={() => handlePageChange(1)}
              style={{
                borderRadius: "8px",
                width: "40px",
                height: "40px",
                padding: 0,
                backgroundColor: "#f1f1f1",
                border: "none",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              <i className="bi bi-chevron-bar-left"></i>
            </Button>

            <Button
              variant="light"
              disabled={!hasPrevPage || isFetching}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{
                borderRadius: "8px",
                width: "40px",
                height: "40px",
                padding: 0,
                backgroundColor: "#f1f1f1",
                border: "none",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              <i className="bi bi-chevron-left"></i>
            </Button>

            <Button
              variant="light"
              disabled={!hasNextPage || isFetching}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{
                borderRadius: "8px",
                width: "40px",
                height: "40px",
                padding: 0,
                backgroundColor: "#f1f1f1",
                border: "none",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              <i className="bi bi-chevron-right"></i>
            </Button>

            <Button
              variant="light"
              disabled={!hasNextPage || isFetching}
              onClick={() => handlePageChange(totalPages)}
              style={{
                borderRadius: "8px",
                width: "40px",
                height: "40px",
                padding: 0,
                backgroundColor: "#f1f1f1",
                border: "none",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              <i className="bi bi-chevron-bar-right"></i>
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
}
