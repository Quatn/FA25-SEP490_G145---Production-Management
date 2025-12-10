// components/purchase-order-management/DeletedProduct.tsx (or wherever you keep it)
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
  useGetDeletedProductsQuery,
  useRestoreProductMutation,
} from "@/service/api/productApiSlice";

export default function DeletedProduct() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(2);
  const [openIds, setOpenIds] = useState<any[]>([]);

  const queryArgs = useMemo(() => ({ page, limit }), [page, limit]);

  const {
    data: productList,
    error: fetchError,
    isLoading: isFetchingList,
    isFetching,
    refetch,
  } = useGetDeletedProductsQuery(queryArgs, {
    // keepUnusedDataFor: 0, // optional
  });

  const [restoreProduct, { isLoading: isRestoring }] =
    useRestoreProductMutation();

  const products = productList?.data ?? [];

  const toggleCollapse = (id: any) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleRestore = async (productId: string) => {
    if (!productId) return;
    if (!window.confirm("Bạn có muốn khôi phục sản phẩm này không?")) return;

    try {
      await restoreProduct(productId).unwrap();
      // refetch listed deleted products
      refetch();
    } catch (err) {
      console.error(err);
      window.alert("Đã xảy ra lỗi khi khôi phục sản phẩm. Vui lòng thử lại.");
    }
  };

  const handlePageChange = (newPage: number) => {
    const totalPages = productList?.totalPages || 1;
    let finalPage = newPage;
    if (newPage < 1) finalPage = 1;
    if (newPage > totalPages) finalPage = totalPages;
    setPage(finalPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
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

  const isLoading = isFetchingList || isFetching || isRestoring;

  return (
    <Container style={{ paddingTop: "1.5rem", paddingBottom: "1.5rem" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Sản phẩm đã xóa</h2>
      </div>

      {isLoading && <div className="text-muted mb-3">Đang tải dữ liệu...</div>}

      {products.map((product: any) => (
        <Card
          className="col-md-10"
          key={product._id || product.id}
          style={{
            marginBottom: "1.5rem",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
            position: "relative",
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
              variant="success"
              size="sm"
              style={{
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Khôi phục"
              onClick={() => handleRestore(product._id)}
            >
              <i className="bi bi-arrow-counterclockwise"></i>
            </Button>
          </div>

          <Card.Body>
            <Row className="align-items-center">
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
                            ? ware?.fluteCombination
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
                          </div>
                        );
                      })}
                    </div>
                  </Collapse>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}

      {!isLoading && products.length === 0 && (
        <div className="text-muted">Không có sản phẩm đã xóa.</div>
      )}

      {/* Pagination UI */}
      {totalItems > 0 && (
        <div
          className="d-flex justify-content-start align-items-center mt-4"
          style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}
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
                disabled={isLoading}
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
              disabled={!hasPrevPage || isLoading}
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
              disabled={!hasPrevPage || isLoading}
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
              disabled={!hasNextPage || isLoading}
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
              disabled={!hasNextPage || isLoading}
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
    </Container>
  );
}
