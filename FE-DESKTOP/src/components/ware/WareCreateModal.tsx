"use client";

import React from "react";

type CreateForm = any;

type MultiSelectInlineProps = {
  id?: string;
  options?: any[];
  selected?: any[];
  // REQUIRED handlers
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  getLabel?: (o: any) => string;
  placeholder?: string;
};

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
  getIdFromDoc: (doc: any) => string | undefined;
  MultiSelectInline: React.ComponentType<MultiSelectInlineProps>;
};

/* TOP-LEVEL stable Label component */
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
  // lightweight debug to help verify the parent state actually changes
  React.useEffect(() => {
    try {
      console.debug(
        "WareCreateModal createForm.printColors:",
        createForm?.printColors
      );
    } catch {}
  }, [createForm?.printColors]);

  if (!show) return null;

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
                      value={createForm?.code ?? ""}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
                          ...(p ?? {}),
                          code: e.target.value,
                        }))
                      }
                    />
                  </Label>

                  <Label label="Đơn giá (đồng)" required>
                    <input
                      className="form-control"
                      type="number"
                      value={createForm?.unitPrice ?? ""}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
                          ...(p ?? {}),
                          unitPrice: e.target.value,
                        }))
                      }
                    />
                  </Label>

                  <Label label="Sóng" required>
                    <select
                      className="form-control"
                      value={createForm?.fluteCombination ?? ""}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
                          ...(p ?? {}),
                          fluteCombination: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- chọn --</option>
                      {(fluteList || []).map((f) => (
                        <option
                          key={getIdFromDoc(f) ?? f.code}
                          value={getIdFromDoc(f) ?? ""}
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
                      value={createForm?.wareManufacturingProcessType ?? ""}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
                          ...(p ?? {}),
                          wareManufacturingProcessType: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- chọn --</option>
                      {(manufList || []).map((m) => (
                        <option
                          key={getIdFromDoc(m) ?? m.code}
                          value={getIdFromDoc(m) ?? ""}
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
                      value={createForm?.wareWidth ?? ""}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
                          ...(p ?? {}),
                          wareWidth: e.target.value,
                        }))
                      }
                    />
                  </Label>

                  <Label label="Dài" required>
                    <input
                      className="form-control"
                      type="number"
                      value={createForm?.wareLength ?? ""}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
                          ...(p ?? {}),
                          wareLength: e.target.value,
                        }))
                      }
                    />
                  </Label>

                  <Label label="Cao">
                    <input
                      className="form-control"
                      type="number"
                      value={createForm?.wareHeight ?? ""}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
                          ...(p ?? {}),
                          wareHeight: e.target.value,
                        }))
                      }
                    />
                  </Label>

                  {/* New adjustment fields placed in left column (required) */}
                  <Label label="warePerBlankAdjustment" required>
                    <input
                      className="form-control"
                      type="number"
                      value={createForm?.warePerBlankAdjustment ?? ""}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
                          ...(p ?? {}),
                          warePerBlankAdjustment: e.target.value,
                        }))
                      }
                    />
                  </Label>

                  <Label label="flapAdjustment" required>
                    <input
                      className="form-control"
                      type="number"
                      value={createForm?.flapAdjustment ?? ""}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
                          ...(p ?? {}),
                          flapAdjustment: e.target.value,
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
                      value={createForm?.volume ?? ""}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
                          ...(p ?? {}),
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
                          value={createForm?.warePerSet ?? ""}
                          onChange={(e) =>
                            setCreateForm((p: any) => ({
                              ...(p ?? {}),
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
                          value={createForm?.warePerCombinedSet ?? ""}
                          onChange={(e) =>
                            setCreateForm((p: any) => ({
                              ...(p ?? {}),
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
                      value={createForm?.horizontalWareSplit ?? ""}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
                          ...(p ?? {}),
                          horizontalWareSplit: e.target.value,
                        }))
                      }
                    />
                  </Label>

                  {/* New adjustment fields placed in right column (required) */}
                  <Label label="flapOverlapAdjustment" required>
                    <input
                      className="form-control"
                      type="number"
                      value={createForm?.flapOverlapAdjustment ?? ""}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
                          ...(p ?? {}),
                          flapOverlapAdjustment: e.target.value,
                        }))
                      }
                    />
                  </Label>

                  <Label label="crossCutCountAdjustment" required>
                    <input
                      className="form-control"
                      type="number"
                      value={createForm?.crossCutCountAdjustment ?? ""}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
                          ...(p ?? {}),
                          crossCutCountAdjustment: e.target.value,
                        }))
                      }
                    />
                  </Label>

                  <Label label="Màu in" required>
                    <MultiSelectInline
                      id="create-printcolor"
                      options={printColorList}
                      selected={createForm?.printColors ?? []}
                      onAdd={(id: string) => addToCreateList("printColors", id)}
                      onRemove={(id: string) =>
                        removeFromCreateList("printColors", id)
                      }
                      getLabel={(o: any) =>
                        o?.code ?? o?.name ?? getIdFromDoc(o) ?? ""
                      }
                      placeholder="-- chọn màu in --"
                    />
                  </Label>

                  <Label label="Công đoạn hoàn thiện">
                    <MultiSelectInline
                      id="create-finishing"
                      options={finishingList}
                      selected={createForm?.finishingProcesses ?? []}
                      onAdd={(id: string) =>
                        addToCreateList("finishingProcesses", id)
                      }
                      onRemove={(id: string) =>
                        removeFromCreateList("finishingProcesses", id)
                      }
                      getLabel={(o: any) =>
                        o?.code ?? o?.name ?? getIdFromDoc(o) ?? ""
                      }
                      placeholder="-- chọn công đoạn --"
                    />
                  </Label>

                  <Label label="Note">
                    <textarea
                      className="form-control"
                      value={createForm?.note ?? ""}
                      onChange={(e) =>
                        setCreateForm((p: any) => ({
                          ...(p ?? {}),
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
                  Lớp giấy{" "}
                  <span style={{ color: "#6c757d", fontSize: 13 }}>
                    (chọn ít nhất 1)
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
                    <Label label="Mặt">
                      <select
                        className="form-control"
                        value={createForm?.faceLayerPaperType ?? ""}
                        onChange={(e) =>
                          setCreateForm((p: any) => ({
                            ...(p ?? {}),
                            faceLayerPaperType: e.target.value,
                          }))
                        }
                      >
                        <option value="">-- rỗng --</option>
                        {PAPER_LAYER_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </Label>
                  </div>

                  <div className="col-md-4">
                    <Label label="Sóng E">
                      <select
                        className="form-control"
                        value={createForm?.EFlutePaperType ?? ""}
                        onChange={(e) =>
                          setCreateForm((p: any) => ({
                            ...(p ?? {}),
                            EFlutePaperType: e.target.value,
                          }))
                        }
                      >
                        <option value="">-- rỗng --</option>
                        {PAPER_LAYER_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </Label>
                  </div>

                  <div className="col-md-4">
                    <Label label="Lớp giữa E/B">
                      <select
                        className="form-control"
                        value={createForm?.EBLinerLayerPaperType ?? ""}
                        onChange={(e) =>
                          setCreateForm((p: any) => ({
                            ...(p ?? {}),
                            EBLinerLayerPaperType: e.target.value,
                          }))
                        }
                      >
                        <option value="">-- rỗng --</option>
                        {PAPER_LAYER_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </Label>
                  </div>

                  <div className="col-md-4">
                    <Label label="Sóng B">
                      <select
                        className="form-control"
                        value={createForm?.BFlutePaperType ?? ""}
                        onChange={(e) =>
                          setCreateForm((p: any) => ({
                            ...(p ?? {}),
                            BFlutePaperType: e.target.value,
                          }))
                        }
                      >
                        <option value="">-- rỗng --</option>
                        {PAPER_LAYER_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </Label>
                  </div>

                  <div className="col-md-4">
                    <Label label="Lớp giữa B/A C">
                      <select
                        className="form-control"
                        value={createForm?.BACLinerLayerPaperType ?? ""}
                        onChange={(e) =>
                          setCreateForm((p: any) => ({
                            ...(p ?? {}),
                            BACLinerLayerPaperType: e.target.value,
                          }))
                        }
                      >
                        <option value="">-- rỗng --</option>
                        {PAPER_LAYER_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </Label>
                  </div>

                  <div className="col-md-4">
                    <Label label="Sóng AC">
                      <select
                        className="form-control"
                        value={createForm?.ACFlutePaperType ?? ""}
                        onChange={(e) =>
                          setCreateForm((p: any) => ({
                            ...(p ?? {}),
                            ACFlutePaperType: e.target.value,
                          }))
                        }
                      >
                        <option value="">-- rỗng --</option>
                        {PAPER_LAYER_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </Label>
                  </div>

                  <div className="col-md-4">
                    <Label label="Đáy">
                      <select
                        className="form-control"
                        value={createForm?.backLayerPaperType ?? ""}
                        onChange={(e) =>
                          setCreateForm((p: any) => ({
                            ...(p ?? {}),
                            backLayerPaperType: e.target.value,
                          }))
                        }
                      >
                        <option value="">-- rỗng --</option>
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
                <Label label="Loại máy in">
                  <select
                    className="form-control"
                    value={createForm?.typeOfPrinter ?? ""}
                    onChange={(e) =>
                      setCreateForm((p: any) => ({
                        ...(p ?? {}),
                        typeOfPrinter: e.target.value,
                      }))
                    }
                  >
                    <option value="">-- rỗng --</option>
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
