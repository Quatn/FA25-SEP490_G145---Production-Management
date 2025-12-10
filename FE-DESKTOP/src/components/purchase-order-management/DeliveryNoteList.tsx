// src/components/purchase-order-management/DeliveryNoteList.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useListDeliveryNotesQuery } from "@/service/api/deliveryNoteApiSlice";

function getIdFromDoc(doc: any): string | undefined {
  if (doc === null || doc === undefined) return undefined;
  if (typeof doc === "string") return doc;
  if (typeof doc === "number") return String(doc);
  if (doc._id?.$oid) return String(doc._id.$oid);
  if (doc.$oid) return String(doc.$oid);
  if (doc._id) return String(doc._id);
  if (doc.id) return String(doc.id);
  try {
    if (typeof doc.toString === "function") return doc.toString();
  } catch {}
  return undefined;
}

export default function DeliveryNoteList() {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [query, setQuery] = useState<string>("");

  const {
    data: resp,
    refetch,
    isLoading,
    isFetching,
    error,
  } = useListDeliveryNotesQuery(
    { page, limit, query: query || undefined },
    { refetchOnMountOrArgChange: true }
  );

  // -------------------------
  // Column width configuration (change if needed)
  // Order: PO item | PO code | Length | Width | Height | Ware | Req amount | Delivered
  // -------------------------
  const colWidths = {
    poitem: "minmax(220px, 1fr)",
    poCode: "120px",
    sizeLen: "80px",
    sizeWid: "80px",
    sizeHei: "80px",
    ware: "220px",
    req: "120px",
    delivered: "120px",
  };

  // separator color: light but visible
  const separatorColor = "rgba(0, 0, 0, 0.06)";

  const cellBaseStyle: React.CSSProperties = {
    padding: "10px 12px",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  };

  // normalize response -> notes array
  let notesRaw: any[] = [];
  if (resp?.data?.data && Array.isArray(resp.data.data))
    notesRaw = resp.data.data;
  else if (resp?.data && Array.isArray(resp.data)) notesRaw = resp.data;
  else if (Array.isArray(resp)) notesRaw = resp;
  else if (resp && resp.data && Array.isArray(resp.data)) notesRaw = resp.data;
  else notesRaw = [];

  const [notes, setNotes] = useState<any[]>(notesRaw);
  const notesRef = useRef<any[]>(notes);
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    const same =
      notesRef.current.length === notesRaw.length &&
      notesRef.current.every(
        (a, i) =>
          (getIdFromDoc(a) ?? a._id ?? a.id) ===
          (getIdFromDoc(notesRaw[i]) ?? notesRaw[i]._id ?? notesRaw[i].id)
      );
    if (!same) setNotes(notesRaw);
  }, [notesRaw]);

  // expanded state (which cards are open)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  // reset expansions when page/query change or notes list length changes
  useEffect(() => {
    setExpanded({});
  }, [page, limit, query, notes.length]);

  // pagination meta detection (supports several shapes)
  const totalCount =
    Number(
      resp?.data?.total ??
        resp?.total ??
        resp?.data?.meta?.total ??
        resp?.data?.meta?.count ??
        resp?.meta?.total ??
        0
    ) || 0;
  const totalPages =
    totalCount > 0 ? Math.max(1, Math.ceil(totalCount / limit)) : 1;

  const isPrevDisabled = isFetching || page <= 1;
  const isNextDisabled = isFetching || page >= totalPages;

  const goToPage = (p: number) => {
    if (p < 1) p = 1;
    if (totalCount > 0 && p > totalPages) p = totalPages;
    setPage(p);
  };

  if (isLoading) return <div>Đang tải...</div>;
  if (error) return <div className="text-danger">Lỗi tải dữ liệu</div>;

  // build the grid template string used for item rows
  const gridTemplate = [
    colWidths.poitem,
    colWidths.poCode,
    colWidths.sizeLen,
    colWidths.sizeWid,
    colWidths.sizeHei,
    colWidths.ware,
    colWidths.req,
    colWidths.delivered,
  ].join(" ");

  // helper to compute per-column border-left style
  const leftBorder = (colIndex: number) =>
    colIndex === 0 ? undefined : { borderLeft: `1px solid ${separatorColor}` };

  return (
    <div style={{ padding: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div>
          <strong>Phiếu xuất kho</strong>
        </div>

        {/* <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="form-control form-control-sm"
            placeholder="Tìm kiếm (tùy chọn)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            style={{ minWidth: 240 }}
          />

        </div> */}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {notes.length === 0 && (
          <div className="text-muted p-4">Không có dữ liệu</div>
        )}

        {notes.map((n) => {
          const id = n._id ?? n.id ?? "";
          const custName =
            (n.customer && (n.customer.name ?? n.customer.code)) ??
            (typeof n.customer === "string" ? n.customer : "-");
          const items: any[] = Array.isArray(n.poitems) ? n.poitems : [];

          return (
            <div
              key={id}
              className="shadow-sm"
              style={{
                borderRadius: 8,
                border: `1px solid ${separatorColor}`,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              {/* header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "#fbfbfd",
                  borderBottom: `1px solid ${separatorColor}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      minWidth: 84,
                      borderLeft: "6px solid #0d6efd",
                      paddingLeft: 12,
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {n.code ?? id}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {custName}
                    </div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                      {n.date ? new Date(n.date).toLocaleString() : "-"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div
                    style={{ fontSize: 13, color: "#666", textAlign: "right" }}
                  >
                    {items.length} items
                  </div>
                  <div
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "#f1f5f9",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#333",
                    }}
                  >
                    {n.status}
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => toggle(id)}
                    aria-expanded={!!expanded[id]}
                    style={{ minWidth: 92 }}
                  >
                    {expanded[id] ? "Thu gọn" : `Xem (${items.length})`}
                  </button>
                </div>
              </div>

              {/* body: only render when expanded */}
              {expanded[id] && (
                <div style={{ padding: 12 }}>
                  <div
                    style={{
                      border: `1px solid ${separatorColor}`,
                      borderRadius: 6,
                      overflow: "hidden",
                    }}
                  >
                    {/* header: two-row grid so "Size" can span three subcolumns */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: gridTemplate,
                        gridAutoRows: "auto auto",
                        background: "#f7f9fc",
                      }}
                    >
                      {/* top header row */}
                      <div
                        style={{
                          ...cellBaseStyle,
                          paddingLeft: 12,
                          fontWeight: 700,
                        }}
                      >
                        Mã PO item
                      </div>

                      {/* PO code */}
                      <div
                        style={{
                          ...cellBaseStyle,
                          ...leftBorder(1),
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                      >
                        PO
                      </div>

                      {/* Size label spanning 3 cols (grid column 3..5 in 1-based) */}
                      <div
                        style={{
                          ...cellBaseStyle,
                          ...leftBorder(2),
                          justifyContent: "center",
                          fontWeight: 700,
                          gridColumn: "3 / 6",
                        }}
                      >
                        Size
                      </div>

                      {/* Ware / Req / Delivered - these occupy columns 6/7/8 */}
                      <div
                        style={{
                          ...cellBaseStyle,
                          ...leftBorder(5),
                          justifyContent: "flex-end",
                          fontWeight: 700,
                        }}
                      >
                        Mã hàng
                      </div>
                      <div
                        style={{
                          ...cellBaseStyle,
                          ...leftBorder(6),
                          justifyContent: "flex-end",
                          fontWeight: 700,
                        }}
                      >
                        Số lượng yêu cầu
                      </div>
                      <div
                        style={{
                          ...cellBaseStyle,
                          ...leftBorder(7),
                          justifyContent: "flex-end",
                          fontWeight: 700,
                        }}
                      >
                        Số lượng xuất
                      </div>

                      {/* second header row: individual size labels */}
                      <div style={{ ...cellBaseStyle, paddingLeft: 12 }}></div>
                      <div style={{ ...cellBaseStyle, ...leftBorder(1) }}></div>

                      <div
                        style={{
                          ...cellBaseStyle,
                          ...leftBorder(2),
                          justifyContent: "center",
                          fontWeight: 600,
                        }}
                      >
                        Dài
                      </div>
                      <div
                        style={{
                          ...cellBaseStyle,
                          ...leftBorder(3),
                          justifyContent: "center",
                          fontWeight: 600,
                        }}
                      >
                        Rộng
                      </div>
                      <div
                        style={{
                          ...cellBaseStyle,
                          ...leftBorder(4),
                          justifyContent: "center",
                          fontWeight: 600,
                        }}
                      >
                        Cao
                      </div>

                      <div style={{ ...cellBaseStyle, ...leftBorder(5) }}></div>
                      <div style={{ ...cellBaseStyle, ...leftBorder(6) }}></div>
                      <div style={{ ...cellBaseStyle, ...leftBorder(7) }}></div>
                    </div>

                    {/* items */}
                    {(items || []).length === 0 ? (
                      <div style={{ padding: 12, color: "#666" }}>
                        Không có PO items
                      </div>
                    ) : (
                      (items || []).map((pi: any, idx: number) => {
                        const poitemDoc = pi.poitem ?? null;
                        const poitemId =
                          poitemDoc?._id ??
                          poitemDoc?.id ??
                          (typeof pi.poitem === "string"
                            ? pi.poitem
                            : `noid-${idx}`);

                        // PO code: subPurchaseOrder.purchaseOrder.code
                        const poCode =
                          poitemDoc?.subPurchaseOrder?.purchaseOrder?.code ??
                          poitemDoc?.subPurchaseOrder?.purchaseOrder?.id ??
                          "-";

                        // ware code (prefer ware.code; if ware is string fallback)
                        const wareCode =
                          poitemDoc?.ware?.code ??
                          (typeof poitemDoc?.ware === "string"
                            ? poitemDoc.ware
                            : "-");

                        // sizes (prefer ware properties)
                        const wareLength =
                          poitemDoc?.ware?.wareLength ??
                          poitemDoc?.wareLength ??
                          "-";
                        const wareWidth =
                          poitemDoc?.ware?.wareWidth ??
                          poitemDoc?.wareWidth ??
                          "-";
                        const wareHeight =
                          poitemDoc?.ware?.wareHeight ??
                          poitemDoc?.wareHeight ??
                          "-";

                        const reqAmount = poitemDoc?.amount ?? "-";
                        const delivered = pi.deliveredAmount ?? 0;

                        return (
                          <div
                            key={String(poitemId) + idx}
                            style={{
                              display: "grid",
                              gridTemplateColumns: gridTemplate,
                              alignItems: "center",
                              borderTop: `1px solid ${separatorColor}`,
                              background: idx % 2 === 0 ? "#fff" : "#fbfcfe",
                            }}
                          >
                            <div style={{ ...cellBaseStyle, paddingLeft: 12 }}>
                              {poitemDoc?.code ?? poitemId}
                            </div>

                            <div
                              style={{
                                ...cellBaseStyle,
                                ...leftBorder(1),
                                justifyContent: "center",
                              }}
                            >
                              {poCode}
                            </div>

                            <div
                              style={{
                                ...cellBaseStyle,
                                ...leftBorder(2),
                                justifyContent: "center",
                              }}
                            >
                              {wareLength}
                            </div>
                            <div
                              style={{
                                ...cellBaseStyle,
                                ...leftBorder(3),
                                justifyContent: "center",
                              }}
                            >
                              {wareWidth}
                            </div>
                            <div
                              style={{
                                ...cellBaseStyle,
                                ...leftBorder(4),
                                justifyContent: "center",
                              }}
                            >
                              {wareHeight}
                            </div>

                            <div
                              style={{
                                ...cellBaseStyle,
                                ...leftBorder(5),
                                justifyContent: "flex-end",
                              }}
                            >
                              {wareCode}
                            </div>
                            <div
                              style={{
                                ...cellBaseStyle,
                                ...leftBorder(6),
                                justifyContent: "flex-end",
                              }}
                            >
                              {reqAmount}
                            </div>
                            <div
                              style={{
                                ...cellBaseStyle,
                                ...leftBorder(7),
                                justifyContent: "flex-end",
                              }}
                            >
                              {Number(delivered).toLocaleString()}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* pagination controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 12,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => goToPage(page - 1)}
            disabled={isPrevDisabled}
          >
            Trước
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => goToPage(page + 1)}
            disabled={isNextDisabled}
          >
            Sau
          </button>
          <div style={{ marginLeft: 8 }}>
            Trang {page} {totalCount > 0 && `of ${totalPages}`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span className="text-muted">Đi đến</span>
            <input
              type="number"
              value={page}
              min={1}
              max={totalPages}
              onChange={(e) => {
                const v = Number(e.target.value || 1);
                if (!Number.isFinite(v)) return;
                goToPage(Math.max(1, Math.floor(v)));
              }}
              style={{ width: 72 }}
              className="form-control form-control-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
