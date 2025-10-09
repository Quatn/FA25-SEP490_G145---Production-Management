import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  InputGroup,
  Badge,
  Modal,
} from "react-bootstrap";

import { commands } from "../data/mockData-commands";
import { importForm, exportForm } from "../data/mockData-inventory-management";

const ImportExportManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isImport, setIsImport] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateQuantity, setUpdateQuantity] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchOrderCode, setSearchOrderCode] = useState("");
  const [selectedCommand, setSelectedCommand] = useState(null);

  // Load data khi thay đổi giữa nhập/xuất
  useEffect(() => {
    const currentData = isImport ? importForm : exportForm;
    setData(currentData);
    setFilteredData(currentData);
  }, [isImport]);

  // Lọc data khi có thay đổi filter
  useEffect(() => {
    let result = [...data];

    // Lọc theo mã lệnh SX
    if (searchTerm) {
      result = result.filter((item) =>
        item.productionOrderCode
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo trạng thái
    if (statusFilter) {
      result = result.filter((item) => item.status === statusFilter);
    }

    // Lọc theo ngày
    if (startDate && result.length > 0) {
      result = result.filter((item) => {
        const batches = isImport ? item.ImportBatches : item.exportBatches;
        return batches.some((batch) => batch.date === startDate);
      });
    }

    setFilteredData(result);
  }, [searchTerm, statusFilter, startDate, data, isImport]);

  // Lấy thông tin chi tiết từ commands
  const getCommandDetails = (productionOrderCode) => {
    return commands.find(
      (cmd) => cmd.productionOrderCode === productionOrderCode
    );
  };

  // Xử lý thay đổi trạng thái
  const handleStatusChange = (orderId, newStatus) => {
    const updatedData = data.map((item) =>
      item.id === orderId ? { ...item, status: newStatus } : item
    );
    setData(updatedData);
  };

  const handleShowDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleShowUpdate = (order) => {
    setSelectedOrder(order);
    setShowUpdateModal(true);
    setUpdateQuantity("");
  };

  const handleClose = () => {
    setShowDetailModal(false);
    setShowUpdateModal(false);
    setSelectedOrder(null);
  };

  const handleConfirmUpdate = () => {
    if (!updateQuantity || isNaN(updateQuantity) || updateQuantity <= 0) {
      alert("Vui lòng nhập số lượng hợp lệ!");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn cập nhật số lượng này?")) {
      const updatedData = data.map((item) => {
        if (item.id === selectedOrder.id) {
          // Các field cần cập nhật
          const totalField = isImport
            ? "totalImportQuantity"
            : "totalExportQuantity";
          const remainField = isImport
            ? "quantityImportRemaining"
            : "quantityExportRemaining";
          const batchField = isImport ? "ImportBatches" : "exportBatches";

          // Tạo đợt mới
          const newBatch = {
            batchNumber: (item[batchField]?.length || 0) + 1,
            date: new Date().toISOString().split("T")[0], // format yyyy-mm-dd
            quantity: Number(updateQuantity),
          };

          // Cập nhật dữ liệu
          const newTotal = item[totalField] + Number(updateQuantity);
          const newRemain = Math.max(
            item[remainField] - Number(updateQuantity),
            0
          );
          const updatedBatches = [...(item[batchField] || []), newBatch];

          return {
            ...item,
            [totalField]: newTotal,
            [remainField]: newRemain,
            [batchField]: updatedBatches,
          };
        }
        return item;
      });

      setData(updatedData);
      setShowUpdateModal(false);
      alert("Cập nhật thành công!");
    }
  };

  // Format trạng thái
  const getStatusStyle = (status) => {
    const statusMap = {
      running: { text: "Đang SX", bg: "#ffc107", color: "#000" },
      complete: { text: "Hoàn Thành", bg: "#198754", color: "#fff" },
      cancel: { text: "Hủy", bg: "#dc3545", color: "#fff" },
    };
    return statusMap[status] || { text: status, bg: "#6c757d", color: "#fff" };
  };

  // Format ngày
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d)) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  };

  const formatDateDetail = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4 fw-bold">
        Quản lý đơn {isImport ? "nhập" : "xuất"} của kho bán thành phẩm
      </h2>

      {/* Bộ lọc */}
      <Row className="mb-4 align-items-end">
        <Col md={3}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm theo lệnh SX"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>

        <Col md={2}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value={""}>Trạng thái</option>
            <option value={"running"}>Đang SX</option>
            <option value={"complete"}>Hoàn Thành</option>
            <option value={"cancel"}>Hủy</option>
          </Form.Select>
        </Col>

        <Col md={2}>
          <Form.Label className="small text-muted mb-1">Ngày nhận</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Col>

        <Col md={1} className="text-end">
          <Button
            variant="dark"
            className="px-4"
            active={isImport}
            disabled={isImport}
            onClick={() => setIsImport(true)}
          >
            Nhập
          </Button>
        </Col>

        <Col md={1}>
          <Button
            variant="dark"
            className="px-4"
            active={!isImport}
            disabled={!isImport}
            onClick={() => setIsImport(false)}
          >
            Xuất
          </Button>
        </Col>

        <Col md={3} className="text-end">
          <Button
            variant="dark"
            className="px-4"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-plus-circle me-2"></i> Tạo đơn{" "}
            {isImport ? "nhập" : "xuất"} mới
          </Button>
        </Col>
      </Row>

      {/* Bảng hiển thị */}
      <Table bordered hover responsive style={{ fontSize: "14px" }}>
        <thead style={{ backgroundColor: "#f8f9fa" }}>
          <tr>
            <th className="text-center">Lệnh SX</th>
            <th className="text-center">Khách Hàng</th>
            <th className="text-center">Sóng</th>
            <th className="text-center">Dài/Khổ</th>
            <th className="text-center">Rộng/CD</th>
            <th className="text-center">Cao</th>
            <th className="text-center">SL</th>
            <th className="text-center">Trạng thái</th>
            <th className="text-center">Ngày Nhận</th>
            <th className="text-center">SLTT</th>
            <th className="text-center">Còn Lại</th>
            <th className="text-center">Ghi Chú</th>
            <th className="text-center">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((order) => {
            const commandDetail = getCommandDetails(order.productionOrderCode);
            const totalQuantity = isImport
              ? order.totalImportQuantity
              : order.totalExportQuantity;
            const quantityRemaining = isImport
              ? order.quantityImportRemaining
              : order.quantityExportRemaining;

            return (
              <tr key={order.id}>
                <td className="text-center fw-semibold">
                  {order.productionOrderCode}
                </td>
                <td className="text-center">
                  {commandDetail?.customer || "-"}
                </td>
                <td className="text-center">
                  {commandDetail?.waveType || "-"}
                </td>
                <td className="text-center">{commandDetail?.length || "-"}</td>
                <td className="text-center">{commandDetail?.width || "-"}</td>
                <td className="text-center">{commandDetail?.height || "-"}</td>
                <td className="text-center">
                  {commandDetail?.amount.toLocaleString() || "-"}
                </td>
                <td className="text-center">
                  <Form.Select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    style={{
                      width: "130px",
                      margin: "0 auto",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontWeight: "500",
                      fontSize: "13px",
                      backgroundColor: getStatusStyle(order.status).bg,
                      color: getStatusStyle(order.status).color,
                      border: "none",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <option
                      value="running"
                      style={{ backgroundColor: "#fff", color: "#000" }}
                    >
                      Đang SX
                    </option>
                    <option
                      value="complete"
                      style={{ backgroundColor: "#fff", color: "#000" }}
                    >
                      Hoàn Thành
                    </option>
                    <option
                      value="cancel"
                      style={{ backgroundColor: "#fff", color: "#000" }}
                    >
                      Hủy
                    </option>
                  </Form.Select>
                </td>
                <td className="text-center">
                  {commandDetail?.receiveDate
                    ? formatDate(commandDetail.receiveDate)
                    : "-"}
                </td>
                <td className="text-center">
                  {totalQuantity?.toLocaleString() || 0}
                </td>
                <td className="text-center">
                  {quantityRemaining?.toLocaleString() || 0}
                </td>
                <td className="text-center">{order.note || "-"}</td>
                <td className="text-center">
                  <Button
                    variant="link"
                    size="sm"
                    className="text-decoration-none"
                    onClick={() => handleShowUpdate(order)}
                  >
                    Cập nhật
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-decoration-none"
                    onClick={() => handleShowDetail(order)}
                  >
                    Chi tiết
                  </Button>
                </td>
              </tr>
            );
          })}
          {filteredData.length === 0 && (
            <tr>
              <td colSpan="13" className="text-center py-4 text-muted">
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showDetailModal} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thông tin chi tiết</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-2">
                <Col>
                  <strong>Lệnh Sản Xuất:</strong>{" "}
                  {selectedOrder.productionOrderCode}
                </Col>
                <Col>
                  <strong>Khách Hàng:</strong>{" "}
                  {
                    getCommandDetails(selectedOrder.productionOrderCode)
                      ?.customer
                  }
                </Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  <strong>Mã Hàng:</strong>{" "}
                  {
                    getCommandDetails(selectedOrder.productionOrderCode)
                      ?.wareCode
                  }
                </Col>
                <Col>
                  <strong>Sóng:</strong>{" "}
                  {
                    getCommandDetails(selectedOrder.productionOrderCode)
                      ?.waveType
                  }
                </Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  <strong>Kích Thước:</strong>{" "}
                  {(() => {
                    const cmd = getCommandDetails(
                      selectedOrder.productionOrderCode
                    );
                    if (!cmd) return "-";
                    const { length, width, height } = cmd;
                    return `${length}x${width}${height ? `x${height}` : ""}`;
                  })()}
                </Col>
                <Col>
                  <strong>Số Lượng:</strong>{" "}
                  {getCommandDetails(
                    selectedOrder.productionOrderCode
                  )?.amount?.toLocaleString()}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  <strong>Ngày Nhận:</strong>{" "}
                  {formatDate(
                    getCommandDetails(selectedOrder.productionOrderCode)
                      ?.receiveDate
                  )}
                </Col>
                <Col>
                  <strong>Còn Lại:</strong>{" "}
                  {isImport
                    ? selectedOrder.quantityImportRemaining
                    : selectedOrder.quantityExportRemaining}
                </Col>
              </Row>
              <hr />
              <h6>Các đợt {isImport ? "nhập" : "xuất"}</h6>
              <Table bordered size="sm">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Số lượng</th>
                  </tr>
                </thead>
                <tbody>
                  {(isImport
                    ? selectedOrder.ImportBatches
                    : selectedOrder.exportBatches
                  )?.map((b, idx) => (
                    <tr key={idx}>
                      <td>{formatDateDetail(b.date)}</td>
                      <td>{b.quantity.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="text-end fw-bold">
                Tổng:{" "}
                {isImport
                  ? selectedOrder.totalImportQuantity
                  : selectedOrder.totalExportQuantity}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={handleClose}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showUpdateModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật số lượng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nhập số lượng cần cập nhật</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={updateQuantity}
                onChange={(e) => setUpdateQuantity(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button variant="dark" onClick={handleConfirmUpdate}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false);
          setSearchOrderCode("");
          setSelectedCommand(null);
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Tạo đơn {isImport ? "nhập" : "xuất"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <Form.Label>Lệnh Sản Xuất*</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập mã lệnh SX..."
              value={searchOrderCode}
              onChange={(e) => setSearchOrderCode(e.target.value)}
            />
          </Form.Group>

          <div
            className="mt-3"
            style={{
              maxHeight: "350px",
              overflowY: "auto",
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "10px",
            }}
          >
            {commands
              .filter((cmd) =>
                cmd.productionOrderCode
                  .toLowerCase()
                  .includes(searchOrderCode.toLowerCase())
              )
              .map((cmd, index) => (
                <div key={cmd.productionOrderCode}>
                  <div
                    className={`p-3 rounded ${
                      selectedCommand?.productionOrderCode ===
                      cmd.productionOrderCode
                        ? "bg-light border border-dark"
                        : "border"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedCommand(cmd)}
                  >
                    {/* --- Dòng tiêu đề: Lệnh sản xuất + Priority badge --- */}
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h6 className="mb-0 fw-bold text-dark">
                        Lệnh Sản Xuất: {cmd.productionOrderCode}
                      </h6>
                      <span
                        className={`badge rounded-pill px-3 py-2 ${
                          cmd.priority === 3
                            ? "bg-danger"
                            : cmd.priority === 2
                            ? "bg-warning text-dark"
                            : "bg-secondary"
                        }`}
                      >
                        {cmd.priority == 3 ? "Cao" : (cmd.priority == 2 ? "Trung Bình" : "Thấp") }
                      </span>
                    </div>

                    {/* --- Thông tin chi tiết --- */}
                    <div className="text-secondary small">
                      <div>
                        <strong>Khách Hàng:</strong> {cmd.customer} &nbsp; •
                        &nbsp;
                        <strong>Mã Hàng:</strong> {cmd.wareCode}
                      </div>
                      <div>
                        <strong>Kích Thước (DxRxC):</strong> {cmd.length}x
                        {cmd.width}
                        {cmd.height ? `x${cmd.height}` : ""} &nbsp; • &nbsp;
                        <strong>Sóng:</strong> {cmd.waveType} &nbsp; • &nbsp;
                        <strong>Số Lượng:</strong> {cmd.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* --- Gạch phân cách giữa các command --- */}
                  {index < commands.length - 1 && (
                    <hr className="my-3 text-muted" style={{ opacity: 0.4 }} />
                  )}
                </div>
              ))}

            {/* --- Không tìm thấy kết quả --- */}
            {searchOrderCode &&
              commands.filter((cmd) =>
                cmd.productionOrderCode
                  .toLowerCase()
                  .includes(searchOrderCode.toLowerCase())
              ).length === 0 && (
                <p className="text-center text-muted mt-2">
                  Không tìm thấy lệnh phù hợp
                </p>
              )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="dark"
            disabled={!selectedCommand}
            onClick={() => {
              const newOrder = {
                id: Date.now(),
                productionOrderCode: selectedCommand.productionOrderCode,
                status: "running",
                note: "",
                ...(isImport
                  ? {
                      totalImportQuantity: 0,
                      quantityImportRemaining: selectedCommand.amount,
                      ImportBatches: [],
                    }
                  : {
                      totalExportQuantity: 0,
                      quantityExportRemaining: selectedCommand.amount,
                      exportBatches: [],
                    }),
              };

              const newData = [...data, newOrder];
              setData(newData);
              setShowCreateModal(false);
              setSearchOrderCode("");
              setSelectedCommand(null);
              alert(`Đã tạo đơn ${isImport ? "nhập" : "xuất"} mới thành công!`);
            }}
          >
            Tạo mới
          </Button>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Hủy bỏ
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export { ImportExportManagement };
