"use client";

import React from "react";

type CreateForm = any;

type Props = {
  show: boolean;
  onClose: () => void;
  createForm: CreateForm;
  setCreateForm: (updater: any) => void;
  fluteList: any[];
  manufList: any[];
  printColorList: any[];
  finishingList: any[];
  PAPER_LAYER_OPTIONS: string[];
  TYPE_OF_PRINTER_OPTIONS: string[];
  addToCreateList: (
    field: "printColors" | "finishingProcesses" | "manufacturingProcesses",
    id: string
  ) => void;
  removeFromCreateList: (
    field: "printColors" | "finishingProcesses" | "manufacturingProcesses",
    id: string
  ) => void;
  handleCreateSubmit: () => Promise<void>;
  creating?: boolean;
  // passed from parent (no other new files)
  getIdFromDoc: (doc: any) => string | undefined;
  MultiSelectInline: any; // React component passed from parent
};

const WareCreateModal: React.FC<Props> = ({
  show,
  onClose,
  createForm,
  setCreateForm,
  fluteList,
  manufList,
  printColorList,
  finishingList,
  PAPER_LAYER_OPTIONS,
  TYPE_OF_PRINTER_OPTIONS,
  addToCreateList,
  removeFromCreateList,
  handleCreateSubmit,
  creating,
  getIdFromDoc,
  MultiSelectInline,
}) => {
  if (!show) return null;

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
              <h5 className="modal-title">Tạo mã hàng</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <Label label="Mã hàng" required>
                    <input
                      className="form-control"
                      value={createForm.code}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
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
                      value={createForm.unitPrice}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
                          ...p,
                          unitPrice: e.target.value,
                        }))
                      }
                    />
                  </Label>

                  <Label label="Sóng" required>
                    <select
                      className="form-control"
                      value={createForm.fluteCombination}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
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
                      value={createForm.wareManufacturingProcessType}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
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
                      value={createForm.wareWidth}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
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
                      value={createForm.wareLength}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
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
                      value={createForm.wareHeight}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
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
                      value={createForm.volume}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
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
                          value={createForm.warePerSet}
                          onChange={(e) =>
                            setCreateForm((p: any) => ({
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
                          value={createForm.warePerCombinedSet}
                          onChange={(e) =>
                            setCreateForm((p: any) => ({
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
                      value={createForm.horizontalWareSplit}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
                          ...p,
                          horizontalWareSplit: e.target.value,
                        }))
                      }
                    />
                  </Label>

                  <Label label="Màu in" required>
                    {React.createElement(MultiSelectInline, {
                      id: "create-printcolor",
                      options: printColorList,
                      selected: createForm.printColors || [],
                      onAdd: (id: string) => addToCreateList("printColors", id),
                      onRemove: (id: string) =>
                        removeFromCreateList("printColors", id),
                      getLabel: (o: any) =>
                        o?.code ?? o?.name ?? getIdFromDoc(o) ?? "",
                      placeholder: "-- choose print colors --",
                    })}
                  </Label>

                  <Label label="Công đoạn hoàn thiện">
                    {React.createElement(MultiSelectInline, {
                      id: "create-finishing",
                      options: finishingList,
                      selected: createForm.finishingProcesses || [],
                      onAdd: (id: string) =>
                        addToCreateList("finishingProcesses", id),
                      onRemove: (id: string) =>
                        removeFromCreateList("finishingProcesses", id),
                      getLabel: (o: any) =>
                        o?.code ?? o?.name ?? getIdFromDoc(o) ?? "",
                      placeholder: "-- choose finishing processes --",
                    })}
                  </Label>

                  <Label label="Note">
                    <textarea
                      className="form-control"
                      value={createForm.note}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
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
                        value={createForm.faceLayerPaperType}
                        onChange={(e) =>
                          setCreateForm((p: any) => ({
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
                        value={createForm.EFlutePaperType}
                        onChange={(e) =>
                          setCreateForm((p: any) => ({
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
                        value={createForm.EBLinerLayerPaperType}
                        onChange={(e) =>
                          setCreateForm((p: any) => ({
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
                        value={createForm.BFlutePaperType}
                        onChange={(e) =>
                          setCreateForm((p: any) => ({
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
                        value={createForm.BACLinerLayerPaperType}
                        onChange={(e) =>
                          setCreateForm((p: any) => ({
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
                        value={createForm.ACFlutePaperType}
                        onChange={(e) =>
                          setCreateForm((p: any) => ({
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
                        value={createForm.backLayerPaperType}
                        onChange={(e) =>
                          setCreateForm((p: any) => ({
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
                    value={createForm.typeOfPrinter}
                    onChange={(e) =>
                      setCreateForm((p: any) => ({
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

export default WareCreateModal;
