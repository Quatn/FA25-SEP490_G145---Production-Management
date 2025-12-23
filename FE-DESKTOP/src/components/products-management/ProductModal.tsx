"use client";
import React, { useMemo } from "react";
import { Modal, Button, Form, Row, Col, Card } from "react-bootstrap";

type AnyObj = any;

interface Props {
  show: boolean;
  onHide: () => void;
  editingProduct: AnyObj | null;
  setEditingProduct: (p: AnyObj | null) => void;
  customers: AnyObj[];
  productTypes: AnyObj[];
  availableItemCodes: AnyObj[];
  modalSearchTerm: string;
  setModalSearchTerm: (s: string) => void;
  isLoadingWares: boolean;
  isLoadingCustomer: boolean;
  isLoadingProductTypes: boolean;
  onSave: () => Promise<void>;
  isMutating: boolean;
  containerEl?: Element | null;
}

export default function ProductModal({
  show,
  onHide,
  editingProduct,
  setEditingProduct,
  customers,
  productTypes,
  availableItemCodes,
  modalSearchTerm,
  setModalSearchTerm,
  isLoadingWares,
  isLoadingCustomer,
  isLoadingProductTypes,
  onSave,
  isMutating,
  containerEl,
}: Props) {
  const filteredModalItems = useMemo(() => {
    if (!availableItemCodes) return [];
    return availableItemCodes.filter((item) => {
      const wareCode = item.code || "";
      return wareCode.toLowerCase().includes(modalSearchTerm.toLowerCase());
    });
  }, [availableItemCodes, modalSearchTerm]);

  if (!editingProduct) return null;

  const isEditMode = Boolean(editingProduct?._id);

  return (
    <Modal
      show={show}
      onHide={onHide}
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
                  disabled={isEditMode}
                  aria-disabled={isEditMode}
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
                  value={
                    typeof editingProduct.productType === "string"
                      ? editingProduct.productType
                      : editingProduct.productType?._id ||
                        editingProduct.productType?.id ||
                        ""
                  }
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
                setEditingProduct({ ...editingProduct, name: e.target.value })
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
              filteredModalItems.map((item) => {
                const itemId = item._id || item.id;
                const isSelected = (editingProduct.wares || []).some(
                  (i: any) => {
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
                        updated = updated.filter((i: any) => {
                          const existingId =
                            typeof i === "string" ? i : i?._id || i?.id;
                          return String(existingId) !== String(itemId);
                        });
                      } else {
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
                            : "N/A"}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })
            )}
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button variant="dark" onClick={onSave} disabled={isMutating}>
          {editingProduct?._id ? "Cập nhật" : "Lưu sản phẩm"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
