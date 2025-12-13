// src/components/paper-storage-management/PaperDetailModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useGetTransactionsQuery } from "@/service/api/paperRollTransactionApiSlice";
import { useGetAllPaperColorsQuery } from "@/service/api/paperColorApiSlice";
import { useGetAllPaperSuppliersQuery } from "@/service/api/paperSupplierApiSlice";
import { PaperType } from "@/types/PaperType";

type Props = {
  show: boolean;
  onHide: () => void;
  paper?: any;
  transactions?: any[]; // optional array passed by parent
  colorName?: string;
  supplierName?: string;
  paperRollId?: string;
};

function getIdFromDoc(doc: any) {
  if (!doc && doc !== 0) return undefined;
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

function docIdAsString(doc: any) {
  if (!doc) return undefined;
  return (
    doc._id?.$oid ??
    (typeof doc._id === "string" ? doc._id : doc._id?.toString?.()) ??
    doc.paperRollId
  );
}

/** compute display id — same algorithm used elsewhere in your app */
const computePaperRollIdForPaper = (paper: any) => {
  if (!paper) return "-";
  const pt = paper.paperType ?? paper.paperTypeId ?? null;
  const colorCode =
    pt?.paperColor?.code ??
    pt?.paperColor?.title ??
    paper.paperType?.paperColor?.title ??
    undefined;
  const supplierCode = paper.paperSupplier?.code ?? paper.paperSupplier?.name;
  const width = pt?.width ?? paper.width;
  const grammage = pt?.grammage ?? paper.grammage;
  const seq = paper.sequenceNumber ?? paper.sequence;
  const receiving = paper.receivingDate ?? paper.createdAt;
  const yy = receiving
    ? new Date(receiving).getFullYear() % 100
    : new Date().getFullYear() % 100;

  if (
    colorCode &&
    supplierCode &&
    width != null &&
    grammage != null &&
    seq != null
  ) {
    if (seq > 0 && seq < 10) {
      return `${colorCode}/${supplierCode}/${width}/${grammage}/${supplierCode}0000${seq}XC${String(
        yy
      ).padStart(2, "0")}`;
    }
    if (seq >= 10 && seq < 100) {
      return `${colorCode}/${supplierCode}/${width}/${grammage}/${supplierCode}000${seq}XC${String(
        yy
      ).padStart(2, "0")}`;
    }
    if (seq >= 100 && seq < 1000) {
      return `${colorCode}/${supplierCode}/${width}/${grammage}/${supplierCode}00${seq}XC${String(
        yy
      ).padStart(2, "0")}`;
    }
    if (seq >= 1000 && seq < 10000) {
      return `${colorCode}/${supplierCode}/${width}/${grammage}/${supplierCode}0${seq}XC${String(
        yy
      ).padStart(2, "0")}`;
    }
    return `${colorCode}/${supplierCode}/${width}/${grammage}/${supplierCode}${seq}XC${String(
      yy
    ).padStart(2, "0")}`;
  }
  return paper.paperRollId ?? getIdFromDoc(paper) ?? "-";
};

export const PaperDetailModal: React.FC<Props> = ({
  show,
  onHide,
  paper,
  transactions = [],
  colorName,
  supplierName,
  paperRollId,
}) => {
  // --------------------------
  // ALL hooks go here, unconditionally
  // --------------------------

  // pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // search state + debounce
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // transactions query (always called)
  const {
    data: txResp,
    isLoading: txLoading,
    error: txError,
  } = useGetTransactionsQuery({ page, limit, search: debouncedSearch });

  const fetchedTxs: any[] = txResp?.data?.data ?? txResp?.data ?? txResp ?? [];

  // total count & paging helpers
  const totalCount =
    Number(
      txResp?.data?.totalItems ??
        txResp?.data?.total ??
        txResp?.total ??
        txResp?.data?.meta?.total ??
        txResp?.data?.meta?.count ??
        0
    ) || 0;
  const totalPages =
    totalCount > 0 ? Math.max(1, Math.ceil(totalCount / limit)) : 1;
  const goToPage = (p: number) => {
    if (p < 1) p = 1;
    if (totalCount > 0 && p > totalPages) p = totalPages;
    setPage(p);
  };

  // fetch colors & suppliers
  const { data: colorsResp } = useGetAllPaperColorsQuery();
  const { data: suppliersResp } = useGetAllPaperSuppliersQuery();
  const allColors: any[] = colorsResp?.data ?? colorsResp ?? [];
  const allSuppliers: any[] = suppliersResp?.data ?? suppliersResp ?? [];

  // maps
  const colorMap = useMemo(() => {
    const m = new Map<string, any>();
    (allColors || []).forEach((c: any) =>
      m.set(String(getIdFromDoc(c) ?? c.code ?? c.title), c)
    );
    return m;
  }, [allColors]);

  const supplierMap = useMemo(() => {
    const m = new Map<string, any>();
    (allSuppliers || []).forEach((s: any) =>
      m.set(String(getIdFromDoc(s) ?? s.code ?? s.name), s)
    );
    return m;
  }, [allSuppliers]);

  // helper copied from PaperList: get color id from paperType object (handles object or id)
  const getColorIdFromPaperType = (pt: PaperType) => {
    if (!pt) return undefined;
    if (pt.paperColor && typeof pt.paperColor === "object")
      return getIdFromDoc(pt.paperColor);
    return (
      getIdFromDoc(pt.paperColor) ?? undefined
    );
  };

  // safe to compute these even if `paper` is undefined
  const computedId = computePaperRollIdForPaper(paper);
  const dbId =
    docIdAsString(paper) ?? getIdFromDoc(paper) ?? paper?.paperRollId;

  // choose transactions source (parent-supplied or fetched)
  const allFetched =
    Array.isArray(transactions) && transactions.length > 0
      ? transactions
      : fetchedTxs;

  // filter related txs (memoized)
  const relatedTxs = useMemo(() => {
    if (!Array.isArray(allFetched)) return [];
    return allFetched.filter((t: any) => {
      const matchesDb =
        String(t.paperRollDbId ?? t._paperRollDbId ?? "") === String(dbId);
      const matchesDisplay =
        String(t.paperRollId ?? "") === String(computedId) ||
        String(t.paperRollId ?? "") === String(paper?.paperRollId ?? "");
      const matchesFallbackDb =
        String(t.paperRollId ?? "") === String(dbId) ||
        String(t.paperRollDbId ?? "") === String(computedId);
      return matchesDb || matchesDisplay || matchesFallbackDb;
    });
  }, [allFetched, dbId, computedId, paper?.paperRollId]);

  // compute unique dates available in relatedTxs
  const dates = useMemo(() => {
    const s = Array.from(
      new Set(
        (relatedTxs || [])
          .map((t: any) =>
            t.timeStamp ? String(t.timeStamp).slice(0, 10) : ""
          )
          .filter(Boolean)
      )
    );
    s.sort((a, b) => (a < b ? 1 : -1));
    return s;
  }, [relatedTxs]);

  // selected date state (hook)
  const [selectedDate, setSelectedDate] = useState<string>("");

  // keep selectedDate synced to available dates
  useEffect(() => {
    if (!selectedDate && dates.length) setSelectedDate(dates[0]);
    if (dates.length === 0) setSelectedDate("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dates]);

  // filtered entries for selectedDate
  const entriesForDate = useMemo(() => {
    if (!selectedDate) return relatedTxs;
    return relatedTxs.filter(
      (t: any) =>
        (t.timeStamp ? String(t.timeStamp).slice(0, 10) : "") === selectedDate
    );
  }, [relatedTxs, selectedDate]);

  // small util (not a hook)
  const formatTime = (ts: string | undefined) => {
    if (!ts) return "";
    try {
      return String(ts).slice(11, 19);
    } catch {
      return ts;
    }
  };

  // --------------------------
  // Now safe to early-return for non-visible states
  // --------------------------
  if (!show) return null;

  if (!paper) {
    return (
      <div className="modal-backdrop" style={{ display: "block" }}>
        <div className="modal" role="dialog" style={{ display: "block" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết cuộn giấy</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={onHide}
                />
              </div>
              <div className="modal-body">Không có dữ liệu</div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={onHide}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // compute final color & supplier display names (pure sync)
  const finalColorName =
    colorName ??
    paper.paperType?.paperColor?.title ??
    (() => {
      const pt = paper.paperType ?? paper.paperTypeId ?? null;
      const cId = getColorIdFromPaperType(pt);
      const c = cId ? colorMap.get(String(cId)) : undefined;
      return c?.title ?? c?.code ?? undefined;
    })();

  const finalSupplierName =
    supplierName ??
    paper.paperSupplier?.name ??
    (() => {
      const sId = getIdFromDoc(paper.paperSupplier ?? paper.paperSupplierId);
      const s = sId ? supplierMap.get(String(sId)) : undefined;
      return s?.name ?? s?.code ?? undefined;
    })();

  // ---------- Render UI ----------
  return (
    <div className="modal-backdrop" style={{ display: "block" }}>
      <div className="modal" role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Chi tiết cuộn giấy</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onHide}
              />
            </div>

            <div className="modal-body">
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <th style={{ width: 200 }}>Mã cuộn</th>
                    <td>{paperRollId ?? computedId}</td>
                  </tr>
                  <tr>
                    <th>Số thứ tự</th>
                    <td>{paper.sequenceNumber ?? "-"}</td>
                  </tr>
                  <tr>
                    <th>Loại giấy</th>
                    <td>
                      {paper.paperType
                        ? `${paper.paperType.width} mm • ${paper.paperType.grammage} g/m2`
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <th>Màu</th>
                    <td>{finalColorName ?? "-"}</td>
                  </tr>
                  <tr>
                    <th>Nhà cung cấp</th>
                    <td>{finalSupplierName ?? "-"}</td>
                  </tr>
                  <tr>
                    <th>Khổ (mm)</th>
                    <td>{paper.paperType?.width ?? paper.width ?? "-"}</td>
                  </tr>
                  <tr>
                    <th>Định lượng (gram/m2)</th>
                    <td>
                      {paper.paperType?.grammage ?? paper.grammage ?? "-"}
                    </td>
                  </tr>
                  <tr>
                    <th>Trọng lượng hiện tại</th>
                    <td>{paper.weight ?? "-"}</td>
                  </tr>
                  <tr>
                    <th>Ngày nhận</th>
                    <td>
                      {paper.receivingDate
                        ? new Date(paper.receivingDate)
                            .toISOString()
                            .slice(0, 10)
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <th>Ghi chú</th>
                    <td>{paper.note ?? "-"}</td>
                  </tr>
                </tbody>
              </table>

              <h6 style={{ marginTop: 16 }}>Lịch sử lệnh cho cuộn này</h6>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <label className="small text-muted" style={{ margin: 0 }}>
                    Chọn ngày
                  </label>
                  <select
                    className="form-select"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ minWidth: 160 }}
                  >
                    <option value="">-- tất cả --</option>
                    {dates.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    className="form-control form-control-sm"
                    placeholder="Search (optional)"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    style={{ minWidth: 200 }}
                  />
                </div>
              </div>

              {txLoading ? (
                <div className="text-muted">Đang tải lịch sử...</div>
              ) : txError ? (
                <div className="text-danger">Lỗi khi tải lịch sử</div>
              ) : (
                <>
                  <table className="table table-striped table-sm">
                    <thead>
                      <tr>
                        <th>Thời gian</th>
                        <th>Thao tác</th>
                        <th style={{ textAlign: "right" }}>Tồn đầu</th>
                        <th style={{ textAlign: "right" }}>Tồn cuối</th>
                        <th>Người thực hiện</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entriesForDate.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-muted">
                            Không có lịch sử
                          </td>
                        </tr>
                      ) : (
                        entriesForDate.map((t: any, i: number) => (
                          <tr key={t.id ?? t._id ?? i}>
                            <td>{formatTime(t.timeStamp)}</td>
                            <td>{t.transactionType}</td>
                            <td style={{ textAlign: "right" }}>
                              {t.initialWeight}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              {t.finalWeight}
                            </td>
                            <td>{t.inCharge ?? t.employeeName ?? ""}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 8,
                    }}
                  >
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => goToPage(page - 1)}
                        disabled={page <= 1}
                      >
                        Trước
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => goToPage(page + 1)}
                        disabled={totalCount > 0 ? page >= totalPages : false}
                      >
                        Sau
                      </button>
                      <div style={{ marginLeft: 8 }}>
                        Trang {page} {totalCount > 0 && `trong ${totalPages}`}
                      </div>
                    </div>

                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
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

                      <div>
                        <select
                          className="form-control form-control-sm"
                          value={limit}
                          onChange={(e) => {
                            const v = Number(e.target.value || 10);
                            if (!Number.isFinite(v) || v <= 0) return;
                            setLimit(v);
                            setPage(1);
                          }}
                        >
                          <option value={5}>5 / trang</option>
                          <option value={10}>10 / trang</option>
                          <option value={20}>20 / trang</option>
                          <option value={50}>50 / trang</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onHide}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperDetailModal;
