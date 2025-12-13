// src/components/ware/WareEditModal.tsx
"use client";

import React from "react";

type EditForm = any;

type MultiSelectInlineProps = {
  id?: string;
  options?: any[];
  selected?: any[];
  // REQUIRED handlers to match the MultiSelectInline implementation
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  getLabel?: (o: any) => string;
  placeholder?: string;
};

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
  getIdFromDoc: (doc: any) => string | undefined;
  // accept a component value
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
  // helper factories to keep numeric behavior consistent
  const makeOnKeyDown =
    (allowDecimal = false) =>
    (e: React.KeyboardEvent) => {
      if (e.key === "-" || e.key === "e" || e.key === "+") {
        e.preventDefault();
      }
      if (!allowDecimal && e.key === ".") {
        e.preventDefault();
      }
    };

  const makeOnPaste =
    (allowDecimal = false, integerOnly = false) =>
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const paste = e.clipboardData.getData("text");
      const regex = allowDecimal ? /[^0-9.]/g : /[^0-9]/g;
      if (regex.test(paste)) {
        e.preventDefault();
        const cleaned = paste.replace(regex, "");
        if (!cleaned) return;
        const el = e.currentTarget;
        const start = el.selectionStart ?? 0;
        const end = el.selectionEnd ?? 0;
        const newVal = el.value.slice(0, start) + cleaned + el.value.slice(end);
        if (integerOnly) {
          const num = Math.floor(Number(newVal) || 0);
          setEditForm((p: any) => ({
            ...(p ?? {}),
            [el.name]: Math.max(0, num),
          }));
        } else {
          const num = Number(newVal);
          if (!Number.isNaN(num)) {
            setEditForm((p: any) => ({
              ...(p ?? {}),
              [el.name]: Math.max(0, num),
            }));
          }
        }
      }
    };

  const onWheelPreventChange = (e: React.WheelEvent<HTMLInputElement>) => {
    (e.currentTarget as HTMLInputElement).blur();
  };

  const handleNumberChange =
    (field: string, integerOnly = false) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "") {
        setEditForm((p: any) => ({ ...(p ?? {}), [field]: "" }));
        return;
      }
      if (integerOnly) {
        let num = Math.floor(Number(raw) || 0);
        if (num < 0) num = 0;
        setEditForm((p: any) => ({ ...(p ?? {}), [field]: num }));
      } else {
        const num = Number(raw);
        if (Number.isNaN(num)) {
          return;
        }
        setEditForm((p: any) => ({ ...(p ?? {}), [field]: num < 0 ? 0 : num }));
      }
    };

  // debug: observe selected printColors in edit form
  React.useEffect(() => {
    try {
      console.debug(
        "WareEditModal editForm.printColors:",
        editForm?.printColors
      );
    } catch {}
  }, [editForm?.printColors]);

  if (!show || !editForm) return null;

  return (
    <div className="modal-backdrop" style={{ display: "block" }}>
      <div className="modal" role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div
              className="modal-header"
              style={{ borderBottom: "1px solid #e9ecef" }}
            >
              <h5 className="modal-title">Sửa {editForm?.code ?? ""}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <Label label="Mã hàng" required>
                    <input
                      className="form-control"
                      value={editForm?.code ?? ""}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
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
                      name="unitPrice"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      value={editForm?.unitPrice ?? ""}
                      onChange={handleNumberChange("unitPrice", true)}
                      onKeyDown={makeOnKeyDown(false)}
                      onPaste={makeOnPaste(false, true)}
                      onWheel={onWheelPreventChange}
                    />
                  </Label>

                  <Label label="Sóng" required>
                    <select
                      className="form-control"
                      value={editForm?.fluteCombination ?? ""}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
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
                      value={editForm?.wareManufacturingProcessType ?? ""}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
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
                      name="wareWidth"
                      min={0}
                      step="any"
                      inputMode="numeric"
                      value={editForm?.wareWidth ?? ""}
                      onChange={handleNumberChange("wareWidth", false)}
                      onKeyDown={makeOnKeyDown(true)}
                      onPaste={makeOnPaste(true, false)}
                      onWheel={onWheelPreventChange}
                    />
                  </Label>

                  <Label label="Dài" required>
                    <input
                      className="form-control"
                      type="number"
                      name="wareLength"
                      min={0}
                      step="any"
                      inputMode="numeric"
                      value={editForm?.wareLength ?? ""}
                      onChange={handleNumberChange("wareLength", false)}
                      onKeyDown={makeOnKeyDown(true)}
                      onPaste={makeOnPaste(true, false)}
                      onWheel={onWheelPreventChange}
                    />
                  </Label>

                  <Label label="Cao">
                    <input
                      className="form-control"
                      type="number"
                      name="wareHeight"
                      min={0}
                      step="any"
                      inputMode="numeric"
                      value={editForm?.wareHeight ?? ""}
                      onChange={handleNumberChange("wareHeight", false)}
                      onKeyDown={makeOnKeyDown(true)}
                      onPaste={makeOnPaste(true, false)}
                      onWheel={onWheelPreventChange}
                    />
                  </Label>

                  <Label label="Thể tích" required>
                    <input
                      className="form-control"
                      type="number"
                      name="volume"
                      min={0}
                      step="any"
                      inputMode="numeric"
                      value={editForm?.volume ?? ""}
                      onChange={handleNumberChange("volume", false)}
                      onKeyDown={makeOnKeyDown(true)}
                      onPaste={makeOnPaste(true, false)}
                      onWheel={onWheelPreventChange}
                    />
                  </Label>
                </div>

                <div className="col-md-6">
                  <Label label="Điều chỉnh số SP">
                    <input
                      className="form-control"
                      type="number"
                      name="warePerBlankAdjustment"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      value={editForm?.warePerBlankAdjustment ?? ""}
                      onChange={handleNumberChange(
                        "warePerBlankAdjustment",
                        true
                      )}
                      onKeyDown={makeOnKeyDown(false)}
                      onPaste={makeOnPaste(false, true)}
                      onWheel={onWheelPreventChange}
                    />
                  </Label>

                  <Label label="Điều chỉnh tai">
                    <input
                      className="form-control"
                      type="number"
                      name="flapAdjustment"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      value={editForm?.flapAdjustment ?? ""}
                      onChange={handleNumberChange("flapAdjustment", true)}
                      onKeyDown={makeOnKeyDown(false)}
                      onPaste={makeOnPaste(false, true)}
                      onWheel={onWheelPreventChange}
                    />
                  </Label>

                  <Label label="Điều chỉnh cộng cánh">
                    <input
                      className="form-control"
                      type="number"
                      name="flapOverlapAdjustment"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      value={editForm?.flapOverlapAdjustment ?? ""}
                      onChange={handleNumberChange(
                        "flapOverlapAdjustment",
                        true
                      )}
                      onKeyDown={makeOnKeyDown(false)}
                      onPaste={makeOnPaste(false, true)}
                      onWheel={onWheelPreventChange}
                    />
                  </Label>

                  <Label label="Điều chỉnh part SX">
                    <input
                      className="form-control"
                      type="number"
                      name="crossCutCountAdjustment"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      value={editForm?.crossCutCountAdjustment ?? ""}
                      onChange={handleNumberChange(
                        "crossCutCountAdjustment",
                        true
                      )}
                      onKeyDown={makeOnKeyDown(false)}
                      onPaste={makeOnPaste(false, true)}
                      onWheel={onWheelPreventChange}
                    />
                  </Label>

                  <Label label="Màu in" required>
                    <MultiSelectInline
                      id="edit-printcolor"
                      options={printColorList}
                      selected={editForm?.printColors ?? []}
                      onAdd={(id: string) => addToEditList("printColors", id)}
                      onRemove={(id: string) =>
                        removeFromEditList("printColors", id)
                      }
                      getLabel={(o: any) =>
                        o?.code ?? o?.name ?? getIdFromDoc(o) ?? ""
                      }
                      placeholder="-- choose print colors --"
                    />
                  </Label>

                  <Label label="Công đoạn hoàn thiện">
                    <MultiSelectInline
                      id="edit-finishing"
                      options={finishingList}
                      selected={editForm?.finishingProcesses ?? []}
                      onAdd={(id: string) =>
                        addToEditList("finishingProcesses", id)
                      }
                      onRemove={(id: string) =>
                        removeFromEditList("finishingProcesses", id)
                      }
                      getLabel={(o: any) =>
                        o?.code ?? o?.name ?? getIdFromDoc(o) ?? ""
                      }
                      placeholder="-- choose finishing processes --"
                    />
                  </Label>

                  <Label label="Note">
                    <textarea
                      className="form-control"
                      value={editForm?.note ?? ""}
                      onChange={(e) =>
                        setEditForm((p: any) => ({
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
                        value={editForm?.faceLayerPaperType ?? ""}
                        onChange={(e) =>
                          setEditForm((p: any) => ({
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
                        value={editForm?.EFlutePaperType ?? ""}
                        onChange={(e) =>
                          setEditForm((p: any) => ({
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
                        value={editForm?.EBLinerLayerPaperType ?? ""}
                        onChange={(e) =>
                          setEditForm((p: any) => ({
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
                        value={editForm?.BFlutePaperType ?? ""}
                        onChange={(e) =>
                          setEditForm((p: any) => ({
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
                        value={editForm?.BACLinerLayerPaperType ?? ""}
                        onChange={(e) =>
                          setEditForm((p: any) => ({
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
                        value={editForm?.ACFlutePaperType ?? ""}
                        onChange={(e) =>
                          setEditForm((p: any) => ({
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
                        value={editForm?.backLayerPaperType ?? ""}
                        onChange={(e) =>
                          setEditForm((p: any) => ({
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
                    value={editForm?.typeOfPrinter ?? ""}
                    onChange={(e) =>
                      setEditForm((p: any) => ({
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
