"use client";
import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Collapse,
  Button,
  Form,
  InputGroup,
  Modal,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ProductList() {
  const mockProducts = [
    {
      unique_id: "CAT-0001",
      product_code: "VN-BOX-001",
      customer_code: "AROMA",
      product_name: "Thùng carton Aroma 5 lớp",
      description:
        "Thùng carton 5 lớp sử dụng để đóng gói sản phẩm nước hoa Aroma",
      length: 200,
      width: 300,
      height: 100,
      quantity: 200,
      product_type: "Bộ",
      received_date: "2025-10-25",
      delivery_date: "2025-11-02",
      item_codes: [
        {
          id: 1,
          product_code: "VN 240*125*260 (WX1-0202)",
          wave_type: "5C",
          length: 260,
          width_panel_flap: 730,
          height: 240,
          paper_size: 1100,
        },
        {
          id: 2,
          product_code: "VN 250*130*270 (WX1-0203)",
          wave_type: "5C",
          length: 270,
          width_panel_flap: 740,
          height: 250,
          paper_size: 1120,
        },
      ],
    },
    {
      unique_id: "CAT-0003",
      product_code: "VN-BOX-003",
      customer_code: "THUẬN AN",
      product_name: "Thùng carton 7 lớp",
      description: "Thùng carton 7 lớp cho sản phẩm công nghiệp",
      length: 610,
      width: 508,
      height: 324,
      quantity: 150,
      product_type: "Lót",
      received_date: "2025-10-28",
      delivery_date: "2025-11-05",
      item_codes: [
        {
          id: 1,
          product_code: "VN 610*508*324 (TA-0707)",
          wave_type: "7CBE",
          length: 610,
          width_panel_flap: 508,
          height: 324,
          paper_size: 1250,
        },
      ],
    },
    {
      unique_id: "CAT-0005",
      product_code: "VN-BOX-005",
      customer_code: "MAY YÊN",
      product_name: "Thùng carton 5 lớp TAG",
      description: "Thùng carton 5 lớp có TAG cho sản phẩm may mặc",
      length: 940,
      width: 680,
      height: 280,
      quantity: 100,
      product_type: "Thùng",
      received_date: "2025-10-26",
      delivery_date: "2025-11-03",
      item_codes: [
        {
          id: 1,
          product_code: "VN 940*680*280 (MY-0505)",
          wave_type: "3BC",
          length: 940,
          width_panel_flap: 680,
          height: 280,
          paper_size: 1500,
        },
      ],
    },
  ];

  const availableItemCodes = [
    {
      id: 1,
      customer: "AROMA",
      product_code: "VN 240*125*260 (WX1-0202)",
      production_type: "5CB",
      length: 260,
      width_panel_flap: 730,
      processing_type: "Tấm",
      quantity: 2.0,
      processing_size: 260,
      processing_cd: 730,
      quantity_per_sheet: 2,
      dock_position: "",
      dock_flap_sum: "",
      dock_part: "",
      dock_part_2: 4,
      margin: 30,
      paper_size: 1100,
    },
    {
      id: 2,
      customer: "THUẬN AN",
      product_code: "7L 610*508*324",
      production_type: "7CBE",
      length: 610,
      width_panel_flap: 508,
      height: 324,
      processing_type: "Ghép",
      quantity: 1.0,
      processing_size: 836,
      processing_cd: 2266,
      product_lid_flap: 256,
      quantity_per_sheet: "",
      dock_position: 30,
      dock_flap_sum: 2,
      dock_part: 1,
      dock_part_2: 1,
      margin: 32,
      paper_size: 900,
    },
    {
      id: 3,
      customer: "MAY YÊN",
      product_code: "H5L 940*680*280 TAG",
      production_type: "5AB",
      length: 940,
      width_panel_flap: 680,
      height: 280,
      processing_type: "Liền",
      quantity: 0.5,
      processing_size: 964,
      processing_cd: 1655,
      product_lid_flap: 342,
      quantity_per_sheet: "",
      dock_position: "",
      dock_flap_sum: "",
      dock_part: 1,
      dock_part_2: 1,
      margin: 18,
      paper_size: 1000,
    },
    {
      id: 4,
      customer: "AROMA",
      product_code: "H5L 185*185*310",
      production_type: "5CB",
      length: 185,
      width_panel_flap: 185,
      height: 310,
      processing_type: "Tấm",
      quantity: 1.0,
      processing_size: 499,
      processing_cd: 775,
      product_lid_flap: 94.5,
      quantity_per_sheet: "",
      dock_position: "",
      dock_flap_sum: "",
      dock_part: 3,
      dock_part_2: 3,
      margin: 27,
      paper_size: 1550,
    },
  ];

  const [openIds, setOpenIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // 🔹 State mới (thay cho showAddProductModal & newProduct)
  const [editingProduct, setEditingProduct] = useState(null);

  // 🔹 Hàm mở modal
  const handleOpenProductModal = (product = null) => {
    setEditingProduct(
      product
        ? { ...product } // Chỉnh sửa
        : {
            product_code: "",
            customer_code: "",
            product_name: "",
            description: "",
            length: "",
            width: "",
            height: "",
            quantity: "",
            product_type: "Bộ",
            received_date: "",
            delivery_date: "",
            item_codes: [],
          } // Thêm mới
    );
  };

  // 🔹 Hàm đóng modal
  const handleCloseProductModal = () => setEditingProduct(null);

  const toggleCollapse = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case "Bộ":
        return "danger";
      case "Lót":
        return "primary";
      case "Thùng":
        return "success";
      default:
        return "secondary";
    }
  };

  const handleShowModal = (productId) => {
    setSelectedProductId(productId);
    setShowModal(true);
    setModalSearchTerm("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProductId(null);
    setSelectedItemId(null);
    setModalSearchTerm("");
  };

  // Filter products based on search and type
  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.item_codes.some((item) =>
        item.product_code.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesType =
      filterType === "all" || product.product_type === filterType;

    return matchesSearch && matchesType;
  });

  // Filter available item codes in modal
  const filteredModalItems = availableItemCodes.filter((item) =>
    item.product_code.toLowerCase().includes(modalSearchTerm.toLowerCase())
  );

  return (
    <Container style={{ paddingTop: "1.5rem", paddingBottom: "1.5rem" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản Lý Sản Phẩm</h2>
        <Button variant="success" onClick={() => handleOpenProductModal()}>
          <i className="bi bi-plus-circle me-2"></i> Thêm sản phẩm
        </Button>
      </div>

      {/* Search and Filter Section */}
      <Row className="mb-4">
        <Col xs={12} md={8} className="mb-3 mb-md-0">
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm theo mã sản phẩm, tên sản phẩm, hoặc mã hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col xs={12} md={4}>
          <Form.Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Tất cả loại</option>
            <option value="Bộ">Bộ</option>
            <option value="Lót">Lót</option>
            <option value="Thùng">Thùng</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Product List */}
      {filteredProducts.map((product, index) => (
        <Card
          className="col-md-10"
          key={product.unique_id}
          style={{
            marginBottom: "1.5rem",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {/* Action Buttons */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              display: "flex",
              gap: "8px",
            }}
          >
            <Button
              variant="primary"
              size="sm"
              style={{
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Cập nhật"
              onClick={() => handleOpenProductModal(product)}
            >
              <i className="bi bi-pencil-square"></i>
            </Button>
            <Button
              variant="danger"
              size="sm"
              style={{
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Xóa"
            >
              <i className="bi bi-trash3"></i>
            </Button>
          </div>

          <Card.Body>
            <Row className="align-items-center">
              {/* Box Icon */}
              <Col xs={12} md={2} className="text-center mb-3 mb-md-0">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "120px",
                    height: "120px",
                    background: "#f3f4f6",
                    borderRadius: "12px",
                    margin: "0 auto",
                  }}
                >
                  <i
                    className="bi bi-box-seam"
                    style={{ fontSize: "60px", color: "#9ca3af" }}
                  ></i>
                </div>
              </Col>

              {/* Product Info */}
              <Col xs={12} md={8}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 style={{ marginBottom: "0.25rem" }}>
                      {product.product_name} 📦 {product.product_code}
                    </h5>
                    <Badge
                      bg={getBadgeColor(product.product_type)}
                      style={{
                        fontSize: "13px",
                        padding: "4px 12px",
                        fontWeight: 500,
                        borderRadius: "6px",
                      }}
                    >
                      Loại: {product.product_type}
                    </Badge>
                  </div>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <small style={{ fontSize: "13px" }}>
                    Mô tả: {product.description}
                  </small>
                </div>

                {/* Basic Info */}
                <Row style={{ marginTop: "1rem" }}>
                  <Col xs={12} sm={4} style={{ marginBottom: "0.5rem" }}>
                    <div
                      style={{
                        background: "#f9fafb",
                        padding: "12px",
                        borderRadius: "8px",
                      }}
                    >
                      <i className="bi bi-arrows-angle-expand me-2"></i>
                      <small style={{ color: "#6b7280" }}>
                        Box size: <br />
                      </small>{" "}
                      <strong>
                        {product.length}×{product.width}×{product.height} cm
                      </strong>
                    </div>
                  </Col>
                  <Col xs={12} sm={4} style={{ marginBottom: "0.5rem" }}>
                    <div
                      style={{
                        background: "#f9fafb",
                        padding: "12px",
                        borderRadius: "8px",
                      }}
                    >
                      <i className="bi bi-basket2 me-2"></i>
                      <small style={{ color: "#6b7280" }}>
                        Quantity: <br />
                      </small>{" "}
                      <strong>{product.quantity} pcs</strong>
                    </div>
                  </Col>
                  <Col xs={12} sm={4}>
                    <div
                      style={{
                        background: "#f9fafb",
                        padding: "12px",
                        borderRadius: "8px",
                      }}
                    >
                      <i className="bi bi-person-badge me-2"></i>
                      <small style={{ color: "#6b7280" }}>
                        Customer: <br />
                      </small>{" "}
                      <strong>{product.customer_code}</strong>
                    </div>
                  </Col>
                </Row>

                {/* Toggle Item Codes */}
                <div style={{ marginTop: "1rem" }}>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => toggleCollapse(product.unique_id)}
                  >
                    Hiển thị mã hàng ({product.item_codes.length}){" "}
                    <i
                      className={`bi ${
                        openIds.includes(product.unique_id)
                          ? "bi-chevron-up"
                          : "bi-chevron-down"
                      }`}
                    ></i>
                  </Button>

                  <Collapse in={openIds.includes(product.unique_id)}>
                    <div style={{ marginTop: "10px" }}>
                      {product.item_codes.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            background: "#f9fafb",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            marginTop: "6px",
                          }}
                        >
                          <div style={{ fontSize: "13px", fontWeight: 500 }}>
                            {item.product_code}
                          </div>
                          <div style={{ fontSize: "12px" }}>
                            Kích thước: {item.length}×{item.width_panel_flap}×
                            {item.height} mm | Sóng:{" "}
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: "500",
                                color: "blue",
                              }}
                            >
                              {item.wave_type}
                            </span>{" "}
                            | Khổ giấy:{" "}
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: "500",
                                color: "red",
                                textDecoration: "underline",
                              }}
                            >
                              {item.paper_size}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Add New Item Button */}
                      <Button
                        variant="outline-success"
                        size="sm"
                        style={{
                          marginTop: "10px",
                          width: "100%",
                          borderStyle: "dashed",
                        }}
                        onClick={() => handleShowModal(product.unique_id)}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Thêm mã hàng mới
                      </Button>
                    </div>
                  </Collapse>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}

      {/* Modal for Adding Item Codes */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Thêm mã hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Search Input */}
          <Form.Group className="mb-3">
            <Form.Label>Mã Hàng</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập mã hàng để tìm kiếm..."
              value={modalSearchTerm}
              onChange={(e) => setModalSearchTerm(e.target.value)}
            />
          </Form.Group>

          {/* Results List */}
          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "10px",
            }}
          >
            {filteredModalItems.length > 0 ? (
              filteredModalItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      item.id === selectedItemId ? "#000" : "#000";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      item.id === selectedItemId ? "#000" : "#e5e7eb";
                  }}
                  style={{
                    background: "#f9fafb",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    border:
                      item.id === selectedItemId
                        ? "2px solid #000"
                        : "1px solid #e5e7eb",
                    cursor: "pointer",
                    transition: "border-color 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      marginBottom: "8px",
                      color: "#1f2937",
                    }}
                  >
                    {item.product_code}
                  </div>
                  <Row style={{ fontSize: "13px", color: "#4b5563" }}>
                    <Col xs={12} md={6}>
                      <div className="mb-2">
                        <strong>Khách Hàng:</strong> {item.customer}
                      </div>
                      <div className="mb-2">
                        <strong>Kích Thước (DxRxC):</strong> {item.length}×
                        {item.width_panel_flap}
                        {item.height ? `×${item.height}` : ""}
                      </div>
                    </Col>
                    <Col xs={12} md={6}>
                      <div className="mb-2">
                        <strong>Sóng:</strong>{" "}
                        <span style={{ color: "blue", fontWeight: 500 }}>
                          {item.production_type}
                        </span>
                      </div>
                      <div className="mb-2">
                        <strong>Khổ Giấy:</strong>{" "}
                        <span style={{ color: "red", fontWeight: 500 }}>
                          {item.paper_size}
                        </span>
                      </div>
                      <div className="mb-2">
                        <strong>Loại Chế Biến:</strong> {item.processing_type}
                      </div>
                    </Col>
                  </Row>
                </div>
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#9ca3af",
                }}
              >
                <i
                  className="bi bi-inbox"
                  style={{ fontSize: "48px", marginBottom: "10px" }}
                ></i>
                <div>Không tìm thấy mã hàng phù hợp</div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Hủy bỏ
          </Button>
          <Button
            variant="dark"
            disabled={!selectedItemId}
            onClick={() => {
              console.log("Đã chọn mã hàng ID:", selectedItemId);
              handleCloseModal();
            }}
          >
            Thêm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal thêm sản phẩm */}
      <Modal
        show={!!editingProduct}
        onHide={handleCloseProductModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct?.unique_id
              ? "Cập nhật sản phẩm"
              : "Thêm sản phẩm mới"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {editingProduct && (
            <Form>
              {/* --- Thông tin cơ bản --- */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Mã sản phẩm</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingProduct.product_code}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          product_code: e.target.value,
                        })
                      }
                      placeholder="VD: VN-BOX-999"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Mã khách hàng</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingProduct.customer_code}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          customer_code: e.target.value,
                        })
                      }
                      placeholder="VD: AROMA"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Tên sản phẩm</Form.Label>
                <Form.Control
                  type="text"
                  value={editingProduct.product_name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      product_name: e.target.value,
                    })
                  }
                  placeholder="VD: Thùng carton 5 lớp Aroma"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  placeholder="Mô tả chi tiết sản phẩm..."
                />
              </Form.Group>

              {/* --- Kích thước & loại sản phẩm --- */}
              <Row className="mb-3">
                {["length", "width", "height"].map((field, idx) => (
                  <Col md={4} key={idx}>
                    <Form.Group>
                      <Form.Label>
                        {field === "length"
                          ? "Chiều dài (mm)"
                          : field === "width"
                          ? "Chiều rộng (mm)"
                          : "Chiều cao (mm)"}
                      </Form.Label>
                      <Form.Control
                        type="number"
                        value={editingProduct[field]}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            [field]: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                ))}
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Số lượng</Form.Label>
                    <Form.Control
                      type="number"
                      value={editingProduct.quantity}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          quantity: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Loại sản phẩm</Form.Label>
                    <Form.Select
                      value={editingProduct.product_type}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          product_type: e.target.value,
                        })
                      }
                    >
                      <option value="Bộ">Bộ</option>
                      <option value="Lót">Lót</option>
                      <option value="Thùng">Thùng</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Ngày nhận</Form.Label>
                    <Form.Control
                      type="date"
                      value={editingProduct.received_date}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          received_date: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Ngày giao</Form.Label>
                <Form.Control
                  type="date"
                  value={editingProduct.delivery_date}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      delivery_date: e.target.value,
                    })
                  }
                />
              </Form.Group>

              {/* --- Chọn mã hàng (card style) --- */}
              <hr />
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold fs-6">Chọn mã hàng</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="🔍 Tìm kiếm mã hàng..."
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                />
              </Form.Group>

              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {availableItemCodes
                  .filter((item) =>
                    item.product_code
                      .toLowerCase()
                      .includes(modalSearchTerm.toLowerCase())
                  )
                  .map((item) => {
                    const isSelected = editingProduct.item_codes.some(
                      (i) => i.id === item.id
                    );
                    return (
                      <Card
                        key={item.id}
                        className={`mb-2 shadow-sm ${
                          isSelected ? "border-dark border-2" : ""
                        }`}
                        style={{ cursor: "pointer", borderRadius: "10px" }}
                        onClick={() => {
                          let updated = editingProduct.item_codes || [];
                          updated = isSelected
                            ? updated.filter((i) => i.id !== item.id)
                            : [...updated, item];
                          setEditingProduct({
                            ...editingProduct,
                            item_codes: updated,
                          });
                        }}
                      >
                        <Card.Body className="py-2 px-3">
                          <div className="fw-bold">{item.product_code}</div>
                          <div style={{ fontSize: "13px", color: "#6c757d" }}>
                            Khách hàng: {item.customer} | Sóng:{" "}
                            <span className="text-primary fw-semibold">
                              {item.production_type}
                            </span>{" "}
                            | Khổ giấy:{" "}
                            <span className="text-danger fw-semibold">
                              {item.paper_size}
                            </span>
                          </div>
                        </Card.Body>
                      </Card>
                    );
                  })}
              </div>
            </Form>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseProductModal}>
            Hủy
          </Button>
          <Button
            variant="dark"
            onClick={() => {
              if (editingProduct.unique_id)
                console.log("Cập nhật sản phẩm:", editingProduct);
              else console.log("Thêm sản phẩm mới:", editingProduct);
              handleCloseProductModal();
            }}
          >
            {editingProduct?.unique_id ? "Cập nhật" : "Lưu sản phẩm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
