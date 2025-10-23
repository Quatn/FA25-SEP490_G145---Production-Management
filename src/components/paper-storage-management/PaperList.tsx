// src/components/paper-storage-management/PaperList.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { mockPaperRollsQuery } from "../../service/mock-data/functions/paper-an-renamelater/mock-paper-rolls-crud";
import { mockPaperTypesQuery } from "../../service/mock-data/functions/paper-an-renamelater/mock-paper-types-crud";
import { mockPaperSuppliersQuery } from "../../service/mock-data/functions/paper-an-renamelater/mock-paper-suppliers-crud";
import { mockPaperRollTransactionsQuery } from "../../service/mock-data/functions/paper-an-renamelater/mock-paper-roll-transactions-crud";
import type { PaperRoll, PaperType, PaperSupplier, PaperRollTransaction } from "../../types/PaperTypes";

export const PaperList = () => {
  const [paperRolls, setPaperRolls] = useState<PaperRoll[]>([]);
  const [paperTypes, setPaperTypes] = useState<PaperType[]>([]);
  const [suppliers, setSuppliers] = useState<PaperSupplier[]>([]);
  const [transactions, setTransactions] = useState<PaperRollTransaction[]>([]);
  const [exportsList, setExportsList] = useState<any[]>([]);
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const pr = await mockPaperRollsQuery({});
      setPaperRolls(pr.data.paperRolls || []);

      const pt = await mockPaperTypesQuery({});
      setPaperTypes(pt.data.paperTypes || []);

      const sp = await mockPaperSuppliersQuery({});
      setSuppliers(sp.data.paperSuppliers || []);

      const tx = await mockPaperRollTransactionsQuery({});
      setTransactions(tx.data.paperRollTransactions || []);
    };
    load();
  }, []);

  function isNumeric(s: string) {
    return s !== "" && !Number.isNaN(Number(s));
  }

  const filtered = useMemo(() => {
    const q = (query || "").trim();
    if (!q) return paperRolls;
    if (isNumeric(q)) {
      const n = Number(q);
      return paperRolls.filter((r) => Number(r.weight) > n);
    }
    const low = q.toLowerCase();
    return paperRolls.filter(
      (r) =>
        (r.paperRollId || "").toLowerCase().includes(low) ||
        (r.name || "").toLowerCase().includes(low)
    );
  }, [paperRolls, query]);

  const findPaperType = (id?: string) => paperTypes.find((p) => p.paperTypeId === id);
  const findSupplier = (id?: string) => suppliers.find((s) => s.id === id);

  const handleExport = (paperRollId: string) => {
    const roll = paperRolls.find((r) => r.paperRollId === paperRollId);
    if (!roll) return;
    const w = Number(roll.weight || 0);
    if (!w || w <= 0) {
      alert("Trọng lượng rỗng, không thể xuất");
      return;
    }

    const code = `${roll.name} -${w}`;
    const exportRow = {
      id: code,
      code,
      date: new Date().toISOString().slice(0, 10),
      qtyOut: w,
      qtyReturn: 0,
      used: w,
      sourceId: roll.paperRollId,
    };
    setExportsList((prev) => [exportRow, ...prev]);

    setPaperRolls((prev) =>
      prev.map((p) => (p.paperRollId === roll.paperRollId ? { ...p, weight: 0 } : p))
    );

    const tx: PaperRollTransaction = {
      id: `TX${Date.now()}`,
      paperRollId: roll.paperRollId,
      timeStamp: new Date().toISOString(),
      transactionType: "XUAT",
      initialWeight: w,
      finalWeight: 0,
      inCharge: "Operator A",
    };
    setTransactions((prev) => [tx, ...prev]);
    alert(`Đã xuất ${w} kg từ ${roll.paperRollId}`);
  };

  const handleReImport = (paperRollId: string) => {
    const value = prompt("Nhập lại trọng lượng (kg):");
    if (value == null) return;
    const v = Number(value);
    if (Number.isNaN(v) || v < 0) return alert("Giá trị không hợp lệ");

    setPaperRolls((prev) => prev.map((p) => (p.paperRollId === paperRollId ? { ...p, weight: v } : p)));

    setExportsList((prev) =>
      prev.map((ex) => {
        if (ex.sourceId === paperRollId) {
          const qtyReturn = v;
          const used = (ex.qtyOut || 0) - qtyReturn;
          return { ...ex, qtyReturn, used };
        }
        return ex;
      })
    );

    const tx: PaperRollTransaction = {
      id: `TX${Date.now()}`,
      paperRollId,
      timeStamp: new Date().toISOString(),
      transactionType: "NHAPLAI",
      initialWeight: 0,
      finalWeight: v,
      inCharge: "Operator B",
    };
    setTransactions((prev) => [tx, ...prev]);

    alert(`Đã nhập lại ${v} kg cho ${paperRollId}`);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <strong>List cuộn giấy</strong>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="form-control" placeholder="Search mã / tên or number for weight > X" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Mã cuộn</th>
              <th>Tên</th>
              <th>Loại giấy</th>
              <th style={{ textAlign: "right" }}>Trọng lượng</th>
              <th>Ngày nhận</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const pt = findPaperType(r.paperTypeId);
              const supplier = pt && findSupplier(pt.supplierId);
              const typeName = pt?.name || supplier?.code || r.paperTypeId;
              return (
                <tr key={r.paperRollId}>
                  <td>{r.paperRollId}</td>
                  <td>{r.name}</td>
                  <td>{typeName}</td>
                  <td style={{ textAlign: "right" }}>{r.weight}</td>
                  <td>{r.receivingDate}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-danger" onClick={() => handleExport(r.paperRollId)}>Xuất</button>
                      <button className="btn btn-secondary" onClick={() => handleReImport(r.paperRollId)}>Nhập lại</button>
                      <button className="btn btn-outline-primary" onClick={() => { navigator.clipboard?.writeText(r.paperRollId); alert("Copied"); }}>Copy ID</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 18 }}>
        <h5>Exports (generated)</h5>
        <table className="table table-sm table-striped">
          <thead>
            <tr>
              <th>Mã</th>
              <th>T.Lượng xuất</th>
              <th>T.Lượng nhập lại</th>
              <th>Đã dùng</th>
            </tr>
          </thead>
          <tbody>
            {exportsList.map((e) => (
              <tr key={e.id}>
                <td>{e.code}</td>
                <td>{e.qtyOut}</td>
                <td>{e.qtyReturn}</td>
                <td>{e.used}</td>
              </tr>
            ))}
            {exportsList.length === 0 && (
              <tr>
                <td colSpan={4} className="small text-muted">
                  No export rows yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaperList;