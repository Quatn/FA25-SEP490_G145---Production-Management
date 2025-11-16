"use client";
import { useState, useMemo } from "react";
import {
  Container,
  Table,
  Form,
  InputGroup,
  Row,
  Col,
  Nav,
} from "react-bootstrap";

import mockDataPO from "@/service/mock-data/mock-tracking-po";

// Hàm format priority thành màu nền

const getOrderStatus = (order) => {
  // Kiểm tra trạng thái Hủy
  const isCanceled = order.status === "Hủy";

  if (isCanceled) return "canceled";

  // Kiểm tra trạng thái Hoàn Thành
  const isCompleted = order.status === "Hoàn Thành";

  if (isCompleted) return "completed";

  return "normal";
};

// Hàm lấy màu nền theo mức độ ưu tiên và trạng thái
const getRowBackgroundColor = (order) => {
  const status = getOrderStatus(order);

  // Ưu tiên trạng thái trước
  if (status === "completed") return "#c8e6c9"; // Xanh lá nhạt

  // Nếu không có trạng thái đặc biệt, dùng màu theo priority
  switch (order.priority) {
    case 1:
      return "#ffcdd2"; // Đỏ nhạt - Cao
    // case 2:
    //   return "#fff9c4"; // Vàng nhạt - Trung bình
    case 3:
      return "#ffffff"; // Trắng - Thấp
    default:
      return "#ffffff";
  }
};

// Hàm lấy style cho text
const getRowTextStyle = (order) => {
  const status = getOrderStatus(order);

  if (status === "canceled") {
    return {
      textDecoration: "line-through",
      fontWeight: "500",
      color: "#c62828",
    };
  }

  if (status === "completed") {
    return {
      fontWeight: "600",
      color: "#2e7d32",
    };
  }

  return {};
};

// Màu nền riêng cho các tab
const departmentBg = {
  keHoach: "#e3f2fd",
  song: "#e0f7fa",
  inAn: "#f3e5f5",
  cheBien: "#fff3e0",
  ghimDan: "#e8f5e9",
};

