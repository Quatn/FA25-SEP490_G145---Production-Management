"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  useGetWaresQuery,
  useCreateWareMutation,
  useUpdateWareMutation,
  useDeleteWareMutation,
  useGetDeletedWaresQuery, // <-- added
} from "@/service/api/wareApiSlice";
import { useGetAllFluteCombinationQuery } from "@/service/api/fluteCombinationApiSlice";
import { useGetAllPrintColorsQuery } from "@/service/api/printColorApiSlice";
import { useGetAllWareManufacturingTypesQuery } from "@/service/api/wareManufacturingProcessTypeApiSlice";
import { useGetAllWareFinishingTypesQuery } from "@/service/api/wareFinishingProcessTypeApiSlice";
import WareCreateModal from "@/components/ware/WareCreateModal";
import WareEditModal from "@/components/ware/WareEditModal";
import {
  useGetPaperTypeQuery,
  useGetAllPaperTypesQuery,
} from "@/service/api/paperTypeApiSlice";
import { useGetAllPaperSuppliersQuery } from "@/service/api/paperSupplierApiSlice";
import { useConfirm } from "@/components/common/ConfirmModal";
import { toaster } from "@/components/ui/toaster";
import dynamic from "next/dynamic";
import WareAdvancedSearchModal from "@/components/ware/WareAdvancedSearchModal";

// --- new imports for privilege check ---
import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import check from "check-types";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";
// ------------------------------------------------

function getIdFromDoc(doc: any): string | undefined {
  if (doc === null || doc === undefined) return undefined;
  if (typeof doc === "string") return doc;
  if (typeof doc === "number") return String(doc);
  if (doc._id?.$oid) return String(doc._id.$oid);
  if (doc.$oid) return String(doc.$oid);
  if (doc._id) return String(doc._id);
  if (doc.id) return String(doc.id);
  try {
    if (typeof doc.toString === "function") return doc.toString();
  } catch {}
  return undefined;
}

function getCodeLabelForFlute(flute: any, fluteList: any[]) {
  if (!flute) return "-";
  if (typeof flute === "object" && (flute.code || flute.description)) {
    return flute.code ?? flute.description ?? "-";
  }
  const id = getIdFromDoc(flute);
  if (id) {
    const found = (fluteList || []).find((f: any) => {
      return getIdFromDoc(f) === id || f._id === id || f.code === id;
    });
    if (found) return found.code ?? found.description ?? id;
    return id;
  }
  return String(flute);
}

function labelsFromIdArray(
  arr: any[] = [],
  lookup: Map<string, any>,
  prefer = "code"
) {
  if (!Array.isArray(arr) || arr.length === 0) return "";
  return arr
    .map((p) => {
      if (!p) return "";
      if (typeof p === "object") {
        return p[prefer] ?? p.name ?? getIdFromDoc(p) ?? "";
      }
      const id = getIdFromDoc(p);
      if (!id) return String(p);
      const found = lookup.get(id);
      if (found) return found[prefer] ?? found.name ?? id;
      return id;
    })
    .filter(Boolean)
    .join(", ");
}

function arraysEqualById(a: any[] = [], b: any[] = []) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ida = getIdFromDoc(a[i]) ?? String(a[i]);
    const idb = getIdFromDoc(b[i]) ?? String(b[i]);
    if (ida !== idb) return false;
  }
  return true;
}

const Chip: React.FC<{ label: string; onRemove?: () => void }> = ({
  label,
  onRemove,
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "4px 8px",
      borderRadius: 16,
      background: "#f1f3f5",
      marginRight: 6,
      marginBottom: 6,
      fontSize: 13,
    }}
  >
    <span style={{ fontSize: 12 }}>{label}</span>
    {onRemove && (
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        style={{ padding: "0 6px", lineHeight: 1 }}
        onClick={onRemove}
      >
        ×
      </button>
    )}
  </span>
);

