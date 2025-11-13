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

export const PaperDetailModal: React.FC<Props> = ({
  show,
  onHide,
  paper,
  transactions = [],
  colorName,
  supplierName,
}) => {
  if (!show) return null;

  if (!paper) {
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
              <div className="modal-body">Không có dữ liệu</div>
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
  }

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
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <th style={{ width: 200 }}>Mã cuộn</th>
                    <td>{paper.paperRollId}</td>
                  </tr>
                  <tr>
                    <th>Sequence #</th>
                    <td>{paper.sequenceNumber}</td>
                  </tr>
                  <tr>
                    <th>Loại giấy</th>
                    <td>
                      {paper.paperType
                        ? `${paper.paperType.width} mm • ${paper.paperType.grammage} g`
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <th>Màu</th>
                    <td>
                      {colorName ?? paper.paperType?.paperColor?.title ?? "-"}
                    </td>
                  </tr>
                  <tr>
                    <th>Nhà cung cấp</th>
                    <td>{supplierName ?? paper.paperSupplier?.name ?? "-"}</td>
                  </tr>
                  <tr>
                    <th>Rộng (mm)</th>
                    <td>{paper.paperType?.width ?? "-"}</td>
                  </tr>
                  <tr>
                    <th>Khổ giấy (grammage)</th>
                    <td>{paper.paperType?.grammage ?? "-"}</td>
                  </tr>
                  <tr>
                    <th>Trọng lượng hiện tại</th>
                    <td>{paper.weight}</td>
                  </tr>
                  <tr>
                    <th>Ngày nhận</th>
                    <td>
                      {new Date(paper.receivingDate).toISOString().slice(0, 10)}
                    </td>
                  </tr>
                  <tr>
                    <th>Ghi chú</th>
                    <td>{paper.note ?? "-"}</td>
                  </tr>
                </tbody>
              </table>

              <h6>Lịch sử lệnh cho cuộn này</h6>
              <table className="table table-striped table-sm">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Thao tác</th>
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
                  {transactions.map((t: any, i: any) => (
                    <tr key={t.id ?? i}>
                      <td>{t.timeStamp}</td>
                      <td>{t.transactionType}</td>
                      <td style={{ textAlign: "right" }}>{t.initialWeight}</td>
                      <td style={{ textAlign: "right" }}>{t.finalWeight}</td>
                      <td>{t.inCharge}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
