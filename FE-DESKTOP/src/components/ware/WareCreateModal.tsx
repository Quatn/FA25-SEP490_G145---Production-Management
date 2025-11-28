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

  return (
    <div className="modal-backdrop" style={{ display: "block" }}>
      <div className="modal" role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Tạo mã hàng</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Mã hàng
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
                  </label>

                  <label className="form-label">
                    Đơn giá (đồng)
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
                  </label>

                  <label className="form-label">
                    Sóng
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
                  </label>

                  <label className="form-label">
                    Kiểu SP gia công
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
                  </label>

                  <label className="form-label">
                    Rộng
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
                  </label>

                  <label className="form-label">
                    Dài
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
                  </label>

                  <label className="form-label">
                    Cao
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
                  </label>
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Volume
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
                  </label>

                  <br />

                  <label className="form-label">
                    Số SP bộ
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
                  </label>

                  <label className="form-label">
                    Số SP ghép bộ
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
                  </label>

                  <label className="form-label">
                    Dọc chia SP
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
                  </label>

                  <br />

                  <label className="form-label">Màu in</label>
                  {/* render passed MultiSelectInline */}
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

                  <label className="form-label" style={{ marginTop: 8 }}>
                    Công đoạn hoàn thiện
                  </label>
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

                  <label className="form-label" style={{ marginTop: 8 }}>
                    Note
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
                  </label>
                </div>
              </div>

              <hr />

              <div style={{ marginBottom: 8 }}>
                <strong>Paper layers (at least one required)</strong>
              </div>

              <div className="row g-3">
                {/** face / e flute / e/b liner / b flute / b/a c liner / ac flute / back layer */}
                <div className="col-md-4">
                  <label className="form-label">
                    Face layer
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
                  </label>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    E flute
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
                  </label>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    E/B liner
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
                  </label>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    B flute
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
                  </label>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    B/A C liner
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
                  </label>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    AC flute
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
                  </label>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Back layer
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
                  </label>
                </div>
              </div>

              <hr />

              <div style={{ marginTop: 12 }}>
                <label className="form-label">
                  Type of printer
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
                </label>
              </div>
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

export default WareCreateModal;
