import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  InputGroup,
  Tooltip,
  Dropdown,
  OverlayTrigger,
  Modal,
} from "react-bootstrap";
import { commands as initialCommands } from "../data/mockData-commands";

const CommandManager = () => {
  const [commands, setCommands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCommand, setEditingCommand] = useState(null);
  const [formData, setFormData] = useState({
    productionOrderCode: "",
    customer: "",
    wareCode: "",
    waveType: "",
    length: "",
    width: "",
    height: "",
    amount: "",
    status: "waiting",
    receiveDate: "",
    deliveryDate: "",
    priority: 1,
    note: "",
  });


  useEffect(() => {
    const sorted = [...initialCommands].sort((a, b) => b.priority - a.priority);
    setCommands(sorted);
  }, []);

  useEffect(() => {
    setCommands((prev) => [...prev].sort((a, b) => b.priority - a.priority));
  }, [commands.length]);

  // 🧠 Lọc danh sách
  const filteredCommands = commands.filter((command) => {
    const matchSearch =
      command.productionOrderCode
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      command.customer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === "" || command.status === statusFilter;
    const matchReceiveDate =
      new Date(command.receiveDate) >= new Date(startDate) || startDate === "";
    const matchDeliveryDate =
      new Date(command.deliveryDate) <= new Date(endDate) || endDate === "";

    return matchSearch && matchStatus && matchReceiveDate && matchDeliveryDate;
  });

  // 🧩 Định dạng hiển thị
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d)) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  };

  const formatStatus = (stat) => {
    switch (stat) {
      case "waiting":
        return "Chờ SX";
      case "running":
        return "Đang SX";
      case "complete":
        return "Hoàn Thành";
      case "cancel":
        return "Hủy";
      default:
        return "";
    }
  };

  const formatPriority = (priority) => {
    switch (priority) {
      case 1:
        return "#ffffff";
      case 2:
        return "#e6f5ff";
      case 3:
        return "#ffe6e6";
      default:
        return "#fff";
    }
  };

  // ⚙️ Xử lý mở modal
  const handleShowModal = (command = null) => {
    if (command) {
      setEditingCommand(command);
      setFormData(command);
    } else {
      setEditingCommand(null);
      setFormData({
        productionOrderCode: "",
        customer: "",
        wareCode: "",
        waveType: "",
        length: "",
        width: "",
        height: "",
        amount: "",
        status: "waiting",
        receiveDate: "",
        deliveryDate: "",
        priority: 1,
        note: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (["customer", "wareCode", "waveType"].includes(name)) {
      newValue = value.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "priority" ? Number(newValue) : newValue,
    }));
  };

  // 🧾 Lưu thêm/cập nhật
  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingCommand) {
      // cập nhật
      setCommands((prev) =>
        prev.map((cmd) =>
          cmd.productionOrderCode === editingCommand.productionOrderCode
            ? formData
            : cmd
        )
      );
    } else {
      // thêm mới
      setCommands((prev) => [...prev, formData]);
    }

    setShowModal(false);
  };

  // 🗑️ Xóa lệnh
  const handleDelete = (code) => {
    if (window.confirm(`Bạn có chắc muốn xóa lệnh ${code}?`)) {
      setCommands((prev) =>
        prev.filter((cmd) => cmd.productionOrderCode !== code)
      );
    }
  };

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4 fw-bold">Quản lý lệnh</h2>

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
            <option value={"waiting"}>Chờ SX</option>
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

        <Col md={2}>
          <Form.Label className="small text-muted mb-1">Ngày giao</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Col>

        <Col md={3} className="text-end">
          <Button
            variant="dark"
            className="px-4"
            onClick={() => handleShowModal()}
          >
            <i className="bi bi-plus-circle me-2"></i> Tạo lệnh mới
          </Button>
        </Col>
      </Row>

      {/* Bảng hiển thị */}
      <Table bordered hover responsive style={{ fontSize: "14px" }}>
        <thead style={{ backgroundColor: "#f8f9fa" }}>
          <tr>
            <th className="text-center">Lệnh SX</th>
            <th className="text-center">Khách Hàng</th>
            <th className="text-center">Mã Hàng</th>
            <th className="text-center">Sóng</th>
            <th className="text-center">Dài/Khổ</th>
            <th className="text-center">Rộng/CD</th>
            <th className="text-center">Cao</th>
            <th className="text-center">SL</th>
            <th className="text-center">Trạng thái</th>
            <th className="text-center">Ngày Nhận</th>
            <th className="text-center">Ngày Giao</th>
            <th className="text-center">Ghi Chú</th>
            <th className="text-center">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredCommands.map((order, index) => (
            <tr key={index}>
              <td
                className="text-center fw-semibold"
                style={{ backgroundColor: formatPriority(order.priority) }}
              >
                {order.productionOrderCode}
              </td>
              <td
                className="text-center"
                style={{ backgroundColor: formatPriority(order.priority) }}
              >
                {order.customer}
              </td>
              <td style={{ backgroundColor: formatPriority(order.priority) }}>
                {order.wareCode}
              </td>
              <td
                className="text-center"
                style={{ backgroundColor: formatPriority(order.priority) }}
              >
                {order.waveType}
              </td>
              <td
                className="text-center"
                style={{ backgroundColor: formatPriority(order.priority) }}
              >
                {order.length}
              </td>
              <td
                className="text-center"
                style={{ backgroundColor: formatPriority(order.priority) }}
              >
                {order.width}
              </td>
              <td
                className="text-center"
                style={{ backgroundColor: formatPriority(order.priority) }}
              >
                {order.height}
              </td>
              <td
                className="text-center"
                style={{ backgroundColor: formatPriority(order.priority) }}
              >
                {order.amount.toLocaleString()}
              </td>
              <td
                className="text-center"
                style={{ backgroundColor: formatPriority(order.priority) }}
              >
                {formatStatus(order.status)}
              </td>
              <td
                className="text-center"
                style={{ backgroundColor: formatPriority(order.priority) }}
              >
                {formatDate(order.receiveDate)}
              </td>
              <td
                className="text-center"
                style={{ backgroundColor: formatPriority(order.priority) }}
              >
                {formatDate(order.deliveryDate)}
              </td>
              <td
                className="text-center"
                style={{ backgroundColor: formatPriority(order.priority) }}
              >
                {order.note}
              </td>
              <td
                className="text-center"
                style={{ backgroundColor: formatPriority(order.priority) }}
              >
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Cập nhật</Tooltip>}
                >
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-dark me-2"
                    onClick={() => handleShowModal(order)}
                  >
                    <i className="bi bi-pencil-fill"></i>
                  </Button>
                </OverlayTrigger>

                <Dropdown align="end" className="d-inline">
                  <Dropdown.Toggle
                    as={Button}
                    variant="link"
                    size="sm"
                    className="p-0 text-dark"
                  >
                    <i className="bi bi-three-dots"></i>
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    style={{ minWidth: "120px", fontSize: "13px" }}
                  >
                    <Dropdown.Item
                      className="text-danger"
                      onClick={() => handleDelete(order.productionOrderCode)}
                    >
                      Xóa
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 🧾 Modal thêm/sửa */}
      <Modal show={showModal} onHide={handleCloseModal} centered >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCommand
              ? "Cập nhật lệnh sản xuất"
              : "Tạo mới lệnh sản xuất"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-2">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Mã lệnh SX</Form.Label>
                  <Form.Control
                    name="productionOrderCode"
                    value={formData.productionOrderCode}
                    placeholder="2190/08"
                    onChange={handleChange}
                    required
                    disabled={!!editingCommand}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Khách hàng</Form.Label>
                  <Form.Control
                    name="customer"
                    value={formData.customer}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Mã hàng</Form.Label>
                  <Form.Control
                    name="wareCode"
                    value={formData.wareCode}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Sóng</Form.Label>
                  <Form.Control
                    name="waveType"
                    value={formData.waveType}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Số lượng</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Dài</Form.Label>
                  <Form.Control
                    type="number"
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Rộng</Form.Label>
                  <Form.Control
                    type="number"
                    name="width"
                    value={formData.width}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Cao</Form.Label>
                  <Form.Control
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ngày nhận</Form.Label>
                  <Form.Control
                    type="date"
                    name="receiveDate"
                    value={formData.receiveDate}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ngày giao</Form.Label>
                  <Form.Control
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="waiting">Chờ SX</option>
                    <option value="running">Đang SX</option>
                    <option value="complete">Hoàn Thành</option>
                    <option value="cancel">Hủy</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Độ ưu tiên</Form.Label>
                  <Form.Select
                    name="priority"
                    value={+formData.priority}
                    onChange={handleChange}
                  >
                    <option value="1">Thấp</option>
                    <option value="2">Trung bình</option>
                    <option value="3">Cao</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="text-end mt-3">
              <Button variant="secondary" onClick={handleCloseModal}>
                Hủy
              </Button>{" "}
              <Button variant="primary" type="submit">
                {editingCommand ? "Lưu thay đổi" : "Tạo mới"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export { CommandManager };
