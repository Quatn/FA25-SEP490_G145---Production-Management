"use client";

import React from "react";
import { Form, Button } from "react-bootstrap";

export default function MOTrackingPagination({
  paginationInfo,
  onPageChange,
  onLimitChange,
}) {
  const {
    currentPage,
    totalPages,
    limit,
    totalItems,
    hasPrevPage,
    hasNextPage,
    isFetching,
  } = paginationInfo;

  const limitOptions = [5, 10, 15, 20]; // Lấy từ file gốc của bạn

  // Tính toán rangeDisplay
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);
  const rangeDisplay = `${startItem} - ${endItem} of ${totalItems}`;

  return (
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
            onChange={(e) => onLimitChange(Number(e.target.value))}
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
          onClick={() => onPageChange(1)}
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
          onClick={() => onPageChange(currentPage - 1)}
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
          onClick={() => onPageChange(currentPage + 1)}
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
          onClick={() => onPageChange(totalPages)}
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
  );
}
