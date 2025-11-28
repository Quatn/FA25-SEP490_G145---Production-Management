// src/components/paper-storage-management/PaperDailyUsageReport.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useGetTransactionsQuery } from "@/service/api/paperRollTransactionApiSlice";
import { useGetPaperRollsQuery } from "@/service/api/paperRollApiSlice";
import { useGetAllPaperColorsQuery } from "@/service/api/paperColorApiSlice";
import { useGetAllPaperSuppliersQuery } from "@/service/api/paperSupplierApiSlice";
import { useGetAllPaperTypesQuery } from "@/service/api/paperTypeApiSlice";

/* ----------------------------- helpers ----------------------------- */

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

/** More robust color-id extractor that handles pt being an id string or object */
const getColorIdFromPaperType = (pt: any, findType?: (id?: string) => any) => {
  if (!pt) return undefined;
  let ptObj = pt;
  if (typeof pt === "string" && typeof findType === "function") {
    ptObj = findType(pt) ?? ptObj;
  }
  if (!ptObj) return undefined;
  if (ptObj.paperColorId && typeof ptObj.paperColorId === "object")
    return getIdFromDoc(ptObj.paperColorId);
  if (ptObj.paperColor && typeof ptObj.paperColor === "object")
    return getIdFromDoc(ptObj.paperColor);
  return (
    getIdFromDoc(ptObj.paperColorId) ??
    getIdFromDoc(ptObj.paperColor) ??
    undefined
  );
};

