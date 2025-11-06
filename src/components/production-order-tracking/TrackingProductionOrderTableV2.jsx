"use client";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Table,
  Badge,
} from "react-bootstrap";

export default function TrackingProductionOrderTableV3() {
  const processes = ["Sóng", "In", "Ghim dán", "Thành phẩm"];
  const statuses = ["Hủy", "Chờ Sản Xuất", "Đang Sản Xuất", "Hoàn thành"];

  const [orders, setOrders] = useState([
    {
      id: "L1",
      productionOrderCode: "2781/08",
      wareCode: "H5L 355*255*220 WX001",
      customer: "AROMA",
      waveType: "5CB",
      paperWidth: "1500",
      wareLength: "355",
      wareWidth: "255",
      wareHeight: "220",
      processes: {
        Sóng: "Đang Sản Xuất",
        In: "Đang Sản Xuất",
        "Ghim dán": "Đang Sản Xuất",
        "Thành phẩm": "Chờ Sản Xuất",
      },
      priority: 3, // cao
    },
    {
      id: "L2",
      productionOrderCode: "1229/06",
      wareCode: "TN 345*245 (WX0-0001)",
      customer: "AROMA",
      waveType: "7CB",
      paperWidth: "1250",
      wareLength: "355",
      wareWidth: "255",
      wareHeight: "220",
      processes: {
        Sóng: "Chờ Sản Xuất",
        In: "Chờ Sản Xuất",
        "Ghim dán": "Chờ Sản Xuất",
        "Thành phẩm": "Chờ Sản Xuất",
      },
      priority: 2, // trung bình
    },
    {
      id: "L3",
      productionOrderCode: "2728/08",
      wareCode: "TN 230*230 (WX0-0001)",
      customer: "MRS HẠNH",
      waveType: "3A",
      paperWidth: "1700",
      wareLength: "355",
      wareWidth: "255",
      wareHeight: "220",
      processes: {
        Sóng: "Hoàn thành",
        In: "Hoàn thành",
        "Ghim dán": "Hoàn thành",
        "Thành phẩm": "Hoàn thành",
      },
      priority: 1, // thấp
    },
    {
      id: "L4",
      productionOrderCode: "108/09",
      wareCode: "VN3L 345*245*200 WX1-0202",
      customer: "VS VIETNAM",
      waveType: "7CB",
      paperWidth: "1400",
      wareLength: "355",
      wareWidth: "255",
      wareHeight: "220",
      processes: {
        Sóng: "Đang Sản Xuất",
        In: "Đang Sản Xuất",
        "Ghim dán": "Chờ Sản Xuất",
        "Thành phẩm": "Chờ Sản Xuất",
      },
      priority: 2,
    },
    {
      id: "L5",
      productionOrderCode: "507/09",
      wareCode: "L5L 119*250*5MM",
      customer: "VINAMILK",
      waveType: "5AB",
      paperWidth: "1550",
      wareLength: "355",
      wareWidth: "255",
      wareHeight: "220",
      processes: {
        Sóng: "Hoàn thành",
        In: "Hoàn thành",
        "Ghim dán": "Hoàn thành",
        "Thành phẩm": "Hoàn thành",
      },
      priority: 3, // cao
    },
  ]);

  const [history, setHistory] = useState([
    {
      id: 1,
      orderCode: "2781/08",
      customer: "AROMA",
      wareCode: "H5L 355*255*220 WX001",
      fromStatus: "Chờ Sản Xuất",
      toStatus: "Đang Sản Xuất",
      process: "Sóng",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5h trước
    },
    {
      id: 2,
      orderCode: "1229/06",
      customer: "AROMA",
      wareCode: "TN 345*245 (WX0-0001)",
      fromStatus: "Đang Sản Xuất",
      toStatus: "Hoàn thành",
      process: "In",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25), // 25h trước
    },
  ]);
  const [endDate, setEndDate] = useState("");
  const [startDate, setStartDate] = useState("");

  useEffect(() => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 2);

    // format yyyy-mm-dd để input date hiểu đúng
    const formatDate = (d) => d.toISOString().split("T")[0];

    setEndDate(formatDate(end));
    setStartDate(formatDate(start));
  }, []);

  // Sort theo mức độ ưu tiên (cao → thấp)
  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => b.priority - a.priority),
    [orders]
  );

  const [activeProcess, setActiveProcess] = useState("Sóng");
  const [activeWaveTab, setActiveWaveTab] = useState("5L");
  const [draggedItem, setDraggedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // -------- Helpers --------
  const getWaveGroup = (waveType) => {
    const first = waveType.charAt(0);
    return first === "7" ? "7L" : "5L";
  };

  const getPriorityColor = (p) =>
    p === 3 ? "#ffe6e6" : p === 2 ? "#e6f5ff" : "#ffffff";

  // -------- Drag logic (chỉ kéo ngang, không reorder) --------
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, status) => {
    e.preventDefault();
    if (!draggedItem) return;

    const previousStatus = draggedItem.processes[activeProcess];

    if (previousStatus !== status) {
      setHistory((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          orderCode: draggedItem.productionOrderCode,
          customer: draggedItem.customer,
          wareCode: draggedItem.wareCode,
          fromStatus: previousStatus,
          toStatus: status,
          process: activeProcess,
          timestamp: new Date(),
        },
      ]);
    }

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== draggedItem.id) return order;

        const updatedProcesses = {
          ...order.processes,
          [activeProcess]: status,
        };

        // 🔁 Logic đồng bộ hóa giữa các khâu
        if (status === "Hoàn thành" && activeProcess === "Thành phẩm") {
          processes.forEach((p) => (updatedProcesses[p] = "Hoàn thành"));
        } else if (status === "Chờ Sản Xuất" && activeProcess === "Sóng") {
          processes.forEach((p) => (updatedProcesses[p] = "Chờ Sản Xuất"));
        } else if (status === "Hủy") {
          processes.forEach((p) => (updatedProcesses[p] = "Hủy"));
        }

        return { ...order, processes: updatedProcesses };
      })
    );
    setDraggedItem(null);
  };

  // -------- Lọc lệnh theo process hiện tại --------
  const getFilteredOrders = (status) => {
    let filtered = sortedOrders.filter(
      (o) =>
        o.processes[activeProcess] === status &&
        o.productionOrderCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeProcess === "Sóng")
      filtered = filtered.filter(
        (o) => getWaveGroup(o.waveType) === activeWaveTab
      );

    return filtered;
  };

  // -------- Chiều cao động của cột --------
  const maxOrdersCount = useMemo(() => {
    return Math.max(...statuses.map((s) => getFilteredOrders(s).length));
  }, [sortedOrders, activeProcess, activeWaveTab]);

  const dynamicHeight = maxOrdersCount * 130 + 40;

  // -------- UI --------
  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <Container fluid className="py-4">
        <h1 className="fw-bold fs-3 mb-4 text-dark">Theo dõi lệnh</h1>
        <div className="mb-3 col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Tìm theo mã lệnh (VD: 2781/08)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Bộ chọn khâu */}
        <div className="mb-3 d-flex gap-2">
          {processes.map((p) => (
            <Button
              key={p}
              variant={activeProcess === p ? "primary" : "outline-secondary"}
              onClick={() => {
                setActiveProcess(p);
                if (p !== "Sóng") setActiveWaveTab("5L");
              }}
            >
              {p}
            </Button>
          ))}
        </div>
        {/* Bộ chọn dàn */}
        {activeProcess === "Sóng" && (
          <div className="mb-4 d-flex gap-2">
            <Button
              variant={
                activeWaveTab === "5L" ? "secondary" : "outline-secondary"
              }
              onClick={() => setActiveWaveTab("5L")}
            >
              Dàn 5L
            </Button>
            <Button
              variant={
                activeWaveTab === "7L" ? "secondary" : "outline-secondary"
              }
              onClick={() => setActiveWaveTab("7L")}
            >
              Dàn 7L
            </Button>
          </div>
        )}
        {/* Bảng chính */}
        <Row className="g-3 align-items-stretch">
          {statuses.map((status) => (
            <Col key={status} xs={12} sm={6} lg={3}>
              <Card
                style={{
                  backgroundColor: "#f8f9fa",
                  minHeight: `${dynamicHeight}px`,
                  height: "100%",
                }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                <Card.Header
                  className="text-center fw-bold text-dark"
                  style={{ backgroundColor: "#e9ecef" }}
                >
                  {status}
                </Card.Header>
                <Card.Body>
                  <div className="d-flex flex-column gap-3">
                    {getFilteredOrders(status).map((item) => (
                      <Card
                        key={`tracking-po-${item.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragOver={handleDragOver}
                        style={{
                          backgroundColor: getPriorityColor(item.priority),
                          cursor: "grab",
                          border: "1px solid #dee2e6",
                        }}
                        className="shadow-sm"
                      >
                        <Card.Body>
                          <div className="mb-2">
                            <Link href={"#"}>
                              <span className="fw-bold fs-5 text-dark">
                                {item.productionOrderCode}
                              </span>
                            </Link>
                          </div>
                          <div style={{ fontSize: "14px", color: "#495057" }}>
                            <div>
                              <span style={{ fontWeight: " bold" }}>
                                Mã Hàng: {item.wareCode}
                              </span>
                            </div>
                            <div>
                              <span style={{ fontWeight: " bold" }}>
                                Khách hàng: {item.customer}
                              </span>{" "}
                              ·{" "}
                              <span style={{ fontWeight: " bold" }}>
                                Sóng: {item.waveType}
                              </span>
                            </div>
                            <div>
                              <span style={{ fontWeight: " bold" }}>
                                Khổ Giấy: {item.paperWidth}
                              </span>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <hr className="my-4" />
        <h3 className="fw-bold text-dark mb-3">📜 Lịch sử thao tác</h3>
        {/* Bộ lọc ngày */}
        <div className="d-flex align-items-center gap-3 mb-3">
          <div>
            <label className="form-label fw-semibold">Từ ngày:</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label fw-semibold">Đến ngày:</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        {/* Bảng lịch sử */}
        {Object.entries(
          history
            .filter((h) => {
              const date = new Date(h.timestamp);
              return (
                date >= new Date(startDate) &&
                date <= new Date(endDate + "T23:59:59")
              );
            })
            .sort((a, b) => b.timestamp - a.timestamp)
            .reduce((acc, log) => {
              const dateKey = new Date(log.timestamp).toLocaleDateString(
                "vi-VN"
              );
              if (!acc[dateKey]) acc[dateKey] = [];
              acc[dateKey].push(log);
              return acc;
            }, {})
        ).map(([date, dayLogs]) => (
          <Card
            key={date}
            className="mb-4 border-0 shadow-sm rounded-4 overflow-hidden"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <Card.Header
              className="fw-bold fs-6 text-white"
              style={{
                background: "linear-gradient(90deg, #6f42c1 0%, #8e63d4 100%)",
              }}
            >
              {date}
            </Card.Header>
            <Card.Body className="p-0">
              {dayLogs.map((log, idx) => {
                const time = new Date(log.timestamp).toLocaleTimeString(
                  "vi-VN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }
                );
                return (
                  <div
                    key={idx}
                    className="d-flex justify-content-between align-items-center border-bottom px-3 py-3"
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f3f0fa",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <div>
                      <div
                        className="fw-bold"
                        style={{ color: "#0d6efd", fontSize: "16px" }}
                      >
                        {log.orderCode} <span className="text-muted">•</span>{" "}
                        <span style={{ color: "#343a40" }}>{log.customer}</span>
                      </div>
                      <div className="text-muted small mt-1">
                        Mã Hàng:{" "}
                        <strong style={{ color: "#495057" }}>
                          {log.wareCode}
                        </strong>
                      </div>
                      <div className="text-muted small mt-1">
                        Khâu:{" "}
                        <strong style={{ color: "#495057" }}>
                          {log.process}
                        </strong>{" "}
                        —{" "}
                        <Badge bg="danger" className="me-1 px-2 py-1">
                          {log.fromStatus}
                        </Badge>{" "}
                        →{" "}
                        <Badge bg="success" className="ms-1 px-2 py-1">
                          {log.toStatus}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-end">
                      <div
                        className="fw-semibold"
                        style={{ color: "#6c757d", fontSize: "14px" }}
                      >
                        {time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        ))}
      </Container>
    </div>
  );
}
