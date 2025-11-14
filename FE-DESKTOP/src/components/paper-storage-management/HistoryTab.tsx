// src/components/paper-storage-management/HistoryTab.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useGetTransactionsQuery } from "@/service/api/paperRollTransactionApiSlice";
import { useGetPaperRollsQuery } from "@/service/api/paperRollApiSlice";

function docIdAsString(doc: any) {
  if (!doc) return undefined;
  return (
    doc._id?.$oid ??
    (typeof doc._id === "string" ? doc._id : doc._id?.toString?.()) ??
    doc.paperRollId
  );
}

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
  const rolls = rollsRaw.map((r: any) => {
    const id = docIdAsString(r);
    return {
      paperRollId: id,
      paperRollDbId: id,
      sequenceNumber: r.sequenceNumber,
      paperSupplier: r.paperSupplier,
      paperType: r.paperType,
      weight: r.weight,
    };
  });

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

  const findRollName = (id: string) =>
    rolls.find((r) => r.paperRollId === id)?.paperRollId ?? id;

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
                    {findRollName(tx.paperRollId)} ({tx.paperRollId})
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
