"use client";
import { useState, useEffect } from "react";
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
          usage_type: "Thùng",
        },
        {
          id: 2,
          product_code: "VN 250*130*270 (WX1-0203)",
          wave_type: "5C",
          length: 270,
          width_panel_flap: 740,
          height: 250,
          paper_size: 1120,
          usage_type: "Lót",
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
          usage_type: "Lót",
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
          usage_type: "Thùng",
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
      usage_type: "Thùng",
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
      usage_type: "Lót",
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
      usage_type: "Đế",
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
      usage_type: "Thùng",
    },
  ];

  const [products, setProducts] = useState(mockProducts);
  const [openIds, setOpenIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // 🔹 State mới (thay cho showAddProductModal & newProduct)
  const [editingProduct, setEditingProduct] = useState(null);

  const [containerEl, setContainerEl] = useState(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const el = document.querySelector(".bootstrap-scope");
      if (el) setContainerEl(el);
    }
  }, []);

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

  const getUsageBadgeVariant = (usageType) => {
    switch (usageType) {
      case "Thùng":
        return "success"; // xanh lá
      case "Lót":
        return "primary"; // xanh dương
      case "Đế":
        return "warning"; // vàng
      default:
        return "secondary";
    }
  };

  const getNextUniqueId = () => {
    const maxId = products.reduce((max, p) => {
      const idNum = parseInt(p.unique_id.replace("CAT-", "")) || 0;
      return idNum > max ? idNum : max;
    }, 0);
    return `CAT-${String(maxId + 1).padStart(4, "0")}`;
  };

  // 1. Thêm/Cập nhật Sản phẩm (Create/Update)
  const handleSaveProduct = () => {
    if (!editingProduct) return;

    if (editingProduct.unique_id) {
      // Cập nhật sản phẩm hiện có
      setProducts((prev) =>
        prev.map((p) =>
          p.unique_id === editingProduct.unique_id ? editingProduct : p
        )
      );
      console.log("Sản phẩm đã được cập nhật:", editingProduct.unique_id);
    } else {
      // Thêm sản phẩm mới
      const newProduct = {
        ...editingProduct,
        unique_id: getNextUniqueId(), // Tạo ID mới
        // Đảm bảo các trường số là number
        length: Number(editingProduct.length) || 0,
        width: Number(editingProduct.width) || 0,
        height: Number(editingProduct.height) || 0,
        quantity: Number(editingProduct.quantity) || 0,
        received_date:
          editingProduct.received_date || new Date().toISOString().slice(0, 10),
        delivery_date: editingProduct.delivery_date || "",
        item_codes: editingProduct.item_codes.map((item) => ({
          ...item,
          id: item.id || Date.now() + Math.random(), // Đảm bảo item_codes có ID nếu chưa có
          // Chỉ giữ lại các trường cần thiết nếu cần, hiện tại giữ tất cả
        })),
      };

      setProducts((prev) => [...prev, newProduct]);
      console.log("Sản phẩm mới đã được thêm:", newProduct.unique_id);
    }

    handleCloseProductModal();
    setModalSearchTerm(""); // Đặt lại search term cho modal item code
  };

  // 2. Xóa Sản phẩm (Delete)
  const handleDeleteProduct = (productId) => {
    if (
      window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${productId} không?`)
    ) {
      setProducts((prev) => prev.filter((p) => p.unique_id !== productId));
      console.log("Sản phẩm đã được xóa:", productId);
      setOpenIds((prev) => prev.filter((id) => id !== productId)); // Đóng collapse nếu đang mở
    }
  };

  const handleAddItemCodeToProduct = () => {
    if (!selectedProductId || !selectedItemId) return;

    const itemToAdd = availableItemCodes.find(
      (item) => item.id === selectedItemId
    );

    if (itemToAdd) {
      // Chuyển đổi item code từ availableItemCodes format sang product item_codes format
      const newItemCode = {
        id: itemToAdd.id,
        product_code: itemToAdd.product_code,
        wave_type: itemToAdd.production_type, // Sóng
        length: itemToAdd.length,
        width_panel_flap: itemToAdd.width_panel_flap,
        height: itemToAdd.height || null, // Có thể thiếu height trong availableItemCodes
        paper_size: itemToAdd.paper_size,
        usage_type: itemToAdd.usage_type,
      };

      setProducts((prev) =>
        prev.map((product) => {
          if (product.unique_id === selectedProductId) {
            const isExist = product.item_codes.some(
              (item) => item.id === newItemCode.id
            );
            return isExist
              ? product // Đã tồn tại thì không thêm
              : {
                  ...product,
                  item_codes: [...product.item_codes, newItemCode],
                };
          }
          return product;
        })
      );
      console.log(
        `Đã thêm mã hàng ${newItemCode.product_code} vào sản phẩm ${selectedProductId}`
      );
    }

    handleCloseModal();
  };

  const handleRemoveItemCode = (productId, itemId) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.unique_id === productId) {
          return {
            ...product,
            item_codes: product.item_codes.filter((item) => item.id !== itemId),
          };
        }
        return product;
      })
    );
    console.log(`Đã xóa mã hàng ID ${itemId} khỏi sản phẩm ${productId}`);
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
  const filteredProducts = products.filter((product) => {
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
        <Col xs={12} md={6} className="mb-3 mb-md-0">
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
        <Col xs={12} md={2}>
          <Form.Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">--Chọn Loại--</option>
            <option value="Bộ">Bộ</option>
            <option value="Lót">Lót</option>
            <option value="Thùng">Thùng</option>
          </Form.Select>
        </Col>
        <Col xs={12} md={2}>
          <Form.Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">--Khách Hàng--</option>
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
              onClick={() => handleDeleteProduct(product.unique_id)}
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
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center gap-3">
                    <h5 style={{ marginBottom: 0 }}>
                      {product.product_name} 📦 {product.product_code}
                    </h5>
                    {/* <Badge
                      bg={getBadgeColor(product.product_type)}
                      style={{
                        fontSize: "13px",
                        padding: "4px 12px 8px 12px",
                        fontWeight: 500,
                        borderRadius: "6px",
                      }}
                    >
                      Loại: {product.product_type}
                    </Badge> */}
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
                      <i className="bi bi-box me-2"></i>
                      <small style={{ color: "#6b7280" }}>
                        Type: <br />
                      </small>{" "}
                      <strong>{product.product_type}</strong>
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
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              // justifyContent: "space-between",
                              gap: "15px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#1f2937",
                              }}
                            >
                              {item.product_code}
                            </div>
                            <Badge bg={getUsageBadgeVariant(item.usage_type)}>
                              {item.usage_type}
                            </Badge>
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
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        centered
        // container={document.querySelector(".bootstrap-scope")}
        container={containerEl}
      >
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#1f2937",
                      }}
                    >
                      {item.product_code}
                    </div>
                    <Badge bg={getUsageBadgeVariant(item.usage_type)}>
                      {item.usage_type}
                    </Badge>
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
            onClick={handleAddItemCodeToProduct}
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
        // container={document.querySelector(".bootstrap-scope")}
        container={containerEl}
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
                <Col md={4}>
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
                <Col md={4}>
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

              <div
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  padding: "6px 4px",
                }}
              >
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
                        style={{
                          cursor: "pointer",
                          borderRadius: "10px",
                          transition: "all 0.2s ease",
                          border: isSelected
                            ? "2px solid #000"
                            : "1px solid #e5e7eb",
                          position: "relative",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            // e.currentTarget.style.borderColor = "#007bff";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(0, 123, 255, 0.25)";
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.zIndex = "10";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = "#e5e7eb";
                            e.currentTarget.style.boxShadow = "";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.zIndex = "1";
                          }
                        }}
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
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#1f2937",
                              }}
                            >
                              {item.product_code}
                            </div>
                            <Badge bg={getUsageBadgeVariant(item.usage_type)}>
                              {item.usage_type}
                            </Badge>
                          </div>
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
          <Button variant="dark" onClick={handleSaveProduct}>
            {editingProduct?.unique_id ? "Cập nhật" : "Lưu sản phẩm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
