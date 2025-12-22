"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Collapse,
  Button,
  Form,
  InputGroup,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetDeletedProductsQuery, // <-- added
} from "@/service/api/productApiSlice";
import { useGetWaresQuery } from "@/service/api/wareApiSlice";
import { useGetAllCustomersQuery } from "@/service/api/customerApiSlice";
import { useGetAllProductTypeQuery } from "@/service/api/productTypeApiSlice";

import ProductModal from "./ProductModal";
import ProductAddItemCodeModal from "./ProductAddItemCodeModal";

import { toaster } from "@/components/ui/toaster";
import { useConfirm } from "@/components/common/ConfirmModal";

// privilege hook (same path as used elsewhere in your project)
import { useAppSelector } from "@/service/hooks";

export default function ProductList() {
  // --- Privilege check ---
  const userState: any = useAppSelector((s: any) => s.auth?.userState ?? null);
  const EDIT_PRIVS = [
    "system-admin",
    "system-readWrite",
    "purchaseOrder-admin",
    "purchaseOrder-readWrite",
    "product-admin",
    "product-readWrite",
  ];
  const writeAllowed =
    Array.isArray(userState?.accessPrivileges) &&
    userState.accessPrivileges.some((p: string) => EDIT_PRIVS.includes(p));
  const writeDisabled = !writeAllowed;
  // ------------------------

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
  const [openIds, setOpenIds] = useState<any[]>([]);
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [containerEl, setContainerEl] = useState<Element | null>(null);

  // State mới cho Modal thêm mã hàng
  const [showAddItemCodeModal, setShowAddItemCodeModal] = useState(false);
  const [productToUpdateWareCodes, setProductToUpdateWareCodes] = useState<
    any | null
  >(null);

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

  // Helper: check duplicate code among currently-loaded products
  const isDuplicateCode = (code: string, excludeId?: string | null) => {
    if (!code) return false;
    const normalized = code.trim().toLowerCase();
    return products.some((p: any) => {
      const pCode = (p.code || "").trim().toLowerCase();
      if (!pCode) return false;
      // exclude the current product when editing
      if (excludeId && (p._id === excludeId || p.id === excludeId))
        return false;
      return pCode === normalized;
    });
  };

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
    productType: "",
    wares: [],
  };

  // confirm hook (ConfirmProvider must be mounted above this component)
  const showConfirm = useConfirm();

  // --- NEW: fetch deleted products for duplicate detection ---
  const {
    data: deletedProductsResp,
    isLoading: isLoadingDeletedProducts,
    refetch: refetchDeletedProducts,
  } = useGetDeletedProductsQuery({ page: 1, limit: 1000 });

  const deletedProductsList = useMemo(() => {
    const raw = deletedProductsResp?.data ?? deletedProductsResp ?? [];
    const arr = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : raw?.data?.data && Array.isArray(raw.data.data)
      ? raw.data.data
      : [];
    return Array.isArray(arr) ? arr : [];
  }, [deletedProductsResp]);

  const isCodeInDeleted = (code?: string, excludeId?: string | null) => {
    if (!code) return false;
    const norm = String(code).trim().toLowerCase();
    if (!norm) return false;
    return (deletedProductsList || []).some((d: any) => {
      const candidate = String(
        d?.code ?? d?.id ?? d?._id ?? d?.productCode ?? ""
      )
        .trim()
        .toLowerCase();
      if (!candidate) return false;
      const did = d?._id ?? d?.id ?? d?.code;
      if (excludeId && did && String(did) === String(excludeId)) return false;
      return candidate === norm;
    });
  };
  // ----------------------------------------------------------------

  // 🔹 Hàm mở modal chính (Thêm/Sửa Sản phẩm) - guarded
  const handleOpenProductModal = (product: any = null) => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền tạo/cập nhật sản phẩm.",
        type: "error",
      });
      return;
    }
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

  // 🆕 Hàm mở modal thêm mã hàng - guarded
  const handleShowAddItemCodeModal = (product: any) => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền thêm mã hàng cho sản phẩm.",
        type: "error",
      });
      return;
    }
    setProductToUpdateWareCodes(product); // Lưu sản phẩm cần cập nhật
    setModalSearchTerm(""); // Reset thanh tìm kiếm
    setShowAddItemCodeModal(true);
  };

  // 🆕 Hàm đóng modal thêm mã hàng
  const handleCloseAddItemCodeModal = () => {
    setShowAddItemCodeModal(false);
    setProductToUpdateWareCodes(null);
  };

  // 🆕 Hàm thêm mã hàng vào sản phẩm (nhận itemId từ child modal) - guarded
  const handleAddItemCodeToProduct = async (selectedItemId: string) => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền thêm mã hàng.",
        type: "error",
      });
      return;
    }

    if (!productToUpdateWareCodes || !selectedItemId) return;

    // Get existing wares IDs
    const existingWaresIds = (productToUpdateWareCodes.wares || []).map(
      (item: any) => {
        if (typeof item === "string") {
          return item;
        }
        if (item && typeof item === "object") {
          return item._id || item.id || item;
        }
        return item;
      }
    );

    // Add the new selected item ID (selectedItemId)
    const updatedWaresIds = [...existingWaresIds, selectedItemId];

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
      productType:
        typeof productToUpdateWareCodes.productType === "string"
          ? productToUpdateWareCodes.productType
          : productToUpdateWareCodes.productType?._id ||
            productToUpdateWareCodes.productType?.id ||
            "",
      wares: updatedWaresIds,
    };

    try {
      await updateProduct({
        productId: productToUpdateWareCodes._id,
        body: payload,
      }).unwrap();

      // Đóng modal sau khi cập nhật thành công
      toaster.create({
        description: "Thêm mã hàng thành công",
        type: "success",
      });
      handleCloseAddItemCodeModal();
    } catch (error) {
      console.error("Không thể thêm mã hàng vào sản phẩm:", error);
      toaster.create({
        description: "Đã xảy ra lỗi khi thêm mã hàng. Vui lòng thử lại.",
        type: "error",
      });
    }
  };

  // 🆕 Hàm xóa mã hàng khỏi sản phẩm - guarded
  const handleRemoveItemCode = async (
    productId: string,
    itemCodeId: string,
    itemCode?: string
  ) => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền xóa mã hàng.",
        type: "error",
      });
      return;
    }

    const product = products.find((p: any) => p._id === productId);
    if (!product) return;

    const ok = await showConfirm({
      title: "Xóa mã hàng",
      description: `Bạn có chắc chắn muốn xóa mã hàng ${
        itemCode || itemCodeId
      } khỏi sản phẩm ${product.code || product._id} không?`,
      confirmText: "Xóa",
      cancelText: "Hủy",
      destructive: true,
    });
    if (!ok) {
      return;
    }

    // Filter out the removed ware code by comparing IDs
    const updatedWaresIds = (product.wares || [])
      .map((item: any) => {
        if (typeof item === "string") {
          return item;
        }
        if (item && typeof item === "object") {
          return item._id || item.id || item;
        }
        return item;
      })
      .filter((id: any) => {
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

      toaster.create({
        description: "Xóa mã hàng thành công",
        type: "success",
      });
    } catch (error) {
      console.error("Không thể xóa mã hàng:", error);
      toaster.create({
        description: "Đã xảy ra lỗi khi xóa mã hàng. Vui lòng thử lại.",
        type: "error",
      });
    }
  };

  const toggleCollapse = (id: any) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getBadgeColor = (type: any) => {
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

  // 1. Thêm/Cập nhật Sản phẩm (Create/Update) - guarded inside
  const handleSaveProduct = async () => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền tạo/cập nhật sản phẩm.",
        type: "error",
      });
      return;
    }

    if (!editingProduct) return;

    // Convert wares to array of ObjectId strings
    const waresIds = (editingProduct.wares || []).map((item: any) => {
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
    const productTypeId =
      typeof editingProduct.productType === "string"
        ? editingProduct.productType
        : editingProduct.productType?._id ||
          editingProduct.productType?.id ||
          "";

    const payload = {
      code: editingProduct.code?.trim() ?? "",
      name: editingProduct.name?.trim() ?? "",
      productName: editingProduct.name?.trim() ?? "",
      customer: customerId,
      description: editingProduct.description ?? "",
      productLength: Number(editingProduct.productLength) || 0,
      productWidth: Number(editingProduct.productWidth) || 0,
      productHeight: Number(editingProduct.productHeight) || 0,
      productType: productTypeId,
      image: "",
      wares: waresIds,
    };

    // Validation
    if (!payload.code || !payload.name) {
      toaster.create({
        description: "Vui lòng nhập mã sản phẩm và tên sản phẩm.",
        type: "error",
      });
      return;
    }

    if (!payload.customer) {
      toaster.create({
        description: "Vui lòng chọn khách hàng.",
        type: "error",
      });
      return;
    }

    if (!payload.productType) {
      toaster.create({
        description: "Vui lòng chọn loại sản phẩm.",
        type: "error",
      });
      return;
    }

    if (!Array.isArray(payload.wares) || payload.wares.length === 0) {
      toaster.create({
        description: "Vui lòng chọn ít nhất một mã hàng.",
        type: "error",
      });
      return;
    }

    // NEW: client-side duplicate check (case-insensitive)
    // When editing, exclude the current product id to allow not changing the code.
    const excludeId = editingProduct._id ? editingProduct._id : null;
    if (isDuplicateCode(payload.code, excludeId)) {
      toaster.create({
        description: `Mã sản phẩm "${payload.code}" đã tồn tại. Vui lòng chọn mã khác.`,
        type: "error",
      });
      return;
    }

    // NEW: check deleted products list
    if (isLoadingDeletedProducts) {
      toaster.create({
        description:
          "Đang kiểm tra danh sách sản phẩm đã xóa — vui lòng thử lại sau",
        type: "error",
      });
      return;
    }
    if (isCodeInDeleted(payload.code, excludeId)) {
      toaster.create({
        description: "Mã sản phẩm đã tồn tại trong danh sách sản phẩm đã xóa",
        type: "error",
      });
      return;
    }

    try {
      if (editingProduct._id) {
        await updateProduct({
          productId: editingProduct._id,
          body: payload,
        }).unwrap();
        toaster.create({
          description: "Cập nhật sản phẩm thành công",
          type: "success",
        });
      } else {
        await createProduct(payload).unwrap();
        toaster.create({
          description: "Tạo sản phẩm thành công",
          type: "success",
        });
      }
      handleCloseProductModal();
    } catch (error: any) {
      console.error("Không thể lưu sản phẩm:", error);

      // server duplicate fallback -> show deleted-list style message if backend indicates duplicate
      const status = error?.status ?? error?.response?.status;
      const serverMsg = (error?.data?.message ??
        error?.message ??
        "") as string;
      if (
        status === 409 ||
        /duplicate|already exists|unique|exists/i.test(String(serverMsg))
      ) {
        toaster.create({
          description: "Mã sản phẩm đã tồn tại trong danh sách sản phẩm đã xóa",
          type: "error",
        });
        return;
      }

      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Đã xảy ra lỗi khi lưu sản phẩm. Vui lòng thử lại.";
      toaster.create({ description: errorMessage, type: "error" });
    }
  };

  // 2. Xóa Sản phẩm (Delete) - guarded
  const handleDeleteProduct = async (
    productId: string,
    productCode?: string
  ) => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền xóa sản phẩm.",
        type: "error",
      });
      return;
    }

    const ok = await showConfirm({
      title: "Xóa sản phẩm",
      description: `Bạn có chắc chắn muốn xóa sản phẩm ${
        productCode || productId
      } không?`,
      confirmText: "Xóa",
      cancelText: "Hủy",
      destructive: true,
    });
    if (!ok) return;

    try {
      await deleteProductMutation(productId).unwrap();
      setOpenIds((prev) => prev.filter((id) => id !== productId));
      toaster.create({
        description: "Xóa sản phẩm thành công",
        type: "success",
      });
    } catch (error) {
      console.error("Không thể xóa sản phẩm:", error);
      toaster.create({
        description: "Đã xảy ra lỗi khi xóa sản phẩm. Vui lòng thử lại.",
        type: "error",
      });
    }
  };

  // ----------------------------------------
  // 💡 LOGIC PHÂN TRANG MỚI
  // ----------------------------------------
  const handlePageChange = (newPage: number) => {
    const totalPages = productList?.totalPages || 1;
    let finalPage = newPage;
    if (newPage < 1) finalPage = 1;
    if (newPage > totalPages) finalPage = totalPages;
    setPage(finalPage);
  };

  const handleLimitChange = (newLimit: number) => {
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

  const limitOptions = [2, 4, 6, 10];

  return (
    <Container style={{ paddingTop: "1.5rem", paddingBottom: "1.5rem" }}>
      {/* Header, Search and Filter Section (Giữ nguyên) */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản Lý Sản Phẩm</h2>
        <Button
          variant="success"
          onClick={() => handleOpenProductModal()}
          disabled={writeDisabled}
          title={"Thêm sản phẩm"}
        >
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
            {productTypes.map((productType: any) => {
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
            {customers.map((customer: any) => {
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

      {/* Product List */}
      {products.map((product: any) => (
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
              title={"Cập nhật"}
              onClick={() => handleOpenProductModal(product)}
              disabled={writeDisabled}
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
              title={"Xóa"}
              onClick={() => handleDeleteProduct(product._id, product.code)}
              disabled={writeDisabled}
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
                  <Col xs={12} sm={6} style={{ marginBottom: "0.5rem" }}>
                    <div
                      style={{
                        background: "#f9fafb",
                        padding: "12px",
                        borderRadius: "8px",
                      }}
                    >
                      <i className="bi bi-box me-2"></i>
                      <small style={{ color: "#6b7280" }}>
                        Loại:
                        <br />
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
                  <Col xs={12} sm={6}>
                    <div
                      style={{
                        background: "#f9fafb",
                        padding: "12px",
                        borderRadius: "8px",
                      }}
                    >
                      <i className="bi bi-person-badge me-2"></i>
                      <small style={{ color: "#6b7280" }}>
                        Khách Hàng:
                        <br />
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
                      {(product.wares ?? []).map((item: any) => {
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
                        const fluteCombination =
                          typeof ware?.fluteCombination === "object" &&
                          ware?.fluteCombination?.code
                            ? ware.fluteCombination.code
                            : typeof ware?.fluteCombination === "string"
                            ? "-"
                            : "-";
                        const paperSize = ware?.paperWidth || 0;

                        if (!ware && typeof item === "string") {
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
                              title={"Xóa mã hàng này"}
                              disabled={writeDisabled}
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
                        title={"Thêm mã hàng mới"}
                        disabled={writeDisabled}
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

      {/* Pagination UI (same as before) */}
      {totalItems > 0 && (
        <div
          className="d-flex justify-content-start align-items-center mt-4"
          style={{
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <div className="d-flex align-items-center gap-4">
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

          <div className="d-flex gap-2 ms-4">
            <Button
              variant="light"
              disabled={!hasPrevPage || isFetching}
              onClick={() => handlePageChange(1)}
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

      {/* Modals (moved to components) */}
      <ProductModal
        show={!!editingProduct}
        onHide={handleCloseProductModal}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        customers={customers}
        productTypes={productTypes}
        availableItemCodes={availableItemCodes}
        modalSearchTerm={modalSearchTerm}
        setModalSearchTerm={setModalSearchTerm}
        isLoadingWares={isLoadingWares}
        isLoadingCustomer={isLoadingCustomer}
        isLoadingProductTypes={isLoadingProductTypes}
        onSave={handleSaveProduct}
        isMutating={isMutating}
        containerEl={containerEl}
      />

      <ProductAddItemCodeModal
        show={showAddItemCodeModal}
        onHide={handleCloseAddItemCodeModal}
        productToUpdateWareCodes={productToUpdateWareCodes}
        availableItemCodes={availableItemCodes}
        isLoadingWares={isLoadingWares}
        modalSearchTerm={modalSearchTerm}
        setModalSearchTerm={setModalSearchTerm}
        onAdd={handleAddItemCodeToProduct}
        isUpdating={isUpdating}
        containerEl={containerEl}
      />
    </Container>
  );
}
