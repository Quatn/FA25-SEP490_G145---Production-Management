// src/components/paper-storage-management/PaperRollAudit.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  useGetPaperRollsQuery,
  useUpdatePaperRollMutation,
} from "@/service/api/paperRollApiSlice";
import {
  useCreateTransactionMutation,
  useGetTransactionsQuery,
} from "@/service/api/paperRollTransactionApiSlice";
import { useGetAllPaperColorsQuery } from "@/service/api/paperColorApiSlice";
import { useGetAllPaperSuppliersQuery } from "@/service/api/paperSupplierApiSlice";
import { useGetAllPaperTypesQuery } from "@/service/api/paperTypeApiSlice";

function getIdFromDoc(doc: any): string | undefined {
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

const getColorIdFromPaperType = (pt: any) => {
  if (!pt) return undefined;
  if (pt.paperColorId && typeof pt.paperColorId === "object")
    return getIdFromDoc(pt.paperColorId);
  return getIdFromDoc(pt.paperColorId) ?? undefined;
};

export const PaperRollAudit: React.FC = () => {
  // paging for listing paper rolls
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // fetch paper rolls (paginated)
  const { data: rollsResp, isLoading: rollsLoading } = useGetPaperRollsQuery({
    page,
    limit,
    search: debouncedSearch,
    sortBy: "both",
    sortOrder: "desc",
  });

  const paperRolls: any[] =
    rollsResp?.data?.data ?? rollsResp?.data ?? rollsResp ?? [];

  const totalCount =
    Number(
      rollsResp?.data?.totalItems ??
        rollsResp?.data?.total ??
        rollsResp?.total ??
        rollsResp?.data?.meta?.total ??
        rollsResp?.data?.meta?.count ??
        0
    ) || 0;
  const totalPages =
    totalCount > 0 ? Math.max(1, Math.ceil(totalCount / limit)) : 1;
  const goToPage = (p: number) => {
    if (p < 1) p = 1;
    if (totalCount > 0 && p > totalPages) p = totalPages;
    setPage(p);
  };

  // reference lists
  const { data: colorsResp } = useGetAllPaperColorsQuery();
  const allColors: any[] = colorsResp?.data ?? colorsResp ?? [];

  const { data: suppliersResp } = useGetAllPaperSuppliersQuery();
  const allSuppliers: any[] = suppliersResp?.data ?? suppliersResp ?? [];

  const { data: typesResp } = useGetAllPaperTypesQuery();
  const allTypes: any[] = typesResp?.data ?? typesResp ?? [];

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

  const typeMap = useMemo(() => {
    const m = new Map<string, any>();
    (allTypes || []).forEach((t: any) =>
      m.set(
        String(
          getIdFromDoc(t) ??
            t._id ??
            `${t.width}_${t.grammage}_${getIdFromDoc(t.paperColorId)}`
        ),
        t
      )
    );
    return m;
  }, [allTypes]);

  const computePaperRollId = (r: any) => {
    const pt = r.paperType ?? r.paperTypeId ?? null;
    const colorId = getColorIdFromPaperType(pt);
    const colorObj = colorId ? colorMap.get(String(colorId)) : undefined;
    const colorCode = colorObj?.code;

    const supplierObj =
      r.paperSupplier ??
      (r.paperSupplierId
        ? supplierMap.get(String(getIdFromDoc(r.paperSupplierId)))
        : undefined);
    const supplierCode = supplierObj?.code ?? r.paperSupplier?.code;

    const width = pt?.width ?? r.width;
    const grammage = pt?.grammage ?? r.grammage;
    const seq = r.sequenceNumber ?? r.sequence;
    const receiving = r.receivingDate ?? r.createdAt;
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
    return r.paperRollId ?? "-";
  };

  // local map for input values keyed by db id
  const [inputs, setInputs] = useState<Record<string, string>>({});
  // local map for pending state per row
  const [pending, setPending] = useState<Record<string, boolean>>({});
  // local audit history (so user sees immediate result)
  const [auditHistory, setAuditHistory] = useState<any[]>([]);

  const [createTransaction] = useCreateTransactionMutation();
  const [updatePaperRoll] = useUpdatePaperRollMutation();

  // optional: also fetch transactions (so we can show server-side recent items)
  const { data: txResp } = useGetTransactionsQuery({ page: 1, limit: 10 });
  const recentTx: any[] = txResp?.data?.data ?? [];

  // derive visible normalized rows (compute db id)
  const rows = useMemo(() => {
    return (paperRolls || []).map((r: any) => {
      const dbId = docIdAsString(r) ?? getIdFromDoc(r) ?? r.paperRollId;
      const computedId = computePaperRollId(r);
      const sysWeight = Number(r.weight ?? 0);
      return {
        dbId,
        original: r,
        paperRollId: computedId,
        systemWeight: sysWeight,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paperRolls, colorMap, supplierMap, typeMap]);

  useEffect(() => {
    // initialize inputs to current system weight for visible rows
    const next: Record<string, string> = {};
    rows.forEach((r) => {
      if (r.dbId) next[r.dbId] = String(r.systemWeight ?? "");
    });
    setInputs((p) => ({ ...next, ...p }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const handleChangeClick = async (row: any) => {
    const dbId = row.dbId;
    const value = inputs[dbId];
    if (value === undefined || value === null || String(value).trim() === "") {
      return alert(
        "Vui lòng nhập trọng lượng (TL hiện tại) trước khi Thay đổi."
      );
    }
    const newW = Number(value);
    if (!Number.isFinite(newW) || newW < 0) {
      return alert("Vui lòng nhập trọng lượng hợp lệ (>= 0).");
    }

    // disable button for this row
    setPending((p) => ({ ...p, [dbId]: true }));

    try {
      const txPayload = {
        paperRollId: dbId,
        employeeId: "69146dd889bf8e8ca320bcff",
        transactionType: "KIEMKE",
        initialWeight: Number(row.systemWeight ?? 0),
        finalWeight: newW,
        timeStamp: new Date().toISOString(),
        inCharge: "Operator A",
      };
      const txResp = await createTransaction(txPayload).unwrap();

      // update paper roll weight in DB
      await updatePaperRoll({ id: dbId, data: { weight: newW } }).unwrap();

      // update local UI: reflect new systemWeight in rows by forcing a reload
      // best-effort: update inputs and keep an audit history local entry
      setAuditHistory((prev) => [
        {
          ...txPayload,
          createdAt: new Date().toISOString(),
          message: txResp?.message ?? "Kiểm kê",
        },
        ...prev,
      ]);

      // update the input value to reflect persisted weight
      setInputs((p) => ({ ...p, [dbId]: String(newW) }));

      alert("Thay đổi thành công (Kiểm kê).");
    } catch (err: any) {
      console.error("Kiểm kê failed", err);
      alert(err?.data?.message ?? err?.message ?? "Kiểm kê thất bại");
    } finally {
      setPending((p) => ({ ...p, [dbId]: false }));
    }
  };

  const fieldStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 12,
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div>
          <strong>Kiểm kê kho giấy</strong>
          <div className="small text-muted">Kiểm kê từng cuộn</div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="form-control"
            placeholder="Tìm kiếm NCC / khổ / định lượng"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ minWidth: 320 }}
          />
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Cuộn giấy</th>
              <th style={{ textAlign: "right" }}>TL hiện tại (kg)</th>
              <th style={{ textAlign: "right" }}>TL hệ thống (kg)</th>
              <th style={{ textAlign: "right" }}>Chênh</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const dbId = r.dbId ?? Math.random().toString(36).slice(2, 7);
              const inputVal = inputs[dbId] ?? "";
              const diff =
                inputVal !== "" && !Number.isNaN(Number(inputVal))
                  ? Number(inputVal) - Number(r.systemWeight ?? 0)
                  : null;
              return (
                <tr key={dbId}>
                  <td style={{ whiteSpace: "nowrap" }}>{r.paperRollId}</td>
                  <td style={{ textAlign: "right", minWidth: 150 }}>
                    <input
                      className="form-control form-control-sm"
                      value={inputVal}
                      onChange={(e) =>
                        setInputs((p) => ({ ...p, [dbId]: e.target.value }))
                      }
                      style={{ textAlign: "right" }}
                    />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {r.systemWeight ?? "-"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {diff === null ? "-" : String(diff)}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleChangeClick(r)}
                      disabled={pending[dbId]}
                      title="Lưu thay đổi trọng lượng (Kiểm kê)"
                    >
                      {pending[dbId] ? "Đang..." : "Thay đổi"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="text-muted p-4">
                  Rỗng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 8,
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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

          <div style={{ marginLeft: 12 }}>
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
    </div>
  );
};

export default PaperRollAudit;
