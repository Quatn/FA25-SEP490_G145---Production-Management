"use client";

import React from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { useGetAllFluteCombinationQuery } from "@/service/api/fluteCombinationApiSlice";
import { useGetAllCustomersQuery } from "@/service/api/customerApiSlice";

export default function MOTrackingFilters({
  filters,
  onFilterChange,
  onClearFilters,
}) {
  // Fetch FluteCombination list
  const { data: fluteCombinationData, isLoading: isLoadingFluteCombination } =
    useGetAllFluteCombinationQuery();

  // Fetch Customer list
  const { data: customerData, isLoading: isLoadingCustomer } =
    useGetAllCustomersQuery();

  const fluteCombinations = fluteCombinationData?.data ?? [];
  const customers = customerData?.data ?? [];

  const handleInputChange = (e) => {
    onFilterChange(e.target.name, e.target.value);
  };

  return (
    <Form className="mb-4 p-3 border rounded shadow-sm bg-light">
      <Row className="mb-3">
        {/* Search */}
        <Col xs={12} md={4} className="mb-3 mb-md-0">
          <Form.Group>
            <Form.Label className="fw-bold">Tìm kiếm</Form.Label>
            <div className="d-flex align-items-center border rounded bg-white">
              <span className="px-2">
                <i className="bi bi-search"></i>
              </span>
              <Form.Control
                type="text"
                placeholder="Lệnh SX hoặc Mã Hàng..."
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleInputChange}
                style={{ border: "none", boxShadow: "none" }}
              />
            </div>
          </Form.Group>
        </Col>

        {/* Loại sóng (FluteCombination) Filter */}
        <Col xs={12} md={2} className="mb-3 mb-md-0">
          <Form.Group>
            <Form.Label className="fw-bold">Loại sóng</Form.Label>
            <Form.Select
              name="fluteCombinationFilter"
              value={filters.fluteCombinationFilter || "all"}
              onChange={handleInputChange}
              disabled={isLoadingFluteCombination}
            >
              <option value="all">-- Tất cả --</option>
              {fluteCombinations.map((fc) => (
                <option key={fc._id || fc.id} value={fc._id || fc.id}>
                  {fc.code}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Manufacturing Date From */}
        <Col xs={12} md={3} className="mb-3 mb-md-0">
          <Form.Group>
            <Form.Label className="fw-bold">Ngày Nhận (Từ)</Form.Label>
            <Form.Control
              type="date"
              name="manufacturingDateFrom"
              value={filters.manufacturingDateFrom}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>

        {/* Manufacturing Date To */}
        <Col xs={12} md={3} className="mb-3 mb-md-0">
          <Form.Group>
            <Form.Label className="fw-bold">Ngày Nhận (Đến)</Form.Label>
            <Form.Control
              type="date"
              name="manufacturingDateTo"
              value={filters.manufacturingDateTo}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3 mb-md-0">
        {/* Khách hàng (Customer) Filter */}
        <Col xs={12} md={4} className="mb-3 mb-md-0">
          <Form.Group>
            <Form.Label className="fw-bold">Khách hàng</Form.Label>
            <Form.Select
              name="customerFilter"
              value={filters.customerFilter || "all"}
              onChange={handleInputChange}
              disabled={isLoadingCustomer}
            >
              <option value="all">-- Tất cả --</option>
              {customers.map((customer) => (
                <option
                  key={customer._id || customer.id}
                  value={customer._id || customer.id}
                >
                  {customer.code} - {customer.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Status Filter */}
        <Col xs={12} md={2} className="mb-3 mb-md-0">
          <Form.Group>
            <Form.Label className="fw-bold">Trạng thái</Form.Label>
            <Form.Select
              name="overallStatusFilter"
              value={filters.overallStatusFilter}
              onChange={handleInputChange}
            >
              <option value="all">-- Tất cả --</option>
              <option value="NOTSTARTED">Chờ</option>
              <option value="RUNNING">Chạy</option>
              <option value="COMPLETED">Hoàn Thành</option>
              <option value="CANCELLED">Hủy</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Dàn (CorrugatorLine) Filter */}
        <Col xs={12} md={2} className="mb-3 mb-md-0">
          <Form.Group>
            <Form.Label className="fw-bold">Dàn</Form.Label>
            <Form.Select
              name="corrugatorLineFilter"
              value={filters.corrugatorLineFilter || "all"}
              onChange={handleInputChange}
            >
              <option value="all">-- Tất cả --</option>
              <option value="5">Dàn 5L</option>
              <option value="7">Dàn 7L</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Clear Button */}
        <Col
          xs={12}
          md={2}
          className="d-flex align-items-end justify-content-center"
        >
          <Button
            variant="outline-danger"
            onClick={onClearFilters}
            className="w-100"
            style={{ alignItems: "center" }}
          >
            <i className="bi bi-funnel-fill me-2"></i>
            Xóa bộ lọc
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
