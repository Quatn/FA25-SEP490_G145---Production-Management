// src/components/paper-storage-management/HistoryTab.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { mockPaperRollTransactionsQuery } from "../../service/mock-data/functions/paper-an-renamelater/mock-paper-roll-transactions-crud";
import { mockPaperRollsQuery } from "../../service/mock-data/functions/paper-an-renamelater/mock-paper-rolls-crud";
import type { PaperRollTransaction, PaperRoll } from "../../types/PaperTypes";

export const HistoryTab: React.FC = () => {
  const [transactions, setTransactions] = useState<PaperRollTransaction[]>([]);
  const [paperRolls, setPaperRolls] = useState<PaperRoll[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const tx = await mockPaperRollTransactionsQuery({});
      setTransactions(tx.data.paperRollTransactions || []);
      const pr = await mockPaperRollsQuery({});
      setPaperRolls(pr.data.paperRolls || []);
      // default newest date if any
      const dates = Array.from(new Set((tx.data.paperRollTransactions || []).map((t: any) => t.timeStamp.slice(0, 10))));
      dates.sort((a, b) => (a < b ? 1 : -1));
      setSelectedDate(dates[0] || "");
    };
    load();
  }, []);

  const dates = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.timeStamp.slice(0, 10)))).sort((a, b) => (a < b ? 1 : -1));
  }, [transactions]);

  const entriesForDate = useMemo(() => {
    if (!selectedDate) return [];
    return transactions.filter((t) => t.timeStamp.slice(0, 10) === selectedDate);
  }, [transactions, selectedDate]);

  const findRollName = (id: string) => {
    const r = paperRolls.find((p) => p.paperRollId === id);
    return r?.name || id;
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <h5>Lịch sử giao dịch</h5>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label className="small text-muted">Chọn ngày</label>
          <select className="form-select" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
            {dates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input type="date" className="form-control" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>
      </div>

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
          {entriesForDate.length === 0 && (
            <tr>
              <td colSpan={6} className="text-muted">
                Không có lịch sử
              </td>
            </tr>
          )}
          {entriesForDate.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.timeStamp.slice(11, 19)}</td>
              <td>
                {findRollName(tx.paperRollId)} ({tx.paperRollId})
              </td>
              <td>{tx.transactionType}</td>
              <td style={{ textAlign: "right" }}>{tx.initialWeight}</td>
              <td style={{ textAlign: "right" }}>{tx.finalWeight}</td>
              <td>{tx.inCharge}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HistoryTab;