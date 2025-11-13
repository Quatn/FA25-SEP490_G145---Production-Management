"use client";

import React, { useMemo, useState } from "react";
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
} from "@/service/api/trackingManufacturingOrderApiSlice";

// Hàm format số lượng thành định dạng 1.500
const formatNumber = (num) => {
  if (num === null || num === undefined) return "-";
  return new Intl.NumberFormat("vi-VN").format(num);
};

// Hàm lấy style cho toàn bộ hàng dựa trên trạng thái quy trình sóng
const getRowStyles = (item) => {
  const baseStyle = {
    fontWeight: "500",
    color: "#000000",
    textDecoration: "none",
    backgroundColor: "white",
  };

  // Lấy trạng thái từ corrugatorProcess
  const corrugatorStatus =
    typeof item?.corrugatorProcess === "object" &&
    item?.corrugatorProcess !== null
      ? item.corrugatorProcess.status
      : null;

  switch (corrugatorStatus) {
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
        ...baseGaseStyle,
        backgroundColor: "#fbe6e8",
        textDecoration: "line-through",
        color: "#c62828",
      };
    default:
      return baseStyle;
  }
};

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

// Mảng các trạng thái có thể chỉnh sửa
const EDITABLE_STATUSES = [
  // { value: "NOTSTARTED", label: "Chờ" },
  { value: "RUNNING", label: "Chạy" },
  { value: "PAUSED", label: "Dừng" },
  { value: "CANCELLED", label: "Hủy" },
  { value: "COMPLETED", label: "Hoàn Thành" },
  // Bạn có thể thêm/bớt các trạng thái khác ở đây
  // VD: { value: "COMPLETED", label: "Hoàn Thành" }
];

const formatShortDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date)) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}`;
};

export default function FluteCorrugatorProcessPage() {
  // --- STATE ---
  const [activePage, setActivePage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [activeLimit, setActiveLimit] = useState(1);
  const [pendingLimit, setPendingLimit] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [corrugatorLineFilter, setCorrugatorLineFilter] = useState("all");
  const [selectedMoIds, setSelectedMoIds] = useState(new Set());
  const [stepAmount, setStepAmount] = useState(100);
  const [toasts, setToasts] = useState([]);

  // --- STATE LƯU THAY ĐỔI TẠM THỜI ---
  // Lưu các thay đổi số lượng (Đã SX) chưa bấm "Lưu"
  // Dạng { corrugatorProcessId: newAmount }
  const [pendingAmounts, setPendingAmounts] = useState({});
  // Lưu các thay đổi trạng thái chưa bấm "Lưu"
  // Dạng { corrugatorProcessId: newStatus }
  const [pendingStatuses, setPendingStatuses] = useState({});

  // --- BUILD QUERY ARGS ---
  const queryArgs = useMemo(
    () => ({
      page: 1,
      limit: 1000,
      ...(searchTerm.trim() ? { searchCode: searchTerm.trim() } : {}),
      ...(corrugatorLineFilter !== "all"
        ? { corrugatorLine: Number(corrugatorLineFilter) }
        : {}),
    }),
    [searchTerm, corrugatorLineFilter]
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

  console.log(rawDataList);

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
  // Bảng trên: Quy trình sóng có trạng thái RUNNING, PAUSED, COMPLETED
  const activeProcesses = useMemo(() => {
    const filtered = rawDataList.filter((item) => {
      const corrugatorStatus =
        typeof item?.corrugatorProcess === "object" &&
        item?.corrugatorProcess !== null
          ? item.corrugatorProcess.status
          : null;
      return (
        corrugatorStatus === "RUNNING" ||
        corrugatorStatus === "PAUSED" ||
        corrugatorStatus === "COMPLETED" ||
        // Hiển thị cả những trạng thái đang được thay đổi tạm thời
        Object.keys(pendingStatuses).includes(
          String(item.corrugatorProcess?.id)
        )
      );
    });

    // Pagination cho active processes
    const start = (activePage - 1) * activeLimit;
    const end = start + activeLimit;
    return filtered.slice(start, end);
  }, [rawDataList, activePage, activeLimit, pendingStatuses]);

  const activeTotalItems = useMemo(() => {
    return rawDataList.filter((item) => {
      const corrugatorStatus =
        typeof item?.corrugatorProcess === "object" &&
        item?.corrugatorProcess !== null
          ? item.corrugatorProcess.status
          : null;
      return (
        corrugatorStatus === "RUNNING" ||
        corrugatorStatus === "PAUSED" ||
        corrugatorStatus === "COMPLETED" ||
        Object.keys(pendingStatuses).includes(
          String(item.corrugatorProcess?.id)
        )
      );
    }).length;
  }, [rawDataList, pendingStatuses]);

  // Bảng dưới: Quy trình sóng có trạng thái NOTSTARTED
  const pendingProcesses = useMemo(() => {
    const filtered = rawDataList.filter((item) => {
      const corrugatorStatus =
        typeof item?.corrugatorProcess === "object" &&
        item?.corrugatorProcess !== null
          ? item.corrugatorProcess.status
          : null;
      // Lọc ra những item CHƯA bắt đầu VÀ không có trong danh sách active
      return (
        corrugatorStatus === "NOTSTARTED" &&
        !(
          corrugatorStatus === "RUNNING" ||
          corrugatorStatus === "PAUSED" ||
          corrugatorStatus === "COMPLETED" ||
          Object.keys(pendingStatuses).includes(
            String(item.corrugatorProcess?.id)
          )
        )
      );
    });

    // Pagination cho pending processes
    const start = (pendingPage - 1) * pendingLimit;
    const end = start + pendingLimit;
    return filtered.slice(start, end);
  }, [rawDataList, pendingPage, pendingLimit, pendingStatuses]);

  const pendingTotalItems = useMemo(() => {
    return rawDataList.filter((item) => {
      const corrugatorStatus =
        typeof item?.corrugatorProcess === "object" &&
        item?.corrugatorProcess !== null
          ? item.corrugatorProcess.status
          : null;
      return (
        corrugatorStatus === "NOTSTARTED" &&
        !(
          corrugatorStatus === "RUNNING" ||
          corrugatorStatus === "PAUSED" ||
          corrugatorStatus === "COMPLETED" ||
          Object.keys(pendingStatuses).includes(
            String(item.corrugatorProcess?.id)
          )
        )
      );
    }).length;
  }, [rawDataList, pendingStatuses]);

  // --- MUTATION ---
  const [runCorrugatorProcesses, { isLoading: isRunning }] =
    useRunCorrugatorProcessesMutation();
  const [updateCorrugatorProcess, { isLoading: isUpdating }] =
    useUpdateCorrugatorProcessMutation();

  // --- PAGINATION INFO ---
  const activeTotalPages = Math.ceil(activeTotalItems / activeLimit) || 1;
  const activeHasNextPage = activePage < activeTotalPages;
  const activeHasPrevPage = activePage > 1;
  const activeCurrentPage = activePage;

  const pendingTotalPages = Math.ceil(pendingTotalItems / pendingLimit) || 1;
  const pendingHasNextPage = pendingPage < pendingTotalPages;
  const pendingHasPrevPage = pendingPage > 1;
  const pendingCurrentPage = pendingPage;

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

  // --- LOGIC MỚI: CẬP NHẬT STATE TẠM THỜI ---

  // Cập nhật state SỐ LƯỢNG (Đã SX) tạm thời
  const handleChangePendingAmount = (
    corrugatorProcessId,
    currentAmount, // Số lượng từ API (hoặc từ state tạm thời nếu đã thay đổi)
    delta
  ) => {
    if (!corrugatorProcessId) return;
    const newAmount = Math.max(0, currentAmount + delta);

    setPendingAmounts((prev) => ({
      ...prev,
      [corrugatorProcessId]: newAmount,
    }));
  };

  // Cập nhật state TRẠNG THÁI tạm thời
  const handleChangePendingStatus = (corrugatorProcessId, newStatus) => {
    if (!corrugatorProcessId) return;

    setPendingStatuses((prev) => ({
      ...prev,
      [corrugatorProcessId]: newStatus,
    }));
  };

  // --- LOGIC MỚI: XỬ LÝ LƯU (GỌI API) ---
  const handleSave = async (corrugatorProcessId) => {
    const newAmount = pendingAmounts[corrugatorProcessId];
    const newStatus = pendingStatuses[corrugatorProcessId];

    // Kiểm tra xem có gì để lưu không
    const hasPendingAmount = newAmount !== undefined;
    const hasPendingStatus = newStatus !== undefined;

    if (!hasPendingAmount && !hasPendingStatus) {
      showToast("Không có thay đổi để lưu.", "info");
      return;
    }

    // Build body cho API
    const body = { id: corrugatorProcessId };
    if (hasPendingAmount) {
      body.manufacturedAmount = newAmount;
    }
    if (hasPendingStatus) {
      body.status = newStatus;
    }

    try {
      const result = await updateCorrugatorProcess(body).unwrap();
      showToast(result?.message || "Lưu thay đổi thành công!", "success");

      // Xóa các thay đổi tạm thời sau khi lưu
      if (hasPendingAmount) {
        setPendingAmounts((prev) => {
          const newState = { ...prev };
          delete newState[corrugatorProcessId];
          return newState;
        });
      }
      if (hasPendingStatus) {
        setPendingStatuses((prev) => {
          const newState = { ...prev };
          delete newState[corrugatorProcessId];
          return newState;
        });
      }

      refetch(); // Tải lại dữ liệu
    } catch (error) {
      console.error("Error saving changes:", error);
      showToast(
        error.data?.message || "Có lỗi xảy ra khi lưu thay đổi",
        "danger"
      );
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setCorrugatorLineFilter("all");
    setActivePage(1);
    setPendingPage(1);
    setSelectedMoIds(new Set());
  };

  // --- TABLE HEADERS ---
  const TABLE_HEADERS_ACTIVE = [
    "Lệnh SX",
    "Mã Hàng",
    "Sóng",
    "Dài/Khổ",
    "Rộng/CD",
    "Cao",
    "SL",
    "Trạng thái", // Sẽ là dropdown
    "Đã SX",
    "Lưu", // Thay "Hành động"
    "Ngày Nhận",
    "Khổ giấy",
  ];

  const TABLE_HEADERS_PENDING = [
    "Lệnh SX",
    "Mã Hàng",
    "Sóng",
    "Dài/Khổ",
    "Rộng/CD",
    "Cao",
    "SL",
    "Trạng thái",
    "Đã SX",
    "Ngày Nhận",
    "Khổ giấy",
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

  // Render pagination component
  const renderPagination = (
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    onPageChange,
    isFetching,
    totalItems,
    currentLimit
  ) => {
    const startItem =
      totalItems === 0 ? 0 : (currentPage - 1) * currentLimit + 1;
    const endItem = Math.min(currentPage * currentLimit, totalItems);
    const rangeDisplay = `${startItem} - ${endItem} of ${totalItems}`;

    return (
      <div
        className="d-flex flex-column flex-md-row justify-content-md-end align-items-center mt-3 gap-3"
        style={{ width: "100%", margin: "0" }}
      >
        <div className="d-flex align-items-center justify-content-center justify-content-md-end gap-4 flex-wrap">
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

        <div className="d-flex justify-content-center justify-content-md-end gap-2">
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
  };

  // Render "Rows per page" component
  const renderLimitSelector = (currentLimit, onChangeHandler, isDisabled) => (
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
          borderRadius: "8px",
          backgroundColor: "#fff",
          padding: "6px 10px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
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

      <h2 className="fw-bold mb-3">Quản lý quy trình sóng</h2>

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
                    setActivePage(1);
                    setPendingPage(1);
                  }}
                  style={{ border: "none", boxShadow: "none" }}
                />
              </div>
            </Form.Group>
          </Col>

          {/* Corrugator Line Filter */}
          <Col xs={12} md={3} className="mb-3 mb-md-0">
            <Form.Group>
              <Form.Label className="fw-bold">Dàn</Form.Label>
              <Form.Select
                value={
                  corrugatorLineFilter === "all"
                    ? "all"
                    : String(corrugatorLineFilter)
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setCorrugatorLineFilter(
                    value === "all" ? "all" : Number(value)
                  );
                  setActivePage(1);
                  setPendingPage(1);
                }}
              >
                <option value="all">-- Tất cả --</option>
                <option value="5">Dàn 5L</option>
                <option value="7">Dàn 7L</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Step Amount */}
          <Col xs={12} md={3} className="mb-3 mb-md-0">
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
            md={2}
            className="d-flex align-items-end justify-content-end"
          >
            <Button
              variant="outline-danger"
              onClick={handleClearFilters}
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
      {/* ======================= TABLE 1: ACTIVE PROCESSES ======================= */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">
            Quy trình sóng đang chạy/Dừng/Hoàn thành
          </h4>
          {renderLimitSelector(
            activeLimit,
            handleActiveLimitChange,
            isFetching
          )}
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

                    if (!corrugatorProcess) return null; // Không hiển thị nếu không có process

                    const processId = corrugatorProcess.id;

                    // Lấy số lượng: ưu tiên state tạm thời, nếu không có thì lấy từ API
                    const currentAmount =
                      pendingAmounts[processId] ??
                      corrugatorProcess.manufacturedAmount ??
                      0;

                    // Lấy trạng thái: ưu tiên state tạm thời, nếu không có thì lấy từ API
                    const currentStatus =
                      pendingStatuses[processId] ?? corrugatorProcess.status;

                    // Kiểm tra xem có thay đổi chưa lưu hay không
                    const hasPendingChanges =
                      pendingAmounts[processId] !== undefined ||
                      pendingStatuses[processId] !== undefined;

                    return (
                      <tr key={item.id} className="align-middle">
                        <td className="text-center" style={{ ...rowStyles }}>
                          {item?.code || "-"}
                        </td>
                        <td style={{ ...rowStyles, minWidth: "150px" }}>
                          {ware?.code || "-"}
                        </td>
                        <td className="text-center" style={{ ...rowStyles }}>
                          {ware?.fluteCombinationCode || "-"}
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

                        {/* --- CỘT TRẠNG THÁI (DROPDOWN) --- */}
                        <td
                          className="text-center"
                          style={{ ...rowStyles, minWidth: "130px" }}
                          // style={{ ...rowStyles }}
                        >
                          <Form.Select
                            size="sm"
                            value={currentStatus}
                            onChange={(e) =>
                              handleChangePendingStatus(
                                processId,
                                e.target.value
                              )
                            }
                            disabled={isUpdating}
                            style={{
                              fontWeight: 600,
                              borderColor: hasPendingChanges
                                ? "#0d6efd"
                                : "default",
                                // minWidth: "90px"
                            }}
                          >
                            {EDITABLE_STATUSES.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                            {/* Thêm các trạng thái không chỉnh sửa được (như COMPLETED) */}
                            {!EDITABLE_STATUSES.some(
                              (s) => s.value === corrugatorProcess.status
                            ) && (
                              <option value={corrugatorProcess.status} disabled>
                                {getStatus(corrugatorProcess.status)}
                              </option>
                            )}
                          </Form.Select>
                        </td>

                        {/* --- CỘT ĐÃ SX (CẬP NHẬT STATE TẠM) --- */}
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
                                  processId,
                                  currentAmount, // Truyền số lượng hiện tại (từ state tạm hoặc api)
                                  -stepAmount
                                )
                              }
                              disabled={
                                isUpdating ||
                                corrugatorProcess?.status === "COMPLETED"
                              }
                              style={{ textDecoration: "none" }}
                              title={`Giảm ${stepAmount}`}
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
                                  processId,
                                  currentAmount, // Truyền số lượng hiện tại (từ state tạm hoặc api)
                                  stepAmount
                                )
                              }
                              disabled={
                                isUpdating ||
                                corrugatorProcess?.status === "COMPLETED"
                              }
                              style={{ textDecoration: "none" }}
                              title={`Tăng ${stepAmount}`}
                            >
                              <i className="bi bi-plus-circle fs-5"></i>
                            </Button>
                          </div>
                        </td>

                        {/* --- CỘT LƯU --- */}
                        <td
                          className="text-center"
                          style={{ ...rowStyles, minWidth: "80px" }}
                        >
                          <Button
                            variant={
                              hasPendingChanges
                                ? "primary"
                                : "outline-secondary"
                            }
                            size="sm"
                            onClick={() => handleSave(processId)}
                            disabled={!hasPendingChanges || isUpdating}
                            title="Lưu thay đổi"
                          >
                            <i className="bi bi-save-fill"></i>
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
                            color: "red",
                          }}
                        >
                          {item?.purchaseOrderItem?.ware?.paperSize || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
            {renderPagination(
              activeCurrentPage,
              activeTotalPages,
              activeHasNextPage,
              activeHasPrevPage,
              handleActivePageChange,
              isFetching,
              activeTotalItems,
              activeLimit
            )}
          </>
        ) : (
          !isFetching && (
            <div className="text-muted text-center p-4 border rounded">
              Không có quy trình sóng đang chạy/dừng/hoàn thành.
            </div>
          )
        )}
      </div>

      {/* ======================= TABLE 2: PENDING PROCESSES (SELECTABLE) ======================= */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">Lệnh sản xuất chờ xử lý</h4>
          {selectedMoIds.size > 0 ? (
            <Button
              variant="success"
              onClick={handleRunSelected}
              disabled={isRunning}
            >
              <i className="bi bi-play-fill me-2"></i>
              Chuyển {selectedMoIds.size} lệnh sang chạy
            </Button>
          ) : (
            renderLimitSelector(
              pendingLimit,
              handlePendingLimitChange,
              isFetching
            )
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
                        <td style={{ ...rowStyles, minWidth: "150px" }}>
                          {ware?.code || "-"}
                        </td>
                        <td className="text-center" style={{ ...rowStyles }}>
                          {ware?.fluteCombinationCode || "-"}
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
                          {corrugatorProcess
                            ? getStatus(corrugatorProcess.status)
                            : "Chờ"}
                        </td>
                        <td
                          className="text-center"
                          style={{
                            ...rowStyles,
                            ...amountCellStyle,
                          }}
                        >
                          {corrugatorProcess
                            ? formatNumber(corrugatorProcess.manufacturedAmount)
                            : "0"}
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
                          {item?.purchaseOrderItem?.ware?.paperSize || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
            {renderPagination(
              pendingCurrentPage,
              pendingTotalPages,
              pendingHasNextPage,
              pendingHasPrevPage,
              handlePendingPageChange,
              isFetching,
              pendingTotalItems,
              pendingLimit
            )}
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
