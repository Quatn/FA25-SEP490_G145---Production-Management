"use client";

import React, { useMemo, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Container, Tabs, Tab, Button } from "react-bootstrap";
import { useGetManufacturingOrderTrackingQuery } from "@/service/api/trackingManufacturingOrderApiSlice";

// Tách các components con
import MOTrackingFilters from "./MOTrackingFilters";
import MOTrackingPagination from "./MOTrackingPagination";
import PlanningDeptView from "./PlanningDeptView";
import CorrugatorDeptView from "./CorrugatorDeptView";

export default function MOTrackingPage() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState("planning"); // State cho tab
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(1);
  const [filters, setFilters] = useState({
    searchTerm: "",
    overallStatusFilter: "all",
    fluteCombinationFilter: "all",
    corrugatorLineFilter: "all",
    customerFilter: "",
    manufacturingDateFrom: "",
    manufacturingDateTo: "",
  });

  // --- BUILD QUERY ARGS ---
  const queryArgs = useMemo(
    () => ({
      page,
      limit,
      ...(filters.searchTerm.trim()
        ? { searchCode: filters.searchTerm.trim() }
        : {}),
      ...(filters.overallStatusFilter !== "all"
        ? { overallStatus: filters.overallStatusFilter }
        : {}),
      ...(filters.fluteCombinationFilter !== "all"
        ? { fluteCombination: filters.fluteCombinationFilter }
        : {}),
      ...(filters.corrugatorLineFilter !== "all"
        ? { corrugatorLine: Number(filters.corrugatorLineFilter) }
        : {}),
      ...(filters.customerFilter.trim()
        ? { customer: filters.customerFilter.trim() }
        : {}),
      ...(filters.manufacturingDateFrom
        ? { manufacturingDateFrom: filters.manufacturingDateFrom }
        : {}),
      ...(filters.manufacturingDateTo
        ? { manufacturingDateTo: filters.manufacturingDateTo }
        : {}),
    }),
    [page, limit, filters]
  );

  // --- FETCH DATA ---
  const {
    data: trackingData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetManufacturingOrderTrackingQuery(queryArgs);

  const rawDataList = useMemo(() => trackingData?.data ?? [], [trackingData]);

  // --- PAGINATION INFO ---
  const paginationInfo = useMemo(
    () => ({
      totalItems: trackingData?.totalItems ?? 0,
      totalPages: trackingData?.totalPages ?? 1,
      hasNextPage: trackingData?.hasNextPage ?? false,
      hasPrevPage: trackingData?.hasPrevPage ?? false,
      currentPage: trackingData?.page ?? 1,
      limit: limit,
      isFetching: isFetching,
    }),
    [trackingData, limit, isFetching]
  );

  // --- HANDLERS ---
  const handlePageChange = (newPage) => {
    let finalPage = newPage;
    if (newPage < 1) finalPage = 1;
    if (newPage > paginationInfo.totalPages) finalPage = paginationInfo.totalPages;
    setPage(finalPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: "",
      overallStatusFilter: "all",
      fluteCombinationFilter: "all",
      corrugatorLineFilter: "all",
      customerFilter: "",
      manufacturingDateFrom: "",
      manufacturingDateTo: "",
    });
    setPage(1);
  };

  // --- RENDER ---
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
      <MOTrackingFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Loading Indicator */}
      {(isLoading || isFetching) && !isError && (
        <div className="text-muted mb-3">Đang tải dữ liệu...</div>
      )}

      {/* ======================= TABS SECTION ======================= */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
        fill
      >
        <Tab eventKey="planning" title="Phòng Kế Hoạch">
          <PlanningDeptView
            data={rawDataList}
            isLoading={isLoading}
            isFetching={isFetching}
          />
        </Tab>
        <Tab eventKey="corrugator" title="Bộ Phận Sóng">
          <CorrugatorDeptView
            data={rawDataList}
            isLoading={isLoading}
            isFetching={isFetching}
          />
        </Tab>

        <Tab eventKey="finishing" title="Bộ Phận Chế Biến">
          <CorrugatorDeptView
            data={rawDataList}
            isLoading={isLoading}
            isFetching={isFetching}
          />
        </Tab>
        
        {/* Thêm các tab khác ở đây nếu cần */}
        {/* <Tab eventKey="finishing" title="Bộ Phận Chế Biến">
          ...
        </Tab> */}
      </Tabs>

      {/* ======================= PAGINATION SECTION ======================= */}
      {!isError && paginationInfo.totalItems > 0 && (
        <MOTrackingPagination
          paginationInfo={paginationInfo}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      {/* Empty State (khi không loading và không có data) */}
      {!isFetching && !isLoading && rawDataList.length === 0 && !isError && (
        <div className="text-muted text-center mt-5 p-4 border rounded">
          Không có lệnh sản xuất phù hợp với bộ lọc hiện tại.
        </div>
      )}
    </Container>
  );
}