"use client";

import React, { useMemo, useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  Container,
  Table,
  Form,
  Row,
  Col,
  Button,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import {
  useGetManufacturingOrderTrackingQuery,
  useRunCorrugatorProcessesMutation,
  useUpdateCorrugatorProcessMutation,
  useUpdateManyCorrugatorProcessesMutation,
} from "@/service/api/trackingManufacturingOrderApiSlice";
import CustomPagination from "./CustomPagination";
import {
  formatNumber,
  getRowStyles,
  getStatus,
  EDITABLE_STATUSES,
  formatShortDate,
} from "./trackingUtils";

export default function CorrugatorTab({
  searchTerm: propSearchTerm = "",
  corrugatorLineFilter: propCorrugatorLineFilter = "all",
  paperWidthFilter: propPaperWidthFilter = "",
  stepAmount: propStepAmount = 100,
  statusFilter: propStatusFilter = "all",
}) {
  // --- STATE ---
  const [activePage, setActivePage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [activeLimit, setActiveLimit] = useState(5);
  const [pendingLimit, setPendingLimit] = useState(5);
  const [selectedMoIds, setSelectedMoIds] = useState(new Set());
  const [isUpdatingStatusMode, setIsUpdatingStatusMode] = useState(false);
  const [isMarkingCompletedMode, setIsMarkingCompletedMode] = useState(false);
  const [selectedMoIdsForComplete, setSelectedMoIdsForComplete] =
    useState(new Set());
  const [toasts, setToasts] = useState([]);
  const [pendingAmounts, setPendingAmounts] = useState({});
  const [pendingStatuses, setPendingStatuses] = useState({});
  // State để lưu trạng thái được chọn cho từng process khi ở chế độ edit
  const [selectedStatusesForRows, setSelectedStatusesForRows] = useState({});

  // --- BUILD QUERY ARGS ---
  const queryArgs = useMemo(
    () => ({
      page: 1,
      limit: 1000,
      ...(propSearchTerm.trim() ? { searchCode: propSearchTerm.trim() } : {}),
      ...(propCorrugatorLineFilter !== "all"
        ? { corrugatorLine: Number(propCorrugatorLineFilter) }
        : {}),
      ...(propPaperWidthFilter.trim() && !isNaN(Number(propPaperWidthFilter))
        ? { paperWidth: Number(propPaperWidthFilter) }
        : {}),
    }),
    [propSearchTerm, propCorrugatorLineFilter, propPaperWidthFilter]
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

  // Reset page khi filter thay đổi
  useEffect(() => {
    setActivePage(1);
    setPendingPage(1);
  }, [propSearchTerm, propCorrugatorLineFilter, propPaperWidthFilter, propStatusFilter]);

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

  // --- FILTER DATA ---
  // Bảng 1: Hiển thị tất cả các trạng thái TRỪ NOTSTARTED (bao gồm cả CANCELLED, COMPLETED, OVERCOMPLETED)
  const activeProcesses = useMemo(() => {
    let filtered = rawDataList.filter((item) => {
      const corrugatorStatus =
        typeof item?.corrugatorProcess === "object" &&
        item?.corrugatorProcess !== null
          ? item.corrugatorProcess.status
          : null;

      const moId = item.id;
      const hasPendingStatus = Object.keys(pendingStatuses).includes(moId);

      // Hiển thị tất cả các trạng thái trừ NOTSTARTED
      // Bao gồm: RUNNING, PAUSED, COMPLETED, CANCELLED, OVERCOMPLETED
      // Hoặc các item có pendingStatus (đang được chỉnh sửa)
      return (
        (corrugatorStatus !== null && corrugatorStatus !== "NOTSTARTED") ||
        hasPendingStatus
      );
    });

    // Filter theo statusFilter nếu được chọn
    if (propStatusFilter !== "all") {
      filtered = filtered.filter((item) => {
        const moId = item.id;
        const currentStatus = pendingStatuses[moId] ?? item.corrugatorProcess?.status;
        return currentStatus === propStatusFilter;
      });
    }

    const start = (activePage - 1) * activeLimit;
    const end = start + activeLimit;
    return filtered.slice(start, end);
  }, [rawDataList, activePage, activeLimit, pendingStatuses, propStatusFilter]);

  const activeTotalItems = useMemo(() => {
    let filtered = rawDataList.filter((item) => {
      const corrugatorStatus =
        typeof item?.corrugatorProcess === "object" &&
        item?.corrugatorProcess !== null
          ? item.corrugatorProcess.status
          : null;

      const moId = item.id;
      const hasPendingStatus = Object.keys(pendingStatuses).includes(moId);

      return (
        (corrugatorStatus !== null && corrugatorStatus !== "NOTSTARTED") ||
        hasPendingStatus
      );
    });

    // Filter theo statusFilter nếu được chọn
    if (propStatusFilter !== "all") {
      filtered = filtered.filter((item) => {
        const moId = item.id;
        const currentStatus = pendingStatuses[moId] ?? item.corrugatorProcess?.status;
        return currentStatus === propStatusFilter;
      });
    }

    return filtered.length;
  }, [rawDataList, pendingStatuses, propStatusFilter]);

  // Bảng 2: Chỉ hiển thị NOTSTARTED
  const pendingProcesses = useMemo(() => {
    let filtered = rawDataList.filter((item) => {
      const corrugatorStatus =
        typeof item?.corrugatorProcess === "object" &&
        item?.corrugatorProcess !== null
          ? item.corrugatorProcess.status
          : null;
      // Chỉ hiển thị NOTSTARTED và không có trong pendingStatuses (đã được chuyển sang active)
      return (
        corrugatorStatus === "NOTSTARTED" &&
        !Object.keys(pendingStatuses).includes(item.id)
      );
    });

    // Filter theo statusFilter - chỉ hiển thị NOTSTARTED nếu filter là "all" hoặc "NOTSTARTED"
    if (propStatusFilter !== "all" && propStatusFilter !== "NOTSTARTED") {
      filtered = [];
    }

    const start = (pendingPage - 1) * pendingLimit;
    const end = start + pendingLimit;
    return filtered.slice(start, end);
  }, [rawDataList, pendingPage, pendingLimit, pendingStatuses, propStatusFilter]);

  const pendingTotalItems = useMemo(() => {
    let filtered = rawDataList.filter((item) => {
      const corrugatorStatus =
        typeof item?.corrugatorProcess === "object" &&
        item?.corrugatorProcess !== null
          ? item.corrugatorProcess.status
          : null;
      return (
        corrugatorStatus === "NOTSTARTED" &&
        !Object.keys(pendingStatuses).includes(item.id)
      );
    });

    // Filter theo statusFilter - chỉ hiển thị NOTSTARTED nếu filter là "all" hoặc "NOTSTARTED"
    if (propStatusFilter !== "all" && propStatusFilter !== "NOTSTARTED") {
      filtered = [];
    }

    return filtered.length;
  }, [rawDataList, pendingStatuses, propStatusFilter]);

  // --- MUTATION ---
  const [runCorrugatorProcesses, { isLoading: isRunning }] =
    useRunCorrugatorProcessesMutation();
  const [updateCorrugatorProcess, { isLoading: isUpdating }] =
    useUpdateCorrugatorProcessMutation();
  const [updateManyCorrugatorProcesses, { isLoading: isUpdatingMany }] =
    useUpdateManyCorrugatorProcessesMutation();

  // --- PAGINATION INFO ---
  const activeTotalPages = Math.ceil(activeTotalItems / activeLimit) || 1;
  const activeHasNextPage = activePage < activeTotalPages;
  const activeHasPrevPage = activePage > 1;

  const pendingTotalPages = Math.ceil(pendingTotalItems / pendingLimit) || 1;
  const pendingHasNextPage = pendingPage < pendingTotalPages;
  const pendingHasPrevPage = pendingPage > 1;

  const limitOptions = [1, 5, 10, 15];

  // --- HANDLERS ---
  const handleActivePageChange = (newPage) => {
    let finalPage = newPage;
    if (newPage < 1) finalPage = 1;
    if (newPage > activeTotalPages) finalPage = activeTotalPages;
    setActivePage(finalPage);
  };

  const handlePendingPageChange = (newPage) => {
    let finalPage = newPage;
    if (newPage < 1) finalPage = 1;
    if (newPage > pendingTotalPages) finalPage = pendingTotalPages;
    setPendingPage(finalPage);
  };

  const handleActiveLimitChange = (newLimit) => {
    setActiveLimit(newLimit);
    setActivePage(1);
  };

  const handlePendingLimitChange = (newLimit) => {
    setPendingLimit(newLimit);
    setPendingPage(1);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedMoIds(new Set(pendingProcesses.map((item) => item.id)));
    } else {
      setSelectedMoIds(new Set());
    }
  };

  const handleSelectItem = (moId, checked) => {
    const newSelected = new Set(selectedMoIds);
    if (checked) {
      newSelected.add(moId);
    } else {
      newSelected.delete(moId);
    }
    setSelectedMoIds(newSelected);
  };

  const handleRunSelected = async () => {
    if (selectedMoIds.size === 0) {
      showToast("Vui lòng chọn ít nhất một lệnh sản xuất", "danger");
      return;
    }

    try {
      const result = await runCorrugatorProcesses({
        moIds: Array.from(selectedMoIds),
      }).unwrap();
      setSelectedMoIds(new Set());
      showToast(result?.message || "Chuyển trạng thái thành công!", "success");
      refetch();
    } catch (error) {
      console.error("Error running processes:", error);
      showToast(
        error.data?.message || "Có lỗi xảy ra khi chuyển trạng thái",
        "danger"
      );
    }
  };

  const handleStartUpdateStatus = () => {
    setIsUpdatingStatusMode(true);
    setSelectedStatusesForRows({});
    // Tắt chế độ mark as completed nếu đang bật
    setIsMarkingCompletedMode(false);
    setSelectedMoIdsForComplete(new Set());
  };

  const handleCancelUpdateStatus = () => {
    setIsUpdatingStatusMode(false);
    setSelectedStatusesForRows({});
  };

  const handleStartMarkAsCompleted = () => {
    setIsMarkingCompletedMode(true);
    setSelectedMoIdsForComplete(new Set());
    // Tắt chế độ update status nếu đang bật
    setIsUpdatingStatusMode(false);
    setSelectedStatusesForRows({});
  };

  const handleCancelMarkAsCompleted = () => {
    setIsMarkingCompletedMode(false);
    setSelectedMoIdsForComplete(new Set());
  };

  const handleSelectProcessForComplete = (moId, checked) => {
    const newSelected = new Set(selectedMoIdsForComplete);
    if (checked) {
      newSelected.add(moId);
    } else {
      newSelected.delete(moId);
    }
    setSelectedMoIdsForComplete(newSelected);
  };

  const handleSelectAllMosForComplete = (checked) => {
    if (checked) {
      const allMoIds = activeProcesses
        .map((item) => {
          if (item.corrugatorProcess?.status !== "COMPLETED") {
            return item.id;
          }
          return null;
        })
        .filter((id) => id);
      setSelectedMoIdsForComplete(new Set(allMoIds));
    } else {
      setSelectedMoIdsForComplete(new Set());
    }
  };

  // Handler để cập nhật trạng thái cho một hàng cụ thể
  const handleRowStatusChange = (moId, newStatus) => {
    setSelectedStatusesForRows((prev) => ({
      ...prev,
      [moId]: newStatus, // [SỬA] Key bằng moId
    }));
  };

  // Handler để xác nhận và cập nhật tất cả các trạng thái đã chọn
  const handleConfirmUpdateManyStatus = async () => {
    // Lọc ra các process có trạng thái đã chọn và khác với trạng thái hiện tại
    const moIdsToUpdate = Object.keys(selectedStatusesForRows).filter(
      (id) => {
        const selectedStatus = selectedStatusesForRows[id];
        if (!selectedStatus) return false;

        // Tìm process tương ứng để so sánh trạng thái hiện tại
        const item = activeProcesses.find((p) => p.id === id);
        if (!item) return false;

        const currentStatus = item.corrugatorProcess?.status;
        return selectedStatus !== currentStatus;
      }
    );

    if (moIdsToUpdate.length === 0) {
      showToast(
        "Vui lòng chọn trạng thái mới cho ít nhất một quy trình",
        "danger"
      );
      return;
    }

    try {
      const updatePromises = moIdsToUpdate.map((moId) =>
        updateCorrugatorProcess({
          moId: moId,
          status: selectedStatusesForRows[moId],
        }).unwrap()
      );

      await Promise.all(updatePromises);
      setIsUpdatingStatusMode(false);
      setSelectedStatusesForRows({});
      showToast(
        `Đã cập nhật ${moIdsToUpdate.length} quy trình sóng thành công!`,
        "success"
      );
      refetch();
    } catch (error) {
      console.error("Error updating processes:", error);
      showToast(
        error.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái",
        "danger"
      );
    }
  };

  // Handler để xác nhận và đánh dấu nhiều process là hoàn thành
  const handleConfirmMarkAsCompleted = async () => {
    if (selectedMoIdsForComplete.size === 0) {
      showToast(
        "Vui lòng chọn ít nhất một quy trình để đánh dấu hoàn thành",
        "danger"
      );
      return;
    }

    const moIdsArray = Array.from(selectedMoIdsForComplete);
    const results = [];
    const failedItems = [];

    try {
      // Update từng process và lưu kết quả
      for (const moId of moIdsArray) {
        try {
          await updateCorrugatorProcess({
            moId: moId,
            status: "COMPLETED",
          }).unwrap();
          results.push({ moId, success: true });
        } catch (error) {
          // Tìm tên lệnh sản xuất từ moId trong rawDataList (toàn bộ dữ liệu)
          const item = rawDataList.find((p) => p.id === moId);
          const moCode = item?.code || moId;
          failedItems.push(moCode);
          results.push({ moId, success: false, error, moCode });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      const failedCount = results.filter((r) => !r.success).length;

      // Hiển thị thông báo chi tiết
      if (failedCount > 0) {
        const failedCodes = failedItems.join(", ");
        showToast(
          `Đã đánh dấu hoàn thành ${successCount} quy trình. ${failedCount} quy trình thất bại: ${failedCodes}`,
          "warning"
        );
      } else {
        showToast(
          `Đã đánh dấu hoàn thành ${successCount} quy trình thành công!`,
          "success"
        );
      }

      setIsMarkingCompletedMode(false);
      setSelectedMoIdsForComplete(new Set());
      refetch();
    } catch (error) {
      console.error("Error marking processes as completed:", error);
      showToast(
        error.data?.message || "Có lỗi xảy ra khi đánh dấu hoàn thành",
        "danger"
      );
    }
  };

  const handleChangePendingAmount = (
    moId,
    currentAmount,
    delta
  ) => {
    if (!moId) return;
    const newAmount = Math.max(0, currentAmount + delta);

    setPendingAmounts((prev) => ({
      ...prev,
      [moId]: newAmount,
    }));
  };

  const handleChangePendingStatus = (corrugatorProcessId, newStatus) => {
    if (!corrugatorProcessId) return;

    setPendingStatuses((prev) => ({
      ...prev,
      [corrugatorProcessId]: newStatus,
    }));
  };

  const handleSave = async (moId) => {
    const newAmount = pendingAmounts[moId];
    const newStatus = pendingStatuses[moId];

    const hasPendingAmount = newAmount !== undefined;
    const hasPendingStatus = newStatus !== undefined;

    if (!hasPendingAmount && !hasPendingStatus) {
      showToast("Không có thay đổi để lưu.", "info");
      return;
    }

    const body = { moId: moId };
    if (hasPendingAmount) {
      body.manufacturedAmount = newAmount;
    }
    if (hasPendingStatus) {
      body.status = newStatus;
    }

    try {
      const result = await updateCorrugatorProcess(body).unwrap();
      showToast(result?.message || "Lưu thay đổi thành công!", "success");

      if (hasPendingAmount) {
        setPendingAmounts((prev) => {
          const newState = { ...prev };
          delete newState[moId];
          return newState;
        });
      }
      if (hasPendingStatus) {
        setPendingStatuses((prev) => {
          const newState = { ...prev };
          delete newState[moId];
          return newState;
        });
      }

      refetch();
    } catch (error) {
      console.error("Error saving changes:", error);
      showToast(
        error.data?.message || "Có lỗi xảy ra khi lưu thay đổi",
        "danger"
      );
    }
  };

  // --- TABLE HEADERS ---
  const TABLE_HEADERS_ACTIVE = [
    "Lệnh SX",
    "Sóng",
    "Khổ gia công",
    "Cắt dài gia công",
    "Nắp/ Cánh SP",
    "Lề biên",
    "Part SX",
    "Tấm chặt",
    "Mét SX",
    "Trạng thái",
    "Đã SX",
    "Hành Động",
    "Ngày Nhận",
    "Khổ giấy",
    "Giấy mặt SP",
  ];

  const TABLE_HEADERS_PENDING = [
    "Lệnh SX",
    "Sóng",
    "Dài/Khổ",
    "Rộng/CD",
    "Cao",
    "Khổ gia công",
    "Cắt dài gia công",
    "Nắp/ Cánh SP",
    "Lề biên",
    "Part SX",
    "Tấm chặt",
    "Ngày Nhận",
    "Khổ giấy",
    "Giấy mặt SP",
  ];

  const amountCellStyle = { textDecoration: "underline", fontWeight: "600" };

  // --- LOADING/ERROR STATES ---
  if (isError) {
    return (
      <Container fluid className="p-4">
        <div className="alert alert-danger">
          Không thể tải dữ liệu quy trình sóng.
          <Button variant="link" onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
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

      {/* Loading Indicator */}
      {(isLoading || isFetching) && (
        <div className="text-muted mb-3">Đang tải dữ liệu...</div>
      )}

      {/* ======================= TABLE 1: ACTIVE PROCESSES ======================= */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">
            Quy trình sóng đang chạy/Dừng/Hoàn thành
          </h4>
          <div className="d-flex align-items-center gap-2">
            {isUpdatingStatusMode ? (
              <>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleConfirmUpdateManyStatus}
                  disabled={isUpdatingMany}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Xác nhận
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleCancelUpdateStatus}
                  disabled={isUpdatingMany}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Hủy
                </Button>
              </>
            ) : isMarkingCompletedMode ? (
              <>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleConfirmMarkAsCompleted}
                  disabled={
                    isUpdatingMany || selectedMoIdsForComplete.size === 0
                  }
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Xác nhận
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleCancelMarkAsCompleted}
                  disabled={isUpdatingMany}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Hủy
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleStartUpdateStatus}
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  Cập nhật trạng thái
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleStartMarkAsCompleted}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Đánh dấu hoàn thành
                </Button>
              </>
            )}
          </div>
        </div>
        {!isFetching && activeProcesses.length > 0 ? (
          <>
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
                hover
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
                    {isMarkingCompletedMode && (
                      <th style={{ width: "50px" }}>
                        <Form.Check
                          type="checkbox"
                          checked={
                            activeProcesses.length > 0 &&
                            activeProcesses.filter(
                              (item) =>
                                item.corrugatorProcess?.status !== "COMPLETED"
                            ).length > 0 &&
                            activeProcesses
                              .filter(
                                (item) =>
                                  item.corrugatorProcess?.status !== "COMPLETED"
                              )
                              .every((item) => {
                                // [SỬA] Check bằng moId (item.id)
                                return selectedMoIdsForComplete.has(item.id);
                              })
                          }
                          onChange={(e) =>
                            handleSelectAllMosForComplete(
                              e.target.checked
                            )
                          }
                        />
                      </th>
                    )}
                    {TABLE_HEADERS_ACTIVE.map((header) => (
                      <th key={header} style={{ fontSize: "13.5px" }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeProcesses.map((item) => {
                    const rowStyles = getRowStyles(item);
                    const ware = item?.purchaseOrderItem?.ware;
                    const corrugatorProcess =
                      typeof item?.corrugatorProcess === "object" &&
                      item?.corrugatorProcess !== null
                        ? item.corrugatorProcess
                        : null;

                    if (!corrugatorProcess) return null;

                    const moId = item.id;

                    const originalAmount =
                      corrugatorProcess.manufacturedAmount ?? 0;
                    const originalStatus = corrugatorProcess.status;

                    const currentAmount =
                      pendingAmounts[moId] ?? originalAmount;
                    const currentStatus =
                      pendingStatuses[moId] ?? originalStatus;

                    // Kiểm tra xem có thay đổi thực sự so với giá trị ban đầu không
                    const hasAmountChange =
                      pendingAmounts[moId] !== undefined &&
                      pendingAmounts[moId] !== originalAmount;
                    const hasStatusChange =
                      pendingStatuses[moId] !== undefined &&
                      pendingStatuses[moId] !== originalStatus;

                    const hasPendingChanges = hasAmountChange || hasStatusChange;

                    const isSelectedForComplete =
                      selectedMoIdsForComplete.has(moId);
                    const isCompleted =
                      corrugatorProcess?.status === "COMPLETED";

                    return (
                      <tr
                        key={item.id}
                        className="align-middle"
                        style={{
                          ...rowStyles,
                          ...(isSelectedForComplete
                            ? {
                                backgroundColor: "#bbdefb",
                                fontWeight: "600",
                              }
                            : {}),
                        }}
                      >
                        {isMarkingCompletedMode && (
                          <td className="text-center">
                            <Form.Check
                              type="checkbox"
                              checked={isSelectedForComplete}
                              onChange={(e) =>
                                handleSelectAllMosForComplete(
                                  moId,
                                  e.target.checked
                                )
                              }
                              disabled={isCompleted}
                            />
                          </td>
                        )}
                        <td className="text-center" style={{ ...rowStyles }}>
                          {item?.code || "-"}
                        </td>
                        <td
                          className="text-center"
                          style={{ ...rowStyles, color: "red" }}
                        >
                          {typeof ware?.fluteCombination === "object" &&
                          ware?.fluteCombination?.code
                            ? ware.fluteCombination.code
                            : "-"}
                        </td>
                        <td className="text-center" style={{ ...rowStyles }}>
                          {ware?.blankWidth || "-"}
                        </td>
                        <td className="text-center" style={{ ...rowStyles }}>
                          {ware?.blankLength || "-"}
                        </td>
                        <td className="text-center" style={{ ...rowStyles }}>
                          {ware?.flapLength || "-"}
                        </td>
                        <td className="text-center" style={{ ...rowStyles }}>
                          {ware?.margin || "-"}
                        </td>
                        <td className="text-center" style={{ ...rowStyles }}>
                          {ware?.crossCutCount || "-"}
                        </td>
                        <td
                          className="text-center"
                          style={{
                            ...rowStyles,
                            ...amountCellStyle,
                            color: "red",
                          }}
                        >
                          {formatNumber(
                            item?.purchaseOrderItem?.longitudinalCutCount
                          )}
                        </td>
                        <td
                          className="text-center"
                          style={{
                            ...rowStyles,
                            ...amountCellStyle,
                            color: "red",
                          }}
                        >
                          {formatNumber(item?.purchaseOrderItem?.runningLength)}
                        </td>
                        <td
                          className="text-center"
                          style={{ ...rowStyles, minWidth: "130px" }}
                        >
                          {isUpdatingStatusMode &&
                          corrugatorProcess?.status !== "COMPLETED" ? (
                            // Chế độ edit: hiển thị select (chỉ cho các lệnh chưa hoàn thành)
                            <Form.Select
                              size="sm"
                              value={
                                selectedStatusesForRows[moId] ||
                                currentStatus
                              }
                              onChange={(e) =>
                                handleRowStatusChange(moId, e.target.value)
                              }
                              disabled={isUpdating}
                              style={{
                                fontWeight: 600,
                                borderColor:
                                  selectedStatusesForRows[moId] &&
                                  selectedStatusesForRows[moId] !==
                                    currentStatus
                                    ? "#0d6efd"
                                    : "default",
                              }}
                            >
                              {EDITABLE_STATUSES.map((status) => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ))}
                              {!EDITABLE_STATUSES.some(
                                (s) => s.value === currentStatus
                              ) && (
                                <option value={currentStatus} disabled>
                                  {getStatus(currentStatus)}
                                </option>
                              )}
                            </Form.Select>
                          ) : (
                            // Chế độ bình thường hoặc lệnh đã hoàn thành: hiển thị text
                            <span
                              style={{
                                fontWeight: 600,
                                color:
                                  corrugatorProcess?.status === "COMPLETED"
                                    ? "#2e7d32"
                                    : corrugatorProcess?.status === "RUNNING"
                                    ? "#1976d2"
                                    : corrugatorProcess?.status === "PAUSED"
                                    ? "#e65100"
                                    : "#000",
                              }}
                            >
                              {getStatus(currentStatus)}
                            </span>
                          )}
                        </td>
                        <td
                          className="text-center"
                          style={{
                            ...rowStyles,
                            padding: "4px",
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
                                  moId,
                                  currentAmount,
                                  -propStepAmount
                                )
                              }
                              disabled={
                                isUpdating ||
                                corrugatorProcess?.status === "COMPLETED"
                              }
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
                                color: hasPendingChanges ? "#0d6efd" : "#000",
                                borderBottom: hasPendingChanges
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
                                  moId,
                                  currentAmount,
                                  propStepAmount
                                )
                              }
                              disabled={
                                isUpdating ||
                                corrugatorProcess?.status === "COMPLETED"
                              }
                              style={{ textDecoration: "none" }}
                              title={`Tăng ${propStepAmount}`}
                            >
                              <i className="bi bi-plus-circle fs-5"></i>
                            </Button>
                          </div>
                        </td>
                        <td className="text-center" style={{ ...rowStyles }}>
                          <Button
                            variant={
                              hasPendingChanges
                                ? "success"
                                : "outline-secondary"
                            }
                            size="sm"
                            onClick={() => handleSave(moId)}
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
                        <td className="text-center" style={{ ...rowStyles }}>
                          {formatShortDate(item?.manufacturingDate)}
                        </td>
                        <td
                          className="text-center"
                          style={{
                            ...rowStyles,
                            ...amountCellStyle,
                            color: "blue",
                          }}
                        >
                          {ware?.paperWidth || "-"}
                        </td>
                        <td className="text-center" style={{ ...rowStyles }}>
                          {ware?.faceLayerPaperType || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
            <CustomPagination
              currentPage={activePage}
              totalPages={activeTotalPages}
              hasNextPage={activeHasNextPage}
              hasPrevPage={activeHasPrevPage}
              onPageChange={handleActivePageChange}
              isFetching={isFetching}
              totalItems={activeTotalItems}
              limit={activeLimit}
              onLimitChange={handleActiveLimitChange}
              limitOptions={limitOptions}
            />
          </>
        ) : (
          !isFetching && (
            <div className="text-muted text-center p-4 border rounded">
              Không có quy trình sóng đang chạy
            </div>
          )
        )}
      </div>

      {/* ======================= TABLE 2: PENDING PROCESSES ======================= */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Lệnh sản xuất chờ xử lý</h4>
          {selectedMoIds.size > 0 && (
            <Button
              variant="success"
              onClick={handleRunSelected}
              disabled={isRunning}
            >
              <i className="bi bi-play-fill me-2"></i>
              Chuyển {selectedMoIds.size} lệnh sang chạy
            </Button>
          )}
        </div>
        {!isFetching && pendingProcesses.length > 0 ? (
          <>
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
                hover
                responsive
                style={{ margin: 0, fontSize: "13.5px" }}
              >
                <thead
                  className="text-center align-middle"
                  style={{
                    fontSize: "14px",
                    backgroundColor: "#e3f2fd",
                    color: "black",
                    fontWeight: "bold",
                  }}
                >
                  <tr>
                    <th style={{ width: "50px" }}>
                      <Form.Check
                        type="checkbox"
                        checked={
                          pendingProcesses.length > 0 &&
                          selectedMoIds.size === pendingProcesses.length
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    {TABLE_HEADERS_PENDING.map((header) => (
                      <th key={header} style={{ fontSize: "13.5px" }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingProcesses.map((item) => {
                    const rowStyles = getRowStyles(item);
                    const ware = item?.purchaseOrderItem?.ware;
                    const corrugatorProcess =
                      typeof item?.corrugatorProcess === "object" &&
                      item?.corrugatorProcess !== null
                        ? item.corrugatorProcess
                        : null;
                    const isSelected = selectedMoIds.has(item.id);

                    return (
                      <tr
                        key={item.id}
                        style={{
                          ...rowStyles,
                          ...(isSelected
                            ? {
                                backgroundColor: "#bbdefb",
                                fontWeight: "600",
                              }
                            : {}),
                        }}
                      >
                        <td className="text-center">
                          <Form.Check
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) =>
                              handleSelectItem(item.id, e.target.checked)
                            }
                          />
                        </td>
                        <td className="text-center" style={{ ...rowStyles }}>
                          {item?.code || "-"}
                        </td>
                        <td
                          className="text-center"
                          style={{ ...rowStyles, color: "red" }}
                        >
                          {typeof ware?.fluteCombination === "object" &&
                          ware?.fluteCombination?.code
                            ? ware.fluteCombination.code
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
                        <td className="text-center" style={{ ...rowStyles }}>
                          {ware?.blankWidth || "-"}
                        </td>
                        <td className="text-center" style={{ ...rowStyles }}>
                          {ware?.blankLength || "-"}
                        </td>
                        <td className="text-center" style={{ ...rowStyles }}>
                          {ware?.flapLength || "-"}
                        </td>
                        <td className="text-center" style={{ ...rowStyles }}>
                          {ware?.margin || "-"}
                        </td>
                        <td className="text-center" style={{ ...rowStyles }}>
                          {ware?.crossCutCount || "-"}
                        </td>
                        <td
                          className="text-center"
                          style={{
                            ...rowStyles,
                            ...amountCellStyle,
                            color: "red",
                          }}
                        >
                          {formatNumber(
                            item?.purchaseOrderItem?.longitudinalCutCount
                          )}
                        </td>
                        <td className="text-center" style={{ ...rowStyles }}>
                          {formatShortDate(item?.manufacturingDate)}
                        </td>
                        <td
                          className="text-center"
                          style={{
                            ...rowStyles,
                            ...amountCellStyle,
                            color: "red",
                          }}
                        >
                          {ware?.paperWidth || "-"}
                        </td>
                        <td className="text-center" style={{ ...rowStyles }}>
                          {ware?.faceLayerPaperType || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
            <CustomPagination
              currentPage={pendingPage}
              totalPages={pendingTotalPages}
              hasNextPage={pendingHasNextPage}
              hasPrevPage={pendingHasPrevPage}
              onPageChange={handlePendingPageChange}
              isFetching={isFetching}
              totalItems={pendingTotalItems}
              limit={pendingLimit}
              onLimitChange={handlePendingLimitChange}
              limitOptions={limitOptions}
            />
          </>
        ) : (
          !isFetching && (
            <div className="text-muted text-center p-4 border rounded">
              Không có lệnh sản xuất chờ xử lý.
            </div>
          )
        )}
      </div>
    </Container>
  );
}
