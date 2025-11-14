// src/components/purchase-order-management/SubPOSelectorModal.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Button, Card, Row, Col, Badge, Collapse, Form } from "react-bootstrap";

export type ItemCode = {
  id: number;
  product_code: string;
  wave_type?: string;
  length?: number;
  width_panel_flap?: number;
  height?: number;
  paper_size?: number;
  [k: string]: any;
};

export type ProductCard = {
  unique_id: string;
  product_code: string;
  customer_code: string;
  product_name: string;
  description?: string;
  length?: number;
  width?: number;
  height?: number;
  quantity?: number;
  product_type?: string;
  received_date?: string;
  delivery_date?: string;
  item_codes: ItemCode[];
};

type Props = {
  show: boolean;
  onHide: () => void;
  onConfirm: (selectedProducts: ProductCard[]) => void;
  preselectedIds?: string[];
};

const mockProducts: ProductCard[] = [
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

const ProductSelectorModal: React.FC<Props> = ({
  show,
  onHide,
  onConfirm,
  preselectedIds = [],
}) => {
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>(
    () => {
      const map: Record<string, boolean> = {};
      preselectedIds.forEach((id) => (map[id] = true));
      return map;
    }
  );

  const toggleCollapse = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filtered = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    if (!q) return mockProducts;
    return mockProducts.filter((p) => {
      const matches =
        p.product_code.toLowerCase().includes(q) ||
        p.product_name.toLowerCase().includes(q) ||
        p.customer_code.toLowerCase().includes(q) ||
        p.item_codes.some((it) => it.product_code.toLowerCase().includes(q));
      return matches;
    });
  }, [searchTerm]);

  const toggleSelectProduct = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const confirmSelection = () => {
    const selected = mockProducts.filter((p) => selectedIds[p.unique_id]);
    onConfirm(selected);
    onHide();
  };

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;

  if (!show) return null;

  return (
    <div className="modal-backdrop" style={{ display: "block" }}>
      <div className="modal" role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Chọn sản phẩm để tạo Sub-PO ({selectedCount} selected)
              </h5>
              <button className="btn-close" onClick={onHide} />
            </div>

            <div className="modal-body">
              <Row className="mb-3">
                <Col md={8}>
                  <Form.Control
                    placeholder="Tìm kiếm mã sản phẩm / tên / mã hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>
                <Col md={4} className="text-end">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setSelectedIds({})}
                  >
                    Clear selection
                  </Button>
                </Col>
              </Row>

              <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                {filtered.map((product) => {
                  const open = openIds.includes(product.unique_id);
                  const isSelected = !!selectedIds[product.unique_id];

                  return (
                    <Card
                      key={product.unique_id}
                      className={`mb-3 ${
                        isSelected ? "border-2 border-primary" : ""
                      }`}
                      style={{ position: "relative" }}
                    >
                      <div style={{ position: "absolute", top: 12, left: 12 }}>
                        <Form.Check
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            toggleSelectProduct(product.unique_id)
                          }
                        />
                      </div>

                      <Card.Body style={{ paddingLeft: 56 }}>
                        <Row>
                          <Col md={8}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <h5 style={{ margin: 0 }}>
                                {product.product_name}{" "}
                                <small className="text-muted">
                                  ({product.product_code})
                                </small>
                              </h5>
                              <Badge bg="secondary">
                                Loại: {product.product_type}
                              </Badge>
                              <Badge bg="light" text="dark">
                                Khách: {product.customer_code}
                              </Badge>
                            </div>

                            <div
                              className="small text-muted"
                              style={{ marginTop: 8 }}
                            >
                              {product.description}
                            </div>
                            <div style={{ marginTop: 8 }}>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() =>
                                  toggleCollapse(product.unique_id)
                                }
                              >
                                Hiển thị mã hàng ({product.item_codes.length}){" "}
                                <i
                                  className={`bi ${
                                    open ? "bi-chevron-up" : "bi-chevron-down"
                                  }`}
                                ></i>
                              </Button>
                            </div>
                          </Col>

                          <Col md={4} className="text-end">
                            <div style={{ fontSize: 13 }}>
                              <strong>Size:</strong> {product.length}×
                              {product.width}×{product.height} mm
                            </div>
                            <div style={{ fontSize: 13, marginTop: 8 }}>
                              <strong>Quantity:</strong> {product.quantity}
                            </div>
                          </Col>
                        </Row>

                        <Collapse in={open}>
                          <div style={{ marginTop: 12 }}>
                            {product.item_codes.map((item) => (
                              <div
                                key={item.id}
                                style={{
                                  padding: 8,
                                  background: "#f8fafc",
                                  borderRadius: 8,
                                  marginBottom: 6,
                                }}
                              >
                                <div style={{ fontWeight: 600 }}>
                                  {item.product_code}
                                </div>
                                <div className="small text-muted">
                                  Kích thước: {item.length}×
                                  {item.width_panel_flap}
                                  {item.height ? `×${item.height}` : ""} mm •
                                  Sóng:{" "}
                                  <span style={{ color: "blue" }}>
                                    {item.wave_type}
                                  </span>{" "}
                                  • Khổ giấy:{" "}
                                  <span style={{ color: "red" }}>
                                    {item.paper_size}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Collapse>
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <Button variant="secondary" onClick={onHide}>
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={confirmSelection}
                disabled={selectedCount === 0}
              >
                Chọn ({selectedCount})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectorModal;
