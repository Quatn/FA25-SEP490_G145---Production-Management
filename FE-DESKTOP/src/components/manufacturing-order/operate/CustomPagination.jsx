"use client";

import React from "react";
import { Button, Form } from "react-bootstrap";

// Component chọn giới hạn số hàng
function LimitSelector({
  currentLimit,
  onChangeHandler,
  isDisabled,
  limitOptions = [5, 10, 15, 20],
}) {
  return (
    <div className="d-flex align-items-center gap-2">
      <Form.Label
        className="mb-0 text-muted"
        style={{ fontSize: "0.9rem", whiteSpace: "nowrap" }}
      >
        Rows per page
      </Form.Label>
      <Form.Select
        style={{
          width: "80px",
          height: "40px",
          fontSize: "0.9rem",
          padding: "0.3rem 1.5rem 0.3rem 0.5rem",
        }}
        value={currentLimit}
        onChange={(e) => onChangeHandler(Number(e.target.value))}
        disabled={isDisabled}
      >
        {limitOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </Form.Select>
    </div>
  );
}

// Component phân trang chính
export default function CustomPagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  isFetching,
  totalItems,
  limit,
  onLimitChange,
  limitOptions = [1, 5, 10, 15], // Bạn có thể truyền options khác nhau
}) {
  return (
    <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-3">
      {/* Thông tin tổng số item */}
      <span className="text-muted" style={{ fontSize: "0.9rem" }}>
        Tổng cộng:{" "}
        <strong className="text-dark">
          {isFetching ? "..." : totalItems}
        </strong>{" "}
        mục
      </span>

      <div className="d-flex align-items-center gap-3">
        {/* Bộ chọn Limit */}
        <LimitSelector
          currentLimit={limit}
          onChangeHandler={onLimitChange}
          isDisabled={isFetching}
          limitOptions={limitOptions}
        />

        {/* Nút phân trang */}
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={!hasPrevPage || isFetching}
            aria-label="First Page"
          >
            <i className="bi bi-chevron-bar-left"></i>
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage || isFetching}
            aria-label="Previous Page"
          >
            <i className="bi bi-chevron-left"></i>
          </Button>
          <span className="fw-medium">
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage || isFetching}
            aria-label="Next Page"
          >
            <i className="bi bi-chevron-right"></i>
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNextPage || isFetching}
            aria-label="Last Page"
          >
            <i className="bi bi-chevron-bar-right"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}