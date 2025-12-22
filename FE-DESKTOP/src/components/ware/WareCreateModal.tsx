"use client";

import React from "react";
import { toaster } from "../ui/toaster";

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
  // PAPER_LAYER_OPTIONS is now derived in parent and passed down
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
  // new: raw data lists for more accurate labels / supplier choices
  paperTypeList?: any[]; // raw paper type objects
  paperSupplierList?: any[]; // raw supplier objects
};

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
  paperTypeList = [],
  paperSupplierList = [],
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
          setCreateForm((p: any) => ({
            ...(p ?? {}),
            [el.name]: Math.max(0, num),
          }));
        } else {
          const num = Number(newVal);
          if (!Number.isNaN(num)) {
            setCreateForm((p: any) => ({
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
        setCreateForm((p: any) => ({ ...(p ?? {}), [field]: "" }));
        return;
      }
      if (integerOnly) {
        let num = Math.floor(Number(raw) || 0);
        if (num < 0) num = 0;
        setCreateForm((p: any) => ({ ...(p ?? {}), [field]: num }));
      } else {
        const num = Number(raw);
        if (Number.isNaN(num)) {
          return;
        }
        setCreateForm((p: any) => ({
          ...(p ?? {}),
          [field]: num < 0 ? 0 : num,
        }));
      }
    };

  // helper to build friendly labels for paper-type select options
  const labelForPaperOption = (optString: string) => {
    // optString is like "T/1000/1000"
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

  // mapping flute key -> createForm field name
  const fluteToField: Record<string, string> = {
    faceLayer: "faceLayerPaperType",
    EFlute: "EFlutePaperType",
    EBLiner: "EBLinerLayerPaperType",
    BFlute: "BFlutePaperType",
    BACLiner: "BACLinerLayerPaperType",
    ACFlute: "ACFlutePaperType",
    backLayer: "backLayerPaperType",
  };

  // labels for flute keys
  const fluteKeyLabel: Record<string, string> = {
    faceLayer: "Mặt",
    EFlute: "Sóng E",
    EBLiner: "Lớp giữa E/B",
    BFlute: "Sóng B",
    BACLiner: "Lớp giữa B/A C",
    ACFlute: "Sóng AC",
    backLayer: "Đáy",
  };

  // helper: return selected flute definition object
  const selectedFluteDef = React.useMemo(() => {
    const sel = createForm?.fluteCombination ?? "";
    if (!sel) return undefined;
    // find by id in fluteList
    return (fluteList || []).find((f) => {
      try {
        const id = getIdFromDoc(f);
        return String(id) === String(sel) || f._id === sel || f.code === sel;
      } catch {
        return false;
      }
    });
  }, [createForm?.fluteCombination, fluteList]);

  const displayedFlutes: string[] = (
    selectedFluteDef?.flutes && Array.isArray(selectedFluteDef.flutes)
      ? selectedFluteDef.flutes
      : []
  ) as string[];

  // helper to produce the base shown paper for selects when stored string may contain supplier
  const shownBasePaper = (val: string) => {
    if (!val) return "";
    if (!val.includes("/")) return val;
    const parts = val.split("/");
    if (parts.length === 4) {
      return `${parts[0]}/${parts[2]}/${parts[3]}`;
    }
    return val;
  };

  // handle flute combination change: update fluteCombination and clear/keep layer fields
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

    setCreateForm((prev: any) => {
      const next = { ...(prev ?? {}), fluteCombination: newId };
      // for each known flute field, keep if it still exists, otherwise clear
      Object.entries(fluteToField).forEach(([fluteKey, fieldName]) => {
        if (!newFlutes.includes(fluteKey)) {
          next[fieldName] = "";
          // clear suppliers for face/back when they're removed
          if (fluteKey === "faceLayer") next["faceLayerPaperSupplier"] = "";
          if (fluteKey === "backLayer") next["backLayerPaperSupplier"] = "";
        } else {
          // keep existing value (do nothing)
        }
      });
      return next;
    });
  };

  // set face/back paper (paperOpt is base 3-part string); use functional update to avoid stale state
  const onFacePaperChange = (paperOpt: string) => {
    setCreateForm((prev: any) => {
      const supplierCode = prev?.faceLayerPaperSupplier ?? "";
      let finalVal = paperOpt;
      if (supplierCode && supplierCode !== "") {
        const parts = paperOpt.split("/");
        if (parts.length === 3) {
          finalVal = `${parts[0]}/${supplierCode}/${parts[1]}/${parts[2]}`;
        }
      }
      return { ...(prev ?? {}), faceLayerPaperType: finalVal };
    });
  };

  const onBackPaperChange = (paperOpt: string) => {
    setCreateForm((prev: any) => {
      const supplierCode = prev?.backLayerPaperSupplier ?? "";
      let finalVal = paperOpt;
      if (supplierCode && supplierCode !== "") {
        const parts = paperOpt.split("/");
        if (parts.length === 3) {
          finalVal = `${parts[0]}/${supplierCode}/${parts[1]}/${parts[2]}`;
        }
      }
      return { ...(prev ?? {}), backLayerPaperType: finalVal };
    });
  };

  // supplier change: update supplier code and recompute final stored paper string from previous base
  const onFaceSupplierChange = (supplierCode: string) => {
    setCreateForm((prev: any) => {
      const currentPaper = prev?.faceLayerPaperType ?? "";
      let basePaper = currentPaper;
      if (currentPaper && currentPaper.includes("/")) {
        const parts = currentPaper.split("/");
        if (parts.length === 4) {
          basePaper = `${parts[0]}/${parts[2]}/${parts[3]}`;
        }
      }
      let newFacePaper = "";
      if (basePaper) {
        const parts = basePaper.split("/");
        if (parts.length === 3 && supplierCode) {
          newFacePaper = `${parts[0]}/${supplierCode}/${parts[1]}/${parts[2]}`;
        } else {
          newFacePaper = basePaper;
        }
      } else {
        newFacePaper = "";
      }
      return {
        ...(prev ?? {}),
        faceLayerPaperSupplier: supplierCode,
        faceLayerPaperType: newFacePaper,
      };
    });
  };

  const onBackSupplierChange = (supplierCode: string) => {
    setCreateForm((prev: any) => {
      const currentPaper = prev?.backLayerPaperType ?? "";
      let basePaper = currentPaper;
      if (currentPaper && currentPaper.includes("/")) {
        const parts = currentPaper.split("/");
        if (parts.length === 4) {
          basePaper = `${parts[0]}/${parts[2]}/${parts[3]}`;
        }
      }
      let newBackPaper = "";
      if (basePaper) {
        const parts = basePaper.split("/");
        if (parts.length === 3 && supplierCode) {
          newBackPaper = `${parts[0]}/${supplierCode}/${parts[1]}/${parts[2]}`;
        } else {
          newBackPaper = basePaper;
        }
      } else {
        newBackPaper = "";
      }
      return {
        ...(prev ?? {}),
        backLayerPaperSupplier: supplierCode,
        backLayerPaperType: newBackPaper,
      };
    });
  };

  // Compute volume automatically and store in createForm.volume
  React.useEffect(() => {
    // defensive: createForm may be null
    const wRaw = createForm?.wareWidth;
    const hRaw = createForm?.wareHeight;
    const lRaw = createForm?.wareLength;

    const toNum = (v: any) => {
      if (v === "" || v == null) return 0;
      const n = Number(v);
      return Number.isNaN(n) ? 0 : n;
    };

    const w = toNum(wRaw);
    const h = toNum(hRaw);
    const l = toNum(lRaw);

    const wForFormula = w === 0 ? 1 : w;
    const hForFormula = h === 0 ? 1 : h;
    const lForFormula = l === 0 ? 1 : l;

    let newVol = (wForFormula * hForFormula * lForFormula) / 1000000000; // m3
    // round to 3 decimal places
    newVol = Number(parseFloat(String(newVol)).toFixed(5));

    // Only update if different (loose compare to handle "" -> number)
    if (createForm?.volume !== newVol) {
      setCreateForm((p: any) => ({ ...(p ?? {}), volume: newVol }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createForm?.wareWidth, createForm?.wareHeight, createForm?.wareLength]);

  // submit wrapper: require that all displayed layers have value (face/back also need supplier)
  const onSubmitWrapper = async () => {
    const missing: string[] = [];

    displayedFlutes.forEach((fluteKey) => {
      const fieldName = fluteToField[fluteKey];
      const label = fluteKeyLabel[fluteKey] ?? fluteKey;
      const val = (createForm && createForm[fieldName]) || "";
      if (!val || String(val).trim() === "") {
        missing.push(label);
      } else if (fluteKey === "faceLayer") {
        const supp = createForm?.faceLayerPaperSupplier ?? "";
        if (!supp || String(supp).trim() === "") {
          missing.push(`${label} - nhà cung cấp`);
        }
      } else if (fluteKey === "backLayer") {
        const supp = createForm?.backLayerPaperSupplier ?? "";
        if (!supp || String(supp).trim() === "") {
          missing.push(`${label} - nhà cung cấp`);
        }
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
      await handleCreateSubmit();
    } catch (err) {
      // parent's handler will handle error messages
      console.error(err);
    }
  };

  // debug
  React.useEffect(() => {
    try {
      console.debug(
        "Displayed flutes:",
        displayedFlutes,
        "face/back stored:",
        createForm?.faceLayerPaperType,
        createForm?.faceLayerPaperSupplier,
        createForm?.backLayerPaperType,
        createForm?.backLayerPaperSupplier
      );
    } catch {}
  }, [
    JSON.stringify(displayedFlutes),
    createForm?.faceLayerPaperType,
    createForm?.faceLayerPaperSupplier,
    createForm?.backLayerPaperType,
    createForm?.backLayerPaperSupplier,
  ]);

  if (!show) return null;

  // middle layers are displayedFlutes excluding faceLayer/backLayer
  const middleFlutes = displayedFlutes.filter(
    (k) => k !== "faceLayer" && k !== "backLayer"
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
                      name="unitPrice"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      value={createForm?.unitPrice ?? ""}
                      onChange={handleNumberChange("unitPrice", true)}
                      onKeyDown={makeOnKeyDown(false)}
                      onPaste={makeOnPaste(false, true)}
                      onWheel={onWheelPreventChange}
                    />
                  </Label>

                  <Label label="Sóng" required>
                    <select
                      className="form-control"
                      value={createForm?.fluteCombination ?? ""}
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
                      name="wareWidth"
                      min={0}
                      step="any"
                      inputMode="numeric"
                      value={createForm?.wareWidth ?? ""}
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
                      value={createForm?.wareLength ?? ""}
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
                      value={createForm?.wareHeight ?? ""}
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
                      value={createForm?.volume ?? ""}
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
                      value={createForm?.warePerBlankAdjustment ?? ""}
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
                      value={createForm?.flapAdjustment ?? ""}
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
                      value={createForm?.flapOverlapAdjustment ?? ""}
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
                      value={createForm?.crossCutCountAdjustment ?? ""}
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
                {/* ROW 1: faceLayer if present */}
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
                            createForm?.faceLayerPaperType ?? ""
                          )}
                          onChange={(e) => onFacePaperChange(e.target.value)}
                          required
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
                          value={createForm?.faceLayerPaperSupplier ?? ""}
                          onChange={(e) => onFaceSupplierChange(e.target.value)}
                          required
                        >
                          <option value="">-- nhà cung cấp --</option>
                          {(paperSupplierList || []).map((s) => (
                            <option
                              key={getIdFromDoc(s) ?? s.code}
                              value={s.code ?? getIdFromDoc(s)}
                            >
                              {s.code} {s.name ? `- ${s.name}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Label>
                  </div>
                )}

                {/* ROW 2: middle layers (compact). Render in provided order */}
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
                              value={createForm?.[fieldName] ?? ""}
                              onChange={(e) =>
                                setCreateForm((p: any) => ({
                                  ...(p ?? {}),
                                  [fieldName]: e.target.value,
                                }))
                              }
                              required
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

                {/* ROW 3: backLayer if present */}
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
                            createForm?.backLayerPaperType ?? ""
                          )}
                          onChange={(e) => onBackPaperChange(e.target.value)}
                          required
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
                          value={createForm?.backLayerPaperSupplier ?? ""}
                          onChange={(e) => onBackSupplierChange(e.target.value)}
                          required
                        >
                          <option value="">-- nhà cung cấp --</option>
                          {(paperSupplierList || []).map((s) => (
                            <option
                              key={getIdFromDoc(s) ?? s.code}
                              value={s.code ?? getIdFromDoc(s)}
                            >
                              {s.code} {s.name ? `- ${s.name}` : ""}
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
                onClick={onSubmitWrapper}
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
