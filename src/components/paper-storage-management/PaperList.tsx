// src/components/paper-storage-management/PaperList.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

import PaperDetailModal from "./PaperDetailModal";
import BulkActionModal from "./BulkActionModal";

import { mockPaperRollsQuery } from "../../service/mock-data/functions/paper-an-renamelater/mock-paper-rolls-crud";
import { mockPaperTypesQuery } from "../../service/mock-data/functions/paper-an-renamelater/mock-paper-types-crud";
import { mockPaperSuppliersQuery } from "../../service/mock-data/functions/paper-an-renamelater/mock-paper-suppliers-crud";
import { mockPaperRollTransactionsQuery } from "../../service/mock-data/functions/paper-an-renamelater/mock-paper-roll-transactions-crud";
import { mockPaperColorsQuery } from "../../service/mock-data/functions/paper-an-renamelater/mock-paper-colors-crud";

/**
 * PaperList - React.FC implementation with client-side QR generation using `qrcode`.
 * Keeps `any` usage as before for quick integration with your mock-data.
 */
export const PaperList: React.FC = () => {
  const [paperRolls, setPaperRolls] = useState<any[]>([]);
  const [paperTypes, setPaperTypes] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [exportsList, setExportsList] = useState<any[]>([]);
  const [query, setQuery] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [detailOpen, setDetailOpen] = useState<{ open: boolean; roll?: any }>({
    open: false,
  });
  const [bulkModal, setBulkModal] = useState<{
    open: boolean;
    mode?: "XUAT" | "NHAPLAI";
  }>({ open: false });

  // QR state (client-side)
  const [qrModal, setQrModal] = useState<{ open: boolean; text?: string }>({
    open: false,
  });
  const [qrDataUrl, setQrDataUrl] = useState<string | undefined>(undefined);
  const [qrLoading, setQrLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      const pr = await mockPaperRollsQuery({});
      setPaperRolls((pr && pr.data && pr.data.paperRolls) || []);

      const pt = await mockPaperTypesQuery({});
      setPaperTypes((pt && pt.data && pt.data.paperTypes) || []);

      const sp = await mockPaperSuppliersQuery({});
      setSuppliers((sp && sp.data && sp.data.paperSuppliers) || []);

      const tx = await mockPaperRollTransactionsQuery({});
      setTransactions((tx && tx.data && tx.data.paperRollTransactions) || []);

      const cl = await mockPaperColorsQuery({});
      setColors((cl && cl.data && cl.data.paperColors) || []);

      setExportsList([]);
    };
    load();
  }, []);

  function isNumeric(s: string) {
    return s !== "" && !Number.isNaN(Number(s));
  }

  // base filtered set (ignores selected persistence)
  const baseFiltered = useMemo(() => {
    const q = (query || "").trim();
    if (!q) return paperRolls;
    if (isNumeric(q)) {
      const n = Number(q);
      return paperRolls.filter((r: any) => Number(r.weight) > n);
    }
    const low = q.toLowerCase();
    return paperRolls.filter(
      (r: any) =>
        (r.name || "").toLowerCase().includes(low) ||
        (r.paperRollId || "").toLowerCase().includes(low)
    );
  }, [paperRolls, query]);

  // selected items (persisted regardless of search)
  const selectedRolls = useMemo(() => {
    return paperRolls.filter((r: any) => selectedIds[r.paperRollId]);
  }, [paperRolls, selectedIds]);

  // visible rows: selectedRolls first, then baseFiltered excluding ones already shown (dedupe)
  const visibleRows = useMemo(() => {
    const selectedIdsSet = new Set(
      selectedRolls.map((r: any) => r.paperRollId)
    );
    const remaining = baseFiltered.filter(
      (r: any) => !selectedIdsSet.has(r.paperRollId)
    );
    return [...selectedRolls, ...remaining];
  }, [selectedRolls, baseFiltered]);

  const findPaperType = (id?: string) =>
    paperTypes.find((p: any) => p.paperTypeId === id);
  const findSupplierByCode = (code?: string) =>
    suppliers.find((s: any) => s.code === code);
  const findColorByCode = (code?: string) =>
    colors.find((c: any) => c.code === code);

  function parseMaCuon(code?: string) {
    if (!code) return null;
    const parts = code.split("/");
    const color = parts[0] ?? "";
    const supplierCode = parts[1] ?? "";
    const width = parts[2] ?? "";
    const grammage = parts[3] ?? "";
    const tail = parts.slice(4).join("/") || "";
    const fullType = [color, supplierCode, width, grammage]
      .filter(Boolean)
      .join("/");
    return { fullType, color, supplierCode, width, grammage, tail };
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAllVisible = (checked: boolean) => {
    const newSel: Record<string, boolean> = { ...selectedIds };
    visibleRows.forEach((r: any) => {
      newSel[r.paperRollId] = checked;
    });
    setSelectedIds(newSel);
  };

  const getSelectedRolls = (): any[] =>
    paperRolls.filter((r: any) => selectedIds[r.paperRollId]);

  // ... (export/import methods unchanged) ...
  const doSingleExport = (roll: any) => {
    if (!roll) return;
    const w = Number(roll.weight || 0);
    if (!w || w <= 0) return alert("Trọng lượng rỗng, không thể xuất");

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
      prev.map((p: any) =>
        p.paperRollId === roll.paperRollId ? { ...p, weight: 0 } : p
      )
    );
    const tx = {
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

  const doBulkExport = (selected: any[]) => {
    if (!selected || selected.length === 0) return;
    const now = new Date().toISOString();
    const exportRows = selected.map((roll: any) => {
      const w = Number(roll.weight || 0);
      const code = `${roll.name} -${w}`;
      return {
        id: code,
        code,
        date: now.slice(0, 10),
        qtyOut: w,
        qtyReturn: 0,
        used: w,
        sourceId: roll.paperRollId,
      };
    });
    setExportsList((prev) => [...exportRows, ...prev]);
    setPaperRolls((prev) =>
      prev.map((p: any) =>
        selected.find((s: any) => s.paperRollId === p.paperRollId)
          ? { ...p, weight: 0 }
          : p
      )
    );
    const txs = selected.map((roll: any) => ({
      id: `TX${Date.now()}${Math.floor(Math.random() * 1000)}`,
      paperRollId: roll.paperRollId,
      timeStamp: new Date().toISOString(),
      transactionType: "XUAT",
      initialWeight: roll.weight,
      finalWeight: 0,
      inCharge: "Operator Bulk",
    }));
    setTransactions((prev) => [...txs, ...prev]);
    setSelectedIds({});
  };

  const doBulkReImport = (updates: any[]) => {
    if (!updates || updates.length === 0) return;
    setPaperRolls((prev) =>
      prev.map((p: any) => {
        const u = updates.find((x: any) => x.paperRollId === p.paperRollId);
        return u ? { ...p, weight: u.newWeight } : p;
      })
    );
    setExportsList((prev) =>
      prev.map((ex: any) => {
        const u = updates.find((x: any) => x.paperRollId === ex.sourceId);
        if (u) {
          const qtyReturn = u.newWeight;
          const used = (ex.qtyOut || 0) - qtyReturn;
          return { ...ex, qtyReturn, used };
        }
        return ex;
      })
    );
    const txs = updates.map((u: any) => ({
      id: `TX${Date.now()}${Math.floor(Math.random() * 1000)}`,
      paperRollId: u.paperRollId,
      timeStamp: new Date().toISOString(),
      transactionType: "NHAPLAI",
      initialWeight: 0,
      finalWeight: u.newWeight,
      inCharge: "Operator Bulk",
    }));
    setTransactions((prev) => [...txs, ...prev]);
    setSelectedIds({});
  };

  const openDetail = (roll: any) => setDetailOpen({ open: true, roll });
  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQuery(e.target.value);

  // ---- QR handlers using `qrcode` lib ----
  const handleCreateQR = async (text: string) => {
    setQrModal({ open: true, text });
    setQrLoading(true);
    try {
      // generate data URL PNG (client-side)
      const dataUrl = await QRCode.toDataURL(text, { width: 400 });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error("QR generation failed", err);
      setQrDataUrl(undefined);
      alert("Failed to generate QR");
    } finally {
      setQrLoading(false);
    }
  };

  const handleCloseQr = () => {
    setQrModal({ open: false, text: undefined });
    setQrDataUrl(undefined);
    setQrLoading(false);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl || !qrModal.text) return alert("QR not ready");
    // qrDataUrl is data:image/png;base64,...
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${qrModal.text}-qr.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleOpenQrInNewTab = () => {
    if (!qrDataUrl) return;
    // open data URL in new tab
    const w = window.open();
    if (!w) return alert("Popup blocked");
    w.document.write(`<img src="${qrDataUrl}" alt="QR" />`);
  };

  const handleCopyCode = async () => {
    if (!qrModal.text) return;
    try {
      await navigator.clipboard.writeText(qrModal.text);
      alert("Mã cuộn đã được copy");
    } catch {
      alert("Copy failed — please copy manually: " + qrModal.text);
    }
  };

  const handlePrintQr = () => {
    if (!qrDataUrl) return alert("QR not ready");
    const w = window.open("", "_blank", "width=600,height=600");
    if (!w) return alert("Popup blocked");
    w.document.write(`
    <html>
      <head>
        <title>QR Print</title>
        <style>
          body { 
            text-align: center; 
            font-family: sans-serif; 
            margin-top: 40px;
          }
          img { 
            width: 300px; 
            height: 300px; 
          }
          .code {
            margin-top: 12px;
            font-size: 16px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <img src="${qrDataUrl}" alt="QR" />
        <div class="code">${qrModal.text ?? ""}</div>
        <script>
          window.onload = () => window.print();
        </script>
      </body>
    </html>
  `);
    w.document.close();
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
          <strong>List cuộn giấy</strong>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="form-control"
            placeholder="Search mã cuộn / tên or number for weight > X"
            value={query}
            onChange={onQueryChange}
            style={{ minWidth: 320 }}
          />
        </div>
      </div>

      {/* Bulk actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button
          className="btn btn-danger"
          onClick={() => {
            const sel = getSelectedRolls();
            if (sel.length === 0) return alert("Chọn ít nhất một cuộn để xuất");
            if (!confirm(`Xuất toàn bộ ${sel.length} cuộn đã chọn?`)) return;
            doBulkExport(sel);
            alert("Đã xuất các cuộn đã chọn");
          }}
        >
          Xuất (chọn)
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => {
            const sel = getSelectedRolls();
            if (sel.length === 0)
              return alert("Chọn ít nhất một cuộn để nhập lại");
            setBulkModal({ open: true, mode: "NHAPLAI" });
          }}
        >
          Nhập lại (chọn)
        </button>

        <button
          className="btn btn-outline-primary"
          onClick={() => {
            const anySelected = visibleRows.some(
              (r: any) => selectedIds[r.paperRollId]
            );
            selectAllVisible(!anySelected);
          }}
        >
          Toggle chọn tất cả trang này
        </button>

        <div style={{ flex: 1 }} />
        <div className="small text-muted">{paperRolls.length} rows total</div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input
                  type="checkbox"
                  onChange={(e) => selectAllVisible(e.target.checked)}
                  checked={
                    visibleRows.length > 0 &&
                    visibleRows.every((r: any) => selectedIds[r.paperRollId])
                  }
                />
              </th>
              <th>Mã cuộn</th>
              <th>Tên</th>
              <th>Loại giấy</th>
              <th style={{ textAlign: "right" }}>Trọng lượng</th>
              <th>Ngày nhận</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((r: any) => {
              const parsed = parseMaCuon(r.name);
              const typeLabel = parsed?.fullType ?? r.name;
              const supplierObj = findSupplierByCode(parsed?.supplierCode);
              const supplierName = supplierObj
                ? supplierObj.name
                : parsed?.supplierCode || "-";
              const colorObj = findColorByCode(parsed?.color);
              const colorName = colorObj
                ? colorObj.colorName
                : parsed?.color || "-";

              return (
                <tr
                  key={r.paperRollId}
                  style={
                    selectedIds[r.paperRollId]
                      ? { background: "rgba(0,123,255,0.04)" }
                      : undefined
                  }
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selectedIds[r.paperRollId]}
                      onChange={() => toggleSelect(r.paperRollId)}
                    />
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{r.name}</td>
                  <td>{r.paperRollId}</td>
                  <td>
                    <div>{typeLabel}</div>
                    <div className="small text-muted">
                      {colorName} • {supplierName}
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>{r.weight}</td>
                  <td>{r.receivingDate}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => openDetail(r)}
                      >
                        Xem chi tiết
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (!confirm(`Xuất toàn bộ ${r.paperRollId}?`))
                            return;
                          doSingleExport(r);
                        }}
                      >
                        Xuất
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setBulkModal({ open: true, mode: "NHAPLAI" });
                          setSelectedIds({ [r.paperRollId]: true });
                        }}
                      >
                        Nhập lại
                      </button>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleCreateQR(r.name)}
                      >
                        Tạo QR
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-muted p-4">
                  No rows found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 18 }}>
        <h6>Exports (generated)</h6>
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
            {exportsList.map((e: any) => (
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

      <PaperDetailModal
        show={detailOpen.open}
        onHide={() => setDetailOpen({ open: false })}
        paper={detailOpen.roll}
        transactions={transactions.filter(
          (t: any) =>
            detailOpen.roll && t.paperRollId === detailOpen.roll.paperRollId
        )}
        colorName={
          detailOpen.roll
            ? (
                findColorByCode(
                  (parseMaCuon(detailOpen.roll.name) || {}).color
                ) || {}
              ).colorName
            : undefined
        }
        supplierName={
          detailOpen.roll
            ? (
                findSupplierByCode(
                  (parseMaCuon(detailOpen.roll.name) || {}).supplierCode
                ) || {}
              ).name
            : undefined
        }
      />

      <BulkActionModal
        show={bulkModal.open}
        mode={bulkModal.mode ?? "NHAPLAI"}
        selectedRolls={getSelectedRolls()}
        onClose={() => setBulkModal({ open: false })}
        onConfirmBulkReImport={(updates: any[]) => {
          doBulkReImport(updates);
          setBulkModal({ open: false });
        }}
      />

      {/* QR Modal (client-side generated data URL) */}
      {qrModal.open && (
        <div className="modal-backdrop" style={{ display: "block" }}>
          <div className="modal" role="dialog" style={{ display: "block" }}>
            <div className="modal-dialog modal-sm">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">QR: {qrModal.text}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleCloseQr}
                  ></button>
                </div>

                <div className="modal-body" style={{ textAlign: "center" }}>
                  {qrLoading ? (
                    <div>Đang tạo QR...</div>
                  ) : qrDataUrl ? (
                    <>
                      <img
                        src={qrDataUrl}
                        alt="QR"
                        style={{ maxWidth: "100%", height: "auto" }}
                      />
                      <div
                        style={{
                          marginTop: 12,
                          display: "flex",
                          gap: 8,
                          justifyContent: "center",
                        }}
                      >
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={handleOpenQrInNewTab}
                        >
                          Mở tab mới
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={handleDownloadQr}
                        >
                          Download
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={handleCopyCode}
                        >
                          Copy mã cuộn
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={handlePrintQr}
                        >
                          In
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-danger">Tạo QR thất bại</div>
                  )}
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={handleCloseQr}>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperList;
