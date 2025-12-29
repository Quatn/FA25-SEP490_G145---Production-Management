"use client";

import React from "react";
import { toaster } from "../ui/toaster";

type EditForm = any;

type MultiSelectInlineProps = {
  id?: string;
  options?: any[];
  selected?: any[];
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
  MultiSelectInline: React.ComponentType<MultiSelectInlineProps>;
  paperTypeList?: any[];
  paperSupplierList?: any[];
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
  paperTypeList = [],
  paperSupplierList = [],
}) => {
  const makeOnKeyDown =
    (allowDecimal = false) =>
    (e: React.KeyboardEvent) => {
      if (e.key === "-" || e.key === "e" || e.key === "+") e.preventDefault();
      if (!allowDecimal && e.key === ".") e.preventDefault();
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
        if (Number.isNaN(num)) return;
        setEditForm((p: any) => ({ ...(p ?? {}), [field]: num < 0 ? 0 : num }));
      }
    };

  const labelForPaperOption = (optString: string) => {
    const parts = optString.split("/");
    if (parts.length === 3) {
      const [colorCode, width, grammage] = parts;
      const found = (paperTypeList || []).find((pt) => {
        const code = pt?.paperColor?.code ?? pt?.paperColor;
        const w = String(pt?.width ?? pt?.w ?? "");
        const g = String(pt?.grammage ?? pt?.gsm ?? "");
        return (
          String(code) === String(colorCode) &&
          String(w) === String(width) &&
          String(g) === String(grammage)
        );
      });
      if (found) {
        const title =
          found?.paperColor?.title ?? found?.paperColor ?? colorCode;
        return `${title} - ${width} / ${grammage}`;
      }
      return `${colorCode} — ${width} / ${grammage}`;
    } else if (parts.length === 4) {
      const [colorCode, supplierCode, width, grammage] = parts;
      return `${colorCode}/${supplierCode} - ${width}/${grammage}`;
    }
    return optString;
  };

  const fluteToField: Record<string, string> = {
    faceLayer: "faceLayerPaperType",
    EFlute: "EFlutePaperType",
    EBLiner: "EBLinerLayerPaperType",
    BFlute: "BFlutePaperType",
    BACLiner: "BACLinerLayerPaperType",
    ACFlute: "ACFlutePaperType",
    backLayer: "backLayerPaperType",
  };

  const fluteKeyLabel: Record<string, string> = {
    faceLayer: "Mặt",
    EFlute: "Sóng E",
    EBLiner: "Lớp giữa E/B",
    BFlute: "Sóng B",
    BACLiner: "Lớp giữa B/A C",
    ACFlute: "Sóng AC",
    backLayer: "Đáy",
  };

  const selectedFluteDef = React.useMemo(() => {
    const sel = editForm?.fluteCombination ?? "";
    if (!sel) return undefined;
    return (fluteList || []).find((f) => {
      try {
        const id = getIdFromDoc(f);
        return String(id) === String(sel) || f._id === sel || f.code === sel;
      } catch {
        return false;
      }
    });
  }, [editForm?.fluteCombination, fluteList]);

  const displayedFlutes: string[] = (
    selectedFluteDef?.flutes && Array.isArray(selectedFluteDef.flutes)
      ? selectedFluteDef.flutes
      : []
  ) as string[];

  const shownBasePaper = (val: string) => {
    if (!val) return "";
    if (!val.includes("/")) return val;
    const parts = val.split("/");
    if (parts.length === 4) return `${parts[0]}/${parts[2]}/${parts[3]}`;
    return val;
  };

  const extractSupplierFromStored = (val: string) => {
    if (!val || !val.includes("/")) return "";
    const parts = val.split("/");
    if (parts.length === 4) return parts[1];
    return "";
  };

  const onFacePaperChange = (paperOpt: string) => {
    setEditForm((prev: any) => {
      const supplierCode = prev?.faceLayerPaperSupplier ?? "";
      let finalVal = paperOpt;
      if (supplierCode && supplierCode !== "") {
        const parts = paperOpt.split("/");
        if (parts.length === 3)
          finalVal = `${parts[0]}/${supplierCode}/${parts[1]}/${parts[2]}`;
      }
      return { ...(prev ?? {}), faceLayerPaperType: finalVal };
    });
  };

  const onBackPaperChange = (paperOpt: string) => {
    setEditForm((prev: any) => {
      const supplierCode = prev?.backLayerPaperSupplier ?? "";
      let finalVal = paperOpt;
      if (supplierCode && supplierCode !== "") {
        const parts = paperOpt.split("/");
        if (parts.length === 3)
          finalVal = `${parts[0]}/${supplierCode}/${parts[1]}/${parts[2]}`;
      }
      return { ...(prev ?? {}), backLayerPaperType: finalVal };
    });
  };

  const onFaceSupplierChange = (supplierCode: string) => {
    setEditForm((prev: any) => {
      const currentPaper = prev?.faceLayerPaperType ?? "";
      let basePaper = currentPaper;
      if (currentPaper && currentPaper.includes("/")) {
        const parts = currentPaper.split("/");
        if (parts.length === 4)
          basePaper = `${parts[0]}/${parts[2]}/${parts[3]}`;
      }
      let newFacePaper = "";
      if (basePaper) {
        const parts = basePaper.split("/");
        if (parts.length === 3 && supplierCode)
          newFacePaper = `${parts[0]}/${supplierCode}/${parts[1]}/${parts[2]}`;
        else newFacePaper = basePaper;
      } else newFacePaper = "";
      return {
        ...(prev ?? {}),
        faceLayerPaperSupplier: supplierCode,
        faceLayerPaperType: newFacePaper,
      };
    });
  };

  const onBackSupplierChange = (supplierCode: string) => {
    setEditForm((prev: any) => {
      const currentPaper = prev?.backLayerPaperType ?? "";
      let basePaper = currentPaper;
      if (currentPaper && currentPaper.includes("/")) {
        const parts = currentPaper.split("/");
        if (parts.length === 4)
          basePaper = `${parts[0]}/${parts[2]}/${parts[3]}`;
      }
      let newBackPaper = "";
      if (basePaper) {
        const parts = basePaper.split("/");
        if (parts.length === 3 && supplierCode)
          newBackPaper = `${parts[0]}/${supplierCode}/${parts[1]}/${parts[2]}`;
        else newBackPaper = basePaper;
      } else newBackPaper = "";
      return {
        ...(prev ?? {}),
        backLayerPaperSupplier: supplierCode,
        backLayerPaperType: newBackPaper,
      };
    });
  };

  const handleFluteChange = (newId: string) => {
    const def = (fluteList || []).find((f) => {
      try {
        const id = getIdFromDoc(f);
        return (
          String(id) === String(newId) || f._id === newId || f.code === newId
        );
      } catch {
        return false;
      }
    });
    const newFlutes = def?.flutes ?? [];
    setEditForm((prev: any) => {
      const next = { ...(prev ?? {}), fluteCombination: newId };
      Object.entries(fluteToField).forEach(([fluteKey, fieldName]) => {
        if (!newFlutes.includes(fluteKey)) {
          next[fieldName] = "";
          if (fluteKey === "faceLayer") next["faceLayerPaperSupplier"] = "";
          if (fluteKey === "backLayer") next["backLayerPaperSupplier"] = "";
        }
      });
      return next;
    });
  };

  React.useEffect(() => {
    if (!editForm) return;
    const updates: any = {};
    try {
      const faceFromStored = extractSupplierFromStored(
        editForm?.faceLayerPaperType ?? ""
      );
      const backFromStored = extractSupplierFromStored(
        editForm?.backLayerPaperType ?? ""
      );
      if (
        (!editForm?.faceLayerPaperSupplier ||
          editForm?.faceLayerPaperSupplier === "") &&
        faceFromStored
      )
        updates.faceLayerPaperSupplier = faceFromStored;
      if (
        (!editForm?.backLayerPaperSupplier ||
          editForm?.backLayerPaperSupplier === "") &&
        backFromStored
      )
        updates.backLayerPaperSupplier = backFromStored;
      if (Object.keys(updates).length > 0)
        setEditForm((p: any) => ({ ...(p ?? {}), ...updates }));
    } catch (err) {
      console.error("prefill suppliers failed", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editForm?.faceLayerPaperType, editForm?.backLayerPaperType]);

  // compute volume when dimensions change (same formula & zero->1 rule)
  React.useEffect(() => {
    if (!editForm) return;

    const toNum = (v: any) => {
      if (v === "" || v == null) return 0;
      const n = Number(v);
      return Number.isNaN(n) ? 0 : n;
    };

    const w = toNum(editForm?.wareWidth);
    const h = toNum(editForm?.wareHeight);
    const l = toNum(editForm?.wareLength);

    const wForFormula = w === 0 ? 1 : w;
    const hForFormula = h === 0 ? 1 : h;
    const lForFormula = l === 0 ? 1 : l;

    let newVol = (wForFormula * hForFormula * lForFormula) / 1000000000;
    newVol = Number(parseFloat(String(newVol)).toFixed(50));

    if (w === 0 || l === 0) {
      setEditForm((p: any) => ({ ...(p ?? {}), volume: 0 }));
    }

    else if (editForm?.volume !== newVol) {
      setEditForm((p: any) => ({ ...(p ?? {}), volume: newVol }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editForm?.wareWidth, editForm?.wareHeight, editForm?.wareLength]);

  React.useEffect(() => {
    try {
      console.debug(
        "WareEditModal displayed flutes:",
        displayedFlutes,
        "face/back stored:",
        editForm?.faceLayerPaperType,
        editForm?.faceLayerPaperSupplier,
        editForm?.backLayerPaperType,
        editForm?.backLayerPaperSupplier
      );
    } catch {}
  }, [
    JSON.stringify(displayedFlutes),
    editForm?.faceLayerPaperType,
    editForm?.faceLayerPaperSupplier,
    editForm?.backLayerPaperType,
    editForm?.backLayerPaperSupplier,
  ]);

  if (!show || !editForm) return null;

  const middleFlutes = displayedFlutes.filter(
    (k) => k !== "faceLayer" && k !== "backLayer"
  );

  // helpers to check whether supplier exists in supplier list
  const supplierKeyOf = (s: any) =>
    s == null ? "" : s.code ?? getIdFromDoc(s) ?? String(s);
  const faceCurrentSupplier = editForm?.faceLayerPaperSupplier ?? "";
  const backCurrentSupplier = editForm?.backLayerPaperSupplier ?? "";
  const faceSupplierPresent = (paperSupplierList || []).some(
    (s) => String(supplierKeyOf(s)) === String(faceCurrentSupplier)
  );
  const backSupplierPresent = (paperSupplierList || []).some(
    (s) => String(supplierKeyOf(s)) === String(backCurrentSupplier)
  );

  const onSubmitWrapper = async () => {
    const missing: string[] = [];
    displayedFlutes.forEach((fluteKey) => {
      const fieldName = fluteToField[fluteKey];
      const label = fluteKeyLabel[fluteKey] ?? fluteKey;
      const val = (editForm && editForm[fieldName]) || "";
      if (!val || String(val).trim() === "") {
        missing.push(label);
      } else if (fluteKey === "faceLayer") {
        const supp = editForm?.faceLayerPaperSupplier ?? "";
        if (!supp || String(supp).trim() === "")
          missing.push(`${label} - nhà cung cấp`);
      } else if (fluteKey === "backLayer") {
        const supp = editForm?.backLayerPaperSupplier ?? "";
        if (!supp || String(supp).trim() === "")
          missing.push(`${label} - nhà cung cấp`);
      }
    });
    if (missing.length > 0) {
      toaster.create({
        description: `Vui lòng chọn giá trị cho: ${missing.join(", ")}`,
        type: "error",
      });
      return;
    }
    try {
      await handleEditSubmit();
    } catch (err) {
      console.error(err);
    }
  };

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
                      disabled
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
                      onChange={(e) => handleFluteChange(e.target.value)}
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
                      disabled
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
                      placeholder="-- chọn màu in --"
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
                      placeholder="-- chọn công đoạn hoàn thiện --"
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
                {displayedFlutes.includes("faceLayer") && (
                  <div style={{ marginBottom: 10 }}>
                    <Label label="Mặt" required>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <select
                          className="form-control"
                          style={{ flex: "1 1 auto" }}
                          value={shownBasePaper(
                            editForm?.faceLayerPaperType ?? ""
                          )}
                          onChange={(e) => onFacePaperChange(e.target.value)}
                        >
                          <option value="">-- rỗng --</option>
                          {PAPER_LAYER_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {labelForPaperOption(o)}
                            </option>
                          ))}
                        </select>

                        <select
                          className="form-control"
                          style={{ width: 220 }}
                          value={editForm?.faceLayerPaperSupplier ?? ""}
                          onChange={(e) => onFaceSupplierChange(e.target.value)}
                        >
                          <option value="">-- nhà cung cấp --</option>

                          {/* show the current supplier as option if not present in supplier list */}
                          {faceCurrentSupplier && !faceSupplierPresent && (
                            <option
                              key={"__face_current"}
                              value={faceCurrentSupplier}
                            >
                              {faceCurrentSupplier}
                            </option>
                          )}

                          {(paperSupplierList || []).map((s) => (
                            <option
                              key={supplierKeyOf(s)}
                              value={supplierKeyOf(s)}
                            >
                              {s.code ?? supplierKeyOf(s)}{" "}
                              {s.name ? `- ${s.name}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Label>
                  </div>
                )}

                {middleFlutes.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                      marginBottom: 10,
                      flexWrap: "nowrap",
                    }}
                  >
                    {middleFlutes.map((fl) => {
                      const fieldName = fluteToField[fl];
                      const label = fluteKeyLabel[fl] ?? fl;
                      return (
                        <div key={fl} style={{ flex: "1 1 18%" }}>
                          <Label label={label} required>
                            <select
                              className="form-control"
                              value={editForm?.[fieldName] ?? ""}
                              onChange={(e) =>
                                setEditForm((p: any) => ({
                                  ...(p ?? {}),
                                  [fieldName]: e.target.value,
                                }))
                              }
                            >
                              <option value="">-- rỗng --</option>
                              {PAPER_LAYER_OPTIONS.map((o) => (
                                <option key={o} value={o}>
                                  {labelForPaperOption(o)}
                                </option>
                              ))}
                            </select>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {displayedFlutes.includes("backLayer") && (
                  <div>
                    <Label label="Đáy" required>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <select
                          className="form-control"
                          style={{ flex: "1 1 auto" }}
                          value={shownBasePaper(
                            editForm?.backLayerPaperType ?? ""
                          )}
                          onChange={(e) => onBackPaperChange(e.target.value)}
                        >
                          <option value="">-- rỗng --</option>
                          {PAPER_LAYER_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {labelForPaperOption(o)}
                            </option>
                          ))}
                        </select>

                        <select
                          className="form-control"
                          style={{ width: 220 }}
                          value={editForm?.backLayerPaperSupplier ?? ""}
                          onChange={(e) => onBackSupplierChange(e.target.value)}
                        >
                          <option value="">-- nhà cung cấp --</option>

                          {/* fallback current supplier if missing */}
                          {backCurrentSupplier && !backSupplierPresent && (
                            <option
                              key={"__back_current"}
                              value={backCurrentSupplier}
                            >
                              {backCurrentSupplier}
                            </option>
                          )}

                          {(paperSupplierList || []).map((s) => (
                            <option
                              key={supplierKeyOf(s)}
                              value={supplierKeyOf(s)}
                            >
                              {s.code ?? supplierKeyOf(s)}{" "}
                              {s.name ? `- ${s.name}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Label>
                  </div>
                )}
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
              <button className="btn btn-primary" onClick={onSubmitWrapper}>
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
