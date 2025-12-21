// src/components/ware/WareAdvancedSearchModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

type GetWaresParams = {
  page?: number;
  limit?: number;
  code?: string;
  fluteCombination?: string; // code string e.g. "4BE"
  wareWidth?: number | string;
  wareLength?: number | string;
  wareHeight?: number | string;
  wareManufacturingProcessType?: string; // id
  printColor?: string[]; // array of printColor codes e.g. ["BK6F"]
};

type OptionLike =
  | { _id?: any; id?: any; code?: string; name?: string }
  | string;

type Props = {
  show: boolean;
  onClose: () => void;
  onSearch: (filters: GetWaresParams) => void;
  initial?: Partial<GetWaresParams>;
  fluteList?: OptionLike[]; // objects with code or strings
  printColorList?: OptionLike[]; // objects with code or strings
  manufList?: OptionLike[]; // manufacturing types (objects or strings)
  MultiSelectInline?: React.FC<any>; // pass your component from WareList
  getIdFromDoc?: (d: any) => string | undefined;
};

function idOf(opt: any): string {
  if (!opt && opt !== 0) return "";
  if (typeof opt === "string" || typeof opt === "number") return String(opt);
  if (opt._id?.$oid) return String(opt._id.$oid);
  if (opt._id) return String(opt._id);
  if (opt.id) return String(opt.id);
  if (opt.code) return String(opt.code);
  try {
    if (typeof opt.toString === "function") return opt.toString();
  } catch {}
  return "";
}

