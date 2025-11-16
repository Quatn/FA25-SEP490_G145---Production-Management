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
  Button,
} from "react-bootstrap";

import { mockDataBPSong } from "../../service/mock-data/mock-tracking-wave";

// Hàm lấy màu dòng
const getRowBackgroundColor = (order) => {
  if (order.status === "Hoàn Thành") return "#c8e6c9"; // xanh lá nhạt
  if (order.priority === 1 && order.status !== "Hủy") return "#ffcdd2";
  if (order.priority === 2 && order.status !== "Hủy") return "#C9F1FD";
  return "#ffffff";
};

// Style chữ
const getRowTextStyle = (order) => {
  if (order.status === "Hoàn Thành")
    return { fontWeight: 600, color: "#2e7d32" };
  if (order.status === "Hủy") {
    return {
      textDecoration: "line-through",
      fontWeight: "500",
      color: "#c62828",
    };
  }
  return {};
};

// Hàm màu chữ cho số lượng SX
const getAmountColor = (order, amountValue) => {
  if (amountValue < order.requiredAmount) return "#b71c1c"; // Đỏ đậm
  if (amountValue === order.requiredAmount) return "#1b5e20"; // Xanh lá đậm
  if (amountValue > order.requiredAmount) return "#4a148c"; // Tím đậm
  return "black";
};

export default function WaveTracking() {
  const [activeTab, setActiveTab] = useState("5L");
  const [searchTerm, setSearchTerm] = useState("");
  const [amounts, setAmounts] = useState({});
  const [data, setData] = useState(mockDataBPSong);

  const handleAmountChange = (id, delta) => {
    setAmounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + delta,
    }));
  };

  const filteredOrders = useMemo(() => {
    const statusOrder = { Chạy: 1, Chờ: 2, "Hoàn Thành": 3, Hủy: 4 };
    return data
      .filter((o) => {
        const matchTab =
          activeTab === "5L"
            ? o.waveType?.startsWith("5")
            : o.waveType?.startsWith("7");
        const matchSearch =
          o.productionOrderCode
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          o.customer?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchTab && matchSearch;
      })
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
      });
  }, [activeTab, searchTerm]);

  return (
    <Container fluid className="p-4">
      <h4 className="fw-bold mb-3 text-primary">
        Theo dõi lệnh sản xuất - Bộ phận Sóng
      </h4>

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
      </Row>

      <Nav variant="tabs" className="mb-3">
        {["5L", "7L"].map((tabKey) => (
          <Nav.Item key={tabKey}>
            <Nav.Link
              active={activeTab === tabKey}
              onClick={() => setActiveTab(tabKey)}
              style={{
                fontWeight: activeTab === tabKey ? "600" : "500",
                backgroundColor: activeTab === tabKey ? "#b3e5fc" : "#fff",
              }}
            >
              Dàn {tabKey}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* Bảng hiển thị */}
      <div
        style={{
          display: "flex",
          border: "1px solid #dee2e6",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Bảng cố định */}
        <div style={{ flexShrink: 0 }}>
          <Table bordered hover style={{ margin: 0, fontSize: "13.5px" }}>
            <thead style={{ backgroundColor: "#0288d1", color: "white" }}>
              <tr>
                {[
                  "Lệnh SX",
                  "Khách Hàng",
                  "Mã Hàng",
                  "Sóng",
                  "Dài",
                  "Rộng",
                  "Cao",
                  "Số Lượng",
                  "Trạng Thái",
                  "Gia công",
                ].map((header) => (
                  <th key={header} className="text-center align-middle fw-bold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  {[
                    order.productionOrderCode,
                    order.customer,
                    order.wareCode,
                    order.waveType,
                    order.wareLength,
                    order.wareWidth,
                    order.wareHeight,
                    order.requiredAmount,
                    order.status,
                    order.giaCong,
                  ].map((val, i) => (
                    <td
                      key={i}
                      className={
                        i == 2 ? "align-middle" : "text-center align-middle"
                      }
                      style={{
                        backgroundColor: getRowBackgroundColor(order),
                        ...getRowTextStyle(order),
                        fontWeight: "500",
                        height: "47.4px",
                      }}
                    >
                      {val || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Bảng kỹ thuật cuộn ngang */}
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
            style={{ margin: 0, fontSize: "13.5px", minWidth: "1300px" }}
          >
            <thead style={{ backgroundColor: "#b3e5fc" }}>
              <tr>
                {(activeTab === "5L"
                  ? [
                      "Chú Ý",
                      "Khổ",
                      "Cắt dài",
                      "Cánh",
                      "Số Part",
                      "Tấm chặt",
                      "Số Lượng SX",
                      "Mét SX",
                      "Khổ giấy",
                      "Mặt in",
                      "Sóng B",
                      "Lớp giữa",
                      "Sóng A",
                      "Đáy SP",
                      "Thao tác",
                    ]
                  : [
                      "Chú Ý",
                      "Khổ",
                      "Cắt dài",
                      "Cánh",
                      "Số Part",
                      "Tấm chặt",
                      "Số Lượng cần SX",
                      "Mét SX",
                      "Khổ giấy",
                      "Mặt SP (Mặt in)",
                      "Sóng E",
                      "Lớp giữa",
                      "Sóng B",
                      "Lớp giữa",
                      "Sóng C",
                      "Đáy SP",
                      "Thao tác",
                    ]
                ).map((header, idx) => (
                  <th key={`${header}-${idx}`} className="text-center fw-bold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => {
                const amountValue =
                  amounts[order.id] !== undefined
                    ? order.producedAmount + amounts[order.id]
                    : order.producedAmount;

                return (
                  <tr key={order.id}>
                    {/* Cột chung */}
                    {[
                      order.notice,
                      order.blankWidth,
                      order.sheetLength,
                      order.flap,
                      order.part,
                      order.numberOfBlanks,
                      // Cột số lượng
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                        }}
                      >
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => handleAmountChange(order.id, -100)}
                        >
                          -
                        </Button>
                        <span
                          style={{
                            textDecoration: "underline",
                            minWidth: "60px",
                            textAlign: "center",
                            color: getAmountColor(order, amountValue),
                            fontWeight: "600",
                          }}
                        >
                          {amountValue}
                        </span>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => handleAmountChange(order.id, 100)}
                        >
                          +
                        </Button>
                      </div>,
                      order.metSx,
                      <span style={{ color: "blue", fontWeight: "600" }}>
                        {order.paperWidth}
                      </span>,
                    ]
                      .concat(
                        activeTab === "5L"
                          ? [
                              order.matIn,
                              order.songB,
                              order.lopGiua,
                              order.songA,
                              order.daySP,
                            ]
                          : [
                              order.matIn,
                              order.songE,
                              order.lopGiua1,
                              order.songB,
                              order.lopGiua2,
                              order.songC,
                              order.daySP,
                            ]
                      )
                      .concat([
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => alert("Cập nhật thành công!")}
                        >
                          Cập nhật
                        </Button>,
                      ])
                      .map((val, i) => (
                        <td
                          key={i}
                          className={
                            i == 0 ? "align-middle" : "text-center align-middle"
                          }
                          style={{
                            backgroundColor: getRowBackgroundColor(order),
                            ...getRowTextStyle(order),
                            fontWeight: "500",
                          }}
                        >
                          {val || "-"}
                        </td>
                      ))}
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
