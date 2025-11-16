// src/components/ware-management/WareList.tsx
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  useGetWaresQuery,
  useGetDeletedWaresQuery,
  useCreateWareMutation,
  useUpdateWareMutation,
  useDeleteWareMutation,
  useRestoreWareMutation,
} from "@/service/api/wareApiSlice";
import { useGetAllFluteCombinationQuery } from "@/service/api/fluteCombinationApiSlice";
import { useGetAllPrintColorsQuery } from "@/service/api/printColorApiSlice";
import { useGetAllWareManufacturingTypesQuery } from "@/service/api/wareManufacturingProcessTypeApiSlice";
import { useGetAllWareFinishingTypesQuery } from "@/service/api/wareFinishingProcessTypeApiSlice";
import { useGetAllManufacturingProcessesQuery } from "@/service/api/manufacturingProcessApiSlice";

/** Helpers to normalize IDs and labels across shapes */
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

/** UI: small rounded chip */
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

/**
 * Inline multi-select control:
 * - shows chips inline (replacing placeholder when at least one is selected)
 * - clicking the field toggles dropdown
 * - click option to add it immediately
 * - supports onAdd(id), onRemove(id)
 *
 * options: array of { _id/$oid/other id, code?, name? }
 * selected: array of ids (string)
 * labelKey: "code" or "name" (what to show on the option/chip)
 */
