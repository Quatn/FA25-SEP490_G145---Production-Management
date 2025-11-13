// src/components/paper-storage-management/BulkActionModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import type { PaperRoll } from "../../types/PaperRoll";

export type BulkActionMode = "XUAT" | "NHAPLAI";

export type BulkActionModalProps = {
  show: boolean;
  mode: BulkActionMode;
  selectedRolls: PaperRoll[];
  onClose: () => void;
  onConfirmBulkReImport: (
    updates: { paperRollId: string; newWeight: number }[]
  ) => void;
};

export const BulkActionModal: React.FC<BulkActionModalProps> = ({
  show,
  mode,
  selectedRolls,
  onClose,
  onConfirmBulkReImport,
}) => {
  const [weights, setWeights] = useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, string> = {};
    selectedRolls.forEach((r: any) => {
      map[r.paperRollId] = String(r.weight ?? 0);
    });
    setWeights(map);
  }, [selectedRolls, show]);

  if (!show) return null;

  const handleConfirm = (): void => {
    if (mode === "XUAT") {
      onClose();
      return;
    }
    const updates = selectedRolls.map((r) => {
      const value = weights[r.paperRollId];
      const v = Number(value);
      return { paperRollId: r.paperRollId, newWeight: Number.isNaN(v) ? 0 : v };
    });
    onConfirmBulkReImport(updates);
  };

  const onWeightChange = (paperRollId: string, value: string) =>
    setWeights((prev) => ({ ...prev, [paperRollId]: value }));

  return (
    <div className="modal-backdrop" style={{ display: "block" }}>
      <div className="modal" role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {mode === "XUAT" ? "Xuất (bulk)" : "Nhập lại (bulk)"}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              {selectedRolls.length === 0 ? (
                <div>Không có cuộn nào được chọn</div>
              ) : (
                <>
                  {mode === "NHAPLAI" ? (
                    <>
                      <p>Nhập lại trọng lượng cho các cuộn đã chọn:</p>
                      <table className="table table-bordered table-sm">
                        <thead>
                          <tr>
                            <th>Mã cuộn</th>
                            <th>Nhà cung cấp</th>
                            <th style={{ width: 180 }}>
                              Trọng lượng nhập lại (kg)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRolls.map((r: any) => (
                            <tr key={r.paperRollId}>
                              <td style={{ whiteSpace: "nowrap" }}>
                                {r.paperRollId}
                              </td>
                              <td>{r.paperSupplier?.name ?? "-"}</td>
                              <td>
                                <input
                                  className="form-control"
                                  value={weights[r.paperRollId] ?? ""}
                                  onChange={(e) =>
                                    onWeightChange(
                                      r.paperRollId,
                                      e.target.value
                                    )
                                  }
                                  type="number"
                                  min={0}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <p>Confirm export for {selectedRolls.length} rolls.</p>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleConfirm}>
                {mode === "NHAPLAI" ? "Xác nhận Nhập lại" : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionModal;
