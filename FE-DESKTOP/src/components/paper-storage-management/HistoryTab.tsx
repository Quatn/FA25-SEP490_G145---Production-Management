// src/components/paper-storage-management/HistoryTab.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useGetTransactionsQuery } from "@/service/api/paperRollTransactionApiSlice";
import { useGetPaperRollsQuery } from "@/service/api/paperRollApiSlice";
import { useGetAllPaperColorsQuery } from "@/service/api/paperColorApiSlice";
import { useGetAllPaperSuppliersQuery } from "@/service/api/paperSupplierApiSlice";
import { useGetAllPaperTypesQuery } from "@/service/api/paperTypeApiSlice";

/** small helper to normalize id shapes */
function docIdAsString(doc: any) {
  if (!doc) return undefined;
  return (
    doc._id?.$oid ??
    (typeof doc._id === "string" ? doc._id : doc._id?.toString?.()) ??
    doc.paperRollId
  );
}

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

/** extract color id from a paperType which may be populated or just an id */
const getColorIdFromPaperType = (pt: any) => {
  if (!pt) return undefined;
  if (pt.paperColorId && typeof pt.paperColorId === "object")
    return getIdFromDoc(pt.paperColorId);
  return getIdFromDoc(pt.paperColorId) ?? undefined;
};

export const HistoryTab: React.FC = () => {
  // fetch transactions (paginated)
  const {
    data: txResp,
    isLoading: txLoading,
    error: txError,
  } = useGetTransactionsQuery({ page: 1, limit: 1000 });
  const transactions: any[] = txResp?.data?.data ?? [];

  // fetch paper rolls (paginated)
  const {
    data: rollsResp,
    isLoading: rollsLoading,
    error: rollsError,
  } = useGetPaperRollsQuery({ page: 1, limit: 1000 });
  const rollsRaw: any[] = rollsResp?.data?.data ?? [];

  // fetch reference lists so we can compute human-friendly paperRollId
  const { data: colorsResp } = useGetAllPaperColorsQuery();
  const allColors: any[] = colorsResp?.data ?? colorsResp ?? [];

  const { data: suppliersResp } = useGetAllPaperSuppliersQuery();
  const allSuppliers: any[] = suppliersResp?.data ?? suppliersResp ?? [];

  const { data: typesResp } = useGetAllPaperTypesQuery();
  const allTypes: any[] = typesResp?.data ?? typesResp ?? [];

  // build maps for lookups
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
    const colorCode = colorObj?.code ?? colorObj?.title;

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
      return `${colorCode}/${supplierCode}/${width}/${grammage}/${seq}XC${String(
        yy
      ).padStart(2, "0")}`;
    }
    return r.paperRollId ?? "-";
  };

  // normalized rolls with computed paperRollId and db id
  const rolls = useMemo(() => {
    return (rollsRaw || []).map((r: any) => {
      const dbId = docIdAsString(r) ?? getIdFromDoc(r) ?? r.paperRollId;
      return {
        paperRollDbId: dbId,
        // computed display id:
        paperRollId: computePaperRollId(r),
        sequenceNumber: r.sequenceNumber,
        paperSupplier: r.paperSupplier,
        paperType: r.paperType,
        width: r.width,
        grammage: r.grammage,
        weight: r.weight,
        original: r,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollsRaw, colorMap, supplierMap, typeMap]);

  const [selectedDate, setSelectedDate] = useState<string>("");

  // compute available dates from transactions
  const dates = useMemo(() => {
    const s = Array.from(
      new Set(
        (transactions || [])
          .map((t: any) =>
            t.timeStamp ? String(t.timeStamp).slice(0, 10) : ""
          )
          .filter(Boolean)
      )
    );
    s.sort((a, b) => (a < b ? 1 : -1)); // newest first
    return s;
  }, [transactions]);

  // default selected date to latest when available
  useEffect(() => {
    if (!selectedDate && dates.length) setSelectedDate(dates[0]);
  }, [dates, selectedDate]);

  const entriesForDate = useMemo(() => {
    if (!selectedDate) return [];
    return transactions.filter(
      (t: any) =>
        (t.timeStamp ? String(t.timeStamp).slice(0, 10) : "") === selectedDate
    );
  }, [transactions, selectedDate]);

  // find computed roll name by db id or fall back to incoming id
  const findRollName = (id: string) =>
    rolls.find((r) => r.paperRollDbId === id)?.paperRollId ?? id;

  console.log("findrollname: ", findRollName("6919da2f0e20b5ebc3fa22a8"));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <h5>Lịch sử giao dịch</h5>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label className="small text-muted">Chọn ngày</label>
          <select
            className="form-select"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            {dates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {txLoading || rollsLoading ? (
        <div className="text-muted">Đang tải lịch sử...</div>
      ) : txError ? (
        <div className="text-danger">Lỗi khi tải lịch sử</div>
      ) : (
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Mã cuộn</th>
              <th>Thao tác</th>
              <th style={{ textAlign: "right" }}>Trọng lượng trước</th>
              <th style={{ textAlign: "right" }}>Trọng lượng sau</th>
              <th>Người thực hiện</th>
            </tr>
          </thead>
          <tbody>
            {entriesForDate.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted">
                  Không có lịch sử
                </td>
              </tr>
            ) : (
              entriesForDate.map((tx: any) => (
                <tr
                  key={tx.id ?? tx._id ?? `${tx.paperRollId}-${tx.timeStamp}`}
                >
                  <td>{String(tx.timeStamp ?? "").slice(11, 19)}</td>
                  <td>
                    {findRollName(tx.paperRollDbId)}{" "}
                    {findRollName(tx.paperRollId)}
                  </td>
                  <td>{tx.transactionType}</td>
                  <td style={{ textAlign: "right" }}>{tx.initialWeight}</td>
                  <td style={{ textAlign: "right" }}>{tx.finalWeight}</td>
                  <td>
                    {tx.inCharge ?? tx.employeeName ?? tx.employee?.name ?? ""}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HistoryTab;
