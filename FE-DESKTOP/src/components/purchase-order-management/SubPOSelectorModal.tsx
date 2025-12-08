// SubPOSelectorModal.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Button, Card, Row, Col, Badge, Collapse, Form } from "react-bootstrap";
import { useGetProductsQuery } from "@/service/api/productApiSlice";

type ItemCode = { [k: string]: any };

type ProductCard = {
  _id?: string;
  code?: string;
  name?: string;
  description?: string;
  length?: number;
  width?: number;
  height?: number;
  quantity?: number;
  product_type?: string;
  customer?: any;
  wares?: any[];
};

type Props = {
  show: boolean;
  onHide: () => void;
  onConfirm: (
    selectedProducts: {
      productId: string;
      deliveryDate: string;
      status: string;
    }[]
  ) => void;
  preselectedIds?: string[];
};

const SUBPO_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDINGAPPROVAL", label: "Pending approval" },
  { value: "APPROVED", label: "Approved" },
];

const todayIso = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const SubPOSelectorModal: React.FC<Props> = ({
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

  const [meta, setMeta] = useState<
    Record<string, { deliveryDate: string; status: string }>
  >({});

  // fetch real products
  const { data: productsResp } = useGetProductsQuery({
    page: 1,
    limit: 100,
    search: "",
  });
  const products: ProductCard[] =
    (productsResp?.data ?? productsResp?.data?.data ?? productsResp?.data) ||
    [];

  const toggleCollapse = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filtered = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const code = (p.code ?? p._id ?? "").toString().toLowerCase();
      const name = (p.name ?? "").toLowerCase();
      const customer = (
        p.customer?.name ??
        p.customer?.code ??
        ""
      ).toLowerCase();
      const waresMatch = (p.wares || []).some((w: any) =>
        (w.code ?? "").toLowerCase().includes(q)
      );
      return (
        code.includes(q) ||
        name.includes(q) ||
        customer.includes(q) ||
        waresMatch
      );
    });
  }, [searchTerm, products]);

  const toggleSelectProduct = (id: string) => {
    setSelectedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id] && !meta[id]) {
        setMeta((m) => ({
          ...m,
          [id]: { deliveryDate: todayIso(), status: "DRAFT" },
        }));
      }
      return next;
    });
  };

  const setProductMeta = (
    id: string,
    patch: Partial<{ deliveryDate: string; status: string }>
  ) => {
    setMeta((m) => ({
      ...m,
      [id]: {
        ...(m[id] ?? { deliveryDate: todayIso(), status: "DRAFT" }),
        ...(patch ?? {}),
      },
    }));
  };

  const confirmSelection = () => {
    const selected = products
      .filter((p) => selectedIds[p._id ?? (p as any).id])
      .map((p) => ({
        productId: p._id ?? (p as any).id,
        deliveryDate: meta[p._id ?? (p as any).id]?.deliveryDate ?? todayIso(),
        status: meta[p._id ?? (p as any).id]?.status ?? "DRAFT",
      }));
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
                    onClick={() => {
                      setSelectedIds({});
                      setMeta({});
                    }}
                  >
                    Clear selection
                  </Button>
                </Col>
              </Row>

              <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                {filtered.map((product) => {
                  const id = product._id ?? (product as any).id;
                  const open = openIds.includes(id);
                  const isSelected = !!selectedIds[id];
                  const m = meta[id] ?? {
                    deliveryDate: todayIso(),
                    status: "DRAFT",
                  };
                  return (
                    <Card
                      key={id}
                      className={`mb-3 ${
                        isSelected ? "border-2 border-primary" : ""
                      }`}
                      style={{ position: "relative" }}
                    >
                      <div style={{ position: "absolute", top: 12, left: 12 }}>
                        <Form.Check
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectProduct(id)}
                        />
                      </div>

                      <Card.Body style={{ paddingLeft: 56 }}>
                        <Row>
                          <Col md={7}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <h5 style={{ margin: 0 }}>
                                {product.name}{" "}
                                <small className="text-muted">
                                  ({product.code ?? id})
                                </small>
                              </h5>
                              <Badge bg="secondary">
                                Loại: {product.product_type ?? "-"}
                              </Badge>
                              <Badge bg="light" text="dark">
                                Khách:{" "}
                                {product.customer?.code ??
                                  product.customer?.name ??
                                  "-"}
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
                                  setOpenIds((prev) =>
                                    prev.includes(id)
                                      ? prev.filter((x) => x !== id)
                                      : [...prev, id]
                                  )
                                }
                              >
                                Hiển thị mã hàng ({(product.wares || []).length}
                                ){" "}
                                <i
                                  className={`bi ${
                                    open ? "bi-chevron-up" : "bi-chevron-down"
                                  }`}
                                ></i>
                              </Button>
                            </div>
                          </Col>

                          <Col md={5} className="text-end">
                            <div style={{ fontSize: 13 }}>
                              <strong>Size:</strong> {product.length ?? "-"}×
                              {product.width ?? "-"}×{product.height ?? "-"} mm
                            </div>
                            <div style={{ fontSize: 13, marginTop: 8 }}>
                              <strong>Quantity:</strong>{" "}
                              {product.quantity ?? "-"}
                            </div>

                            <div
                              style={{
                                marginTop: 12,
                                display: "flex",
                                gap: 8,
                                justifyContent: "flex-end",
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="date"
                                className="form-control form-control-sm"
                                style={{ width: 160 }}
                                value={m.deliveryDate ?? ""}
                                onChange={(e) =>
                                  setProductMeta(id, {
                                    deliveryDate: e.target.value,
                                  })
                                }
                                disabled={!isSelected}
                              />
                              <select
                                className="form-select form-select-sm"
                                style={{ width: 160 }}
                                value={m.status}
                                onChange={(e) =>
                                  setProductMeta(id, { status: e.target.value })
                                }
                                disabled={!isSelected}
                              >
                                {SUBPO_STATUSES.map((s) => (
                                  <option key={s.value} value={s.value}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </Col>
                        </Row>

                        <Collapse in={open}>
                          <div style={{ marginTop: 12 }}>
                            {(product.wares || []).map((w: any) => (
                              <div
                                key={w._id ?? w.id ?? w.code}
                                style={{
                                  padding: 8,
                                  background: "#f8fafc",
                                  borderRadius: 8,
                                  marginBottom: 6,
                                }}
                              >
                                <div style={{ fontWeight: 600 }}>
                                  {w.code ?? w._id}
                                </div>
                                <div className="small text-muted">
                                  Width: {w.wareWidth ?? "-"} mm • Length:{" "}
                                  {w.wareLength ?? "-"} mm • UnitPrice:{" "}
                                  {w.unitPrice ?? "-"}
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

export default SubPOSelectorModal;
