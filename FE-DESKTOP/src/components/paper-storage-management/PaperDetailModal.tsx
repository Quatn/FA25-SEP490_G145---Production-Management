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
  paperRollId?: string;
};

function getIdFromDoc(doc: any) {
  if (!doc) return undefined;
  if (typeof doc === "string") return doc;
  if (doc._id?.$oid) return String(doc._id.$oid);
  if (doc._id) return String(doc._id);
  if (doc.id) return String(doc.id);
  return undefined;
}

const computePaperRollIdForPaper = (paper: any) => {
  if (!paper) return "-";
  const pt = paper.paperType ?? paper.paperTypeId ?? null;

  // color code: prefer populated color.code, then color.title
  const colorCode =
    pt?.paperColor?.code ??
    pt?.paperColor?.title ??
    paper.paperType?.paperColor?.title ??
    undefined;

  const supplierCode = paper.paperSupplier?.code ?? paper.paperSupplier?.name;

  const width = pt?.width ?? paper.width;
  const grammage = pt?.grammage ?? paper.grammage;
  const seq = paper.sequenceNumber ?? paper.sequence;
  const receiving = paper.receivingDate ?? paper.createdAt;
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
  // fallback
  return paper.paperRollId ?? getIdFromDoc(paper) ?? "-";
};

export const PaperDetailModal: React.FC<Props> = ({
  show,
  onHide,
  paper,
  transactions = [],
  colorName,
  supplierName,
  paperRollId,
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

  const computedId = computePaperRollIdForPaper(paper);

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
                    <td>{paperRollId}</td>
                  </tr>
                  <tr>
                    <th>Số thứ tự</th>
                    <td>{paper.sequenceNumber}</td>
                  </tr>
                  <tr>
                    <th>Loại giấy</th>
                    <td>
                      {paper.paperType
                        ? `${paper.paperType.width} mm • ${paper.paperType.grammage} g/m2`
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
                    <th>Khổ (mm)</th>
                    <td>{paper.paperType?.width ?? "-"}</td>
                  </tr>
                  <tr>
                    <th>Định lượng (gram/m2)</th>
                    <td>{paper.paperType?.grammage ?? "-"}</td>
                  </tr>
                  <tr>
                    <th>Trọng lượng hiện tại</th>
                    <td>{paper.weight}</td>
                  </tr>
                  <tr>
                    <th>Ngày nhận</th>
                    <td>
                      {paper.receivingDate
                        ? new Date(paper.receivingDate)
                            .toISOString()
                            .slice(0, 10)
                        : "-"}
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