const MultiSelectInline: React.FC<{
  options: any[];
  selected: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  getLabel?: (opt: any) => string;
  placeholder?: string;
  id?: string; // optional id for testability/accessibility
}> = ({ options, selected, onAdd, onRemove, getLabel, placeholder, id }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const labelOf = (opt: any) => {
    if (getLabel) return getLabel(opt);
    if (!opt) return "";
    if (typeof opt === "string") return opt;
    return opt.code ?? opt.name ?? getIdFromDoc(opt) ?? "";
  };

  // available options (not selected)
  const avail = (options || []).filter(
    (o) => !selected.includes(getIdFromDoc(o) ?? String(o))
  );

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
          background: open ? "#fff" : "#fff",
          cursor: "pointer",
        }}
        id={id}
      >
        {selected && selected.length > 0 ? (
          selected.map((idv) => (
            <Chip
              key={idv}
              label={labelOf(options.find((o) => getIdFromDoc(o) === idv))}
              onRemove={() => onRemove(idv)}
            />
          ))
        ) : (
          <span className="text-muted" style={{ fontSize: 14 }}>
            {placeholder ?? "-- choose --"}
          </span>
        )}

        {/* caret */}
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

      {/* dropdown */}
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
              const idv = getIdFromDoc(opt) ?? String(opt);
              return (
                <div
                  key={idv}
                  onClick={() => {
                    onAdd(idv);
                    // keep dropdown open so user can add multiple quickly
                    // if you'd prefer to close after add, uncomment next line:
                    // setOpen(false);
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
                  <div>{labelOf(opt)}</div>
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
  const [search, setSearch] = useState("");
  const [page] = useState(1);
  const [limit] = useState(200);

  // main paginated fetch (take refetch)
  const {
    data: waresResp,
    refetch: refetchWares,
    isLoading: waresLoading,
  } = useGetWaresQuery({ page, limit, search });

  // deleted list (may be optional in your api slice)
  const deletedQuery = useGetDeletedWaresQuery
    ? useGetDeletedWaresQuery({ page: 1, limit: 200 })
    : null;
  const deletedResp = deletedQuery?.data;
  const refetchDeleted = deletedQuery?.refetch;

  // reference lists
  const { data: fluteResp } = useGetAllFluteCombinationQuery();
  const fluteList: any[] = fluteResp?.data ?? fluteResp ?? [];

  const { data: printColorResp } = useGetAllPrintColorsQuery();
  const printColorList: any[] = printColorResp?.data ?? printColorResp ?? [];

  const { data: manufResp } = useGetAllWareManufacturingTypesQuery();
  const manufList: any[] = manufResp?.data ?? manufResp ?? [];

  const { data: finishingResp } = useGetAllWareFinishingTypesQuery();
  const finishingList: any[] = finishingResp?.data ?? finishingResp ?? [];

  const { data: mpResp } = useGetAllManufacturingProcessesQuery();
  const mpList: any[] = mpResp?.data ?? mpResp ?? [];

  // mutations
  const [createWare, { isLoading: creating }] = useCreateWareMutation();
  const [updateWare] = useUpdateWareMutation();
  const [deleteWare] = useDeleteWareMutation();
  const [restoreWare] = useRestoreWareMutation();

  // ----- normalize wares array from various shapes -----
  let wares: any[] = [];
  if (waresResp?.data?.data && Array.isArray(waresResp.data.data))
    wares = waresResp.data.data;
  else if (waresResp?.data && Array.isArray(waresResp.data))
    wares = waresResp.data;
  else if (Array.isArray(waresResp)) wares = waresResp;
  else if (waresResp && waresResp.data && Array.isArray(waresResp.data))
    wares = waresResp.data;
  else wares = [];

  const deletedWaresFromQuery: any[] =
    deletedResp?.data?.data ?? deletedResp?.data ?? [];

  // ------------------- local display state (optimistic) -------------------
  const [displayWares, setDisplayWares] = useState<any[]>([]);
  const [displayDeletedWares, setDisplayDeletedWares] = useState<any[]>([]);

  // seed local display state when query changes (keeps ordering from server)
  const displayWaresRef = React.useRef<any[]>(displayWares);
  useEffect(() => {
    displayWaresRef.current = displayWares;
  }, [displayWares]);

  useEffect(() => {
    if (!arraysEqualById(displayWaresRef.current, wares)) {
      setDisplayWares(wares);
    }
  }, [wares]);

  const displayDeletedRef = React.useRef<any[]>(displayDeletedWares);
  useEffect(() => {
    displayDeletedRef.current = displayDeletedWares;
  }, [displayDeletedWares]);

  useEffect(() => {
    if (!arraysEqualById(displayDeletedRef.current, deletedWaresFromQuery)) {
      setDisplayDeletedWares(deletedWaresFromQuery);
    }
  }, [deletedWaresFromQuery]);

  // modal/form state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<any>({
    code: "",
    unitPrice: 0,
    fluteCombination: "",
    wareWidth: 0,
    wareLength: 0,
    wareHeight: 0,
    wareManufacturingProcessType: "",
    warePerBlankAdjustment: 0,
    flapAdjustment: 0,
    flapOverlapAdjustment: 0,
    crossCutCountAdjustment: 0,
    warePerBlank: 0,
    blankWidth: 0,
    blankLength: 0,
    flapLength: 0,
    margin: 0,
    paperWidth: 0,
    crossCutCount: 0,
    faceLayerPaperType: "",
    EFlutePaperType: "",
    EBLinerLayerPaperType: "",
    BFlutePaperType: "",
    BACLinerLayerPaperType: "",
    ACFlutePaperType: "",
    backLayerPaperType: "",
    volume: 0,
    warePerSet: 0,
    warePerCombinedSet: 0,
    horizontalWareSplit: 0,
    printColors: [] as string[],
    typeOfPrinter: "",
    finishingProcesses: [] as string[],
    manufacturingProcesses: [] as string[],
    note: "",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  // helpers to open edit modal with normalized ids
  const openEdit = (ware: any) => {
    setEditForm({
      id: getIdFromDoc(ware) ?? ware._id ?? ware.code,
      code: ware.code ?? "",
      unitPrice: ware.unitPrice ?? 0,
      fluteCombination:
        getIdFromDoc(ware.fluteCombination) ?? ware.fluteCombination?._id ?? "",
      wareWidth: ware.wareWidth ?? 0,
      wareLength: ware.wareLength ?? 0,
      wareHeight: ware.wareHeight ?? 0,
      wareManufacturingProcessType:
        getIdFromDoc(ware.wareManufacturingProcessType) ??
        ware.wareManufacturingProcessType?._id ??
        "",
      warePerBlankAdjustment: ware.warePerBlankAdjustment ?? 0,
      flapAdjustment: ware.flapAdjustment ?? 0,
      flapOverlapAdjustment: ware.flapOverlapAdjustment ?? 0,
      crossCutCountAdjustment: ware.crossCutCountAdjustment ?? 0,
      warePerBlank: ware.warePerBlank ?? 0,
      blankWidth: ware.blankWidth ?? 0,
      blankLength: ware.blankLength ?? 0,
      flapLength: ware.flapLength ?? 0,
      margin: ware.margin ?? 0,
      paperWidth: ware.paperWidth ?? 0,
      crossCutCount: ware.crossCutCount ?? 0,
      volume: ware.volume ?? 0,
      warePerSet: ware.warePerSet ?? 0,
      warePerCombinedSet: ware.warePerCombinedSet ?? 0,
      horizontalWareSplit: ware.horizontalWareSplit ?? 0,
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
    });
    setEditOpen(true);
  };

  // helpers to add/remove items from multi lists (create)
  const addToCreateList = (
    field: "printColors" | "finishingProcesses" | "manufacturingProcesses",
    id: string
  ) => {
    if (!id) return;
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

  // helpers for edit form
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

  // payload helpers for create/update
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

  // create handler (optimistic update + background refetch)
  const handleCreateSubmit = async () => {
    try {
      const payload: any = { ...createForm };
      normalizePayloadRefs(payload);
      const resp: any = await createWare(payload).unwrap();

      // extract created doc from response (guard various response shapes)
      let createdDoc = resp?.data ?? resp;
      if (createdDoc?.data) createdDoc = createdDoc.data;

      // optimistic: add to local list
      setDisplayWares((prev) => [createdDoc, ...prev]);

      // close modal
      setCreateOpen(false);
      setCreateForm((p: any) => ({
        ...p,
        code: "",
        note: "",
        printColors: [],
        finishingProcesses: [],
        manufacturingProcesses: [],
      }));

      // background refetch to sync with server (small delay to reduce jump)
      setTimeout(() => {
        try {
          refetchWares?.();
          refetchDeleted?.();
        } catch {}
      }, 800);

      alert(resp?.message ?? "Created");
    } catch (err: any) {
      console.error("Create ware failed", err);
      alert(err?.data?.message ?? err?.message ?? "Create failed");
    }
  };

  // edit handler (optimistic)
  const handleEditSubmit = async () => {
    try {
      const id = editForm.id;
      const payload: any = { ...editForm };
      delete payload.id;
      normalizePayloadRefs(payload);
      const res: any = await updateWare({ id, data: payload }).unwrap();

      // extract updated doc
      let updatedDoc = res?.data ?? res;
      if (updatedDoc?.data) updatedDoc = updatedDoc.data;

      // optimistic replace
      setDisplayWares((prev) =>
        prev.map((p) =>
          (getIdFromDoc(p) ?? p._id ?? p.code) ===
          (getIdFromDoc(updatedDoc) ?? updatedDoc._id ?? updatedDoc.code)
            ? updatedDoc
            : p
        )
      );

      setEditOpen(false);

      // background refetch
      setTimeout(() => {
        try {
          refetchWares?.();
        } catch {}
      }, 800);

      alert(res?.message ?? "Updated");
    } catch (err: any) {
      console.error("Update failed", err);
      alert(err?.data?.message ?? err?.message ?? "Update failed");
    }
  };

  const handleSoftDelete = async (w: any) => {
    if (!confirm(`Delete ${w.code}?`)) return;
    try {
      const id = getIdFromDoc(w) ?? w._id ?? w.code;
      const res: any = await deleteWare({ id }).unwrap();

      // optimistic move: remove from displayed wares and add to deleted list
      setDisplayWares((prev) =>
        prev.filter(
          (p) =>
            (getIdFromDoc(p) ?? p._id ?? p.code) !==
            (getIdFromDoc(w) ?? w._id ?? w.code)
        )
      );

      // push a shallow deleted item (so deleted list UI updates instantly)
      const deletedAt = new Date().toISOString();
      setDisplayDeletedWares((prev) => [
        { ...(w as any), isDeleted: true, deletedAt },
        ...prev,
      ]);

      // background refetch
      setTimeout(() => {
        try {
          refetchWares?.();
          refetchDeleted?.();
        } catch {}
      }, 800);

      alert(res?.message ?? "Deleted");
    } catch (err: any) {
      console.error("delete failed", err);
      alert(err?.data?.message ?? err?.message ?? "Delete failed");
    }
  };

  const handleRestore = async (w: any) => {
    try {
      const id = getIdFromDoc(w) ?? w._id ?? w.code;
      const res: any = await restoreWare({ id }).unwrap();

      // optimistic: remove from deleted list and add back to displayedWares
      setDisplayDeletedWares((prev) =>
        prev.filter(
          (p) =>
            (getIdFromDoc(p) ?? p._id ?? p.code) !==
            (getIdFromDoc(w) ?? w._id ?? w.code)
        )
      );

      setDisplayWares((prev) => [w, ...prev]);

      // background refetch
      setTimeout(() => {
        try {
          refetchWares?.();
          refetchDeleted?.();
        } catch {}
      }, 800);

      alert(res?.message ?? "Restored");
    } catch (err: any) {
      console.error("restore failed", err);
      alert(err?.data?.message ?? err?.message ?? "Restore failed");
    }
  };

  // derived maps
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

  const mpMap = useMemo(() => {
    const m = new Map<string, any>();
    (mpList || []).forEach((p: any) => m.set(getIdFromDoc(p) ?? p.code, p));
    return m;
  }, [mpList]);

  // For rendering use displayWares / displayDeletedWares (optimistic)
  const displayed = displayWares;
  const displayedDeleted = displayDeletedWares;

  // UI (table + modals) - mostly unchanged; render displayed arrays
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
          <strong>Wares</strong>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="form-control"
            placeholder="Search by code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 300 }}
          />
          <button
            className="btn btn-primary"
            onClick={() => setCreateOpen(true)}
          >
            + Create
          </button>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Code</th>
              <th>Flute</th>
              <th>Unit price</th>
              <th>W (mm)</th>
              <th>L (mm)</th>
              <th>H (mm)</th>
              <th>Paper W</th>
              <th>Cross cut</th>
              <th>Volume</th>
              <th>Manufacturing Type</th>
              <th>Manufacturing Processes</th>
              <th>Finishing Processes</th>
              <th>Print colors</th>
              <th>Actions</th>
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
              const manufProcesses = labelsFromIdArray(
                w.manufacturingProcesses,
                mpMap,
                "code"
              );
              const finishingProcesses = labelsFromIdArray(
                w.finishingProcesses,
                finishingMap,
                "code"
              );

              return (
                <tr key={getIdFromDoc(w) ?? w.code}>
                  <td>{w.code}</td>
                  <td>{fluteLabel}</td>
                  <td style={{ textAlign: "right" }}>{w.unitPrice}</td>
                  <td style={{ textAlign: "right" }}>{w.wareWidth ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>{w.wareLength ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>{w.wareHeight ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>{w.paperWidth ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>
                    {w.crossCutCount ?? "-"}
                  </td>
                  <td style={{ textAlign: "right" }}>{w.volume ?? "-"}</td>
                  <td>{manufTypeLabel}</td>
                  <td style={{ maxWidth: 220 }}>{manufProcesses}</td>
                  <td style={{ maxWidth: 220 }}>{finishingProcesses}</td>
                  <td>{pcolors}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => openEdit(w)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleSoftDelete(w)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!displayed.length && (
              <tr>
                <td colSpan={14} className="text-muted p-4">
                  No wares
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {createOpen && (
        <div className="modal-backdrop" style={{ display: "block" }}>
          <div className="modal" role="dialog" style={{ display: "block" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Create Ware</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setCreateOpen(false)}
                  />
                </div>

                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Code
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
                        Unit price
                        <input
                          className="form-control"
                          type="number"
                          value={createForm.unitPrice}
                          onChange={(e) =>
                            setCreateForm((p: any) => ({
                              ...p,
                              unitPrice: Number(e.target.value),
                            }))
                          }
                        />
                      </label>

                      <label className="form-label">
                        Flute combination
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
                        Ware manufacturing type
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
                        Ware width
                        <input
                          className="form-control"
                          type="number"
                          value={createForm.wareWidth}
                          onChange={(e) =>
                            setCreateForm((p: any) => ({
                              ...p,
                              wareWidth: Number(e.target.value),
                            }))
                          }
                        />
                      </label>

                      <label className="form-label">
                        Ware length
                        <input
                          className="form-control"
                          type="number"
                          value={createForm.wareLength}
                          onChange={(e) =>
                            setCreateForm((p: any) => ({
                              ...p,
                              wareLength: Number(e.target.value),
                            }))
                          }
                        />
                      </label>

                      <label className="form-label">
                        Ware height
                        <input
                          className="form-control"
                          type="number"
                          value={createForm.wareHeight}
                          onChange={(e) =>
                            setCreateForm((p: any) => ({
                              ...p,
                              wareHeight: Number(e.target.value),
                            }))
                          }
                        />
                      </label>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Paper width
                        <input
                          className="form-control"
                          type="number"
                          value={createForm.paperWidth}
                          onChange={(e) =>
                            setCreateForm((p: any) => ({
                              ...p,
                              paperWidth: Number(e.target.value),
                            }))
                          }
                        />
                      </label>

                      <label className="form-label">
                        Cross cut count
                        <input
                          className="form-control"
                          type="number"
                          value={createForm.crossCutCount}
                          onChange={(e) =>
                            setCreateForm((p: any) => ({
                              ...p,
                              crossCutCount: Number(e.target.value),
                            }))
                          }
                        />
                      </label>

                      <label className="form-label">
                        Volume
                        <input
                          className="form-control"
                          type="number"
                          value={createForm.volume}
                          onChange={(e) =>
                            setCreateForm((p: any) => ({
                              ...p,
                              volume: Number(e.target.value),
                            }))
                          }
                        />
                      </label>

                      {/* Print colors multi: inline multi-select */}
                      <label className="form-label">Print colors</label>
                      <MultiSelectInline
                        id="create-printcolor"
                        options={printColorList}
                        selected={createForm.printColors || []}
                        onAdd={(id) => addToCreateList("printColors", id)}
                        onRemove={(id) =>
                          removeFromCreateList("printColors", id)
                        }
                        getLabel={(o) =>
                          o?.code ?? o?.name ?? getIdFromDoc(o) ?? ""
                        }
                        placeholder="-- choose print colors --"
                      />

                      {/* Finishing */}
                      <label className="form-label" style={{ marginTop: 8 }}>
                        Finishing processes
                      </label>
                      <MultiSelectInline
                        id="create-finishing"
                        options={finishingList}
                        selected={createForm.finishingProcesses || []}
                        onAdd={(id) =>
                          addToCreateList("finishingProcesses", id)
                        }
                        onRemove={(id) =>
                          removeFromCreateList("finishingProcesses", id)
                        }
                        getLabel={(o) =>
                          o?.code ?? o?.name ?? getIdFromDoc(o) ?? ""
                        }
                        placeholder="-- choose finishing processes --"
                      />

                      {/* Manufacturing processes */}
                      <label className="form-label" style={{ marginTop: 8 }}>
                        Manufacturing processes
                      </label>
                      <MultiSelectInline
                        id="create-mp"
                        options={mpList}
                        selected={createForm.manufacturingProcesses || []}
                        onAdd={(id) =>
                          addToCreateList("manufacturingProcesses", id)
                        }
                        onRemove={(id) =>
                          removeFromCreateList("manufacturingProcesses", id)
                        }
                        getLabel={(o) =>
                          o?.code ?? o?.name ?? getIdFromDoc(o) ?? ""
                        }
                        placeholder="-- choose manufacturing processes --"
                      />

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
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateSubmit}
                    disabled={creating}
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && editForm && (
        <div className="modal-backdrop" style={{ display: "block" }}>
          <div className="modal" role="dialog" style={{ display: "block" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Ware {editForm.code}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditOpen(false)}
                  />
                </div>

                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Code
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
                        Unit price
                        <input
                          className="form-control"
                          type="number"
                          value={editForm.unitPrice}
                          onChange={(e) =>
                            setEditForm((p: any) => ({
                              ...p,
                              unitPrice: Number(e.target.value),
                            }))
                          }
                        />
                      </label>

                      <label className="form-label">
                        Flute combination
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
                        Ware manufacturing type
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
                        Ware width
                        <input
                          className="form-control"
                          type="number"
                          value={editForm.wareWidth}
                          onChange={(e) =>
                            setEditForm((p: any) => ({
                              ...p,
                              wareWidth: Number(e.target.value),
                            }))
                          }
                        />
                      </label>

                      <label className="form-label">
                        Ware length
                        <input
                          className="form-control"
                          type="number"
                          value={editForm.wareLength}
                          onChange={(e) =>
                            setEditForm((p: any) => ({
                              ...p,
                              wareLength: Number(e.target.value),
                            }))
                          }
                        />
                      </label>

                      <label className="form-label">
                        Ware height
                        <input
                          className="form-control"
                          type="number"
                          value={editForm.wareHeight}
                          onChange={(e) =>
                            setEditForm((p: any) => ({
                              ...p,
                              wareHeight: Number(e.target.value),
                            }))
                          }
                        />
                      </label>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Paper width
                        <input
                          className="form-control"
                          type="number"
                          value={editForm.paperWidth}
                          onChange={(e) =>
                            setEditForm((p: any) => ({
                              ...p,
                              paperWidth: Number(e.target.value),
                            }))
                          }
                        />
                      </label>

                      <label className="form-label">
                        Cross cut count
                        <input
                          className="form-control"
                          type="number"
                          value={editForm.crossCutCount}
                          onChange={(e) =>
                            setEditForm((p: any) => ({
                              ...p,
                              crossCutCount: Number(e.target.value),
                            }))
                          }
                        />
                      </label>

                      <label className="form-label">
                        Volume
                        <input
                          className="form-control"
                          type="number"
                          value={editForm.volume}
                          onChange={(e) =>
                            setEditForm((p: any) => ({
                              ...p,
                              volume: Number(e.target.value),
                            }))
                          }
                        />
                      </label>

                      {/* Print colors - inline multi select */}
                      <label className="form-label">Print colors</label>
                      <MultiSelectInline
                        id="edit-printcolor"
                        options={printColorList}
                        selected={editForm.printColors || []}
                        onAdd={(id) => addToEditList("printColors", id)}
                        onRemove={(id) => removeFromEditList("printColors", id)}
                        getLabel={(o) =>
                          o?.code ?? o?.name ?? getIdFromDoc(o) ?? ""
                        }
                        placeholder="-- choose print colors --"
                      />

                      {/* Finishing */}
                      <label className="form-label" style={{ marginTop: 8 }}>
                        Finishing processes
                      </label>
                      <MultiSelectInline
                        id="edit-finishing"
                        options={finishingList}
                        selected={editForm.finishingProcesses || []}
                        onAdd={(id) => addToEditList("finishingProcesses", id)}
                        onRemove={(id) =>
                          removeFromEditList("finishingProcesses", id)
                        }
                        getLabel={(o) =>
                          o?.code ?? o?.name ?? getIdFromDoc(o) ?? ""
                        }
                        placeholder="-- choose finishing processes --"
                      />

                      {/* Manufacturing processes */}
                      <label className="form-label" style={{ marginTop: 8 }}>
                        Manufacturing processes
                      </label>
                      <MultiSelectInline
                        id="edit-mp"
                        options={mpList}
                        selected={editForm.manufacturingProcesses || []}
                        onAdd={(id) =>
                          addToEditList("manufacturingProcesses", id)
                        }
                        onRemove={(id) =>
                          removeFromEditList("manufacturingProcesses", id)
                        }
                        getLabel={(o) =>
                          o?.code ?? o?.name ?? getIdFromDoc(o) ?? ""
                        }
                        placeholder="-- choose manufacturing processes --"
                      />

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
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleEditSubmit}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WareList;