export default function WareAdvancedSearchModal({
  show,
  onClose,
  onSearch,
  initial,
  fluteList = [],
  printColorList = [],
  manufList = [],
  MultiSelectInline,
  getIdFromDoc,
}: Props) {
  const [code, setCode] = useState<string>(initial?.code ?? "");
  // flute selection will be stored as the flute code string (not id)
  const [fluteInput, setFluteInput] = useState<string>(
    initial?.fluteCombination ?? ""
  );
  const [wareWidth, setWareWidth] = useState<string | number | "">(
    initial?.wareWidth ?? ""
  );
  const [wareLength, setWareLength] = useState<string | number | "">(
    initial?.wareLength ?? ""
  );
  const [wareHeight, setWareHeight] = useState<string | number | "">(
    initial?.wareHeight ?? ""
  );
  const [wareManufacturingProcessType, setWareManufacturingProcessType] =
    useState<string>(initial?.wareManufacturingProcessType ?? "");

  // MultiSelectInline expects selected ids; we store selected ids here
  const [selectedPrintColorIds, setSelectedPrintColorIds] = useState<string[]>(
    (initial?.printColor && Array.isArray(initial.printColor)
      ? initial.printColor.map((c) => String(c))
      : []) as string[]
  );

  // Build a map id -> option for lookup (to convert id -> code)
  const printColorMap = useMemo(() => {
    const m = new Map<string, any>();
    (printColorList || []).forEach((p) => {
      const k = idOf(p);
      if (k) m.set(k, p);
      if (typeof p === "object") {
        if (p.code) m.set(String(p.code), p);
        if (p._id) m.set(String(p._id), p);
      }
    });
    return m;
  }, [printColorList]);

  // For flute dropdown suggestions: create list of flute codes (and allow free text)
  const fluteCodes = useMemo(() => {
    const set = new Set<string>();
    (fluteList || []).forEach((f) => {
      if (!f) return;
      if (typeof f === "string") {
        set.add(String(f));
      } else if (f?.code) {
        set.add(String(f.code));
      } else if (f?._id && f?.description) {
        set.add(String(f._id));
      }
    });
    return Array.from(set).sort();
  }, [fluteList]);

  // helpers for MultiSelectInline
  const doAddPrintColor = (id: string) => {
    setSelectedPrintColorIds((prev) => {
      if (!id) return prev;
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };
  const doRemovePrintColor = (id: string) => {
    setSelectedPrintColorIds((prev) => prev.filter((p) => p !== id));
  };

  useEffect(() => {
    if (!show) return;
    // when modal opens we want the internal state to reflect initial props
    setCode(initial?.code ?? "");
    setFluteInput(initial?.fluteCombination ?? "");
    setWareWidth(initial?.wareWidth ?? "");
    setWareLength(initial?.wareLength ?? "");
    setWareHeight(initial?.wareHeight ?? "");
    setWareManufacturingProcessType(
      initial?.wareManufacturingProcessType ?? ""
    );
    // initial.printColor expected to be array of codes OR ids. Try mapping codes -> ids where possible
    if (initial?.printColor && Array.isArray(initial.printColor)) {
      const ids: string[] = [];
      initial.printColor.forEach((pc) => {
        const pcStr = String(pc);
        // prefer to find id by code in printColorList
        let foundId = "";
        for (const opt of printColorList || []) {
          if (!opt) continue;
          const optCode =
            typeof opt === "object" && opt.code ? String(opt.code) : undefined;
          const optId = idOf(opt);
          if (optCode && optCode.toLowerCase() === pcStr.toLowerCase()) {
            foundId = optId;
            break;
          }
          // also allow if pc is id already
          if (optId === pcStr) {
            foundId = optId;
            break;
          }
        }
        if (foundId) ids.push(foundId);
        else ids.push(pcStr); // fallback to raw string
      });
      setSelectedPrintColorIds(ids);
    } else {
      setSelectedPrintColorIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const handleSearch = () => {
    // convert selected printColor ids -> codes (if available in map)
    const printColorCodes = selectedPrintColorIds
      .map((id) => {
        const opt = printColorMap.get(id);
        if (opt && typeof opt === "object" && opt.code) return String(opt.code);
        // if id looks like a code, just return it
        return id;
      })
      .filter(Boolean);

    const filters: GetWaresParams = {
      code:
        code && String(code).trim() !== "" ? String(code).trim() : undefined,
      fluteCombination:
        fluteInput && String(fluteInput).trim() !== ""
          ? String(fluteInput).trim()
          : undefined,
      wareWidth:
        wareWidth !== "" && wareWidth !== undefined && wareWidth !== null
          ? wareWidth
          : undefined,
      wareLength:
        wareLength !== "" && wareLength !== undefined && wareLength !== null
          ? wareLength
          : undefined,
      wareHeight:
        wareHeight !== "" && wareHeight !== undefined && wareHeight !== null
          ? wareHeight
          : undefined,
      wareManufacturingProcessType:
        wareManufacturingProcessType &&
        String(wareManufacturingProcessType).trim() !== ""
          ? String(wareManufacturingProcessType).trim()
          : undefined,
      printColor: printColorCodes.length > 0 ? printColorCodes : undefined,
    };

    onSearch(filters);
    onClose();
  };

  const handleClear = () => {
    setCode("");
    setFluteInput("");
    setWareWidth("");
    setWareLength("");
    setWareHeight("");
    setWareManufacturingProcessType("");
    setSelectedPrintColorIds([]);
    // also notify parent to clear active filters
    onSearch({});
    // keep modal open so user can continue, or close - choose to keep open for editing convenience
  };

  if (!show) return null;

  return (
    <div
      className="modal show"
      style={{ display: "block", background: "rgba(0,0,0,0.35)" }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-dialog modal-lg"
        role="document"
        style={{ maxWidth: 900 }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Tìm kiếm nâng cao</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            />
          </div>
          <div className="modal-body">
            <div className="row gx-3 gy-2">
              <div className="col-6">
                <label className="form-label">Mã hàng</label>
                <input
                  className="form-control"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Tìm theo mã (phần hoặc toàn bộ)"
                />
              </div>

              <div className="col-6">
                <label className="form-label">Sóng</label>
                {/* simple searchable input with datalist for convenience */}
                <input
                  list="flute-codes-list"
                  className="form-control"
                  value={fluteInput}
                  onChange={(e) => setFluteInput(e.target.value)}
                  placeholder="Nhập sóng hoặc chọn từ danh sách"
                />
                <datalist id="flute-codes-list">
                  {fluteCodes.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div className="col-4">
                <label className="form-label">Rộng (mm)</label>
                <input
                  type="number"
                  className="form-control"
                  value={wareWidth as any}
                  onChange={(e) => setWareWidth(e.target.value)}
                />
              </div>
              <div className="col-4">
                <label className="form-label">Dài (mm)</label>
                <input
                  type="number"
                  className="form-control"
                  value={wareLength as any}
                  onChange={(e) => setWareLength(e.target.value)}
                />
              </div>
              <div className="col-4">
                <label className="form-label">Cao (mm)</label>
                <input
                  type="number"
                  className="form-control"
                  value={wareHeight as any}
                  onChange={(e) => setWareHeight(e.target.value)}
                />
              </div>

              <div className="col-6">
                <label className="form-label">Kiểu SP gia công</label>
                <select
                  className="form-select"
                  value={wareManufacturingProcessType ?? ""}
                  onChange={(e) =>
                    setWareManufacturingProcessType(e.target.value)
                  }
                >
                  <option value="">-- Tất cả --</option>
                  {(manufList || []).map((m) => {
                    const val =
                      idOf(m) ||
                      (typeof m === "object" && m.code ? m.code : "");
                    const label =
                      typeof m === "object" && (m.name || m.code)
                        ? m.name ?? m.code
                        : String(m);
                    return (
                      <option key={String(val)} value={String(val)}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <div style={{ flex: 1 }}>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleClear}
              >
                Xóa hết
              </button>
            </div>
            <div>
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={onClose}
              >
                Đóng
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSearch}
              >
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