/** compute display id — resolves paperType if it's a string id using findType */
const computePaperRollId = (
  r: any,
  colorMap: Map<string, any>,
  supplierMap: Map<string, any>,
  findType?: (id?: string) => any
) => {
  let pt = r.paperType ?? r.paperTypeId ?? null;
  if (typeof pt === "string" && typeof findType === "function") {
    pt = findType(pt) ?? pt;
  }

  const colorId = getColorIdFromPaperType(pt, findType);
  const colorObj = colorId ? colorMap.get(String(colorId)) : undefined;
  const colorCode = colorObj?.code ?? colorObj?.title;

  const supplierObj =
    r.paperSupplier ??
    (r.paperSupplierId
      ? supplierMap.get(String(getIdFromDoc(r.paperSupplierId)))
      : undefined);
  const supplierCode =
    supplierObj?.code ?? r.paperSupplier?.code ?? supplierObj?.name;

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

const todayISODate = () => new Date().toISOString().slice(0, 10);

/* ----------------------------- component ----------------------------- */

export const PaperDailyUsageReport: React.FC = () => {
  // date range / selection
  const [startDate, setStartDate] = useState<string>(todayISODate());
  const [endDate, setEndDate] = useState<string>(todayISODate());

  // pagination for transactions (we'll request a large limit for reports)
  const [page] = useState<number>(1);
  const [limit] = useState<number>(2000);

  // fetch transactions (paginated; using large limit)
  const {
    data: txResp,
    isLoading: txLoading,
    error: txError,
  } = useGetTransactionsQuery({
    page,
    limit,
    search: "",
  });
  const transactions: any[] =
    txResp?.data?.data ?? txResp?.data ?? txResp ?? [];

  // fetch rolls (to help compute display id and other metadata)
  const {
    data: rollsResp,
    isLoading: rollsLoading,
    error: rollsError,
  } = useGetPaperRollsQuery({
    page: 1,
    limit: 2000,
  });
  const rollsRaw: any[] =
    rollsResp?.data?.data ?? rollsResp?.data ?? rollsResp ?? [];

  // reference lists
  const { data: colorsResp } = useGetAllPaperColorsQuery();
  const allColors: any[] = colorsResp?.data ?? colorsResp ?? [];

  const { data: suppliersResp } = useGetAllPaperSuppliersQuery();
  const allSuppliers: any[] = suppliersResp?.data ?? suppliersResp ?? [];

  const { data: typesResp } = useGetAllPaperTypesQuery();
  const allTypes: any[] = typesResp?.data ?? typesResp ?? [];

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

  const findType = (id?: string) =>
    (allTypes || []).find((t: any) => String(getIdFromDoc(t)) === String(id));

  // normalized rolls for quick lookup
  const rolls = useMemo(() => {
    return (rollsRaw || []).map((r: any) => {
      const dbId = docIdAsString(r) ?? getIdFromDoc(r) ?? r.paperRollId;
      return {
        paperRollDbId: dbId,
        paperRollId: computePaperRollId(r, colorMap, supplierMap, findType),
        paperSupplier: r.paperSupplier,
        paperType: r.paperType,
        width: r.width,
        grammage: r.grammage,
        weight: r.weight,
        original: r,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollsRaw, allColors, allSuppliers, allTypes]);

  // parse and clamp date range
  const start = useMemo(() => {
    if (!startDate) return null;
    return new Date(startDate + "T00:00:00");
  }, [startDate]);
  const end = useMemo(() => {
    if (!endDate) return null;
    // include end of day
    return new Date(endDate + "T23:59:59.999");
  }, [endDate]);

  // Filter transactions by date range
  const txsInRange = useMemo(() => {
    if (!start || !end) return [];
    return (transactions || []).filter((t: any) => {
      const ts = t.timeStamp ?? t.createdAt ?? t.time ?? null;
      if (!ts) return false;
      const d = new Date(ts);
      return d >= start && d <= end;
    });
  }, [transactions, start, end]);

  /* -------- helper: extract transaction roll id candidates robustly -------- */
  const extractTxIds = (t: any) => {
    const candidates: string[] = [];
    const pushRaw = (v: any) => {
      if (v === undefined || v === null) return;
      const norm = getIdFromDoc(v) ?? (typeof v === "string" ? v : undefined);
      if (!norm) return;
      const s = String(norm).trim();
      if (s) candidates.push(s);
    };

    // common db/display id fields
    pushRaw(
      t.paperRollDbId ??
        t._paperRollDbId ??
        t.paperRollId ??
        t.displayId ??
        t.rollDbId ??
        t.rollDbIdStr ??
        t.rollDisplayId
    );

    // if embedded paperRoll object exists, inspect it
    if (t.paperRoll && typeof t.paperRoll === "object") {
      pushRaw(t.paperRoll._id ?? t.paperRoll.id ?? t.paperRoll);
      pushRaw(t.paperRoll.paperRollId ?? t.paperRoll.displayId);
    }

    // some transactions may embed a nested 'paper' or 'paperType' object with ids
    if (t.paper && typeof t.paper === "object") {
      pushRaw(t.paper._id ?? t.paper.id ?? t.paper);
      pushRaw(t.paper.paperRollId ?? t.paper.displayId);
    }

    // dedupe and return
    return Array.from(new Set(candidates));
  };

  /* ------------------- usage aggregation ------------------- */
  type UsageRow = {
    key: string;
    displayId: string;
    color?: string;
    supplier?: string;
    width?: number | string;
    grammage?: number | string;
    usedWeight: number;
    transactionsCount: number;
    netChange: number;
  };

  const usageByRoll = useMemo(() => {
    const m = new Map<string, UsageRow>();

    txsInRange.forEach((t: any, idx: number) => {
      const ids = extractTxIds(t);
      const dbIdCandidate = ids.find(Boolean) ?? "";
      // attempt to find a roll by any of the candidates
      let roll = undefined;
      for (const candidate of ids) {
        if (!candidate) continue;
        // try strict db id match first
        roll = rolls.find(
          (r) =>
            String(r.paperRollDbId) === String(candidate) ||
            String(r.paperRollDbId) === String(candidate).trim()
        );
        if (roll) break;
        // try matching by display/computed id (case-insensitive & trimmed)
        roll =
          rolls.find(
            (r) =>
              String(r.paperRollId).trim().toLowerCase() ===
              String(candidate).trim().toLowerCase()
          ) ?? undefined;
        if (roll) break;
      }

      // choose grouping key:
      // prefer DB id of matched roll, else prefer first non-empty candidate,
      // else fall back to unique tx id to avoid merging unrelated unknown txs.
      const key =
        (roll?.paperRollDbId && String(roll.paperRollDbId)) ||
        (dbIdCandidate && String(dbIdCandidate)) ||
        String(
          t._id ?? t.id ?? `tx-${idx}-${Math.random().toString(36).slice(2, 8)}`
        );

      const initial = Number(t.initialWeight ?? 0) || 0;
      const final = Number(t.finalWeight ?? 0) || 0;
      const diff = initial - final;
      const used = Math.max(0, diff);

      const existing: UsageRow = m.get(key) ?? {
        key,
        displayId:
          (roll?.paperRollId ??
            (String(
              t.paperRollId ?? t.paperRoll?.paperRollId ?? dbIdCandidate
            ) as string)) ||
          key,
        color: undefined,
        supplier: undefined,
        width: roll?.paperType?.width ?? roll?.width ?? "-",
        grammage: roll?.paperType?.grammage ?? roll?.grammage ?? "-",
        usedWeight: 0,
        transactionsCount: 0,
        netChange: 0,
      };

      existing.usedWeight += used;
      existing.netChange += diff;
      existing.transactionsCount += 1;

      // populate color if missing (from roll, otherwise try tx-level fields)
      if (!existing.color) {
        const pt = roll?.paperType ?? roll?.original?.paperType ?? undefined;
        const colorId = getColorIdFromPaperType(pt, findType);
        const colorObj = colorId ? colorMap.get(String(colorId)) : undefined;
        existing.color = colorObj?.title ?? colorObj?.code ?? undefined;
        if (!existing.color) {
          existing.color =
            t.paperColorTitle ??
            t.paperColor?.title ??
            t.paperType?.paperColor?.title ??
            undefined;
        }
      }

      // populate supplier if missing (from roll, otherwise try tx-level fields)
      if (!existing.supplier) {
        const supplierId = getIdFromDoc(
          roll?.paperSupplier ??
            roll?.original?.paperSupplier ??
            roll?.original?.paperSupplierId ??
            t.paperSupplier ??
            null
        );
        const sObj = supplierId
          ? supplierMap.get(String(supplierId))
          : undefined;
        existing.supplier =
          sObj?.name ??
          sObj?.code ??
          t.paperSupplierName ??
          t.paperSupplier?.name ??
          undefined;
      }

      // ensure width/grammage are resolved (prefer type values)
      existing.width =
        existing.width ??
        roll?.paperType?.width ??
        roll?.width ??
        t.width ??
        "-";
      existing.grammage =
        existing.grammage ??
        roll?.paperType?.grammage ??
        roll?.grammage ??
        t.grammage ??
        "-";

      m.set(key, existing);
    });

    // convert map values to array and sort by usedWeight desc
    const arr = Array.from(m.values()).sort(
      (a, b) => b.usedWeight - a.usedWeight
    );
    return arr;
  }, [txsInRange, rolls, colorMap, supplierMap, findType]);

  const formatNum = (n: number) =>
    Number.isFinite(n) ? String(Math.round(n * 100) / 100) : "-";

  /* ----------------------------- export ----------------------------- */

  const handleExport = async () => {
    const rows = usageByRoll.map((r) => ({
      "Paper Roll (display id)": r.displayId,
      "DB Key": r.key,
      Color: r.color ?? "-",
      Supplier: r.supplier ?? "-",
      Width: r.width ?? "-",
      Grammage: r.grammage ?? "-",
      "Used Weight (kg)": r.usedWeight,
      "Net Change (kg)": r.netChange,
      "Transactions Count": r.transactionsCount,
    }));

    try {
      // dynamic import - optional xlsx
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const xlsx = await import("xlsx");
      const ws = xlsx.utils.json_to_sheet(rows);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "DailyUsage");
      const filename = `paper-daily-usage-${startDate}${
        startDate !== endDate ? `-to-${endDate}` : ""
      }.xlsx`;
      xlsx.writeFile(wb, filename);
    } catch {
      // fallback csv
      const header = [
        "Paper Roll (display id)",
        "DB Key",
        "Color",
        "Supplier",
        "Width",
        "Grammage",
        "Used Weight (kg)",
        "Net Change (kg)",
        "Transactions Count",
      ];
      const csvBody = [
        header.join(","),
        ...rows.map((r) =>
          [
            `"${String(r["Paper Roll (display id)"] ?? "")}"`,
            `"${String(r["DB Key"] ?? "")}"`,
            `"${String(r["Color"] ?? "")}"`,
            `"${String(r["Supplier"] ?? "")}"`,
            `"${String(r["Width"] ?? "")}"`,
            `"${String(r["Grammage"] ?? "")}"`,
            `${r["Used Weight (kg)"] ?? 0}`,
            `${r["Net Change (kg)"] ?? 0}`,
            `${r["Transactions Count"] ?? 0}`,
          ].join(",")
        ),
      ].join("\r\n");

      const csvWithBom = "\uFEFF" + csvBody;
      const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = `paper-daily-usage-${startDate}${
        startDate !== endDate ? `-to-${endDate}` : ""
      }.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };

  /* ----------------------------- rendering ----------------------------- */

  return (
    <div style={{ padding: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h4 style={{ margin: 0 }}>Daily Paper Usage Report</h4>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <label className="small text-muted" style={{ marginBottom: 0 }}>
            From
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control"
          />
          <label className="small text-muted" style={{ marginBottom: 0 }}>
            To
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control"
          />
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              /* refresh is automatic via hooks */
            }}
          >
            Refresh
          </button>
          <button
            className="btn btn-primary"
            style={{maxWidth: 250, minWidth: 130}}
            onClick={handleExport}
            disabled={usageByRoll.length === 0}
          >
            Export to Excel
          </button>
        </div>
      </div>

      {(txLoading && rollsLoading) || txLoading || rollsLoading ? (
        <div className="text-muted">Loading data...</div>
      ) : txError ? (
        <div className="text-danger">Failed to load transactions</div>
      ) : rollsError ? (
        <div className="text-danger">Failed to load paper rolls</div>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}>
            Showing usage from <strong>{startDate}</strong> to{" "}
            <strong>{endDate}</strong> — {usageByRoll.length} paper(s) with
            usage.
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table table-striped table-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Paper Roll</th>
                  <th>Color</th>
                  <th>Supplier</th>
                  <th style={{ textAlign: "right" }}>Width</th>
                  <th style={{ textAlign: "right" }}>Grammage</th>
                  <th style={{ textAlign: "right" }}>Used Weight (kg)</th>
                  <th style={{ textAlign: "right" }}>Net Change (kg)</th>
                  <th style={{ textAlign: "right" }}>Tx Count</th>
                </tr>
              </thead>
              <tbody>
                {usageByRoll.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-muted">
                      No usage found for the selected date(s)
                    </td>
                  </tr>
                ) : (
                  usageByRoll.map((r, i) => (
                    <tr key={r.key}>
                      <td>{i + 1}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{r.displayId}</td>
                      <td>{r.color ?? "-"}</td>
                      <td>{r.supplier ?? "-"}</td>
                      <td style={{ textAlign: "right" }}>{r.width ?? "-"}</td>
                      <td style={{ textAlign: "right" }}>
                        {r.grammage ?? "-"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {formatNum(r.usedWeight)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {formatNum(r.netChange)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {r.transactionsCount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default PaperDailyUsageReport;
