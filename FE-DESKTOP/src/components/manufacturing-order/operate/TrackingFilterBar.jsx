"use client";

import React from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { FILTER_STATUSES } from "./trackingUtils";
import { useGetAllCustomersQuery } from "@/service/api/customerApiSlice";

export default function TrackingFilterBar({
  searchTerm,
  setSearchTerm,
  corrugatorLineFilter,
  setCorrugatorLineFilter,
  paperWidthFilter,
  setPaperWidthFilter,
  stepAmount,
  setStepAmount,
  statusFilter,
  setStatusFilter,
  customerFilter,
  setCustomerFilter,
  activeTab,
  onClearFilters,
  onPageChange, // Hàm để reset page về 1 khi filter
}) {
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    if (onPageChange) onPageChange();
  };

  // Fetch danh sách khách hàng từ API
  const { data: customerData, isLoading: isLoadingCustomer } =
    useGetAllCustomersQuery();
  const customers = customerData?.data ?? [];

  const isCorrugatorTab = activeTab === "corrugator";

  return (
    <Form className="mb-4 p-3 border rounded shadow-sm bg-light">
      <Row className="mb-3">
        {/* Search - chung cho tất cả tabs */}
        <Col xs={12} md={isCorrugatorTab ? 3 : 4} className="mb-3 mb-md-0">
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
                onChange={handleFilterChange(setSearchTerm)}
                style={{ border: "none", boxShadow: "none" }}
              />
            </div>
          </Form.Group>
        </Col>

        {/* Corrugator Line Filter - chỉ cho tab Sóng */}
        {isCorrugatorTab && (
          <Col xs={12} md={2} className="mb-3 mb-md-0">
            <Form.Group>
              <Form.Label className="fw-bold">Dàn</Form.Label>
              <Form.Select
                value={
                  corrugatorLineFilter === "all"
                    ? "all"
                    : String(corrugatorLineFilter)
                }
                onChange={handleFilterChange(setCorrugatorLineFilter)}
              >
                <option value="all">-- Tất cả --</option>
                <option value="5">Dàn 5L</option>
                <option value="7">Dàn 7L</option>
              </Form.Select>
            </Form.Group>
          </Col>
        )}

        {/* Paper Width Filter - chỉ cho tab Sóng */}
        {isCorrugatorTab && (
          <Col xs={12} md={2} className="mb-3 mb-md-0">
            <Form.Group>
              <Form.Label className="fw-bold">Khổ giấy</Form.Label>
              <Form.Control
                type="number"
                placeholder="Nhập khổ giấy..."
                value={paperWidthFilter}
                onChange={handleFilterChange(setPaperWidthFilter)}
              />
            </Form.Group>
          </Col>
        )}

        {/* Status Filter - chung cho tất cả tabs */}
        <Col xs={12} md={isCorrugatorTab ? 2 : 2} className="mb-3 mb-md-0">
          <Form.Group>
            <Form.Label className="fw-bold">Trạng thái</Form.Label>
            <Form.Select
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
            >
              <option value="all">-- Tất cả --</option>
              {FILTER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Customer Filter - chỉ cho tabs khác Sóng */}
        {!isCorrugatorTab && (
          <Col xs={12} md={3} className="mb-3 mb-md-0">
            <Form.Group>
              <Form.Label className="fw-bold">Khách hàng</Form.Label>
              <Form.Select
                value={customerFilter}
                onChange={handleFilterChange(setCustomerFilter)}
                disabled={isLoadingCustomer}
              >
                <option value="all">-- Tất cả --</option>
                {customers.map((customer) => (
                  <option key={customer.code} value={customer.code}>
                    {customer.code} - {customer.name || customer.code}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        )}

        {/* Step Amount - chung cho tất cả tabs */}
        <Col xs={12} md={isCorrugatorTab ? 2 : 2} className="mb-3 mb-md-0">
          <Form.Group>
            <Form.Label className="fw-bold">Bước nhảy</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={stepAmount}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 100;
                setStepAmount(val);
              }}
              placeholder="100"
            />
          </Form.Group>
        </Col>

        {/* Clear Button */}
        <Col
          xs={12}
          md={isCorrugatorTab ? 1 : 1}
          className="d-flex align-items-end justify-content-end"
        >
          <Button
            variant="outline-danger"
            onClick={onClearFilters}
            style={{ alignItems: "center" }}
          >
            <i className="bi bi-funnel-fill me"></i>
            {/* Xóa bộ lọc */}
            {/* Xóa  */}
          </Button>
        </Col>
      </Row>
    </Form>
  );
}