"use client";

import React, { useMemo, useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  Container,
  Table,
  Form,
  Button,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import {
  useGetManufacturingOrderTrackingQuery,
  useUpdateManufacturingOrderProcessMutation,
} from "@/service/api/trackingManufacturingOrderApiSlice";
import CustomPagination from "./CustomPagination";
import {
  formatNumber,
  getStatus,
  EDITABLE_STATUSES,
  formatShortDate,
} from "./trackingUtils";

// Helper function để lấy row style từ process status
const getProcessRowStyles = (processStatus) => {
  const baseStyle = {
    fontWeight: "500",
    color: "#000000",
    textDecoration: "none",
    backgroundColor: "white",
  };

  switch (processStatus) {
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
    case "PAUSED":
      return {
        ...baseStyle,
        backgroundColor: "#ffe0b2",
        color: "#e65100",
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

export default function PrintingTab({
  processCode,
  searchTerm: propSearchTerm = "",
  stepAmount: propStepAmount = 100,
  statusFilter: propStatusFilter = "all",
  customerFilter: propCustomerFilter = "all",
  rawDataList = [],
  refetch,
  isFetching = false,
}) {
  // --- STATE ---
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [toasts, setToasts] = useState([]);
  const [pendingAmounts, setPendingAmounts] = useState({});
  const [pendingStatuses, setPendingStatuses] = useState({});

  // Reset page khi filter thay đổi
  useEffect(() => {
    setPage(1);
  }, [propSearchTerm, propStatusFilter, propCustomerFilter]);

  // --- FLATTEN PROCESSES ---
  const allProcesses = useMemo(() => {
    const processes = [];
    rawDataList.forEach((order) => {
      if (Array.isArray(order.processes)) {
        order.processes.forEach((process) => {
          processes.push({
            ...process,
            manufacturingOrder: order,
            moCode: order.code,
            moId: order.id,
          });
        });
      }
    });
    return processes;
  }, [rawDataList]);

  // --- FILTER PROCESSES BY TYPE, STATUS, AND CUSTOMER ---
  const processes = useMemo(() => {
    let filtered = allProcesses.filter(
      (process) => process.processDefinition?.code === processCode
    );

    // Filter theo trạng thái
    if (propStatusFilter !== "all") {
      filtered = filtered.filter((process) => {
        const currentStatus = pendingStatuses[process.id] ?? process.status;
        return currentStatus === propStatusFilter;
      });
    }

    // Filter theo khách hàng
    if (propCustomerFilter !== "all") {
      filtered = filtered.filter((process) => {
        const customer =
          process.manufacturingOrder?.purchaseOrderItem?.subPurchaseOrder
            ?.purchaseOrder?.customer;
        const customerCode =
          typeof customer === "object" && customer !== null
            ? customer.code
            : null;
        return customerCode === propCustomerFilter;
      });
    }

    return filtered;
  }, [
    allProcesses,
    processCode,
    propStatusFilter,
    propCustomerFilter,
    pendingStatuses,
  ]);

  // --- PAGINATION ---
  const totalItems = processes.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedProcesses = processes.slice(start, end);

  const limitOptions = [5, 10, 15, 20];

  // --- HELPER: SHOW TOAST ---
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, message, type, show: true },
    ]);
    setTimeout(() => {
      setToasts((currentToasts) =>
        currentToasts.map((toast) =>
          toast.id === id ? { ...toast, show: false } : toast
        )
      );
      setTimeout(() => {
        setToasts((currentToasts) =>
          currentToasts.filter((toast) => toast.id !== id)
        );
      }, 300);
    }, 5000);
  };

  const closeToast = (id) => {
    setToasts((currentToasts) =>
      currentToasts.map((toast) =>
        toast.id === id ? { ...toast, show: false } : toast
      )
    );
    setTimeout(() => {
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== id)
      );
    }, 300);
  };

  // --- MUTATION ---
  const [updateProcess, { isLoading: isUpdating }] =
    useUpdateManufacturingOrderProcessMutation();

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

  const handleChangePendingAmount = (
    processId,
    currentAmount,
    delta,
    originalAmount
  ) => {
    if (!processId) return;
    const newAmount = Math.max(0, currentAmount + delta);

    // Nếu số lượng mới bằng số lượng ban đầu, xóa khỏi pendingAmounts
    if (newAmount === originalAmount) {
      setPendingAmounts((prev) => {
        const newState = { ...prev };
        delete newState[processId];
        return newState;
      });
    } else {
      setPendingAmounts((prev) => ({
        ...prev,
        [processId]: newAmount,
      }));
    }
  };

  const handleChangePendingStatus = (processId, newStatus, originalStatus) => {
    if (!processId) return;

    if (newStatus === originalStatus) {
      setPendingStatuses((prev) => {
        const newState = { ...prev };
        delete newState[processId];
        return newState;
      });
    } else {
      // Ngược lại, thêm/cập nhật nó
      setPendingStatuses((prev) => ({
        ...prev,
        [processId]: newStatus,
      }));
    }
  };

  const handleSave = async (
    processId,
    manufacturingOrderId,
    originalAmount
  ) => {
    const newAmount = pendingAmounts[processId];
    const newStatus = pendingStatuses[processId];

    // Kiểm tra xem số lượng có thay đổi thực sự không (không bằng số lượng ban đầu)
    const hasPendingAmount =
      newAmount !== undefined && newAmount !== originalAmount;
    const hasPendingStatus = newStatus !== undefined;

    if (!hasPendingAmount && !hasPendingStatus) {
      showToast("Không có thay đổi để lưu.", "info");
      return;
    }

    const body = {
      processId,
      manufacturingOrderId,
    };
    if (hasPendingAmount) {
      body.manufacturedAmount = newAmount;
    }
    if (hasPendingStatus) {
      body.status = newStatus;
    }

    try {
      const result = await updateProcess(body).unwrap();
      showToast(result?.message || "Lưu thay đổi thành công!", "success");

      if (hasPendingAmount) {
        setPendingAmounts((prev) => {
          const newState = { ...prev };
          delete newState[processId];
          return newState;
        });
      }
      if (hasPendingStatus) {
        setPendingStatuses((prev) => {
          const newState = { ...prev };
          delete newState[processId];
          return newState;
        });
      }

      if (refetch) refetch();
    } catch (error) {
      console.error("Error saving changes:", error);
      showToast(
        error.data?.message || "Có lỗi xảy ra khi lưu thay đổi",
        "danger"
      );
    }
  };

  // --- TABLE HEADERS ---
  const getTableHeaders = () => {
    const baseHeaders = ["Lệnh SX"];

    // Thêm cột Khách hàng cho các tabs khác (trừ Sóng - không áp dụng ở đây vì đây là PrintingTab)
    // Tất cả các tabs process đều có cột Khách hàng
    baseHeaders.push("Khách hàng");

    baseHeaders.push("Số lượng", "Đã SX", "Trạng thái");

    // Thêm cột đặc biệt cho tab IN
    if (processCode === "IN") {
      baseHeaders.push("Loại máy in", "Màu 1", "Màu 2", "Màu 3", "Màu 4");
    }

    baseHeaders.push("Lưu", "Ngày nhận");

    return baseHeaders;
  };

  const TABLE_HEADERS = getTableHeaders();

  const amountCellStyle = { textDecoration: "underline", fontWeight: "600" };

  if (!processCode) {
    return (
      <div className="text-muted text-center p-4 border rounded">
        Vui lòng chọn quy trình.
      </div>
    );
  }

  if (processes.length === 0) {
    return (
      <div className="text-muted text-center p-4 border rounded">
        Không có quy trình {processCode} nào.
      </div>
    );
  }

  return (
    <Container fluid className="p-0">
      {/* ======================= TOAST CONTAINER ======================= */}
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 9999 }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            onClose={() => closeToast(toast.id)}
            show={toast.show}
            delay={5000}
            autohide
            bg={
              toast.type === "danger"
                ? "danger"
                : toast.type === "info"
                ? "info"
                : "success"
            }
            className="text-white"
          >
            <Toast.Header closeButton={true}>
              <strong className="me-auto">
                {toast.type === "danger"
                  ? "Lỗi"
                  : toast.type === "info"
                  ? "Thông báo"
                  : "Thành công"}
              </strong>
            </Toast.Header>
            <Toast.Body>{toast.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>

      {/* ======================= TABLE ======================= */}
      <div
        style={{
          border: "1px solid #dee2e6",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Table
          bordered
          hover={false}
          responsive
          style={{ margin: 0, fontSize: "13.5px" }}
        >
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
              {TABLE_HEADERS.map((header) => (
                <th key={header} style={{ fontSize: "13.5px" }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedProcesses.map((processItem) => {
              const process = processItem;
              const processId = process.id;
              const originalAmount = process.manufacturedAmount ?? 0;
              const originalStatus = process.status;

              const currentAmount = pendingAmounts[processId] ?? originalAmount;

              const currentStatus =
                pendingStatuses[processId] ?? originalStatus;

              // Kiểm tra xem có thay đổi thực sự so với giá trị ban đầu không
              const hasAmountChange =
                pendingAmounts[processId] !== undefined &&
                pendingAmounts[processId] !== originalAmount;
              const hasStatusChange =
                pendingStatuses[processId] !== undefined &&
                pendingStatuses[processId] !== originalStatus;

              const hasPendingChanges = hasAmountChange || hasStatusChange;

              const moCode = processItem.moCode || "-";
              const manufacturingDate =
                processItem.manufacturingOrder?.manufacturingDate;
              const totalAmount =
                processItem.manufacturingOrder?.purchaseOrderItem?.amount || 0;

              // Lấy thông tin khách hàng
              const customer =
                processItem.manufacturingOrder?.purchaseOrderItem
                  ?.subPurchaseOrder?.purchaseOrder?.customer;
              const customerName =
                typeof customer === "object" && customer !== null
                  ? customer.code || "-"
                  : "-";

              // Lấy thông tin in ấn (chỉ cho tab IN)
              const ware =
                processItem.manufacturingOrder?.purchaseOrderItem?.ware;
              const typeOfPrinter = ware?.typeOfPrinter || "-";
              // Trích xuất mã màu từ mảng object
              const colorCodes = Array.isArray(ware?.printColors)
                ? ware.printColors.map((colorObj) => colorObj.code || "-")
                : [];

              // Gán vào 4 biến riêng biệt, điền "-" nếu không đủ
              const [color1 = "-", color2 = "-", color3 = "-", color4 = "-"] =
                colorCodes;

              const rowStyles = getProcessRowStyles(currentStatus);
              const cellBackgroundColor = rowStyles.backgroundColor || "white";

              return (
                <tr
                  key={processId}
                  className="align-middle"
                  style={{
                    ...rowStyles,
                    backgroundColor: cellBackgroundColor,
                  }}
                >
                  <td
                    className="text-center"
                    style={{
                      backgroundColor: cellBackgroundColor,
                    }}
                  >
                    {moCode}
                  </td>
                  {/* Cột Khách hàng - hiển thị cho tất cả các tabs process */}
                  <td
                    className="text-center"
                    style={{
                      ...amountCellStyle,
                      color: "red",
                      backgroundColor: cellBackgroundColor,
                    }}
                  >
                    {customerName}
                  </td>
                  <td
                    className="text-center"
                    style={{
                      ...amountCellStyle,
                      color: "red",
                      backgroundColor: cellBackgroundColor,
                    }}
                  >
                    {formatNumber(totalAmount)}
                  </td>
                  <td
                    className="text-center"
                    style={{
                      padding: "4px",
                      backgroundColor: cellBackgroundColor,
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{ minWidth: "120px" }}
                    >
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-1"
                        onClick={() =>
                          handleChangePendingAmount(
                            processId,
                            currentAmount,
                            -propStepAmount,
                            originalAmount
                          )
                        }
                        disabled={isUpdating || originalStatus === "COMPLETED"}
                        style={{ textDecoration: "none" }}
                        title={`Giảm ${propStepAmount}`}
                      >
                        <i className="bi bi-dash-circle fs-5"></i>
                      </Button>
                      <span
                        className="mx-2"
                        style={{
                          ...amountCellStyle,
                          fontSize: "1rem",
                          minWidth: "50px",
                          textAlign: "center",
                          color: hasAmountChange ? "#0d6efd" : "#000",
                          borderBottom: hasAmountChange
                            ? "2px solid #0d6efd"
                            : "none",
                        }}
                      >
                        {formatNumber(currentAmount)}
                      </span>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-success p-1"
                        onClick={() =>
                          handleChangePendingAmount(
                            processId,
                            currentAmount,
                            propStepAmount,
                            originalAmount
                          )
                        }
                        disabled={isUpdating || originalStatus === "COMPLETED"}
                        style={{ textDecoration: "none" }}
                        title={`Tăng ${propStepAmount}`}
                      >
                        <i className="bi bi-plus-circle fs-5"></i>
                      </Button>
                    </div>
                  </td>
                  <td
                    className="text-center"
                    style={{
                      minWidth: "130px",
                      backgroundColor: cellBackgroundColor,
                    }}
                  >
                    <Form.Select
                      size="sm"
                      value={currentStatus}
                      onChange={(e) =>
                        handleChangePendingStatus(
                          processId,
                          e.target.value,
                          originalStatus
                        )
                      }
                      disabled={isUpdating || originalStatus === "COMPLETED"}
                      style={{
                        fontWeight: 600,
                        borderColor: hasPendingChanges ? "#0d6efd" : "default",
                        backgroundColor: cellBackgroundColor,
                      }}
                    >
                      {/* 1. Hiển thị tất cả các trạng thái có thể chỉnh sửa */}
                      {EDITABLE_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                      {!EDITABLE_STATUSES.some(
                        (s) => s.value === originalStatus
                      ) && (
                        <>
                          {originalStatus === "NOTSTARTED" ? (
                            <option value="NOTSTARTED">
                              {getStatus("NOTSTARTED")}
                            </option>
                          ) : (
                            <option value={originalStatus} disabled>
                              {getStatus(originalStatus)}
                            </option>
                          )}
                        </>
                      )}
                    </Form.Select>
                  </td>
                  {/* Cột Loại máy in - chỉ cho tab IN */}
                  {processCode === "IN" && (
                    <td
                      className="text-center"
                      style={{
                        backgroundColor: cellBackgroundColor,
                      }}
                    >
                      {typeOfPrinter}
                    </td>
                  )}
                  {/* Cột Màu 1 - 4 - chỉ cho tab IN */}
                  {processCode === "IN" && (
                    <>
                      <td
                        className="text-center"
                        style={{ backgroundColor: cellBackgroundColor }}
                      >
                         {color1}
                      </td>
                      <td
                        className="text-center"
                        style={{ backgroundColor: cellBackgroundColor }}
                      >
                        {color2}
                      </td>
                      <td
                        className="text-center"
                        style={{ backgroundColor: cellBackgroundColor }}
                      >
                        {color3}
                      </td>
                      <td
                        className="text-center"
                        style={{ backgroundColor: cellBackgroundColor }}
                      >
                         {color4}
                      </td>
                    </>
                  )}
                  <td
                    className="text-center"
                    style={{
                      minWidth: "100px",
                      backgroundColor: cellBackgroundColor,
                    }}
                  >
                    <Button
                      variant={
                        hasPendingChanges ? "success" : "outline-secondary"
                      }
                      size="sm"
                      onClick={() =>
                        handleSave(processId, processItem.moId, originalAmount)
                      }
                      disabled={!hasPendingChanges || isUpdating}
                      className="d-flex align-items-center justify-content-center gap-1"
                      style={{
                        minWidth: "30px",
                        fontWeight: hasPendingChanges ? 600 : 400,
                        boxShadow: hasPendingChanges
                          ? "0 2px 4px rgba(25, 135, 84, 0.3)"
                          : "none",
                        transition: "all 0.2s ease",
                        margin: "auto",
                      }}
                      title="Lưu thay đổi"
                    >
                      <i className="bi bi-save-fill"></i>
                      {hasPendingChanges && <span>Lưu</span>}
                    </Button>
                  </td>
                  <td
                    className="text-center"
                    style={{
                      backgroundColor: cellBackgroundColor,
                    }}
                  >
                    {formatShortDate(manufacturingDate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      <CustomPagination
        currentPage={page}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        onPageChange={handlePageChange}
        isFetching={isFetching}
        totalItems={totalItems}
        limit={limit}
        onLimitChange={handleLimitChange}
        limitOptions={limitOptions}
      />
    </Container>
  );
}
