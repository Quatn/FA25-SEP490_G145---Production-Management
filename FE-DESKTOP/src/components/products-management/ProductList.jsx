"use client";
import { useState, useEffect, useMemo } from "react";
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
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/service/api/productApiSlice";

export default function ProductList() {
  const availableItemCodes = useMemo(
    () => [
      {
        id: 1,
        customerCode: "AROMA",
        wareCode: "VN 240*125*260 (WX1-0202)",
        fluteCombination: "5CB",
        wareLength: 260,
        wareWidth: 730,
        wareHeight: 0,
        processingType: "Tấm",
        paperSize: 1100,
        wareUsageType: "Thùng",
      },
      {
        id: 2,
        customerCode: "THUẬN AN",
        wareCode: "7L 610*508*324",
        fluteCombination: "7CBE",
        wareLength: 610,
        wareWidth: 508,
        wareHeight: 324,
        processingType: "Ghép",
        paperSize: 900,
        wareUsageType: "Lót",
      },
      {
        id: 3,
        customerCode: "MAY YÊN",
        wareCode: "H5L 940*680*280 TAG",
        fluteCombination: "5AB",
        wareLength: 940,
        wareWidth: 680,
        wareHeight: 280,
        processingType: "Liền",
        paperSize: 1000,
        wareUsageType: "Đế",
      },
      {
        id: 4,
        customerCode: "AROMA",
        wareCode: "H5L 185*185*310",
        fluteCombination: "5CB",
        wareLength: 185,
        wareWidth: 185,
        wareHeight: 310,
        processingType: "Tấm",
        paperSize: 1550,
        wareUsageType: "Thùng",
      },
      {
        id: 5,
        customerCode: "test",
        wareCode: "H5L 185*185*310",
        fluteCombination: "5CB",
        wareLength: 185,
        wareWidth: 185,
        wareHeight: 310,
        processingType: "Tấm",
        paperSize: 1550,
        wareUsageType: "Thùng",
      },
    ],
    []
  );

  const [page, setPage] = useState(1);
  // 💡 Đổi từ const [limit] sang state để người dùng có thể thay đổi
  const [limit, setLimit] = useState(2);
  const [searchTerm, setSearchTerm] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [openIds, setOpenIds] = useState([]);
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [containerEl, setContainerEl] = useState(null);

  // State mới cho Modal thêm mã hàng
  const [showAddItemCodeModal, setShowAddItemCodeModal] = useState(false);
  const [productToUpdateWareCodes, setProductToUpdateWareCodes] =
    useState(null);
  const [selectedItemCodeId, setSelectedItemCodeId] = useState(null);

  const queryArgs = useMemo(
    () => ({
      page,
      limit,
      ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
      ...(productTypeFilter !== "all"
        ? { productType: productTypeFilter }
        : {}),
      ...(customerFilter !== "all" ? { customerCode: customerFilter } : {}),
    }),
    [page, limit, searchTerm, productTypeFilter, customerFilter]
  );

  const {
    data: productList,
    error: fetchError,
    isLoading: isFetchingList,
    isFetching,
  } = useGetProductsQuery(queryArgs);

  const products = productList?.data ?? [];

  console.log(productList);

  // Logic lọc cho Modal Thêm/Sửa Sản phẩm (Modal chính)
  const filteredModalItems = useMemo(
    () =>
      availableItemCodes.filter((item) =>
        item.wareCode.toLowerCase().includes(modalSearchTerm.toLowerCase())
      ),
    [availableItemCodes, modalSearchTerm]
  );

  // Logic lọc cho Modal Thêm Mã Hàng (Modal phụ)
  const filteredAddItemCodeModalItems = useMemo(() => {
    if (!productToUpdateWareCodes) return [];

    const existingIds = (productToUpdateWareCodes.wareCodes || []).map(
      (item) => item.id
    );
    return availableItemCodes
      .filter((item) => !existingIds.includes(item.id))
      .filter((item) =>
        item.wareCode.toLowerCase().includes(modalSearchTerm.toLowerCase())
      );
  }, [availableItemCodes, modalSearchTerm, productToUpdateWareCodes]);

  const customerOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...products.map((p) => p.customerCode).filter(Boolean),
          ...availableItemCodes
            .map((item) => item.customerCode)
            .filter(Boolean),
        ])
      ),
    [products, availableItemCodes]
  );

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProductMutation, { isLoading: isDeleting }] =
    useDeleteProductMutation();

  const isMutating = isCreating || isUpdating;

  useEffect(() => {
    if (typeof document !== "undefined") {
      const el = document.querySelector(".bootstrap-scope");
      if (el) setContainerEl(el);
    }
  }, []);

  const emptyProduct = {
    id: "",
    customerCode: "",
    productName: "",
    description: "",
    productLength: 0,
    productWidth: 0,
    productHeight: 0,
    productType: "Bộ",
    wareCodes: [],
  };

  // 🔹 Hàm mở modal chính (Thêm/Sửa Sản phẩm)
  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct({
        ...product,
        wareCodes: product.wareCodes ? [...product.wareCodes] : [],
      });
    } else {
      setEditingProduct({ ...emptyProduct, wareCodes: [] });
    }
    setModalSearchTerm("");
  };

  // 🔹 Hàm đóng modal chính
  const handleCloseProductModal = () => setEditingProduct(null);

  // 🆕 Hàm mở modal thêm mã hàng
  const handleShowAddItemCodeModal = (product) => {
    setProductToUpdateWareCodes(product); // Lưu sản phẩm cần cập nhật
    setModalSearchTerm(""); // Reset thanh tìm kiếm
    setSelectedItemCodeId(null); // Reset mã hàng đã chọn
    setShowAddItemCodeModal(true);
  };

  // 🆕 Hàm đóng modal thêm mã hàng
  const handleCloseAddItemCodeModal = () => {
    setShowAddItemCodeModal(false);
    setProductToUpdateWareCodes(null);
    setSelectedItemCodeId(null);
  };

  // 🆕 Hàm chọn mã hàng trong modal phụ
  const handleSelectItemCode = (itemId) => {
    setSelectedItemCodeId(itemId);
  };

  // 🆕 Hàm thêm mã hàng vào sản phẩm và gọi API cập nhật
  const handleAddItemCodeToProduct = async () => {
    if (!productToUpdateWareCodes || !selectedItemCodeId) return;

    const selectedItem = availableItemCodes.find(
      (item) => item.id === selectedItemCodeId
    );
    if (!selectedItem) return;

    const updatedWareCodes = [
      ...(productToUpdateWareCodes.wareCodes || []),
      {
        ...selectedItem,
      },
    ];

    const payload = {
      id: productToUpdateWareCodes.id?.trim() ?? "",
      customerCode: productToUpdateWareCodes.customerCode?.trim() ?? "",
      productName: productToUpdateWareCodes.productName?.trim() ?? "",
      description: productToUpdateWareCodes.description ?? "",
      productLength: Number(productToUpdateWareCodes.productLength) || 0,
      productWidth: Number(productToUpdateWareCodes.productWidth) || 0,
      productHeight: Number(productToUpdateWareCodes.productHeight) || 0,
      productType: productToUpdateWareCodes.productType,
      wareCodes: updatedWareCodes.map((item, index) => ({
        ...item,
        id: item.id ?? index + 1,
        wareHeight: item.wareHeight ?? 0,
      })),
    };

    try {
      // 🚨 Gọi API cập nhật sản phẩm
      await updateProduct({
        productId: productToUpdateWareCodes._id, // Sử dụng _id của MongoDB để update
        body: payload,
      }).unwrap();

      // Đóng modal sau khi cập nhật thành công
      handleCloseAddItemCodeModal();
    } catch (error) {
      console.error("Không thể thêm mã hàng vào sản phẩm:", error);
      window.alert("Đã xảy ra lỗi khi thêm mã hàng. Vui lòng thử lại.");
    }
  };

  // 🆕 Hàm xóa mã hàng khỏi sản phẩm
  const handleRemoveItemCode = async (productId, itemCodeId, itemCode) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa mã hàng ${itemCode} khỏi sản phẩm ${product.id} không?`
      )
    ) {
      return;
    }

    const updatedWareCodes = (product.wareCodes || []).filter(
      (item) => item.id !== itemCodeId
    );

    const payload = {
      id: product.id?.trim() ?? "",
      customerCode: product.customerCode?.trim() ?? "",
      productName: product.productName?.trim() ?? "",
      description: product.description ?? "",
      productLength: Number(product.productLength) || 0,
      productWidth: Number(product.productWidth) || 0,
      productHeight: Number(product.productHeight) || 0,
      productType: product.productType,
      wareCodes: updatedWareCodes.map((item, index) => ({
        ...item,
        id: item.id ?? index + 1,
        wareHeight: item.wareHeight ?? 0,
      })),
    };

    try {
      await updateProduct({
        productId: productId,
        body: payload,
      }).unwrap();
    } catch (error) {
      console.error("Không thể xóa mã hàng:", error);
      window.alert("Đã xảy ra lỗi khi xóa mã hàng. Vui lòng thử lại.");
    }
  };

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

  // 1. Thêm/Cập nhật Sản phẩm (Create/Update)
  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    const payload = {
      id: editingProduct.id?.trim() ?? "",
      customerCode: editingProduct.customerCode?.trim() ?? "",
      productName: editingProduct.productName?.trim() ?? "",
      description: editingProduct.description ?? "",
      productLength: Number(editingProduct.productLength) || 0,
      productWidth: Number(editingProduct.productWidth) || 0,
      productHeight: Number(editingProduct.productHeight) || 0,
      productType: editingProduct.productType,
      //sẽ thêm sau
      // image: "",
      wareCodes: (editingProduct.wareCodes || []).map((item, index) => ({
        ...item,
        id: item.id ?? index + 1,
        wareHeight: item.wareHeight ?? 0,
      })),
    };

    if (!payload.id || !payload.customerCode || !payload.productName) {
      window.alert("Vui lòng nhập mã sản phẩm, khách hàng và tên sản phẩm.");
      return;
    }

    try {
      if (editingProduct._id) {
        await updateProduct({
          productId: editingProduct._id,
          body: payload,
        }).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }
      handleCloseProductModal();
    } catch (error) {
      console.error("Không thể lưu sản phẩm:", error);
      window.alert("Đã xảy ra lỗi khi lưu sản phẩm. Vui lòng thử lại.");
    }
  };

  // 2. Xóa Sản phẩm (Delete)
  const handleDeleteProduct = async (productId, productCode) => {
    if (
      !productId ||
      !window.confirm(
        `Bạn có chắc chắn muốn xóa sản phẩm ${productCode || productId} không?`
      )
    ) {
      return;
    }

    try {
      await deleteProductMutation(productId).unwrap();
      setOpenIds((prev) => prev.filter((id) => id !== productId));
    } catch (error) {
      console.error("Không thể xóa sản phẩm:", error);
      window.alert("Đã xảy ra lỗi khi xóa sản phẩm. Vui lòng thử lại.");
    }
  };

  // ----------------------------------------
  // 💡 LOGIC PHÂN TRANG MỚI
  // ----------------------------------------
  const handlePageChange = (newPage) => {
    const totalPages = productList?.totalPages || 1;
    let finalPage = newPage;
    if (newPage < 1) finalPage = 1;
    if (newPage > totalPages) finalPage = totalPages;
    setPage(finalPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset về trang 1 khi đổi limit
  };

  const totalItems = productList?.totalItems ?? 0;
  const totalPages = productList?.totalPages ?? 1;
  const hasNextPage = productList?.hasNextPage ?? false;
  const hasPrevPage = productList?.hasPrevPage ?? false;
  const currentPage = productList?.page ?? 1;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);
  const rangeDisplay = `${startItem} - ${endItem} of ${totalItems}`;

  const limitOptions = [2, 4, 6, 10]; // Thêm 5 để dễ test với DB ít sản phẩm

  // ----------------------------------------

  return (
    <Container style={{ paddingTop: "1.5rem", paddingBottom: "1.5rem" }}>
      {/* Header, Search and Filter Section (Giữ nguyên) */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản Lý Sản Phẩm</h2>
        <Button variant="success" onClick={() => handleOpenProductModal()}>
          <i className="bi bi-plus-circle me-2"></i> Thêm sản phẩm
        </Button>
      </div>

      {/* Search and Filter Section (Giữ nguyên) */}
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
        </Col>
        <Col xs={12} md={2}>
          <Form.Select
            value={productTypeFilter}
            onChange={(e) => {
              setProductTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">--Chọn Loại--</option>
            <option value="Bộ">Bộ</option>
            <option value="Lót">Lót</option>
            <option value="Thùng">Thùng</option>
            <option value="Vách">Vách</option>
            <option value="Đế">Đế</option>
          </Form.Select>
        </Col>
        <Col xs={12} md={2}>
          <Form.Select
            value={customerFilter}
            onChange={(e) => {
              setCustomerFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">--Khách Hàng--</option>
            {customerOptions.map((customer) => (
              <option key={customer} value={customer}>
                {customer}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {fetchError && (
        <div className="alert alert-danger">
          Không thể tải danh sách sản phẩm. Vui lòng thử lại.
        </div>
      )}

      {(isFetchingList || isFetching) && (
        <div className="text-muted mb-3">Đang tải dữ liệu...</div>
      )}

      {/* Product List (Giữ nguyên) */}
      {products.map((product) => (
        <Card
          className="col-md-10"
          key={product._id}
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
              onClick={() => handleDeleteProduct(product._id, product.id)}
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
                      {product.productName} 📦
                    </h5>
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
                        {product.productLength}×{product.productWidth}
                        {product.productHeight == 0
                          ? ""
                          : `x${product.productHeight}`}{" "}
                        cm
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
                      <strong>{product.productType}</strong>
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
                      <strong>{product.customerCode}</strong>
                    </div>
                  </Col>
                </Row>

                {/* Toggle Item Codes */}
                <div style={{ marginTop: "1rem" }}>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => toggleCollapse(product._id)}
                  >
                    Hiển thị mã hàng ({product.wareCodes?.length ?? 0}){" "}
                    <i
                      className={`bi ${
                        openIds.includes(product._id)
                          ? "bi-chevron-up"
                          : "bi-chevron-down"
                      }`}
                    ></i>
                  </Button>

                  <Collapse in={openIds.includes(product._id)}>
                    <div style={{ marginTop: "10px" }}>
                      {(product.wareCodes ?? []).map((item) => (
                        <div
                          key={item.id}
                          style={{
                            background: "#f9fafb",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            marginTop: "6px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
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
                                {item.wareCode}
                              </div>
                              <Badge
                                bg={getUsageBadgeVariant(item.wareUsageType)}
                              >
                                {item.wareUsageType}
                              </Badge>
                            </div>
                            <div style={{ fontSize: "12px" }}>
                              Kích thước: {item.wareLength}×{item.wareWidth}
                              {item.wareHeight ? `×${item.wareHeight}` : ""} mm
                              | Sóng:{" "}
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "500",
                                  color: "blue",
                                }}
                              >
                                {item.fluteCombination}
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
                                {item.paperSize}
                              </span>
                            </div>
                          </div>
                          {/* Nút Xóa Mã Hàng */}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation(); // Ngăn chặn toggleCollapse
                              handleRemoveItemCode(
                                product._id,
                                item.id,
                                item.wareCode
                              );
                            }}
                            style={{
                              width: "30px",
                              height: "30px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "50%",
                              flexShrink: 0,
                            }}
                            title="Xóa mã hàng này"
                          >
                            <i className="bi bi-trash3"></i>
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline-success"
                        size="sm"
                        style={{
                          marginTop: "10px",
                          width: "100%",
                          borderStyle: "dashed",
                        }}
                        onClick={() => handleShowAddItemCodeModal(product)}
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

      {!isFetching && products.length === 0 && !fetchError && (
        <div className="text-muted">
          Không có sản phẩm phù hợp với bộ lọc hiện tại.
        </div>
      )}

      {/* ---------------------------------------- */}
      {/* 💡 PHÂN TRANG THEO MẪU CỦA BẠN */}
      {/* ---------------------------------------- */}
      {totalItems > 0 && (
        <div
          className="d-flex justify-content-start align-items-center mt-4"
          style={{
            // Đảm bảo nó không bị quá to khi màn hình nhỏ
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <div className="d-flex align-items-center gap-4">
            {/* 1. Rows per page */}
            <div className="d-flex align-items-center gap-2">
              <Form.Label
                className="mb-0 text-muted"
                style={{ fontSize: "0.9rem" }}
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
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                disabled={isFetching}
              >
                {limitOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Form.Select>
            </div>

            {/* 2. Range Display */}
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

          {/* 3. Buttons */}
          <div className="d-flex gap-2 ms-4">
            {/* First Page button (|<) */}
            <Button
              variant="light"
              disabled={!hasPrevPage || isFetching}
              onClick={() => handlePageChange(1)}
              style={{
                borderRadius: "8px",
                width: "40px",
                height: "40px",
                padding: 0,
                backgroundColor: "#f1f1f1", // Màu xám nhạt
                border: "none",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              <i className="bi bi-chevron-bar-left"></i>
            </Button>

            {/* Previous Page button (<) */}
            <Button
              variant="light"
              disabled={!hasPrevPage || isFetching}
              onClick={() => handlePageChange(currentPage - 1)}
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

            {/* Next Page button (>) */}
            <Button
              variant="light"
              disabled={!hasNextPage || isFetching}
              onClick={() => handlePageChange(currentPage + 1)}
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

            {/* Last Page button (>|) */}
            <Button
              variant="light"
              disabled={!hasNextPage || isFetching}
              onClick={() => handlePageChange(totalPages)}
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
      )}
      {/* ---------------------------------------- */}

      {/* Modal thêm sản phẩm (Modal chính) và Modal Thêm Mã Hàng (Modal phụ) (Giữ nguyên) */}
      {/* ... */}
      <Modal
        show={!!editingProduct}
        onHide={handleCloseProductModal}
        size="lg"
        centered
        container={containerEl}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct?._id ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
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
                      value={editingProduct.id}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          id: e.target.value,
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
                      value={editingProduct.customerCode}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          customerCode: e.target.value,
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
                      value={editingProduct.productType}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          productType: e.target.value,
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
                  value={editingProduct.productName}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      productName: e.target.value,
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
                {["productLength", "productWidth", "productHeight"].map(
                  (field, idx) => (
                    <Col md={4} key={idx}>
                      <Form.Group>
                        <Form.Label>
                          {field === "productLength"
                            ? "Chiều dài (cm)"
                            : field === "productWidth"
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
                  )
                )}
              </Row>

              {/* --- Chọn mã hàng (card style) - Đã khôi phục logic ban đầu --- */}
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
                {/* 🚨 Logic đã khôi phục */}
                {filteredModalItems.map((item) => {
                  const isSelected = (editingProduct.wareCodes || []).some(
                    (i) => i.id === item.id
                  );
                  return (
                    <Card
                      key={item.id}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.zIndex = "10";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                        e.currentTarget.style.boxShadow = "";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.zIndex = "1";
                      }}
                      style={{
                        background: isSelected ? "#e6f7ff" : "#f9fafb",
                        padding: "8px",
                        borderRadius: "8px",
                        marginBottom: "10px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: isSelected
                          ? "0 4px 8px rgba(0, 0, 0, 0.1)"
                          : "none",
                      }}
                      onClick={() => {
                        let updated = editingProduct.wareCodes || [];
                        updated = isSelected
                          ? updated.filter((i) => i.id !== item.id)
                          : [...updated, item];
                        setEditingProduct({
                          ...editingProduct,
                          wareCodes: updated,
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
                            {item.wareCode}
                          </div>
                          <Badge bg={getUsageBadgeVariant(item.wareUsageType)}>
                            {item.wareUsageType}
                          </Badge>
                        </div>
                        <div style={{ fontSize: "13px", color: "#6c757d" }}>
                          Khách hàng: {item.customerCode} | Sóng:{" "}
                          <span className="text-primary fw-semibold">
                            {item.fluteCombination}
                          </span>{" "}
                          | Khổ giấy:{" "}
                          <span className="text-danger fw-semibold">
                            {item.paperSize}
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
            onClick={handleSaveProduct}
            disabled={isMutating}
          >
            {editingProduct?._id ? "Cập nhật" : "Lưu sản phẩm"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Thêm Mã Hàng (Modal phụ - giữ nguyên logic) */}
      <Modal
        show={showAddItemCodeModal}
        onHide={handleCloseAddItemCodeModal}
        size="lg"
        centered
        container={containerEl}
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm Mã Hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Search Input */}
          <Form.Group className="mb-3">
            {/* <Form.Label>Mã Hàng (Mã đã có sẽ không hiển thị)</Form.Label> */}
            <Form.Label>Mã Hàng (Mã đã có sẽ không hiển thị)</Form.Label>
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
            {filteredAddItemCodeModalItems.length > 0 ? (
              filteredAddItemCodeModalItems.map((item) => {
                const isSelected = item.id === selectedItemCodeId;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItemCode(item.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.zIndex = "10";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.boxShadow = "";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.zIndex = "1";
                    }}
                    style={{
                      background: isSelected ? "#e6f7ff" : "#f9fafb",
                      padding: "15px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: isSelected
                        ? "0 4px 8px rgba(0, 0, 0, 0.1)"
                        : "none",
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
                        {item.wareCode}
                      </div>
                      <Badge bg={getUsageBadgeVariant(item.wareUsageType)}>
                        {item.wareUsageType}
                      </Badge>
                    </div>
                    <Row style={{ fontSize: "13px", color: "#4b5563" }}>
                      <Col xs={12} md={6}>
                        <div className="mb-2">
                          <strong>Khách Hàng:</strong> {item.customerCode}
                        </div>
                        <div className="mb-2">
                          <strong>Kích Thước (DxRxC):</strong> {item.wareLength}
                          ×{item.wareWidth}
                          {item.wareHeight ? `×${item.wareHeight}` : ""}
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div className="mb-2">
                          <strong>Sóng:</strong>{" "}
                          <span style={{ color: "blue", fontWeight: 500 }}>
                            {item.fluteCombination}
                          </span>
                        </div>
                        <div className="mb-2">
                          <strong>Khổ Giấy:</strong>{" "}
                          <span style={{ color: "red", fontWeight: 500 }}>
                            {item.paperSize}
                          </span>
                        </div>
                        <div className="mb-2">
                          <strong>Loại Chế Biến:</strong> {item.processingType}
                        </div>
                      </Col>
                    </Row>
                  </div>
                );
              })
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
                <div>
                  Không tìm thấy mã hàng phù hợp hoặc tất cả đã được thêm.
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddItemCodeModal}>
            Hủy bỏ
          </Button>
          <Button
            variant="dark"
            disabled={!selectedItemCodeId || isUpdating}
            onClick={handleAddItemCodeToProduct}
          >
            {isUpdating ? "Đang thêm..." : "Thêm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
