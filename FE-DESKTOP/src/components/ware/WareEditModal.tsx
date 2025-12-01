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

  const Label: React.FC<{
    label: string;
    required?: boolean;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }> = ({ label, required, children, style }) => (
    <label
      className="form-label"
      style={{ display: "block", marginBottom: 8, ...style }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span>{label}</span>
        {required && <span style={{ color: "red", lineHeight: 1 }}>*</span>}
      </div>
      {children}
    </label>
  );

  return (
    <div className="modal-backdrop" style={{ display: "block" }}>
      <div className="modal" role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div
              className="modal-header"
              style={{ borderBottom: "1px solid #e9ecef" }}
            >
              <h5 className="modal-title">Sửa {editForm.code}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <Label label="Mã hàng" required>
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
                  </Label>

                  <Label label="Đơn giá (đồng)" required>
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
                  </Label>

                  <Label label="Sóng" required>
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
                  </Label>

                  <Label label="Kiểu SP gia công" required>
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
                  </Label>

                  <Label label="Rộng" required>
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
                  </Label>

                  <Label label="Dài" required>
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
                  </Label>

                  <Label label="Cao">
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
                  </Label>
                </div>

                <div className="col-md-6">
                  <Label label="Volume" required>
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
                  </Label>

                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <Label label="Số SP bộ" required>
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
                      </Label>
                    </div>

                    <div style={{ flex: 1 }}>
                      <Label label="Số SP ghép bộ" required>
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
                      </Label>
                    </div>
                  </div>

                  <Label label="Dọc chia SP" required>
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
                  </Label>

                  <Label label="Màu in" required>
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
                  </Label>

                  <Label label="Công đoạn hoàn thiện">
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
                  </Label>

                  <Label label="Note">
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
                  </Label>
                </div>
              </div>

              <hr />

              <div style={{ marginBottom: 8 }}>
                <strong>
                  Paper layers{" "}
                  <span style={{ color: "#6c757d", fontSize: 13 }}>
                    (at least one required)
                  </span>
                </strong>
              </div>

              <div
                style={{
                  border: "1px solid #e9ecef",
                  padding: 12,
                  borderRadius: 6,
                  background: "#fbfbfd",
                  marginBottom: 12,
                }}
              >
                <div className="row g-3">
                  <div className="col-md-4">
                    <Label label="Face layer">
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
                    </Label>
                  </div>

                  <div className="col-md-4">
                    <Label label="E flute">
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
                    </Label>
                  </div>

                  <div className="col-md-4">
                    <Label label="E/B liner">
                      <select
                        className="form-control"
                        value={editForm.EBLinerLayerPaperType}
                        onChange={(e) =>
                          setEditForm((p: any) => ({
                            ...p,
                            EBLinerLayerPaperType: e.target.value,
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
                    </Label>
                  </div>

                  <div className="col-md-4">
                    <Label label="B flute">
                      <select
                        className="form-control"
                        value={editForm.BFlutePaperType}
                        onChange={(e) =>
                          setEditForm((p: any) => ({
                            ...p,
                            BFlutePaperType: e.target.value,
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
                    </Label>
                  </div>

                  <div className="col-md-4">
                    <Label label="B/A C liner">
                      <select
                        className="form-control"
                        value={editForm.BACLinerLayerPaperType}
                        onChange={(e) =>
                          setEditForm((p: any) => ({
                            ...p,
                            BACLinerLayerPaperType: e.target.value,
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
                    </Label>
                  </div>

                  <div className="col-md-4">
                    <Label label="AC flute">
                      <select
                        className="form-control"
                        value={editForm.ACFlutePaperType}
                        onChange={(e) =>
                          setEditForm((p: any) => ({
                            ...p,
                            ACFlutePaperType: e.target.value,
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
                    </Label>
                  </div>

                  <div className="col-md-4">
                    <Label label="Back layer">
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
                    </Label>
                  </div>
                </div>
              </div>

              <hr />

              <div style={{ marginTop: 12 }}>
                <Label label="Type of printer">
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
                </Label>
              </div>
            </div>

            <div
              className="modal-footer"
              style={{ borderTop: "1px solid #e9ecef" }}
            >
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
