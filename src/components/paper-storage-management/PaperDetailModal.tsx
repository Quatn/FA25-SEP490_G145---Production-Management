// src/components/paper-storage-management/PaperDetailModal.tsx
"use client";

import React from "react";

type Props = {
  show: boolean;
  onHide: () => void;
  paper?: any;
  transactions?: any[];
  colorName?: string;
  supplierName?: string;
};

function parseMaCuon(code?: string) {
  if (!code) return null;
  const parts = code.split("/");
  return {
    fullType: [parts[0], parts[1], parts[2], parts[3]]
      .filter(Boolean)
      .join("/"),
    color: parts[0] ?? "",
    supplierCode: parts[1] ?? "",
    width: parts[2] ?? "",
    grammage: parts[3] ?? "",
    tail: parts.slice(4).join("/") ?? "",
  };
}

export const PaperDetailModal: React.FC<Props> = ({
  show,
  onHide,
  paper,
  transactions = [],
  colorName,
  supplierName,
}) => {
  const parsed = parseMaCuon(paper?.name);

  if (!show) return null;

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
              ></button>
            </div>
            <div className="modal-body">
              {!paper ? (
                <div>Không có dữ liệu</div>
              ) : (
                <>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th style={{ width: 200 }}>Mã cuộn</th>
                        <td>{paper.name}</td>
                      </tr>
                      <tr>
                        <th>Tên (ID)</th>
                        <td>{paper.paperRollId}</td>
                      </tr>
                      <tr>
                        <th>Loại giấy</th>
                        <td>{parsed?.fullType}</td>
                      </tr>
                      <tr>
                        <th>Màu</th>
                        <td>{colorName ?? parsed?.color}</td>
                      </tr>
                      <tr>
                        <th>Nhà cung cấp</th>
                        <td>{supplierName ?? parsed?.supplierCode}</td>
                      </tr>
                      <tr>
                        <th>Rộng (mm)</th>
                        <td>{parsed?.width}</td>
                      </tr>
                      <tr>
                        <th>Khổ giấy (grammage)</th>
                        <td>{parsed?.grammage}</td>
                      </tr>
                      <tr>
                        <th>Trọng lượng hiện tại</th>
                        <td>{paper.weight}</td>
                      </tr>
                      <tr>
                        <th>Ngày nhận</th>
                        <td>{paper.receivingDate}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h6>Lịch sử lệnh cho cuộn này</h6>
                  <table className="table table-striped table-sm">
                    <thead>
                      <tr>
                        <th>Thời gian</th>
                        <th>Hành động</th>
                        <th>Trước</th>
                        <th>Sau</th>
                        <th>Người</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-muted">
                            Không có lịch sử
                          </td>
                        </tr>
                      )}
                      {transactions.map((t, i) => (
                        <tr key={t.id ?? i}>
                          <td>{t.timeStamp}</td>
                          <td>{t.transactionType}</td>
                          <td style={{ textAlign: "right" }}>
                            {t.initialWeight}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {t.finalWeight}
                          </td>
                          <td>{t.inCharge}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
