// src/components/paper-storage-management/PaperListModal.tsx

"use client";

import React, { useEffect, useState } from "react";

/* Create single roll modal */
export const CreateModal: React.FC<any> = ({
  show,
  onClose,
  createForm,
  setCreateForm,
  fieldStyle,
  allTypes,
  allColors,
  allSuppliers,
  colorMap,
  getIdFromDoc,
  findType,
  handleCreateSubmit,
  creating,
}) => {
  if (!show) return null;
  return (
    <div className="modal-backdrop" style={{ display: "block" }}>
      <div className="modal" role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Tạo cuộn</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">
              <label style={fieldStyle}>
                <input
                  type="checkbox"
                  checked={createForm.useNewType}
                  onChange={(e) =>
                    setCreateForm((f: any) => ({
                      ...f,
                      useNewType: e.target.checked,
                    }))
                  }
                />{" "}
                Tạo loại giấy mới
              </label>

              {!createForm.useNewType ? (
                <label style={fieldStyle}>
                  Loại giấy
                  <select
                    className="form-control"
                    value={createForm.paperTypeId}
                    onChange={(e) =>
                      setCreateForm((f: any) => ({
                        ...f,
                        paperTypeId: e.target.value,
                      }))
                    }
                  >
                    <option value="">-- chọn loại giấy --</option>
                    {(allTypes || []).map((t: any) => (
                      <option
                        key={getIdFromDoc(t) ?? `${t.width}_${t.grammage}`}
                        value={getIdFromDoc(t)}
                      >
                        {`${
                          t.paperColor?.title ??
                          colorMap.get(String(getIdFromDoc(t.paperColor)))
                            ?.title ??
                          ""
                        } — ${t.width} x ${t.grammage}`}
                      </option>
                    ))}
                  </select>
                  {createForm.paperTypeId && (
                    <div style={{ marginTop: 8 }}>
                      <small className="text-muted">
                        Width: {findType(createForm.paperTypeId)?.width ?? "-"}{" "}
                        | Grammage:{" "}
                        {findType(createForm.paperTypeId)?.grammage ?? "-"} |
                        Color:{" "}
                        {findType(createForm.paperTypeId)?.paperColor?.title ??
                          colorMap.get(
                            String(
                              getIdFromDoc(
                                findType(createForm.paperTypeId)?.paperColor
                              )
                            )
                          )?.title ??
                          "-"}
                      </small>
                    </div>
                  )}
                </label>
              ) : (
                <>
                  <label style={fieldStyle}>
                    Màu
                    <select
                      className="form-control"
                      value={createForm.paperColor}
                      onChange={(e) =>
                        setCreateForm((f: any) => ({
                          ...f,
                          paperColor: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- chọn màu --</option>
                      {(allColors || []).map((c: any) => (
                        <option
                          key={getIdFromDoc(c) ?? c.code}
                          value={getIdFromDoc(c)}
                        >
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={fieldStyle}>
                    Rộng
                    <input
                      className="form-control"
                      type="number"
                      value={createForm.width}
                      onChange={(e) =>
                        setCreateForm((f: any) => ({
                          ...f,
                          width: e.target.value,
                        }))
                      }
                    />
                  </label>

                  <label style={fieldStyle}>
                    Khổ
                    <input
                      className="form-control"
                      type="number"
                      value={createForm.grammage}
                      onChange={(e) =>
                        setCreateForm((f: any) => ({
                          ...f,
                          grammage: e.target.value,
                        }))
                      }
                    />
                  </label>
                </>
              )}

              <label style={fieldStyle}>
                Nhà cung cấp
                <select
                  className="form-control"
                  value={createForm.paperSupplierId}
                  onChange={(e) =>
                    setCreateForm((f: any) => ({
                      ...f,
                      paperSupplierId: e.target.value,
                    }))
                  }
                >
                  <option value="">-- chọn nhà cung cấp --</option>
                  {(allSuppliers || []).map((s: any) => (
                    <option
                      key={getIdFromDoc(s) ?? s.code}
                      value={getIdFromDoc(s)}
                    >
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={fieldStyle}>
                Trọng lượng
                <input
                  className="form-control"
                  type="number"
                  value={createForm.weight}
                  onChange={(e) =>
                    setCreateForm((f: any) => ({
                      ...f,
                      weight: e.target.value,
                    }))
                  }
                />
              </label>

              <label style={fieldStyle}>
                Ngày nhập
                <input
                  className="form-control"
                  type="date"
                  value={createForm.receivingDate}
                  onChange={(e) =>
                    setCreateForm((f: any) => ({
                      ...f,
                      receivingDate: e.target.value,
                    }))
                  }
                />
              </label>

              <label style={fieldStyle}>
                Note
                <textarea
                  className="form-control"
                  value={createForm.note}
                  onChange={(e) =>
                    setCreateForm((f: any) => ({ ...f, note: e.target.value }))
                  }
                />
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Đóng
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateSubmit}
                disabled={creating}
              >
                {creating ? "Đang tạo..." : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Create multiple rolls modal */
export const CreateMultipleModal: React.FC<any> = ({
  show,
  onClose,
  createMultipleRows = [],
  addCreateMultipleRow,
  removeCreateMultipleRow,
  updateCreateMultipleRow,
  allTypes,
  allColors,
  allSuppliers,
  colorMap,
  getIdFromDoc,
  handleCreateMultipleSubmit,
  creatingMultiple,
}) => {
  // Hooks must come first — do NOT return before hooks
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(() => {
    const first = (createMultipleRows && createMultipleRows[0]) || null;
    return String(first?.paperSupplierId ?? "") || "";
  });

  useEffect(() => {
    (createMultipleRows || []).forEach((r: any) => {
      if (r.paperSupplierId !== selectedSupplierId) {
        updateCreateMultipleRow(r.id, { paperSupplierId: selectedSupplierId });
      }
    });
    // intentionally depends on selectedSupplierId and createMultipleRows reference
  }, [selectedSupplierId, updateCreateMultipleRow, createMultipleRows]);

  useEffect(() => {
    (createMultipleRows || []).forEach((r: any) => {
      if (!r.paperSupplierId && selectedSupplierId) {
        updateCreateMultipleRow(r.id, { paperSupplierId: selectedSupplierId });
      }
    });
    // safe dependency: use length (guarded) so effect fires when rows change
  }, [
    (createMultipleRows || []).length,
    selectedSupplierId,
    updateCreateMultipleRow,
  ]);

  // Now it's safe to bail out if not shown
  if (!show) return null;

  return (
    <div className="modal-backdrop" style={{ display: "block" }}>
      <div className="modal" role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div
              className="modal-header"
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <div style={{ flex: 1 }}>
                <h5 className="modal-title" style={{ margin: 0 }}>
                  Tạo nhiều cuộn
                </h5>
                <div className="small text-muted">Mỗi dòng = 1 cuộn</div>
              </div>

              <div style={{ minWidth: 320 }}>
                <label className="form-label small mb-1">
                  Nhà cung cấp (áp dụng cho tất cả)
                </label>
                <select
                  className="form-control"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                >
                  <option value="">-- chọn nhà cung cấp --</option>
                  {(allSuppliers || []).map((s: any) => (
                    <option
                      key={getIdFromDoc(s) ?? s.code}
                      value={getIdFromDoc(s)}
                    >
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>

            <div className="modal-body">
              <div
                style={{
                  marginBottom: 8,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={addCreateMultipleRow}
                >
                  Thêm dòng
                </button>
                <small className="text-muted">
                  Mỗi dòng tương ứng 1 cuộn — loại/trọng lượng/ngày/ghi chú có
                  thể khác nhau. Nhà cung cấp được áp dụng chung phía trên.
                </small>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}>#</th>
                      <th style={{ minWidth: 420 }}>Loại giấy</th>
                      <th style={{ width: 150 }}>Trọng lượng</th>
                      <th style={{ width: 140 }}>Ngày nhập</th>
                      <th>Ghi chú</th>
                      <th style={{ width: 80 }}>Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {createMultipleRows.map((row: any, idx: number) => (
                      <tr key={row.id}>
                        <td>{idx + 1}</td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                              flexDirection: "column",
                            }}
                          >
                            {!row.useNewType ? (
                              (() => {
                                const st = (allTypes || []).find(
                                  (t: any) =>
                                    String(getIdFromDoc(t)) ===
                                    String(row.paperTypeId)
                                );
                                const titleText = st
                                  ? `${
                                      st.paperColor?.title ??
                                      colorMap.get(
                                        String(getIdFromDoc(st.paperColor))
                                      )?.title ??
                                      ""
                                    } — ${st.width} x ${st.grammage}`
                                  : "";
                                return (
                                  <select
                                    className="form-control"
                                    value={row.paperTypeId}
                                    onChange={(e) =>
                                      updateCreateMultipleRow(row.id, {
                                        paperTypeId: e.target.value,
                                      })
                                    }
                                    style={{ minWidth: 420 }}
                                    title={titleText}
                                  >
                                    <option value="">
                                      -- chọn loại giấy --
                                    </option>
                                    {(allTypes || []).map((t: any) => (
                                      <option
                                        key={
                                          getIdFromDoc(t) ??
                                          `${t.width}_${t.grammage}`
                                        }
                                        value={getIdFromDoc(t)}
                                      >
                                        {`${
                                          t.paperColor?.title ??
                                          colorMap.get(
                                            String(getIdFromDoc(t.paperColor))
                                          )?.title ??
                                          ""
                                        } — ${t.width} x ${t.grammage}`}
                                      </option>
                                    ))}
                                  </select>
                                );
                              })()
                            ) : (
                              <>
                                <select
                                  className="form-control"
                                  value={row.paperColor}
                                  onChange={(e) =>
                                    updateCreateMultipleRow(row.id, {
                                      paperColor: e.target.value,
                                    })
                                  }
                                  style={{ minWidth: 200 }}
                                >
                                  <option value="">-- chọn màu --</option>
                                  {(allColors || []).map((c: any) => (
                                    <option
                                      key={getIdFromDoc(c) ?? c.code}
                                      value={getIdFromDoc(c)}
                                    >
                                      {c.title}
                                    </option>
                                  ))}
                                </select>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 8,
                                    marginTop: 8,
                                  }}
                                >
                                  <input
                                    className="form-control"
                                    placeholder="Width"
                                    type="number"
                                    value={row.width}
                                    onChange={(e) =>
                                      updateCreateMultipleRow(row.id, {
                                        width: e.target.value,
                                      })
                                    }
                                  />
                                  <input
                                    className="form-control"
                                    placeholder="Grammage"
                                    type="number"
                                    value={row.grammage}
                                    onChange={(e) =>
                                      updateCreateMultipleRow(row.id, {
                                        grammage: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </>
                            )}

                            <div style={{ width: "100%", marginTop: 6 }}>
                              <small className="text-muted">
                                Nhà cung cấp:{" "}
                                {(() => {
                                  const sid =
                                    row.paperSupplierId ||
                                    selectedSupplierId ||
                                    "";
                                  const s = (allSuppliers || []).find(
                                    (x: any) =>
                                      String(getIdFromDoc(x)) === String(sid)
                                  );
                                  return s ? s.name : "(chưa chọn)";
                                })()}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <input
                            className="form-control"
                            type="number"
                            min={0}
                            value={row.weight}
                            onChange={(e) =>
                              updateCreateMultipleRow(row.id, {
                                weight: e.target.value,
                              })
                            }
                          />
                        </td>

                        <td>
                          <input
                            className="form-control"
                            type="date"
                            value={row.receivingDate}
                            onChange={(e) =>
                              updateCreateMultipleRow(row.id, {
                                receivingDate: e.target.value,
                              })
                            }
                          />
                        </td>

                        <td>
                          <input
                            className="form-control"
                            value={row.note}
                            onChange={(e) =>
                              updateCreateMultipleRow(row.id, {
                                note: e.target.value,
                              })
                            }
                          />
                        </td>

                        <td>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeCreateMultipleRow(row.id)}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Đóng
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateMultipleSubmit}
                disabled={creatingMultiple}
              >
                {creatingMultiple ? "Đang tạo..." : "Tạo nhiều"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Update single roll modal */
export const UpdateModal: React.FC<any> = ({
  show,
  onClose,
  updateForm,
  setUpdateForm,
  allColors,
  allSuppliers,
  fieldStyle,
  getIdFromDoc,
  handleUpdateSubmit,
}) => {
  if (!show) return null;
  return (
    <div className="modal-backdrop" style={{ display: "block" }}>
      <div className="modal" role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Sửa thông tin</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">
              <label style={fieldStyle}>
                Màu
                <select
                  className="form-control"
                  value={updateForm.paperColor}
                  onChange={(e) =>
                    setUpdateForm((f: any) => ({
                      ...f,
                      paperColor: e.target.value,
                    }))
                  }
                >
                  <option value="">-- select color --</option>
                  {(allColors || []).map((c: any) => (
                    <option
                      key={getIdFromDoc(c) ?? c.code}
                      value={getIdFromDoc(c)}
                    >
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>

              <label style={fieldStyle}>
                Nhà cung cấp
                <select
                  className="form-control"
                  value={updateForm.paperSupplierId}
                  onChange={(e) =>
                    setUpdateForm((f: any) => ({
                      ...f,
                      paperSupplierId: e.target.value,
                    }))
                  }
                >
                  <option value="">-- select supplier --</option>
                  {(allSuppliers || []).map((s: any) => (
                    <option
                      key={getIdFromDoc(s) ?? s.code}
                      value={getIdFromDoc(s)}
                    >
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={fieldStyle}>
                Rộng{" "}
                <input
                  className="form-control"
                  type="number"
                  value={updateForm.width}
                  onChange={(e) =>
                    setUpdateForm((f: any) => ({ ...f, width: e.target.value }))
                  }
                />
              </label>

              <label style={fieldStyle}>
                Khổ{" "}
                <input
                  className="form-control"
                  type="number"
                  value={updateForm.grammage}
                  onChange={(e) =>
                    setUpdateForm((f: any) => ({
                      ...f,
                      grammage: e.target.value,
                    }))
                  }
                />
              </label>

              <label style={fieldStyle}>
                Trọng lượng{" "}
                <input
                  className="form-control"
                  type="number"
                  value={updateForm.weight}
                  onChange={(e) =>
                    setUpdateForm((f: any) => ({
                      ...f,
                      weight: e.target.value,
                    }))
                  }
                />
              </label>

              <label style={fieldStyle}>
                Ngày nhập{" "}
                <input
                  className="form-control"
                  type="date"
                  value={updateForm.receivingDate}
                  onChange={(e) =>
                    setUpdateForm((f: any) => ({
                      ...f,
                      receivingDate: e.target.value,
                    }))
                  }
                />
              </label>

              <label style={fieldStyle}>
                Note{" "}
                <textarea
                  className="form-control"
                  value={updateForm.note}
                  onChange={(e) =>
                    setUpdateForm((f: any) => ({ ...f, note: e.target.value }))
                  }
                />
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Đóng
              </button>
              <button className="btn btn-primary" onClick={handleUpdateSubmit}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Single re-import modal */
export const SingleReimportModal: React.FC<any> = ({
  show,
  onClose,
  roll,
  singleWeight,
  setSingleWeight,
  fieldStyle,
  computePaperRollId,
  handleConfirmSingleReImport,
}) => {
  if (!show || !roll) return null;
  return (
    <div className="modal-backdrop" style={{ display: "block" }}>
      <div className="modal" role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-sm">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Nhập lại (single)</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>

            <div className="modal-body">
              <p>
                Nhập lại trọng lượng cho:{" "}
                <strong>{computePaperRollId(roll)}</strong>
              </p>
              <label style={fieldStyle}>
                Trọng lượng (kg)
                <input
                  className="form-control"
                  type="number"
                  min={0}
                  value={singleWeight}
                  onChange={(e) => setSingleWeight(e.target.value)}
                />
              </label>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmSingleReImport}
              >
                Xác nhận Nhập lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* QR modal */
export const QrModal: React.FC<any> = ({
  show,
  onClose,
  qrModal,
  qrLoading,
  qrDataUrl,
  handleOpenQrInNewTab,
  handleDownloadQr,
  handleCopyCode,
  handlePrintQr,
  computePaperRollId,
  paperRolls,
}) => {
  if (!show) return null;
  return (
    <div className="modal-backdrop" style={{ display: "block" }}>
      <div className="modal" role="dialog" style={{ display: "block" }}>
        <div
          className="modal-dialog"
          style={{ width: "min(70vw, 600px)", maxWidth: "400px" }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                QR:{" "}
                {computePaperRollId(
                  paperRolls.find((r: any) => r._id === qrModal.text)
                )}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
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
              <button className="btn btn-secondary" onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
