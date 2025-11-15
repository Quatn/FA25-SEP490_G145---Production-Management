"use client";
import React, { useState, useMemo } from "react";
import { Container, Tabs, Tab } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

// Import các component của từng Tab
import CorrugatorTab from "./CorrugatorTab";
import PrintingTab from "./PrintingTab";
import TrackingFilterBar from "./TrackingFilterBar";
import { useGetManufacturingOrderTrackingQuery } from "@/service/api/trackingManufacturingOrderApiSlice";

export default function WaveTrackingPage() {
  // State cho filter - sẽ được truyền xuống các tab
  const [searchTerm, setSearchTerm] = useState("");
  const [corrugatorLineFilter, setCorrugatorLineFilter] = useState("all");
  const [paperWidthFilter, setPaperWidthFilter] = useState("");
  const [stepAmount, setStepAmount] = useState(100);
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("corrugator");

  // --- BUILD QUERY ARGS ---
  const queryArgs = useMemo(
    () => ({
      page: 1,
      limit: 1000,
      ...(searchTerm.trim() ? { searchCode: searchTerm.trim() } : {}),
      ...(corrugatorLineFilter !== "all"
        ? { corrugatorLine: Number(corrugatorLineFilter) }
        : {}),
      ...(paperWidthFilter.trim() && !isNaN(Number(paperWidthFilter))
        ? { paperWidth: Number(paperWidthFilter) }
        : {}),
    }),
    [searchTerm, corrugatorLineFilter, paperWidthFilter]
  );

  // --- FETCH DATA FOR PROCESS TYPES ---
  const {
    data: trackingData,
    isLoading: isLoadingProcesses,
    isFetching: isFetchingProcesses,
    refetch: refetchProcesses,
  } = useGetManufacturingOrderTrackingQuery(queryArgs);

  const rawDataList = useMemo(() => trackingData?.data ?? [], [trackingData]);

  // --- GET UNIQUE PROCESS TYPES ---
  const processTypes = useMemo(() => {
    const typeMap = new Map();
    rawDataList.forEach((order) => {
      if (Array.isArray(order.processes)) {
        order.processes.forEach((process) => {
          const processCode = process.processDefinition?.code;
          const processName = process.processDefinition?.name;
          if (processCode && !typeMap.has(processCode)) {
            typeMap.set(processCode, {
              code: processCode,
              name: processName || processCode,
            });
          }
        });
      }
    });
    // Thứ tự ưu tiên: In, Bế, Bó, Dán
    const orderPriority = ["IN", "BE", "BO", "DAN"];
    
    // Sắp xếp theo thứ tự ưu tiên
    return Array.from(typeMap.values()).sort((a, b) => {
      const indexA = orderPriority.indexOf(a.code);
      const indexB = orderPriority.indexOf(b.code);
      
      // Nếu cả hai đều có trong danh sách ưu tiên, sắp xếp theo thứ tự
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // Nếu chỉ một trong hai có trong danh sách, ưu tiên nó
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      // Nếu cả hai đều không có trong danh sách, sắp xếp theo code
      return a.code.localeCompare(b.code);
    });
  }, [rawDataList]);

  // --- FILTER PROCESSES BY TYPE ---
  const getProcessesByType = (processCode) => {
    const processes = [];
    rawDataList.forEach((order) => {
      if (Array.isArray(order.processes)) {
        order.processes.forEach((process) => {
          if (process.processDefinition?.code === processCode) {
            processes.push(process);
          }
        });
      }
    });
    return processes;
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setCorrugatorLineFilter("all");
    setPaperWidthFilter("");
    setStatusFilter("all");
    setCustomerFilter("all");
  };

  return (
    <Container fluid className="p-4">
      <h2 className="fw-bold mb-3">Trạng thái của lệnh sản xuất</h2>

      {/* Filter Bar - ở trên tabs */}
      <TrackingFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        corrugatorLineFilter={corrugatorLineFilter}
        setCorrugatorLineFilter={setCorrugatorLineFilter}
        paperWidthFilter={paperWidthFilter}
        setPaperWidthFilter={setPaperWidthFilter}
        stepAmount={stepAmount}
        setStepAmount={setStepAmount}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        customerFilter={customerFilter}
        setCustomerFilter={setCustomerFilter}
        activeTab={activeTab}
        onClearFilters={handleClearFilters}
        onPageChange={() => {}}
      />

      {/* Tabs - ở dưới filter */}
      <Tabs
        defaultActiveKey="corrugator"
        id="manufacturing-tabs"
        className="mb-3"
        mountOnEnter // Tải component khi tab được chọn
        onSelect={(key) => setActiveTab(key || "corrugator")}
      >
        <Tab eventKey="corrugator" title="Sóng">
          {/* Nội dung tab Sóng (2 bảng) */}
          <CorrugatorTab
            searchTerm={searchTerm}
            corrugatorLineFilter={corrugatorLineFilter}
            paperWidthFilter={paperWidthFilter}
            stepAmount={stepAmount}
            statusFilter={statusFilter}
          />
        </Tab>

        {/* Tabs cho từng quy trình - chỉ hiển thị nếu có processes */}
        {processTypes.map((processType) => {
          const processes = getProcessesByType(processType.code);
          // Chỉ hiển thị tab nếu có processes
          if (processes.length === 0) return null;

          return (
            <Tab
              key={processType.code}
              eventKey={processType.code}
              title={processType.name}
            >
              <PrintingTab
                processCode={processType.code}
                searchTerm={searchTerm}
                stepAmount={stepAmount}
                statusFilter={statusFilter}
                customerFilter={customerFilter}
                rawDataList={rawDataList}
                refetch={refetchProcesses}
                isFetching={isFetchingProcesses}
              />
            </Tab>
          );
        })}
      </Tabs>
    </Container>
  );
}
