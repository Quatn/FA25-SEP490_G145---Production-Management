"use client";

import React from "react";

type EditForm = any;

type Props = {
  show: boolean;
  onClose: () => void;
  editForm: EditForm | null;
  setEditForm: (updater: any) => void;
  fluteList: any[];
  manufList: any[];
  printColorList: any[];
  finishingList: any[];
  PAPER_LAYER_OPTIONS: string[];
  TYPE_OF_PRINTER_OPTIONS: string[];
  addToEditList: (
    field: "printColors" | "finishingProcesses" | "manufacturingProcesses",
    id: string
  ) => void;
  removeFromEditList: (
    field: "printColors" | "finishingProcesses" | "manufacturingProcesses",
    id: string
  ) => void;
  handleEditSubmit: () => Promise<void>;
  // passed from parent (no other new files)
  getIdFromDoc: (doc: any) => string | undefined;
  MultiSelectInline: any;
};

const WareEditModal: React.FC<Props> = ({
  show,
  onClose,
  editForm,
  setEditForm,
  fluteList,
  manufList,
  printColorList,
  finishingList,
  PAPER_LAYER_OPTIONS,
  TYPE_OF_PRINTER_OPTIONS,
  addToEditList,
  removeFromEditList,
  handleEditSubmit,
  getIdFromDoc,
  MultiSelectInline,
}) => {
  if (!show || !editForm) return null;

  return (
    <div className="modal-backdrop" style={{ display: "block" }}>
      <div className="modal" role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Sửa {editForm.code}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Mã hàng
                    <input
                      className="form-control"
                      value={editForm.code}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
                          ...p,
                          code: e.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="form-label">
                    Đơn giá (đồng)
                    <input
                      className="form-control"
                      type="number"
                      value={editForm.unitPrice}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
                          ...p,
                          unitPrice: e.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="form-label">
                    Sóng
                    <select
                      className="form-control"
                      value={editForm.fluteCombination}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
                          ...p,
                          fluteCombination: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- select --</option>
                      {(fluteList || []).map((f) => (
                        <option
                          key={getIdFromDoc(f) ?? f.code}
                          value={getIdFromDoc(f)}
                        >
                          {f.code}
                          {f.description ? ` - ${f.description}` : ""}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="form-label">
                    Kiểu SP gia công
                    <select
                      className="form-control"
                      value={editForm.wareManufacturingProcessType}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
                          ...p,
                          wareManufacturingProcessType: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- select --</option>
                      {(manufList || []).map((m) => (
                        <option
                          key={getIdFromDoc(m) ?? m.code}
                          value={getIdFromDoc(m)}
                        >
                          {m.code} {m.name ? `- ${m.name}` : ""}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="form-label">
                    Rộng
                    <input
                      className="form-control"
                      type="number"
                      value={editForm.wareWidth}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
                          ...p,
                          wareWidth: e.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="form-label">
                    Dài
                    <input
                      className="form-control"
                      type="number"
                      value={editForm.wareLength}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
                          ...p,
                          wareLength: e.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="form-label">
                    Cao
                    <input
                      className="form-control"
                      type="number"
                      value={editForm.wareHeight}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
                          ...p,
                          wareHeight: e.target.value,
                        }))
                      }
                    />
                  </label>
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Volume
                    <input
                      className="form-control"
                      type="number"
                      value={editForm.volume}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
                          ...p,
                          volume: e.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="form-label">
                    Số SP bộ
                    <input
                      className="form-control"
                      type="number"
                      value={editForm.warePerSet}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
                          ...p,
                          warePerSet: e.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="form-label">
                    Số SP ghép bộ
                    <input
                      className="form-control"
                      type="number"
                      value={editForm.warePerCombinedSet}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
                          ...p,
                          warePerCombinedSet: e.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="form-label">
                    Dọc chia SP
                    <input
                      className="form-control"
                      type="number"
                      value={editForm.horizontalWareSplit}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
                          ...p,
                          horizontalWareSplit: e.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="form-label">Màu in</label>
                  {React.createElement(MultiSelectInline, {
                    id: "edit-printcolor",
                    options: printColorList,
                    selected: editForm.printColors || [],
                    onAdd: (id: string) => addToEditList("printColors", id),
                    onRemove: (id: string) =>
                      removeFromEditList("printColors", id),
                    getLabel: (o: any) =>
                      o?.code ?? o?.name ?? getIdFromDoc(o) ?? "",
                    placeholder: "-- choose print colors --",
                  })}

                  <label className="form-label" style={{ marginTop: 8 }}>
                    Công đoạn hoàn thiện
                  </label>
                  {React.createElement(MultiSelectInline, {
                    id: "edit-finishing",
                    options: finishingList,
                    selected: editForm.finishingProcesses || [],
                    onAdd: (id: string) =>
                      addToEditList("finishingProcesses", id),
                    onRemove: (id: string) =>
                      removeFromEditList("finishingProcesses", id),
                    getLabel: (o: any) =>
                      o?.code ?? o?.name ?? getIdFromDoc(o) ?? "",
                    placeholder: "-- choose finishing processes --",
                  })}

                  <label className="form-label" style={{ marginTop: 8 }}>
                    Note
                    <textarea
                      className="form-control"
                      value={editForm.note}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
                          ...p,
                          note: e.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
              </div>

              <hr />

              <div style={{ marginBottom: 8 }}>
                <strong>Paper layers (at least one required)</strong>
              </div>

              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">
                    Face layer
                    <select
                      className="form-control"
                      value={editForm.faceLayerPaperType}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
                          ...p,
                          faceLayerPaperType: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- none --</option>
                      {PAPER_LAYER_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    E flute
                    <select
                      className="form-control"
                      value={editForm.EFlutePaperType}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
                          ...p,
                          EFlutePaperType: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- none --</option>
                      {PAPER_LAYER_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Back layer
                    <select
                      className="form-control"
                      value={editForm.backLayerPaperType}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
                          ...p,
                          backLayerPaperType: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- none --</option>
                      {PAPER_LAYER_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <hr />

              <div style={{ marginTop: 12 }}>
                <label className="form-label">
                  Type of printer
                  <select
                    className="form-control"
                    value={editForm.typeOfPrinter}
                    onChange={(e) =>
                      setEditForm((p: any) => ({
                        ...p,
                        typeOfPrinter: e.target.value,
                      }))
                    }
                  >
                    <option value="">-- none --</option>
                    {TYPE_OF_PRINTER_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Đóng
              </button>
              <button className="btn btn-primary" onClick={handleEditSubmit}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WareEditModal;