const MultiSelectInline: React.FC<{
  options?: any[];
  selected?: any[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  getLabel?: (optOrId: any) => string;
  placeholder?: string;
  id?: string;
}> = ({
  options = [],
  selected = [],
  onAdd,
  onRemove,
  getLabel,
  placeholder,
  id,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const idOf = (o: any) => {
    if (o === null || o === undefined) return "";
    if (typeof o === "string" || typeof o === "number") return String(o);
    if (o._id?.$oid) return String(o._id.$oid);
    if (o._id) return String(o._id);
    if (o.id) return String(o.id);
    if (o.code) return String(o.code);
    try {
      if (typeof o.toString === "function") return o.toString();
    } catch {}
    return String(o);
  };

  // build lookup map: many keys -> option
  const optionsMap = React.useMemo(() => {
    const m = new Map<string, any>();
    (options || []).forEach((opt) => {
      const primary = idOf(opt);
      if (primary) m.set(primary, opt);
      // also store alternative keys if present
      if (opt?._id) m.set(String(opt._id), opt);
      if (opt?._id?.$oid) m.set(String(opt._id.$oid), opt);
      if (opt?.id) m.set(String(opt.id), opt);
      if (opt?.code) m.set(String(opt.code), opt);
    });
    return m;
  }, [options]);

  const labelFromOptionOrId = (optOrId: any) => {
    if (getLabel) {
      try {
        const res = getLabel(optOrId);
        if (res !== undefined && res !== null) return String(res);
      } catch {}
    }

    if (optOrId && typeof optOrId === "object") {
      return optOrId.code ?? optOrId.name ?? idOf(optOrId);
    }

    const idv = idOf(optOrId);
    const found = optionsMap.get(idv);
    if (found) return found.code ?? found.name ?? idOf(found);
    return idv || "";
  };

  // normalize selected -> ids
  const selectedIds: string[] = (Array.isArray(selected) ? selected : []).map(
    (s) => idOf(s)
  );

  // available = options not selected
  const avail = (options || []).filter((o) => !selectedIds.includes(idOf(o)));

  // find option object given id string
  const findOptionById = (idv: string) => optionsMap.get(idv);

  // debug: show shapes / ids
  React.useEffect(() => {
    try {
      console.debug("MultiSelectInline render", {
        id,
        selectedIds,
        optionsIds: (options || []).map((o) => idOf(o)),
        availIds: (avail || []).map((o) => idOf(o)),
      });
    } catch {}
  }, [
    JSON.stringify(selectedIds),
    JSON.stringify(options.map((o) => idOf(o))),
    open,
  ]);

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((s) => !s)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setOpen((s) => !s);
            e.preventDefault();
          }
        }}
        style={{
          minHeight: 42,
          border: "1px solid #ced4da",
          borderRadius: 6,
          padding: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          background: "#fff",
          cursor: "pointer",
        }}
        id={id}
      >
        {selectedIds.length > 0 ? (
          selectedIds.map((idv) => {
            const opt = findOptionById(idv);
            const label = labelFromOptionOrId(opt ?? idv);
            return (
              <span
                key={idv}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 8px",
                  borderRadius: 16,
                  background: "#f1f3f5",
                  marginRight: 6,
                  marginBottom: 6,
                  fontSize: 13,
                }}
                // clicking the chip area should not toggle open
                onClick={(e) => e.stopPropagation()}
              >
                <span style={{ fontSize: 12 }}>{label}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  style={{ padding: "0 6px", lineHeight: 1 }}
                  // use onMouseDown so this runs before outer click/blur
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    try {
                      console.debug("MultiSelectInline onRemove called", {
                        idv,
                      });
                    } catch {}
                    onRemove(idv);
                    // do not close dropdown when removing
                  }}
                >
                  ×
                </button>
              </span>
            );
          })
        ) : (
          <span className="text-muted" style={{ fontSize: 14 }}>
            {placeholder ?? "-- choose --"}
          </span>
        )}

        <div style={{ marginLeft: "auto", paddingLeft: 8 }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            style={{ transform: open ? "rotate(180deg)" : "none" }}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            zIndex: 30,
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            border: "1px solid #ced4da",
            borderRadius: 6,
            background: "#fff",
            maxHeight: 200,
            overflow: "auto",
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            padding: 8,
          }}
        >
          {avail.length === 0 ? (
            <div className="text-muted" style={{ padding: 8 }}>
              No options
            </div>
          ) : (
            avail.map((opt) => {
              const idv = idOf(opt);
              return (
                <div
                  key={idv}
                  // use onMouseDown (not onClick) so selection fires before blur/focus ordering
                  onMouseDown={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      console.debug("MultiSelectInline onAdd called", { idv });
                    } catch {}
                    onAdd(idv);
                    // close dropdown so UI re-renders and shows the new chip
                    setOpen(false);
                  }}
                  style={{
                    padding: "6px 8px",
                    borderRadius: 6,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>{labelFromOptionOrId(opt)}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    +
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export const WareList: React.FC = () => {
  const confirm = useConfirm();

  // --- privilege check (manual as requested) ---
  const hydrating: boolean = useAppSelector((state) => state.auth.hydrating);
  const userState: UserState | null = useAppSelector(
    (state) => state.auth.userState
  );

  const EDIT_PRIVS: AnyAccessPrivileges[] = [
    "system-admin",
    "system-readWrite",
    "purchase-order-admin",
    "purchase-order-readWrite",
  ];

  const writeAllowed =
    check.nonEmptyArray(userState?.accessPrivileges) &&
    EDIT_PRIVS.find((priv) => userState!.accessPrivileges.includes(priv));

  const writeDisabled = !writeAllowed;
  // -------------------------------------------------

  const [search, setSearch] = useState("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any | null>(null);

  const waresQueryParams = React.useMemo(() => {
    if (activeFilters && Object.keys(activeFilters).length > 0) {
      return { ...activeFilters, page, limit };
    }
    // fallback to simple search field (maps to 'code' param for backend)
    return { page, limit, code: search ?? undefined };
  }, [activeFilters, page, limit, search]);

  const {
    data: waresResp,
    refetch: refetchWares,
    isLoading: waresLoading,
  } = useGetWaresQuery(waresQueryParams);

  const { data: fluteResp } = useGetAllFluteCombinationQuery();
  const fluteList: any[] = fluteResp?.data ?? fluteResp ?? [];

  const { data: printColorResp } = useGetAllPrintColorsQuery();
  const printColorList: any[] = printColorResp?.data ?? printColorResp ?? [];

  const { data: manufResp } = useGetAllWareManufacturingTypesQuery();
  const manufList: any[] = manufResp?.data ?? manufResp ?? [];

  const { data: finishingResp } = useGetAllWareFinishingTypesQuery();
  const finishingList: any[] = finishingResp?.data ?? finishingResp ?? [];

  const [createWare, { isLoading: creating }] = useCreateWareMutation();
  const [updateWare] = useUpdateWareMutation();
  const [deleteWare] = useDeleteWareMutation();

  // --- new: fetch paper types (paginated list endpoint) and paper suppliers
  // use a large limit so we get all items in one call (server supports limit param)
  const { data: paperTypeResp } = useGetPaperTypeQuery({
    page: 1,
    limit: 1000,
    search: "",
  });
  // paper types live in paperTypeResp.data.data (paginated). Normalize to array.
  const paperTypeList: any[] =
    paperTypeResp?.data?.data && Array.isArray(paperTypeResp.data.data)
      ? paperTypeResp.data.data
      : paperTypeResp?.data && Array.isArray(paperTypeResp.data)
      ? paperTypeResp.data
      : [];

  const { data: paperSupplierResp } = useGetAllPaperSuppliersQuery();
  const paperSupplierList: any[] =
    paperSupplierResp?.data ?? paperSupplierResp ?? [];

  // --- fetch deleted wares for client-side duplicate detection (large limit)
  const {
    data: deletedWaresResp,
    isLoading: isLoadingDeletedWares,
    refetch: refetchDeletedWares,
  } = useGetDeletedWaresQuery({ page: 1, limit: 1000, search: "" });

  // normalize deleted list to an array
  const deletedWaresList = React.useMemo(() => {
    const raw = deletedWaresResp?.data ?? deletedWaresResp ?? [];
    // sometimes transformResponse returns { data: [...] } or direct array
    const arr = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : raw?.data?.data && Array.isArray(raw.data.data)
      ? raw.data.data
      : [];
    return Array.isArray(arr) ? arr : [];
  }, [deletedWaresResp]);

  let wares: any[] = [];
  if (waresResp?.data?.data && Array.isArray(waresResp.data.data))
    wares = waresResp.data.data;
  else if (waresResp?.data && Array.isArray(waresResp.data))
    wares = waresResp.data;
  else if (Array.isArray(waresResp)) wares = waresResp;
  else if (waresResp && waresResp.data && Array.isArray(waresResp.data))
    wares = waresResp.data;
  else wares = [];

  const [displayWares, setDisplayWares] = useState<any[]>([]);

  const displayWaresRef = React.useRef<any[]>(displayWares);
  useEffect(() => {
    displayWaresRef.current = displayWares;
  }, [displayWares]);

  useEffect(() => {
    if (!arraysEqualById(displayWaresRef.current, wares)) {
      setDisplayWares(wares);
    }
  }, [wares]);

  const [createOpen, setCreateOpen] = useState(false);

  const [createForm, setCreateForm] = useState<any>({
    code: "",
    unitPrice: "",
    fluteCombination: "",
    wareWidth: "",
    wareLength: "",
    wareHeight: "",
    wareManufacturingProcessType: "",
    warePerBlank: 0,
    blankWidth: 0,
    blankLength: 0,
    flapLength: 0,
    margin: 0,
    paperWidth: 0,
    crossCutCount: 0,
    warePerBlankAdjustment: "",
    flapAdjustment: "",
    flapOverlapAdjustment: "",
    crossCutCountAdjustment: "",
    faceLayerPaperType: "",
    faceLayerPaperSupplier: "", // new
    EFlutePaperType: "",
    EBLinerLayerPaperType: "",
    BFlutePaperType: "",
    BACLinerLayerPaperType: "",
    ACFlutePaperType: "",
    backLayerPaperType: "",
    backLayerPaperSupplier: "", // new
    volume: "",
    printColors: [] as string[],
    typeOfPrinter: "",
    finishingProcesses: [] as string[],
    manufacturingProcesses: [] as string[],
    note: "",
  });

  // Debug observe createForm changes (helpful to see sequences)
  useEffect(() => {
    console.debug("WareList createForm.printColors:", createForm?.printColors);
  }, [JSON.stringify(createForm?.printColors)]);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  const openEdit = (ware: any) => {
    setEditForm({
      id: getIdFromDoc(ware) ?? ware._id ?? ware.code,
      code: ware.code ?? "",
      unitPrice:
        ware.unitPrice !== undefined && ware.unitPrice !== null
          ? String(ware.unitPrice)
          : "",
      fluteCombination:
        getIdFromDoc(ware.fluteCombination) ?? ware.fluteCombination?._id ?? "",
      wareWidth:
        ware.wareWidth !== undefined && ware.wareWidth !== null
          ? String(ware.wareWidth)
          : "",
      wareLength:
        ware.wareLength !== undefined && ware.wareLength !== null
          ? String(ware.wareLength)
          : "",
      wareHeight:
        ware.wareHeight !== undefined && ware.wareHeight !== null
          ? String(ware.wareHeight)
          : "",
      wareManufacturingProcessType:
        getIdFromDoc(ware.wareManufacturingProcessType) ??
        ware.wareManufacturingProcessType?._id ??
        "",
      warePerBlank: 0,
      blankWidth: 0,
      blankLength: 0,
      flapLength: 0,
      margin: 0,
      paperWidth:
        ware.paperWidth !== undefined && ware.paperWidth !== null
          ? String(ware.paperWidth)
          : 0,
      crossCutCount:
        ware.crossCutCount !== undefined && ware.crossCutCount !== null
          ? String(ware.crossCutCount)
          : 0,
      // NEW: prefill adjustment fields for edit form
      warePerBlankAdjustment:
        ware.warePerBlankAdjustment !== undefined &&
        ware.warePerBlankAdjustment !== null
          ? String(ware.warePerBlankAdjustment)
          : "",
      flapAdjustment:
        ware.flapAdjustment !== undefined && ware.flapAdjustment !== null
          ? String(ware.flapAdjustment)
          : "",
      flapOverlapAdjustment:
        ware.flapOverlapAdjustment !== undefined &&
        ware.flapOverlapAdjustment !== null
          ? String(ware.flapOverlapAdjustment)
          : "",
      crossCutCountAdjustment:
        ware.crossCutCountAdjustment !== undefined &&
        ware.crossCutCountAdjustment !== null
          ? String(ware.crossCutCountAdjustment)
          : "",
      volume:
        ware.volume !== undefined && ware.volume !== null
          ? String(ware.volume)
          : "",
      printColors:
        (ware.printColors || []).map((p: any) => getIdFromDoc(p) ?? p) ?? [],
      typeOfPrinter: ware.typeOfPrinter ?? "",
      finishingProcesses:
        (ware.finishingProcesses || []).map((p: any) => getIdFromDoc(p) ?? p) ??
        [],
      manufacturingProcesses:
        (ware.manufacturingProcesses || []).map(
          (p: any) => getIdFromDoc(p) ?? p
        ) ?? [],
      note: ware.note ?? "",
      faceLayerPaperType: ware.faceLayerPaperType ?? "",
      faceLayerPaperSupplier: ware.faceLayerPaperSupplier ?? "", // note: may not exist yet
      EFlutePaperType: ware.EFlutePaperType ?? "",
      EBLinerLayerPaperType: ware.EBLinerLayerPaperType ?? "",
      BFlutePaperType: ware.BFlutePaperType ?? "",
      BACLinerLayerPaperType: ware.BACLinerLayerPaperType ?? "",
      ACFlutePaperType: ware.ACFlutePaperType ?? "",
      backLayerPaperType: ware.backLayerPaperType ?? "",
      backLayerPaperSupplier: ware.backLayerPaperSupplier ?? "",
    });
    setEditOpen(true);
  };

  const addToCreateList = (
    field: "printColors" | "finishingProcesses" | "manufacturingProcesses",
    id: string
  ) => {
    if (!id) return;
    console.log("addToCreateList", field, id);
    // functional update to avoid race conditions
    setCreateForm((p: any) => {
      const arr = Array.isArray(p[field]) ? [...p[field]] : [];
      if (!arr.includes(id)) arr.push(id);
      return { ...p, [field]: arr };
    });
  };
  const removeFromCreateList = (
    field: "printColors" | "finishingProcesses" | "manufacturingProcesses",
    id: string
  ) => {
    setCreateForm((p: any) => ({
      ...p,
      [field]: (p[field] || []).filter((x: string) => x !== id),
    }));
  };

  const addToEditList = (
    field: "printColors" | "finishingProcesses" | "manufacturingProcesses",
    id: string
  ) => {
    if (!id) return;
    setEditForm((p: any) => {
      const arr = Array.isArray(p[field]) ? [...p[field]] : [];
      if (!arr.includes(id)) arr.push(id);
      return { ...p, [field]: arr };
    });
  };
  const removeFromEditList = (
    field: "printColors" | "finishingProcesses" | "manufacturingProcesses",
    id: string
  ) => {
    setEditForm((p: any) => ({
      ...p,
      [field]: (p[field] || []).filter((x: string) => x !== id),
    }));
  };

  const normalizePayloadRefs = (payload: any) => {
    payload.printColors = (payload.printColors || []).map(
      (x: any) => getIdFromDoc(x) ?? x
    );
    payload.finishingProcesses = (payload.finishingProcesses || []).map(
      (x: any) => getIdFromDoc(x) ?? x
    );
    payload.manufacturingProcesses = (payload.manufacturingProcesses || []).map(
      (x: any) => getIdFromDoc(x) ?? x
    );
    payload.fluteCombination =
      getIdFromDoc(payload.fluteCombination) ?? payload.fluteCombination;
    payload.wareManufacturingProcessType =
      getIdFromDoc(payload.wareManufacturingProcessType) ??
      payload.wareManufacturingProcessType;
    return payload;
  };

  const parsePositiveNumberOrNull = (s: string | number | undefined | null) => {
    // treat empty string / undefined / null as "missing" -> null
    if (s === undefined || s === null) return null;
    if (s === "") return null;
    const n = Number(s);
    if (!Number.isFinite(n)) return null;
    return n;
  };

  // --- new helper: check if a code already exists in the current list ---
  const isCodeTaken = (code: string, excludeId?: string | null) => {
    const norm = String(code ?? "")
      .trim()
      .toLowerCase();
    if (!norm) return false;
    const arr = displayWaresRef.current || [];
    return arr.some((w) => {
      const wCode = String(w?.code ?? "")
        .trim()
        .toLowerCase();
      if (!wCode) return false;
      const wid = getIdFromDoc(w) ?? w._id ?? w.code;
      if (excludeId && wid && String(wid) === String(excludeId)) return false;
      return wCode === norm;
    });
  };

  // check whether code exists in deleted list. excludeId optional for updates.
  const isCodeInDeleted = (code?: string, excludeId?: string | null) => {
    if (!code) return false;
    const norm = String(code).trim().toLowerCase();
    if (!norm) return false;
    return (deletedWaresList || []).some((d: any) => {
      const candidate = String(d?.code ?? d?.id ?? d?._id ?? d?.orderCode ?? "")
        .trim()
        .toLowerCase();
      if (!candidate) return false;
      // if excludeId provided and matches this deleted doc's id, don't treat as conflict
      const did = getIdFromDoc(d) ?? d._id ?? d.id ?? d.code;
      if (excludeId && did && String(did) === String(excludeId)) return false;
      return candidate === norm;
    });
  };

  const handleCreateSubmit = async () => {
    try {
      // double-check permission before performing API action
      if (writeDisabled) {
        toaster.create({
          description: "Bạn không có quyền thực hiện hành động này",
          type: "error",
        });
        return;
      }

      if (!createForm.code || String(createForm.code).trim() === "") {
        toaster.create({
          description: "Mã hàng không được để trống",
          type: "error",
        });
        return;
      }

      // uniqueness check (current active list)
      if (isCodeTaken(createForm.code)) {
        toaster.create({ description: "Mã hàng đã tồn tại", type: "error" });
        return;
      }

      // check deleted list (prevent creating a code that already existed but was soft-deleted)
      if (isCodeInDeleted(createForm.code)) {
        toaster.create({
          description: "Mã hàng đã tồn tại trong danh sách mã hàng đã xóa",
          type: "error",
        });
        return;
      }

      // optional guard if deleted list still loading (choose to fail-fast)
      if (isLoadingDeletedWares) {
        toaster.create({
          description:
            "Đang kiểm tra danh sách mã bị xóa — vui lòng thử lại sau",
          type: "error",
        });
        return;
      }

      const unitPrice = parsePositiveNumberOrNull(createForm.unitPrice);
      if (!unitPrice || unitPrice <= 0) {
        toaster.create({ description: "Đơn giá phải > 0", type: "error" });
        return;
      }

      const fluteCombination = String(createForm.fluteCombination || "");
      if (!fluteCombination) {
        toaster.create({ description: "Hãy chọn sóng", type: "error" });
        return;
      }

      const wareWidth = parsePositiveNumberOrNull(createForm.wareWidth);
      const wareLength = parsePositiveNumberOrNull(createForm.wareLength);
      if (!wareWidth || wareWidth <= 0) {
        toaster.create({ description: "Rộng phải > 0", type: "error" });
        return;
      }
      if (!wareLength || wareLength <= 0) {
        toaster.create({ description: "Dài phải > 0", type: "error" });
        return;
      }

      const wareManufacturingProcessType = String(
        createForm.wareManufacturingProcessType || ""
      );
      if (!wareManufacturingProcessType) {
        toaster.create({
          description: "Hãy chọn Kiểu SP gia công",
          type: "error",
        });
        return;
      }
      const volume = parsePositiveNumberOrNull(createForm.volume);

      const warePerBlankAdjustment = parsePositiveNumberOrNull(
        createForm.warePerBlankAdjustment
      );
      const flapAdjustment = parsePositiveNumberOrNull(
        createForm.flapAdjustment
      );
      const flapOverlapAdjustment = parsePositiveNumberOrNull(
        createForm.flapOverlapAdjustment
      );
      const crossCutCountAdjustment = parsePositiveNumberOrNull(
        createForm.crossCutCountAdjustment
      );

      if (!volume || volume <= 0) {
        toaster.create({ description: "Thể tích phải > 0", type: "error" });
        return;
      }

      if (warePerBlankAdjustment !== null && warePerBlankAdjustment < 1) {
        toaster.create({
          description: "Điều chỉnh số SP phải >= 1",
          type: "error",
        });
        return;
      }
      if (flapAdjustment !== null && flapAdjustment < 1) {
        toaster.create({
          description: "Điều chỉnh tai phải >= 1",
          type: "error",
        });
        return;
      }
      if (flapOverlapAdjustment !== null && flapOverlapAdjustment < 1) {
        toaster.create({
          description: "Điều chỉnh cộng cánh phải >= 1",
          type: "error",
        });
        return;
      }
      if (crossCutCountAdjustment !== null && crossCutCountAdjustment < 1) {
        toaster.create({
          description: "Điều chỉnh part SX phải >= 1",
          type: "error",
        });
        return;
      }

      if (
        !Array.isArray(createForm.printColors) ||
        createForm.printColors.length === 0
      ) {
        toaster.create({ description: "Chọn ít nhất 1 màu in", type: "error" });
        return;
      }

      const oneLayerSelected = [
        createForm.faceLayerPaperType,
        createForm.EFlutePaperType,
        createForm.EBLinerLayerPaperType,
        createForm.BFlutePaperType,
        createForm.BACLinerLayerPaperType,
        createForm.ACFlutePaperType,
        createForm.backLayerPaperType,
      ].some((v) => v && String(v).trim() !== "");
      if (!oneLayerSelected) {
        toaster.create({
          description: "Chọn ít nhất 1 mặt giấy",
          type: "error",
        });
        return;
      }

      const payload: any = {
        code: String(createForm.code).trim(),
        unitPrice: unitPrice,
        fluteCombination: fluteCombination,
        wareWidth: wareWidth,
        wareLength: wareLength,
        wareHeight: parsePositiveNumberOrNull(createForm.wareHeight),
        wareManufacturingProcessType: wareManufacturingProcessType,
        warePerBlank: 0,
        blankWidth: 0,
        blankLength: 0,
        flapLength: 0,
        margin: 0,
        paperWidth: 0,
        crossCutCount: 0,
        warePerBlankAdjustment: warePerBlankAdjustment,
        flapAdjustment: flapAdjustment,
        flapOverlapAdjustment: flapOverlapAdjustment,
        crossCutCountAdjustment: crossCutCountAdjustment,
        faceLayerPaperType:
          createForm.faceLayerPaperType && createForm.faceLayerPaperType !== ""
            ? createForm.faceLayerPaperType
            : null,
        EFlutePaperType:
          createForm.EFlutePaperType && createForm.EFlutePaperType !== ""
            ? createForm.EFlutePaperType
            : null,
        EBLinerLayerPaperType:
          createForm.EBLinerLayerPaperType &&
          createForm.EBLinerLayerPaperType !== ""
            ? createForm.EBLinerLayerPaperType
            : null,
        BFlutePaperType:
          createForm.BFlutePaperType && createForm.BFlutePaperType !== ""
            ? createForm.BFlutePaperType
            : null,
        BACLinerLayerPaperType:
          createForm.BACLinerLayerPaperType &&
          createForm.BACLinerLayerPaperType !== ""
            ? createForm.BACLinerLayerPaperType
            : null,
        ACFlutePaperType:
          createForm.ACFlutePaperType && createForm.ACFlutePaperType !== ""
            ? createForm.ACFlutePaperType
            : null,
        backLayerPaperType:
          createForm.backLayerPaperType && createForm.backLayerPaperType !== ""
            ? createForm.backLayerPaperType
            : null,
        // optional supplier fields stored separately if needed by backend (kept for compatibility)
        faceLayerPaperSupplier:
          createForm.faceLayerPaperSupplier &&
          createForm.faceLayerPaperSupplier !== ""
            ? createForm.faceLayerPaperSupplier
            : null,
        backLayerPaperSupplier:
          createForm.backLayerPaperSupplier &&
          createForm.backLayerPaperSupplier !== ""
            ? createForm.backLayerPaperSupplier
            : null,
        volume: volume,
        printColors: createForm.printColors || [],
        typeOfPrinter:
          createForm.typeOfPrinter && createForm.typeOfPrinter !== ""
            ? createForm.typeOfPrinter
            : null,
        finishingProcesses: createForm.finishingProcesses || [],
        manufacturingProcesses: createForm.manufacturingProcesses || [],
        note: createForm.note ? String(createForm.note) : "",
      };

      normalizePayloadRefs(payload);

      const resp: any = await createWare(payload).unwrap();

      let createdDoc = resp?.data ?? resp;
      if (createdDoc?.data) createdDoc = createdDoc.data;

      setDisplayWares((prev) => [createdDoc, ...prev]);

      setCreateOpen(false);
      setCreateForm({
        code: "",
        unitPrice: "",
        fluteCombination: "",
        wareWidth: "",
        wareLength: "",
        wareHeight: "",
        wareManufacturingProcessType: "",
        warePerBlank: 0,
        blankWidth: 0,
        blankLength: 0,
        flapLength: 0,
        margin: 0,
        paperWidth: 0,
        crossCutCount: 0,
        warePerBlankAdjustment: "",
        flapAdjustment: "",
        flapOverlapAdjustment: "",
        crossCutCountAdjustment: "",
        faceLayerPaperType: "",
        faceLayerPaperSupplier: "",
        EFlutePaperType: "",
        EBLinerLayerPaperType: "",
        BFlutePaperType: "",
        BACLinerLayerPaperType: "",
        ACFlutePaperType: "",
        backLayerPaperType: "",
        backLayerPaperSupplier: "",
        volume: "",
        printColors: [],
        typeOfPrinter: "",
        finishingProcesses: [],
        manufacturingProcesses: [],
        note: "",
      });

      setTimeout(() => {
        try {
          refetchWares?.();
        } catch {}
      }, 800);

      toaster.create({
        description: resp?.message ?? "Đã tạo",
        type: "success",
      });
    } catch (err: any) {
      console.error("Tạo thất bại", err);

      // server duplicate fallback
      const status = err?.status ?? err?.response?.status;
      const serverMsg = (err?.data?.message ?? err?.message ?? "") as string;
      if (
        status === 409 ||
        /duplicate|already exists|unique|exists/i.test(String(serverMsg))
      ) {
        toaster.create({
          description: "Mã hàng đã tồn tại trong danh sách mã hàng đã xóa",
          type: "error",
        });
        return;
      }

      toaster.create({
        description: err?.data?.message ?? err?.message ?? "Tạo thất bại",
        type: "error",
      });
    }
  };

  const handleEditSubmit = async () => {
    try {
      // double-check permission before performing API action
      if (writeDisabled) {
        toaster.create({
          description: "Bạn không có quyền thực hiện hành động này",
          type: "error",
        });
        return;
      }

      if (!editForm?.id) {
        toaster.create({ description: "Không tìm thấy mã này", type: "error" });
        return;
      }

      if (!editForm.code || String(editForm.code).trim() === "") {
        toaster.create({
          description: "Mã hàng không được để trống",
          type: "error",
        });
        return;
      }

      // uniqueness check (exclude current record id)
      if (isCodeTaken(editForm.code, editForm.id)) {
        toaster.create({ description: "Mã hàng đã tồn tại", type: "error" });
        return;
      }

      // check deleted list (prevent updating code to one that was soft-deleted)
      if (isCodeInDeleted(editForm.code, editForm.id)) {
        toaster.create({
          description: "Mã hàng đã tồn tại trong danh sách mã hàng đã xóa",
          type: "error",
        });
        return;
      }

      const unitPrice = parsePositiveNumberOrNull(editForm.unitPrice);
      if (!unitPrice || unitPrice <= 0) {
        toaster.create({ description: "Đơn giá phải > 0", type: "error" });
        return;
      }

      const fluteCombination = String(editForm.fluteCombination || "");
      if (!fluteCombination) {
        toaster.create({ description: "Hãy chọn sóng", type: "error" });
        return;
      }

      const wareWidth = parsePositiveNumberOrNull(editForm.wareWidth);
      const wareLength = parsePositiveNumberOrNull(editForm.wareLength);
      if (!wareWidth || wareWidth <= 0) {
        toaster.create({ description: "Rộng phải > 0", type: "error" });
        return;
      }
      if (!wareLength || wareLength <= 0) {
        toaster.create({ description: "Dài phải > 0", type: "error" });
        return;
      }

      const wareManufacturingProcessType = String(
        editForm.wareManufacturingProcessType || ""
      );
      if (!wareManufacturingProcessType) {
        toaster.create({
          description: "Hãy chọn Kiểu SP gia công",
          type: "error",
        });
        return;
      }
      const volume = parsePositiveNumberOrNull(editForm.volume);

      // parse new adjustments
      const warePerBlankAdjustment = parsePositiveNumberOrNull(
        editForm.warePerBlankAdjustment
      );
      const flapAdjustment = parsePositiveNumberOrNull(editForm.flapAdjustment);
      const flapOverlapAdjustment = parsePositiveNumberOrNull(
        editForm.flapOverlapAdjustment
      );
      const crossCutCountAdjustment = parsePositiveNumberOrNull(
        editForm.crossCutCountAdjustment
      );

      if (!volume || volume <= 0) {
        toaster.create({ description: "Thể tích phải > 0", type: "error" });
        return;
      }

      if (
        !Array.isArray(editForm.printColors) ||
        editForm.printColors.length === 0
      ) {
        toaster.create({ description: "Chọn ít nhất 1 màu in", type: "error" });
        return;
      }

      const oneLayerSelected = [
        editForm.faceLayerPaperType,
        editForm.EFlutePaperType,
        editForm.EBLinerLayerPaperType,
        editForm.BFlutePaperType,
        editForm.BACLinerLayerPaperType,
        editForm.ACFlutePaperType,
        editForm.backLayerPaperType,
      ].some((v) => v && String(v).trim() !== "");
      if (!oneLayerSelected) {
        toaster.create({
          description: "Chọn ít nhất 1 mặt giấy",
          type: "error",
        });
        return;
      }

      const payload: any = {
        code: String(editForm.code).trim(),
        unitPrice: unitPrice,
        fluteCombination: fluteCombination,
        wareWidth: wareWidth,
        wareLength: wareLength,
        wareHeight: parsePositiveNumberOrNull(editForm.wareHeight),
        wareManufacturingProcessType: wareManufacturingProcessType,
        // include adjustments in edit payload
        warePerBlankAdjustment: warePerBlankAdjustment,
        flapAdjustment: flapAdjustment,
        flapOverlapAdjustment: flapOverlapAdjustment,
        crossCutCountAdjustment: crossCutCountAdjustment,
        warePerBlank: 0,
        blankWidth: 0,
        blankLength: 0,
        flapLength: 0,
        margin: 0,
        paperWidth: 0,
        crossCutCount: 0,
        faceLayerPaperType:
          editForm.faceLayerPaperType && editForm.faceLayerPaperType !== ""
            ? editForm.faceLayerPaperType
            : null,
        EFlutePaperType:
          editForm.EFlutePaperType && editForm.EFlutePaperType !== ""
            ? editForm.EFlutePaperType
            : null,
        EBLinerLayerPaperType:
          editForm.EBLinerLayerPaperType &&
          editForm.EBLinerLayerPaperType !== ""
            ? editForm.EBLinerLayerPaperType
            : null,
        BFlutePaperType:
          editForm.BFlutePaperType && editForm.BFlutePaperType !== ""
            ? editForm.BFlutePaperType
            : null,
        BACLinerLayerPaperType:
          editForm.BACLinerLayerPaperType &&
          editForm.BACLinerLayerPaperType !== ""
            ? editForm.BACLinerLayerPaperType
            : null,
        ACFlutePaperType:
          editForm.ACFlutePaperType && editForm.ACFlutePaperType !== ""
            ? editForm.ACFlutePaperType
            : null,
        backLayerPaperType:
          editForm.backLayerPaperType && editForm.backLayerPaperType !== ""
            ? editForm.backLayerPaperType
            : null,
        // optional supplier fields
        faceLayerPaperSupplier:
          editForm.faceLayerPaperSupplier &&
          editForm.faceLayerPaperSupplier !== ""
            ? editForm.faceLayerPaperSupplier
            : null,
        backLayerPaperSupplier:
          editForm.backLayerPaperSupplier &&
          editForm.backLayerPaperSupplier !== ""
            ? editForm.backLayerPaperSupplier
            : null,
        volume: volume,
        printColors: editForm.printColors || [],
        typeOfPrinter:
          editForm.typeOfPrinter && editForm.typeOfPrinter !== ""
            ? editForm.typeOfPrinter
            : null,
        finishingProcesses: editForm.finishingProcesses || [],
        manufacturingProcesses: editForm.manufacturingProcesses || [],
        note: editForm.note ? String(editForm.note) : "",
      };

      normalizePayloadRefs(payload);

      const id = editForm.id;
      const res: any = await updateWare({ id, data: payload }).unwrap();

      let updatedDoc = res?.data ?? res;
      if (updatedDoc?.data) updatedDoc = updatedDoc.data;

      setDisplayWares((prev) =>
        prev.map((p) =>
          (getIdFromDoc(p) ?? p._id ?? p.code) ===
          (getIdFromDoc(updatedDoc) ?? updatedDoc._id ?? updatedDoc.code)
            ? updatedDoc
            : p
        )
      );

      setEditOpen(false);

      setTimeout(() => {
        try {
          refetchWares?.();
        } catch {}
      }, 800);

      toaster.create({
        description: res?.message ?? "Đã thay đổi thành công",
        type: "success",
      });
    } catch (err: any) {
      console.error("Update failed", err);

      // server duplicate fallback
      const status = err?.status ?? err?.response?.status;
      const serverMsg = (err?.data?.message ?? err?.message ?? "") as string;
      if (
        status === 409 ||
        /duplicate|already exists|unique|exists/i.test(String(serverMsg))
      ) {
        toaster.create({
          description: "Mã hàng đã tồn tại trong danh sách mã hàng đã xóa",
          type: "error",
        });
        return;
      }

      toaster.create({
        description: err?.data?.message ?? err?.message ?? "Update failed",
        type: "error",
      });
    }
  };

  const handleSoftDelete = async (w: any) => {
    // permission guard
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền thực hiện hành động này",
        type: "error",
      });
      return;
    }

    const ok = await confirm({
      title: "Delete Ware",
      description: `Delete ${w.code}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      destructive: true,
    });
    if (!ok) return;
    try {
      const id = getIdFromDoc(w) ?? w._id ?? w.code;
      const res: any = await deleteWare({ id }).unwrap();

      setDisplayWares((prev) =>
        prev.filter(
          (p) =>
            (getIdFromDoc(p) ?? p._id ?? p.code) !==
            (getIdFromDoc(w) ?? w._id ?? w.code)
        )
      );

      setTimeout(() => {
        try {
          refetchWares?.();
        } catch {}
      }, 800);

      toaster.create({
        description: res?.message ?? "Deleted",
        type: "success",
      });
    } catch (err: any) {
      console.error("delete failed", err);
      toaster.create({
        description: err?.data?.message ?? err?.message ?? "Delete failed",
        type: "error",
      });
    }
  };

  const fluteMap = useMemo(() => {
    const m = new Map<string, any>();
    (fluteList || []).forEach((f: any) => m.set(getIdFromDoc(f) ?? f.code, f));
    return m;
  }, [fluteList]);

  const printColorMap = useMemo(() => {
    const m = new Map<string, any>();
    (printColorList || []).forEach((p: any) =>
      m.set(getIdFromDoc(p) ?? p.code, p)
    );
    return m;
  }, [printColorList]);

  const manufMap = useMemo(() => {
    const m = new Map<string, any>();
    (manufList || []).forEach((p: any) => m.set(getIdFromDoc(p) ?? p.code, p));
    return m;
  }, [manufList]);

  const finishingMap = useMemo(() => {
    const m = new Map<string, any>();
    (finishingList || []).forEach((p: any) =>
      m.set(getIdFromDoc(p) ?? p.code, p)
    );
    return m;
  }, [finishingList]);

  const displayed = displayWares;

  // --- derive PAPER_LAYER_OPTIONS from paperTypeList ---
  // The desired format for each option: "<colorCode>/<width>/<grammage>"
  // For face/back, a supplier code may be inserted by the modal (as "<colorCode>/<supplierCode>/<width>/<grammage>")
  const PAPER_LAYER_OPTIONS: string[] = useMemo(() => {
    const set = new Set<string>();
    (paperTypeList || []).forEach((pt) => {
      try {
        const colorCode = pt?.paperColor?.code ?? pt?.paperColor;
        const width = pt?.width ?? pt?.w ?? "";
        const grammage = pt?.grammage ?? pt?.gsm ?? "";
        if (colorCode && width !== undefined && grammage !== undefined) {
          const key = `${String(colorCode)}/${String(width)}/${String(
            grammage
          )}`;
          set.add(key);
        }
      } catch {}
    });
    return Array.from(set);
  }, [paperTypeList]);

  const PAPER_LAYER_KEYS: { key: string; label: string }[] = [
    { key: "faceLayerPaperType", label: "Mặt" },
    { key: "EFlutePaperType", label: "Sóng E" },
    { key: "EBLinerLayerPaperType", label: "Lớp Giữa E/B" },
    { key: "BFlutePaperType", label: "Sóng B" },
    { key: "BACLinerLayerPaperType", label: "Lớp Giữa B A/C" },
    { key: "ACFlutePaperType", label: "Sóng A/C" },
    { key: "backLayerPaperType", label: "Đáy" },
  ];

  const TYPE_OF_PRINTER_OPTIONS = ["3M - A", "2M - C", "4M"];

  // pagination helpers (extract totalCount from likely response shapes)
  const totalCount =
    Number(
      waresResp?.data?.total ??
        waresResp?.total ??
        waresResp?.data?.meta?.total ??
        waresResp?.data?.meta?.count ??
        waresResp?.meta?.total ??
        0
    ) || 0;
  const totalPages =
    totalCount > 0 ? Math.max(1, Math.ceil(totalCount / limit)) : 1;
  const goToPage = (p: number) => {
    if (p < 1) p = 1;
    if (totalCount > 0 && p > totalPages) p = totalPages;
    setPage(p);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div>
          <strong>Mã hàng </strong>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="form-control"
            placeholder="Tìm theo mã"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
              if (activeFilters) setActiveFilters(null);
            }}
            style={{ minWidth: 300 }}
          />
          <button
            className="btn btn-outline-secondary"
            onClick={() => setAdvancedOpen(true)}
            title="Advanced search"
            style={{ marginLeft: 8, minWidth: 170 }}
          >
            Tìm kiếm nâng cao
          </button>
          <button
            className="btn btn-primary"
            style={{ minWidth: 69 }}
            onClick={() => {
              if (writeDisabled) return;
              setCreateOpen(true);
            }}
            disabled={writeDisabled}
            title={writeDisabled ? "Bạn không có quyền tạo" : "Tạo mới"}
          >
            + Tạo
          </button>
        </div>
      </div>

      {/* horizontal scroll container */}
      <div style={{ overflowX: "auto" }}>
        <table
          className="table table-bordered table-sm"
          style={{ minWidth: 1800, tableLayout: "fixed" }}
        >
          <colgroup>
            <col style={{ width: 140 }} />
            <col style={{ width: 60 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 220 }} />
            <col style={{ width: 160 }} />
            {PAPER_LAYER_KEYS.map((_, i) => (
              <col key={i} style={{ width: 140 }} />
            ))}
            <col style={{ width: 120 }} />
            <col style={{ width: 240 }} />
            <col style={{ width: 120 }} />
          </colgroup>
          <thead>
            {/* first header row */}
            <tr>
              <th rowSpan={2}>Mã hàng</th>
              <th rowSpan={2}>Sóng</th>
              <th rowSpan={2}>Đơn giá (đồng)</th>
              <th rowSpan={2}>Rộng (mm)</th>
              <th rowSpan={2}>Dài (mm)</th>
              <th rowSpan={2}>Cao (mm)</th>
              <th rowSpan={2}>Thể tích (m2)</th>
              <th rowSpan={2}>Kiểu SP gia công</th>
              <th rowSpan={2}>Công đoạn hoàn thiện</th>
              <th rowSpan={2}>Màu in</th>
              <th
                colSpan={PAPER_LAYER_KEYS.length}
                style={{ textAlign: "center", verticalAlign: "middle" }}
              >
                Mặt giấy
              </th>
              <th rowSpan={2}>Máy in</th>
              <th rowSpan={2}>Ghi chú</th>
              <th rowSpan={2}>Thao tác</th>
            </tr>

            <tr>
              {PAPER_LAYER_KEYS.map((k) => (
                <th key={k.key}>{k.label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {displayed.map((w) => {
              const fluteLabel = getCodeLabelForFlute(
                w.fluteCombination,
                fluteList
              );
              const pcolors = labelsFromIdArray(
                w.printColors,
                printColorMap,
                "code"
              );
              const manufTypeLabel =
                manufMap.get(getIdFromDoc(w.wareManufacturingProcessType) ?? "")
                  ?.name ??
                manufMap.get(getIdFromDoc(w.wareManufacturingProcessType) ?? "")
                  ?.code ??
                w.wareManufacturingProcessType?.name ??
                "-";
              const finishingProcesses = labelsFromIdArray(
                w.finishingProcesses,
                finishingMap,
                "code"
              );

              return (
                <tr key={getIdFromDoc(w) ?? w.code}>
                  <td>{w.code}</td>
                  <td>{fluteLabel}</td>
                  <td style={{ textAlign: "right" }}>{w.unitPrice ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>{w.wareWidth ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>{w.wareLength ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>{w.wareHeight ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>{w.volume ?? "-"}</td>
                  <td>{manufTypeLabel}</td>
                  <td style={{ maxWidth: 220 }}>{finishingProcesses}</td>
                  <td>{pcolors || "-"}</td>
                  {PAPER_LAYER_KEYS.map((lk) => (
                    <td
                      key={lk.key}
                      style={{
                        minWidth: 140,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        verticalAlign: "middle",
                        textAlign: "center",
                      }}
                      title={w?.[lk.key] ?? ""}
                    >
                      {w?.[lk.key] ? String(w[lk.key]) : "-"}
                    </td>
                  ))}

                  <td>{w.typeOfPrinter ?? "-"}</td>
                  <td
                    style={{
                      maxWidth: 240,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={w.note ?? ""}
                  >
                    {w.note ?? "-"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => {
                          if (writeDisabled) return;
                          openEdit(w);
                        }}
                        disabled={writeDisabled}
                        title={writeDisabled ? "Bạn không có quyền sửa" : "Sửa"}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => {
                          if (writeDisabled) return;
                          handleSoftDelete(w);
                        }}
                        disabled={writeDisabled}
                        title={writeDisabled ? "Bạn không có quyền xóa" : "Xóa"}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {!displayed.length && (
              <tr>
                <td colSpan={20} className="text-muted p-4">
                  Không có mã hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 8,
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            Trước
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => goToPage(page + 1)}
            disabled={totalCount > 0 ? page >= totalPages : false}
          >
            Sau
          </button>

          <div style={{ marginLeft: 8 }}>
            Trang {page} {totalCount > 0 && `of ${totalPages}`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span className="text-muted">Đi đến</span>
            <input
              type="number"
              value={page}
              min={1}
              max={totalPages}
              onChange={(e) => {
                const v = Number(e.target.value || 1);
                if (!Number.isFinite(v)) return;
                goToPage(Math.max(1, Math.floor(v)));
              }}
              style={{ width: 72 }}
              className="form-control form-control-sm"
            />
          </div>
        </div>
      </div>

      <WareCreateModal
        show={createOpen}
        onClose={() => setCreateOpen(false)}
        createForm={createForm}
        setCreateForm={setCreateForm}
        fluteList={fluteList}
        manufList={manufList}
        printColorList={printColorList}
        finishingList={finishingList}
        PAPER_LAYER_OPTIONS={PAPER_LAYER_OPTIONS}
        TYPE_OF_PRINTER_OPTIONS={TYPE_OF_PRINTER_OPTIONS}
        addToCreateList={addToCreateList}
        removeFromCreateList={removeFromCreateList}
        handleCreateSubmit={handleCreateSubmit}
        creating={creating}
        getIdFromDoc={getIdFromDoc}
        MultiSelectInline={MultiSelectInline}
        // pass paper type & supplier raw lists (useful for future logic/display)
        paperTypeList={paperTypeList}
        paperSupplierList={paperSupplierList}
      />

      <WareEditModal
        show={editOpen}
        onClose={() => setEditOpen(false)}
        editForm={editForm}
        setEditForm={setEditForm}
        fluteList={fluteList}
        manufList={manufList}
        printColorList={printColorList}
        finishingList={finishingList}
        PAPER_LAYER_OPTIONS={PAPER_LAYER_OPTIONS}
        TYPE_OF_PRINTER_OPTIONS={TYPE_OF_PRINTER_OPTIONS}
        addToEditList={addToEditList}
        removeFromEditList={removeFromEditList}
        handleEditSubmit={handleEditSubmit}
        getIdFromDoc={getIdFromDoc}
        MultiSelectInline={MultiSelectInline}
        paperTypeList={paperTypeList}
        paperSupplierList={paperSupplierList}
      />

      <WareAdvancedSearchModal
        show={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        onSearch={(filters: any) => {
          // normalize filters slightly: convert numeric strings to numbers where appropriate
          const normalized: any = { ...(filters || {}) };
          ["wareWidth", "wareLength", "wareHeight"].forEach((k) => {
            const v = (normalized as any)[k];
            if (v === "" || v === undefined || v === null)
              delete (normalized as any)[k];
            else if (typeof v === "string") {
              const n = Number(v);
              if (!Number.isFinite(n)) delete (normalized as any)[k];
              else (normalized as any)[k] = n;
            }
          });
          setActiveFilters(
            Object.keys(normalized).length === 0 ? null : normalized
          );
          setPage(1);
        }}
        initial={activeFilters ?? {}}
        fluteList={fluteList}
        printColorList={printColorList}
        manufList={manufList}
        MultiSelectInline={MultiSelectInline}
        getIdFromDoc={getIdFromDoc}
      />
    </div>
  );
};

export default WareList;