export default function ManufacturingOrderTracking() {
  const [orders] = useState(mockDataPO);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [activeTab, setActiveTab] = useState("keHoach");

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];
    if (searchTerm) {
      filtered = filtered.filter(
        (o) =>
          o.productionOrderCode
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          o.customer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterPriority) {
      filtered = filtered.filter(
        (o) => o.priority === parseInt(filterPriority)
      );
    }
    return filtered.sort((a, b) => a.priority - b.priority);
  }, [orders, searchTerm, filterPriority]);

  // Hàm render bảng scroll tùy theo tab
  const renderDepartmentTable = (order) => {
    const bgColor = getRowBackgroundColor(order);
    const textStyle = getRowTextStyle(order);

    switch (activeTab) {
      case "song":
        return (
          <>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpSong["5L"] || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpSong["7L"] || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.blankWidth || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.sheetLength || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.flap || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.warePerBlank || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.numberOfBlanks || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.numberOfSheets || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.partSX || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.paperWidth || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.edgeTrim || "-"}
            </td>
          </>
        );
      case "inAn":
        return (
          <>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpInAn.giaCong || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpInAn.maySX || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpInAn.color1 || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpInAn.color2 || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpInAn.color3 || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpInAn.color4 || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpInAn.status || "-"}
            </td>
          </>
        );
      case "cheBien":
        return (
          <>
            {order.bpCheBien.stages.map((stage, i) => {
              const key = Object.keys(stage)[0];
              const s = stage[key];
              return (
                <>
                  <td
                    style={{ backgroundColor: bgColor, ...textStyle }}
                    key={`name-${i}`}
                  >
                    {s ? `${s.name}` : "-"}
                  </td>
                  <td
                    style={{ backgroundColor: bgColor, ...textStyle }}
                    key={`status-${i}`}
                  >
                    {s ? `${s.status}` : "-"}
                  </td>
                </>
              );
            })}
          </>
        );
      case "ghimDan":
        return (
          <>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpGhimDan.giaCong || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpGhimDan.status || "-"}
            </td>
          </>
        );
      default:
        // keHoach (hiển thị toàn bộ như cũ)
        return (
          <>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpSong["5L"] || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpSong["7L"] || "-"}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpInAn.maySX}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpInAn.status}
            </td>
            {order.bpCheBien.stages.map((stage, i) => {
              const key = Object.keys(stage)[0];
              const s = stage[key];
              return (
                <td style={{ backgroundColor: bgColor, ...textStyle }} key={i}>
                  {s ? s.name : "-"}
                </td>
              );
            })}
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpCheBien.status}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpGhimDan.giaCong}
            </td>
            <td style={{ backgroundColor: bgColor, ...textStyle }}>
              {order.bpGhimDan.status}
            </td>
          </>
        );
    }
  };

  return (
    <Container fluid className="p-4">
      <h4 className="fw-bold mb-3 text-primary">Theo dõi lệnh sản xuất</h4>

      {/* --- Bộ lọc --- */}
      <Row className="mb-4 align-items-end">
        <Col md={3}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Tìm kiếm lệnh SX hoặc KH"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={2}>
          <Form.Select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">Mức độ ưu tiên</option>
            <option value="3">Cao</option>
            <option value="2">Trung Bình</option>
            <option value="1">Thấp</option>
          </Form.Select>
        </Col>
      </Row>

      {/* --- Tabs --- */}
      <Nav variant="tabs" className="mb-3">
        {[
          { key: "keHoach", label: "Kế Hoạch" },
          { key: "song", label: "Sóng" },
          { key: "inAn", label: "In Ấn" },
          { key: "cheBien", label: "Chế Biến" },
          { key: "ghimDan", label: "Ghim Dán" },
        ].map((tab) => (
          <Nav.Item key={tab.key}>
            <Nav.Link
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                backgroundColor:
                  activeTab === tab.key ? departmentBg[tab.key] : "#fff",
                border: "1px solid #dee2e6",
                fontWeight: activeTab === tab.key ? "600" : "500",
              }}
            >
              {tab.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* --- BẢNG --- */}
      <div
        style={{
          display: "flex",
          border: "1px solid #dee2e6",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Cột cố định */}
        <div style={{ flexShrink: 0 }}>
          <Table bordered hover style={{ margin: 0, fontSize: "13.5px" }}>
            <thead style={{ color: "white" }}>
              <tr>
                {[
                  "Lệnh SX",
                  "Khách Hàng",
                  "Mã Hàng",
                  "Đơn Hàng",
                  "Ưu tiên",
                  "Sóng",
                  "Dài/Khổ",
                  "Rộng/CD",
                  "Cao",
                  "SL",
                  "Ngày Giao",
                  "Ngày Nhận",
                ].map((header) => (
                  <th
                    key={header}
                    className="text-center align-middle fw-bold"
                    style={{ height: "74.1px" }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const bgColor = getRowBackgroundColor(order);
                const textStyle = getRowTextStyle(order);

                return (
                  <tr key={order.id}>
                    {[
                      "productionOrderCode",
                      "customer",
                      "wareCode",
                      "purchaseOrder",
                      "priority",
                      "waveType",
                      "wareLength",
                      "wareWidth",
                      "wareHeight",
                      "amount",
                      "deliveryDate",
                      "orderReceivedDate",
                    ].map((field) => (
                      <td
                        key={field}
                        className="text-center"
                        style={{
                          backgroundColor: bgColor,
                          ...textStyle,
                          fontWeight: "500",
                        }}
                      >
                        {order[field] || "-"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        {/* Phần có scroll (thay đổi theo tab) */}
        <div
          style={{
            overflowX: "auto",
            flexGrow: 1,
            maxWidth: "calc(100vw - 800px)",
          }}
        >
          <Table
            bordered
            hover
            style={{
              margin: 0,
              fontSize: "13.5px",
              minWidth:
                activeTab === "keHoach"
                  ? "1000px"
                  : activeTab === "song"
                  ? "800px"
                  : activeTab === "cheBien"
                  ? "800px"
                  : activeTab === "ghimDan"
                  ? "100px"
                  : "500px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: departmentBg[activeTab] }}>
                {activeTab === "keHoach" && (
                  <>
                    <th colSpan="2" className="fw-bold text-center">
                      BP SÓNG
                    </th>
                    <th colSpan="2" className="fw-bold text-center">
                      BP IN ẤN
                    </th>
                    <th colSpan="5" className="fw-bold text-center">
                      BP CHẾ BIẾN
                    </th>
                    <th colSpan="2" className="fw-bold text-center">
                      BP GHIM DÁN
                    </th>
                  </>
                )}
                {activeTab === "song" && (
                  <>
                    <th colSpan="11" className="fw-bold text-center">
                      BP SÓNG
                    </th>
                  </>
                )}
                {activeTab === "inAn" && (
                  <>
                    <th colSpan="7" className="fw-bold text-center">
                      BP IN ẤN
                    </th>
                  </>
                )}
                {activeTab === "cheBien" && (
                  <>
                    <th colSpan="8" className="fw-bold text-center">
                      BP CHẾ BIẾN
                    </th>
                  </>
                )}
                {activeTab === "ghimDan" && (
                  <>
                    <th colSpan="2" className="fw-bold text-center">
                      BP GHIM DÁN
                    </th>
                  </>
                )}
              </tr>
              <tr style={{ backgroundColor: departmentBg[activeTab] }}>
                {activeTab === "keHoach" && (
                  <>
                    <th className="text-center fw-bold">Dàn 5L</th>
                    <th className="text-center fw-bold">Dàn 7L</th>
                    <th className="text-center fw-bold">Máy SX</th>
                    <th className="text-center fw-bold">Trạng Thái</th>
                    <th className="text-center fw-bold">Công Đoạn 1</th>
                    <th className="text-center fw-bold">Công Đoạn 2</th>
                    <th className="text-center fw-bold">Công Đoạn 3</th>
                    <th className="text-center fw-bold">Công Đoạn 4</th>
                    <th className="text-center fw-bold">Trạng Thái</th>
                    <th className="text-center fw-bold">Gia Công</th>
                    <th className="text-center fw-bold">Trạng Thái</th>
                  </>
                )}
                {activeTab === "song" && (
                  <>
                    <th className="fw-bold text-center">Dàn 5L</th>
                    <th className="fw-bold text-center">Dàn 7L</th>
                    <th className="fw-bold text-center">Khổ</th>
                    <th className="fw-bold text-center">Cắt dài</th>
                    <th className="fw-bold text-center">Cánh</th>
                    <th className="fw-bold text-center">Số SP</th>
                    <th className="fw-bold text-center">Tấm chặt</th>
                    <th className="fw-bold text-center">Mét dài</th>
                    <th className="fw-bold text-center">PartSX</th>
                    <th className="fw-bold text-center">Khổ giấy</th>
                    <th className="fw-bold text-center">Lề biên</th>
                  </>
                )}
                {activeTab === "inAn" && (
                  <>
                    <th className="fw-bold text-center">Gia Công</th>
                    <th className="fw-bold text-center">Máy SX</th>
                    <th className="fw-bold text-center">Màu 1</th>
                    <th className="fw-bold text-center">Màu 2</th>
                    <th className="fw-bold text-center">Màu 3</th>
                    <th className="fw-bold text-center">Màu 4</th>
                    <th className="fw-bold text-center">Trạng Thái</th>
                  </>
                )}
                {activeTab === "cheBien" && (
                  <>
                    <th className="fw-bold text-center">Công Đoạn 1</th>
                    <th className="fw-bold text-center">Trạng Thái</th>
                    <th className="fw-bold text-center">Công Đoạn 2</th>
                    <th className="fw-bold text-center">Trạng Thái</th>
                    <th className="fw-bold text-center">Công Đoạn 3</th>
                    <th className="fw-bold text-center">Trạng Thái</th>
                    <th className="fw-bold text-center">Công Đoạn 4</th>
                    <th className="fw-bold text-center">Trạng Thái</th>
                  </>
                )}
                {activeTab === "ghimDan" && (
                  <>
                    <th className="fw-bold text-center">Gia Công</th>
                    <th className="fw-bold text-center">Trạng Thái</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => {
                const textStyle = getRowTextStyle(order);

                return (
                  <tr
                    key={`order-${order.id}`}
                    style={{
                      textAlign: "center",
                      ...textStyle,
                      fontWeight: "500",
                    }}
                  >
                    {renderDepartmentTable(order)}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </Container>
  );
}
