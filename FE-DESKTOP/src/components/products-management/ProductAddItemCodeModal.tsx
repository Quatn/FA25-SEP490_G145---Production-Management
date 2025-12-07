"use client";
import React, { useMemo, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

type AnyObj = any;

interface Props {
  show: boolean;
  onHide: () => void;
  productToUpdateWareCodes: AnyObj | null;
  availableItemCodes: AnyObj[];
  isLoadingWares: boolean;
  modalSearchTerm: string;
  setModalSearchTerm: (s: string) => void;
  onAdd: (selectedItemId: string) => Promise<void>;
  isUpdating?: boolean;
  containerEl?: Element | null;
}

export default function ProductAddItemCodeModal({
  show,
  onHide,
  productToUpdateWareCodes,
  availableItemCodes,
  isLoadingWares,
  modalSearchTerm,
  setModalSearchTerm,
  onAdd,
  isUpdating,
  containerEl,
}: Props) {
  const [selectedItemCodeId, setSelectedItemCodeId] = useState<string | null>(
    null
  );

  const filteredAddItemCodeModalItems = useMemo(() => {
    if (!productToUpdateWareCodes) return [];

    const existingIds = (productToUpdateWareCodes.wares || [])
      .map((item: any) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") return item._id || item.id;
        return item;
      })
      .map((id: any) => String(id));

    return (availableItemCodes || [])
      .filter((item) => {
        const itemId = String(item._id || item.id);
        return !existingIds.includes(itemId);
      })
      .filter((item) => {
        const wareCode = item.code || "";
        return wareCode.toLowerCase().includes(modalSearchTerm.toLowerCase());
      });
  }, [availableItemCodes, modalSearchTerm, productToUpdateWareCodes]);

  const handleSelect = (id: string) => setSelectedItemCodeId(id);

  const handleAdd = async () => {
    if (!selectedItemCodeId) return;
    await onAdd(selectedItemCodeId);
    setSelectedItemCodeId(null);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      container={containerEl}
    >
      <Modal.Header closeButton>
        <Modal.Title>Thêm Mã Hàng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Mã Hàng (Mã đã có sẽ không hiển thị)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nhập mã hàng để tìm kiếm..."
            value={modalSearchTerm}
            onChange={(e) => setModalSearchTerm(e.target.value)}
          />
        </Form.Group>

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
              style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}
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
              const isSelected = String(itemId) === String(selectedItemCodeId);
              return (
                <div
                  key={itemId}
                  onClick={() => handleSelect(itemId)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(0)";
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
                        <strong>Kích Thước (DxRxC):</strong> {item.wareLength}×
                        {item.wareWidth}
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
                          : "N/A"}
                      </div>
                    </Col>
                  </Row>
                </div>
              );
            })
          ) : (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}
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
        <Button variant="secondary" onClick={onHide}>
          Hủy bỏ
        </Button>
        <Button
          variant="dark"
          disabled={!selectedItemCodeId || isUpdating}
          onClick={handleAdd}
        >
          {isUpdating ? "Đang thêm..." : "Thêm"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
