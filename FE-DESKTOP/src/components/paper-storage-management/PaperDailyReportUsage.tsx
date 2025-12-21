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
  if (ptObj.paperColor && typeof ptObj.paperColor === "object")
    return getIdFromDoc(ptObj.paperColor);
  return (
    getIdFromDoc(ptObj.paperColor) ??
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
    includeDeleted: true,
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
            `${t.width}_${t.grammage}_${getIdFromDoc(t.paperColor)}`
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
    transactionsCount: number;
    netChange: number;

    // new fields
    initialWeight?: number;
    finalWeight?: number;

    // internal helpers
    firstTxTime?: number;
    lastTxTime?: number;
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

      // timestamp for earliest/latest selection (fallback to idx-based stable value)
      const ts = t.timeStamp ?? t.createdAt ?? t.time ?? null;
      const tsNum = ts ? new Date(ts).getTime() : Date.now() + idx;

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
        transactionsCount: 0,
        netChange: 0,

        // init new fields
        initialWeight: undefined,
        finalWeight: undefined,
        firstTxTime: Number.POSITIVE_INFINITY,
        lastTxTime: 0,
      };

      // accumulate net change (initial - final) and count
      existing.netChange += diff;
      existing.transactionsCount += 1;

      // update earliest initial weight
      if (tsNum < (existing.firstTxTime ?? Number.POSITIVE_INFINITY)) {
        existing.firstTxTime = tsNum;
        existing.initialWeight = initial;
      }

      // update latest final weight
      if (tsNum > (existing.lastTxTime ?? 0)) {
        existing.lastTxTime = tsNum;
        existing.finalWeight = final;
      }

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

    const arr = Array.from(m.values()).sort(
      (a, b) => b.netChange - a.netChange
    );
    return arr;
  }, [txsInRange, rolls, colorMap, supplierMap, findType]);

  const formatNum = (n: number) =>
    Number.isFinite(n) ? String(Math.round(n * 100) / 100) : "-";

  /* ----------------------------- export (template layout) ----------------------------- */

  const handleExport = async () => {
    // Build rows to match the template's layout:
    // Row 0: Company name (single cell across many columns)
    // Row 1: blank
    // Row 2: Title (single cell across many columns)
    // Row 3: blank
    // Row 4: Date row with 'Từ ngày', startDate, 'Đến ngày', endDate
    // Row 5: blank
    // Row 6: Header row (STT, Mã cuộn, Màu, Nhà cung cấp, Rộng, Khổ, Tồn đầu, Tồn cuối, Trọng lượng sử dụng, Số lần nhập/xuất/kiểm kê)
    // Row 7+: data rows

    const header = [
      "STT",
      "Mã cuộn",
      "Màu",
      "Nhà cung cấp",
      "Rộng",
      "Khổ",
      "Tồn đầu (kg)",
      "Tồn cuối (kg)",
      "Trọng lượng sử dụng (kg)",
      "Số lần nhập/xuất/kiểm kê",
    ];

    // Create the 2D array
    const aoa: any[] = [];

    // Company row (A1)
    aoa.push(["Xuan Cau Company"]); // will merge later
    aoa.push([]); // blank
    aoa.push(["Báo cáo sử dụng giấy"]); // title
    aoa.push([]); // blank

    // Date row (put labels a few columns in to match template appearance)
    // We'll place 'Từ ngày' in column K? simpler: place into columns 11/12 like template showed.
    // But to keep compatibility, we'll put: [ , , , , , , , , 'Từ ngày', startDate, '', 'Đến ngày', endDate ]
    const dateRow: any[] = new Array(Math.max(header.length, 10)).fill("");
    // Put labels near the right side
    const rightIndex = Math.max(6, header.length - 2); // simple heuristic
    // place Từ ngày and Đến ngày spaced
    dateRow[rightIndex] = "Từ ngày";
    dateRow[rightIndex + 1] = startDate;
    dateRow[rightIndex + 2] = "";
    dateRow[rightIndex + 3] = "Đến ngày";
    dateRow[rightIndex + 4] = endDate;
    aoa.push(dateRow);
    aoa.push([]); // blank

    // Header (put header in first columns)
    aoa.push(header);

    // Data rows
    usageByRoll.forEach((r, i) => {
      aoa.push([
        i + 1,
        r.displayId ?? "-",
        r.color ?? "-",
        r.supplier ?? "-",
        r.width ?? "-",
        r.grammage ?? "-",
        r.initialWeight != null ? formatNum(r.initialWeight) : "-",
        r.finalWeight != null ? formatNum(r.finalWeight) : "-",
        formatNum(r.netChange),
        r.transactionsCount ?? 0,
      ]);
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const xlsx = await import("xlsx");
      const ws = xlsx.utils.aoa_to_sheet(aoa);

      // Merge company title across the width (merge first row columns A..J)
      const numCols = Math.max(header.length, 10);
      ws["!merges"] = ws["!merges"] || [];
      // merge row 0 columns 0..(numCols-1)
      ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: numCols - 1 } });
      // merge title row (row 2)
      ws["!merges"].push({ s: { r: 2, c: 0 }, e: { r: 2, c: numCols - 1 } });

      // Optionally set column widths (simple)
      ws["!cols"] = new Array(numCols).fill({ wpx: 90 });
      // Make the header bold-ish by setting the cell style for the header row (row index = aoa header row index)
      const headerRowIndex = aoa.findIndex(
        (r) => Array.isArray(r) && r.length && r[0] === "STT"
      );
      if (headerRowIndex >= 0) {
        for (let c = 0; c < numCols; c++) {
          const cellAddress = xlsx.utils.encode_cell({ r: headerRowIndex, c });
          if (!ws[cellAddress]) continue;
          // Basic style - many environments ignore style on client, but keep shape
          ws[cellAddress].s = ws[cellAddress].s || {};
          ws[cellAddress].s.font = { bold: true };
        }
      }

      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "Sheet1");

      const filename = `paper-daily-usage-${startDate}${
        startDate !== endDate ? `-to-${endDate}` : ""
      }.xlsx`;
      xlsx.writeFile(wb, filename);
    } catch (err) {
      // fallback CSV with the same columns (best-effort)
      const rows = [
        [],
        [],
        ["Báo cáo sử dụng giấy"],
        [],
        [], // date row will be inserted below as simple text
        header,
        ...usageByRoll.map((r, i) => [
          i + 1,
          r.displayId ?? "-",
          r.color ?? "-",
          r.supplier ?? "-",
          r.width ?? "-",
          r.grammage ?? "-",
          r.initialWeight != null ? formatNum(r.initialWeight) : "",
          r.finalWeight != null ? formatNum(r.finalWeight) : "",
          formatNum(r.netChange),
          r.transactionsCount ?? 0,
        ]),
      ];

      // add a simple date row after title (row index 4)
      rows[4] = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Từ ngày",
        startDate,
        "",
        "Đến ngày",
        endDate,
      ];

      const csvBody = rows
        .map((r) => r.map((c) => `"${String(c ?? "")}"`).join(","))
        .join("\r\n");
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
        <h4 style={{ margin: 0 }}>Báo cáo sử dụng giấy</h4>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <label className="small text-muted" style={{ marginBottom: 0 }}>
            Từ ngày
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-control"
          />
          <label className="small text-muted" style={{ marginBottom: 0 }}>
            Đến ngày
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-control"
          />
          {/* <button
            className="btn btn-outline-primary"
            onClick={() => {
            }}
          >
            Refresh
          </button> */}
          <button
            className="btn btn-primary"
            style={{ maxWidth: 250, minWidth: 130 }}
            onClick={handleExport}
            disabled={usageByRoll.length === 0}
          >
            Xuất Excel
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
            Hiển thị các cuộn được sử dụng từ <strong>{startDate}</strong> đến{" "}
            <strong>{endDate}</strong> — {usageByRoll.length} cuộn được sử dụng.
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table table-striped table-sm">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã cuộn</th>
                  <th>Màu</th>
                  <th>Nhà cung cấp</th>
                  <th style={{ textAlign: "right" }}>Rộng</th>
                  <th style={{ textAlign: "right" }}>Khổ</th>
                  <th style={{ textAlign: "right" }}>Tồn đầu (kg)</th>
                  <th style={{ textAlign: "right" }}>Tồn cuối (kg)</th>
                  <th style={{ textAlign: "right" }}>
                    Trọng lượng sử dụng (kg)
                  </th>
                  <th style={{ textAlign: "right" }}>Số lần thao tác</th>
                </tr>
              </thead>
              <tbody>
                {usageByRoll.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-muted">
                      Chưa có cuộn nào được sử dụng trong thời gian này
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
                        {r.initialWeight != null
                          ? formatNum(r.initialWeight)
                          : "-"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {r.finalWeight != null ? formatNum(r.finalWeight) : "-"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {Math.abs(parseFloat(formatNum(r.netChange)))}
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
