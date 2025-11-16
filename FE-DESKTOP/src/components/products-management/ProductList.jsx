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
import { useGetWaresQuery } from "@/service/api/wareApiSlice";
import { useGetAllCustomersQuery } from "@/service/api/customerApiSlice";
import { useGetAllProductTypeQuery } from "@/service/api/productTypeApiSlice";

export default function ProductList() {
  // Load wares from API instead of mock data
  const { data: waresData, isLoading: isLoadingWares } = useGetWaresQuery({
    page: 1,
    limit: 1000,
  }); // Load all wares for selection

  const { data: customersData, isLoading: isLoadingCustomer } =
    useGetAllCustomersQuery({}); // Load all customers for selection

  const { data: productTypesData, isLoading: isLoadingProductTypes } =
    useGetAllProductTypeQuery();

  const customers = customersData?.data ?? [];
  const productTypes = productTypesData?.data ?? [];

  // Use Ware objects directly from API - no need to transform
  const availableItemCodes = useMemo(() => {
    if (!waresData?.data) return [];
    return waresData.data; // Use Ware objects directly
  }, [waresData]);

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
      ...(customerFilter !== "all" ? { customer: customerFilter } : {}),
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
      availableItemCodes.filter((item) => {
        const wareCode = item.code || "";
        return wareCode.toLowerCase().includes(modalSearchTerm.toLowerCase());
      }),
    [availableItemCodes, modalSearchTerm]
  );

  // Logic lọc cho Modal Thêm Mã Hàng (Modal phụ)
  const filteredAddItemCodeModalItems = useMemo(() => {
    if (!productToUpdateWareCodes) return [];

    // Get existing wares IDs
    const existingIds = (productToUpdateWareCodes.wares || [])
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        if (item && typeof item === "object") {
          return item._id || item.id;
        }
        return item;
      })
      .map((id) => String(id)); // Convert to strings for comparison

    return availableItemCodes
      .filter((item) => {
        const itemId = String(item._id || item.id);
        return !existingIds.includes(itemId);
      })
      .filter((item) => {
        const wareCode = item.code || "";
        return wareCode.toLowerCase().includes(modalSearchTerm.toLowerCase());
      });
  }, [availableItemCodes, modalSearchTerm, productToUpdateWareCodes]);

  // Không cần customerOptions từ products nữa, sử dụng trực tiếp từ API

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
    code: "",
    name: "",
    customer: "",
    description: "",
    productLength: 0,
    productWidth: 0,
    productHeight: 0,
    productType: "",
    wares: [],
  };

  // 🔹 Hàm mở modal chính (Thêm/Sửa Sản phẩm)
  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct({
        ...product,
        wares: product.wares ? [...product.wares] : [],
      });
    } else {
      setEditingProduct({ ...emptyProduct, wares: [] });
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

    // Get existing wares IDs
    const existingWaresIds = (productToUpdateWareCodes.wares || []).map(
      (item) => {
        if (typeof item === "string") {
          return item;
        }
        if (item && typeof item === "object") {
          return item._id || item.id || item;
        }
        return item;
      }
    );

    // Add the new selected item ID (assuming selectedItemCodeId is a Ware _id)
    const updatedWaresIds = [...existingWaresIds, selectedItemCodeId];

    // Extract customer ID (can be ObjectId string or Customer object)
    const customerId =
      typeof productToUpdateWareCodes.customer === "string"
        ? productToUpdateWareCodes.customer
        : productToUpdateWareCodes.customer?._id ||
          productToUpdateWareCodes.customer?.id ||
          "";

    const payload = {
      code: productToUpdateWareCodes.code?.trim() ?? "",
      name: productToUpdateWareCodes.name?.trim() ?? "",
      customer: customerId,
      description: productToUpdateWareCodes.description ?? "",
      productLength: Number(productToUpdateWareCodes.productLength) || 0,
      productWidth: Number(productToUpdateWareCodes.productWidth) || 0,
      productHeight: Number(productToUpdateWareCodes.productHeight) || 0,
      productType:
        typeof productToUpdateWareCodes.productType === "string"
          ? productToUpdateWareCodes.productType
          : productToUpdateWareCodes.productType?._id ||
            productToUpdateWareCodes.productType?.id ||
            "",
      wares: updatedWaresIds,
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
        `Bạn có chắc chắn muốn xóa mã hàng ${
          itemCode || itemCodeId
        } khỏi sản phẩm ${product.code || product._id} không?`
      )
    ) {
      return;
    }

    // Filter out the removed ware code by comparing IDs
    const updatedWaresIds = (product.wares || [])
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        if (item && typeof item === "object") {
          return item._id || item.id || item;
        }
        return item;
      })
      .filter((id) => {
        // Compare as strings to handle both ObjectId and string comparisons
        return String(id) !== String(itemCodeId);
      });

    // Extract customer ID (can be ObjectId string or Customer object)
    const customerId =
      typeof product.customer === "string"
        ? product.customer
        : product.customer?._id || product.customer?.id || "";

    const payload = {
      code: product.code?.trim() ?? "",
      name: product.name?.trim() ?? "",
      customer: customerId,
      description: product.description ?? "",
      productLength: Number(product.productLength) || 0,
      productWidth: Number(product.productWidth) || 0,
      productHeight: Number(product.productHeight) || 0,
      productType:
        typeof product.productType === "string"
          ? product.productType
          : product.productType?._id || product.productType?.id || "",
      wares: updatedWaresIds,
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

  // 1. Thêm/Cập nhật Sản phẩm (Create/Update)
  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    // Convert wares to array of ObjectId strings
    const waresIds = (editingProduct.wares || []).map((item) => {
      if (typeof item === "string") {
        return item; // Already an ID string
      }
      if (item && typeof item === "object") {
        return item._id || item.id || item; // Get _id from Ware object
      }
      return item;
    });

    // Extract customer ID (can be ObjectId string or Customer object)
    const customerId =
      typeof editingProduct.customer === "string"
        ? editingProduct.customer
        : editingProduct.customer?._id || editingProduct.customer?.id || "";

    // Extract productType ID (can be ObjectId string or ProductType object)
    // When from select, it's already a string (ObjectId)
    const productTypeId = 
      typeof editingProduct.productType === "string"
        ? editingProduct.productType
        : editingProduct.productType?._id || editingProduct.productType?.id || "";
// editingProduct.productType || "";
    const payload = {
      code: editingProduct.code?.trim() ?? "",
      name: editingProduct.name?.trim() ?? "",
      productName: editingProduct.name?.trim() ?? "", // Backend requires productName
      customer: customerId,
      description: editingProduct.description ?? "",
      productLength: Number(editingProduct.productLength) || 0,
      productWidth: Number(editingProduct.productWidth) || 0,
      productHeight: Number(editingProduct.productHeight) || 0,
      productType: productTypeId,
      //sẽ thêm sau
      // image: "",
      wares: waresIds,
    };

    // Validation
    if (!payload.code || !payload.name) {
      window.alert("Vui lòng nhập mã sản phẩm và tên sản phẩm.");
      return;
    }

    if (!payload.customer) {
      window.alert("Vui lòng chọn khách hàng.");
      return;
    }

    if (!payload.productType) {
      window.alert("Vui lòng chọn loại sản phẩm.");
      return;
    }

    if (!Array.isArray(payload.wares) || payload.wares.length === 0) {
      window.alert("Vui lòng chọn ít nhất một mã hàng.");
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
      // Hiển thị thông báo lỗi chi tiết hơn
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Đã xảy ra lỗi khi lưu sản phẩm. Vui lòng thử lại.";
      window.alert(errorMessage);
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
            disabled={isLoadingProductTypes}
          >
            <option value="all">--Chọn Loại--</option>
            {productTypes.map((productType) => {
              const productTypeId = productType._id || productType.id;
              const productTypeName =
                productType.name || productType.code || "";
              return (
                <option key={productTypeId} value={productTypeId}>
                  {productTypeName}
                </option>
              );
            })}
          </Form.Select>
        </Col>
        <Col xs={12} md={2}>
          <Form.Select
            value={customerFilter}
            onChange={(e) => {
              setCustomerFilter(e.target.value);
              setPage(1);
            }}
            disabled={isLoadingCustomer}
          >
            <option value="all">--Khách Hàng--</option>
            {customers.map((customer) => {
              const customerId = customer._id || customer.id;
              const customerCode = customer.code || customer.name || customerId;
              return (
                <option key={customerId} value={customerId}>
                  {customerCode}
                </option>
              );
            })}
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
              onClick={() => handleDeleteProduct(product._id, product.code)}
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
                      {product.name || product.productName} 📦
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
                          : `×${product.productHeight}`}{" "}
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
                      <strong>
                        {typeof product.productType === "object" &&
                        product.productType?.code
                          ? product.productType?.code
                          : typeof product.productType === "string"
                          ? product.productType
                          : "-"}
                      </strong>
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
                      <strong>
                        {typeof product.customer === "object" &&
                        product.customer?.code
                          ? product.customer.code
                          : typeof product.customer === "string"
                          ? product.customer
                          : "-"}
                      </strong>
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
                    Hiển thị mã hàng ({product.wares?.length ?? 0}){" "}
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
                      {(product.wares ?? []).map((item) => {
                        // Handle both Ware objects (populated) and string IDs
                        const ware =
                          typeof item === "object" && item !== null
                            ? item
                            : null;
                        const wareId =
                          typeof item === "string"
                            ? item
                            : ware?._id || ware?.id;
                        const wareCode = ware?.code || "";
                        const wareLength = ware?.wareLength || 0;
                        const wareWidth = ware?.wareWidth || 0;
                        const wareHeight = ware?.wareHeight || null;
                        // Handle fluteCombination as ObjectId string or populated FluteCombination object
                        const fluteCombination =
                          typeof ware?.fluteCombination === "object" &&
                          ware?.fluteCombination?.code
                            ? ware.fluteCombination.code
                            : typeof ware?.fluteCombination === "string"
                            ? "-"
                            : "-";
                        const paperSize = ware?.paperWidth || 0;

                        if (!ware && typeof item === "string") {
                          // If it's just an ID string, show placeholder
                          return (
                            <div
                              key={wareId}
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
                              <div
                                style={{ fontSize: "12px", color: "#6b7280" }}
                              >
                                Đang tải thông tin mã hàng...
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={wareId}
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
                                  {wareCode}
                                </div>
                              </div>
                              <div style={{ fontSize: "12px" }}>
                                Kích thước: {wareLength}×{wareWidth}
                                {wareHeight ? `×${wareHeight}` : ""} cm | Sóng:{" "}
                                <span
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    color: "blue",
                                  }}
                                >
                                  {fluteCombination}
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
                                  {paperSize}
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
                                  wareId,
                                  wareCode
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
                        );
                      })}
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
                      value={editingProduct.code || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          code: e.target.value,
                        })
                      }
                      placeholder="VD: VN-BOX-999"
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Khách hàng</Form.Label>
                    <Form.Select
                      value={
                        typeof editingProduct.customer === "string"
                          ? editingProduct.customer
                          : editingProduct.customer?._id ||
                            editingProduct.customer?.id ||
                            ""
                      }
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          customer: e.target.value,
                        })
                      }
                      disabled={isLoadingCustomer}
                    >
                      <option value="">--Chọn khách hàng--</option>
                      {customers.map((customer) => {
                        const customerId = customer._id || customer.id;
                        const customerCode =
                          customer.code || customer.name || customerId;
                        return (
                          <option key={customerId} value={customerId}>
                            {customerCode}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Loại sản phẩm</Form.Label>
                    <Form.Select
                      value={editingProduct?.productType?._id}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          productType: e.target.value,
                        })
                      }
                      disabled={isLoadingProductTypes}
                    >
                      <option value="">--Chọn loại sản phẩm--</option>
                      {productTypes.map((productType) => {
                        const productTypeId = productType._id || productType.id;
                        const productTypeName =
                          productType.name || productType.code || "";
                        return (
                          <option key={productTypeId} value={productTypeId}>
                            {productTypeName}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Tên sản phẩm </Form.Label>
                <Form.Control
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
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
                {isLoadingWares ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#6b7280",
                    }}
                  >
                    <i
                      className="bi bi-arrow-repeat"
                      style={{ animation: "spin 1s linear infinite" }}
                    ></i>
                    <div style={{ marginTop: "10px" }}>
                      Đang tải danh sách mã hàng...
                    </div>
                  </div>
                ) : filteredModalItems.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#6b7280",
                    }}
                  >
                    <i className="bi bi-inbox" style={{ fontSize: "32px" }}></i>
                    <div style={{ marginTop: "10px" }}>
                      Không tìm thấy mã hàng phù hợp
                    </div>
                  </div>
                ) : (
                  /* 🚨 Logic đã khôi phục */
                  filteredModalItems.map((item) => {
                    const itemId = item._id || item.id;
                    // Check if item is already selected by comparing IDs
                    const isSelected = (editingProduct.wares || []).some(
                      (i) => {
                        const existingId =
                          typeof i === "string" ? i : i?._id || i?.id;
                        return String(existingId) === String(itemId);
                      }
                    );
                    return (
                      <Card
                        key={itemId}
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
                          let updated = editingProduct.wares || [];
                          if (isSelected) {
                            // Remove by filtering out the matching ID
                            updated = updated.filter((i) => {
                              const existingId =
                                typeof i === "string" ? i : i?._id || i?.id;
                              return String(existingId) !== String(itemId);
                            });
                          } else {
                            // Add the item _id
                            updated = [...updated, item._id];
                          }
                          setEditingProduct({
                            ...editingProduct,
                            wares: updated,
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
                              {item.code}
                            </div>
                          </div>
                          <div style={{ fontSize: "13px", color: "#6c757d" }}>
                            Kích thước: {item.wareLength}×{item.wareWidth}
                            {item.wareHeight ? `×${item.wareHeight}` : ""} cm |
                            Sóng:{" "}
                            <span className="text-primary fw-semibold">
                              {typeof item.fluteCombination === "object" &&
                              item.fluteCombination?.code
                                ? item.fluteCombination.code
                                : typeof item.fluteCombination === "string"
                                ? "N/A"
                                : "N/A"}
                            </span>{" "}
                            | Khổ giấy:{" "}
                            <span className="text-danger fw-semibold">
                              {item.paperWidth || "N/A"}
                            </span>
                          </div>
                        </Card.Body>
                      </Card>
                    );
                  })
                )}
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
            {isLoadingWares ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                }}
              >
                <i
                  className="bi bi-arrow-repeat"
                  style={{
                    animation: "spin 1s linear infinite",
                    fontSize: "32px",
                  }}
                ></i>
                <div style={{ marginTop: "10px" }}>
                  Đang tải danh sách mã hàng...
                </div>
              </div>
            ) : filteredAddItemCodeModalItems.length > 0 ? (
              filteredAddItemCodeModalItems.map((item) => {
                const itemId = item._id || item.id;
                const isSelected =
                  String(itemId) === String(selectedItemCodeId);
                return (
                  <div
                    key={itemId}
                    onClick={() => handleSelectItemCode(itemId)}
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
                        {item.code}
                      </div>
                    </div>
                    <Row style={{ fontSize: "13px", color: "#4b5563" }}>
                      <Col xs={12} md={6}>
                        <div className="mb-2">
                          <strong>Kích Thước (DxRxC):</strong> {item.wareLength}
                          ×{item.wareWidth}
                          {item.wareHeight ? `×${item.wareHeight}` : ""} mm
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div className="mb-2">
                          <strong>Sóng:</strong>{" "}
                          <span style={{ color: "blue", fontWeight: 500 }}>
                            {typeof item.fluteCombination === "object" &&
                            item.fluteCombination?.code
                              ? item.fluteCombination.code
                              : typeof item.fluteCombination === "string"
                              ? "N/A"
                              : "N/A"}
                          </span>
                        </div>
                        <div className="mb-2">
                          <strong>Khổ Giấy:</strong>{" "}
                          <span style={{ color: "red", fontWeight: 500 }}>
                            {item.paperWidth || "N/A"}
                          </span>
                        </div>
                        <div className="mb-2">
                          <strong>Loại Chế Biến:</strong>{" "}
                          {typeof item.wareManufacturingProcessType === "object"
                            ? item.wareManufacturingProcessType?.name || "N/A"
                            : typeof item.wareManufacturingProcessType ===
                              "string"
                            ? "N/A"
                            : "N/A"}
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
