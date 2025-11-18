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
// import { useGetAllManufacturingProcessesQuery } from "@/service/api/manufacturingProcessApiSlice";

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
 * Inline multi-select control
 */
const MultiSelectInline: React.FC<{
  options: any[];
  selected: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  getLabel?: (opt: any) => string;
  placeholder?: string;
  id?: string;
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
              const idv = getIdFromDoc(opt) ?? String(opt);
              return (
                <div
                  key={idv}
                  onClick={() => {
                    onAdd(idv);
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

  // mutations
  const [createWare, { isLoading: creating }] = useCreateWareMutation();
  const [updateWare] = useUpdateWareMutation();
  const [deleteWare] = useDeleteWareMutation();
  const [restoreWare] = useRestoreWareMutation();

  // normalize wares array
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

  // local display state
  const [displayWares, setDisplayWares] = useState<any[]>([]);
  const [displayDeletedWares, setDisplayDeletedWares] = useState<any[]>([]);

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

  // default/create form — numeric fields kept as strings/null so empty => null
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
    faceLayerPaperType: "",
    EFlutePaperType: "",
    EBLinerLayerPaperType: "",
    BFlutePaperType: "",
    BACLinerLayerPaperType: "",
    ACFlutePaperType: "",
    backLayerPaperType: "",
    volume: "",
    warePerSet: "",
    warePerCombinedSet: "",
    horizontalWareSplit: "",
    printColors: [] as string[],
    typeOfPrinter: "",
    finishingProcesses: [] as string[],
    manufacturingProcesses: [] as string[],
    note: "",
  });

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
      volume:
        ware.volume !== undefined && ware.volume !== null
          ? String(ware.volume)
          : "",
      warePerSet:
        ware.warePerSet !== undefined && ware.warePerSet !== null
          ? String(ware.warePerSet)
          : "",
      warePerCombinedSet:
        ware.warePerCombinedSet !== undefined &&
        ware.warePerCombinedSet !== null
          ? String(ware.warePerCombinedSet)
          : "",
      horizontalWareSplit:
        ware.horizontalWareSplit !== undefined &&
        ware.horizontalWareSplit !== null
          ? String(ware.horizontalWareSplit)
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
      EFlutePaperType: ware.EFlutePaperType ?? "",
      EBLinerLayerPaperType: ware.EBLinerLayerPaperType ?? "",
      BFlutePaperType: ware.BFlutePaperType ?? "",
      BACLinerLayerPaperType: ware.BACLinerLayerPaperType ?? "",
      ACFlutePaperType: ware.ACFlutePaperType ?? "",
      backLayerPaperType: ware.backLayerPaperType ?? "",
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

  // payload helpers
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
    if (s === undefined || s === null) return null;
    if (s === "" || s === 0) return null;
    const n = Number(s);
    if (!Number.isFinite(n)) return null;
    return n;
  };

  // create handler
  const handleCreateSubmit = async () => {
    try {
      if (!createForm.code || String(createForm.code).trim() === "")
        return alert("Please provide code");
      const unitPrice = parsePositiveNumberOrNull(createForm.unitPrice);
      if (!unitPrice || unitPrice <= 0)
        return alert("Please provide unitPrice > 0");

      const fluteCombination = String(createForm.fluteCombination || "");
      if (!fluteCombination) return alert("Please select flute (sóng)");

      const wareWidth = parsePositiveNumberOrNull(createForm.wareWidth);
      const wareLength = parsePositiveNumberOrNull(createForm.wareLength);
      if (!wareWidth || wareWidth <= 0)
        return alert("Please provide wareWidth > 0");
      if (!wareLength || wareLength <= 0)
        return alert("Please provide wareLength > 0");

      const wareManufacturingProcessType = String(
        createForm.wareManufacturingProcessType || ""
      );
      if (!wareManufacturingProcessType)
        return alert("Please select Kiểu SP gia công");

      // keep paperWidth & crossCutCount required (per earlier behavior)
      // const paperWidth = parsePositiveNumberOrNull(createForm.paperWidth);
      // const crossCutCount = parsePositiveNumberOrNull(createForm.crossCutCount);
      // if (!paperWidth || paperWidth <= 0)
      //   return alert("Please provide paperWidth > 0");
      // if (!crossCutCount || crossCutCount <= 0)
      //   return alert("Please provide crossCutCount > 0");

      const volume = parsePositiveNumberOrNull(createForm.volume);
      const warePerSet = parsePositiveNumberOrNull(createForm.warePerSet);
      const warePerCombinedSet = parsePositiveNumberOrNull(
        createForm.warePerCombinedSet
      );
      const horizontalWareSplit = parsePositiveNumberOrNull(
        createForm.horizontalWareSplit
      );

      if (!volume || volume <= 0) return alert("Please provide volume > 0");
      if (!warePerSet || warePerSet <= 0)
        return alert("Please provide warePerSet > 0");
      if (!warePerCombinedSet || warePerCombinedSet <= 0)
        return alert("Please provide warePerCombinedSet > 0");
      if (!horizontalWareSplit || horizontalWareSplit <= 0)
        return alert("Please provide horizontalWareSplit > 0");

      if (
        !Array.isArray(createForm.printColors) ||
        createForm.printColors.length === 0
      )
        return alert("Please select at least one print color");

      const oneLayerSelected = [
        createForm.faceLayerPaperType,
        createForm.EFlutePaperType,
        createForm.EBLinerLayerPaperType,
        createForm.BFlutePaperType,
        createForm.BACLinerLayerPaperType,
        createForm.ACFlutePaperType,
        createForm.backLayerPaperType,
      ].some((v) => v && String(v).trim() !== "");
      if (!oneLayerSelected)
        return alert(
          "Please select at least one paper layer (face/inner/back)"
        );

      // build payload: removed-from-input fields set to null
      const payload: any = {
        code: String(createForm.code).trim(),
        unitPrice: unitPrice,
        fluteCombination: fluteCombination,
        wareWidth: wareWidth,
        wareLength: wareLength,
        wareHeight: parsePositiveNumberOrNull(createForm.wareHeight),
        wareManufacturingProcessType: wareManufacturingProcessType,
        // these fields removed from input -> send null so backend can decide
        warePerBlank: 0,
        blankWidth: 0,
        blankLength: 0,
        flapLength: 0,
        margin: 0,
        paperWidth: 0,
        crossCutCount: 0,
        faceLayerPaperType:
          createForm.faceLayerPaperType && createForm.faceLayerPaperType !== ""
            ? createForm.faceLayerPaperType
            : 0,
        EFlutePaperType:
          createForm.EFlutePaperType && createForm.EFlutePaperType !== ""
            ? createForm.EFlutePaperType
            : 0,
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
        volume: volume,
        warePerSet: warePerSet,
        warePerCombinedSet: warePerCombinedSet,
        horizontalWareSplit: horizontalWareSplit,
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
        faceLayerPaperType: "",
        EFlutePaperType: "",
        EBLinerLayerPaperType: "",
        BFlutePaperType: "",
        BACLinerLayerPaperType: "",
        ACFlutePaperType: "",
        backLayerPaperType: "",
        volume: "",
        warePerSet: "",
        warePerCombinedSet: "",
        horizontalWareSplit: "",
        printColors: [],
        typeOfPrinter: "",
        finishingProcesses: [],
        manufacturingProcesses: [],
        note: "",
      });

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

  // edit handler
  const handleEditSubmit = async () => {
    try {
      if (!editForm?.id) return alert("No id");

      if (!editForm.code || String(editForm.code).trim() === "")
        return alert("Please provide code");
      const unitPrice = parsePositiveNumberOrNull(editForm.unitPrice);
      if (!unitPrice || unitPrice <= 0)
        return alert("Please provide unitPrice > 0");

      const fluteCombination = String(editForm.fluteCombination || "");
      if (!fluteCombination) return alert("Please select flute (sóng)");

      const wareWidth = parsePositiveNumberOrNull(editForm.wareWidth);
      const wareLength = parsePositiveNumberOrNull(editForm.wareLength);
      if (!wareWidth || wareWidth <= 0)
        return alert("Please provide wareWidth > 0");
      if (!wareLength || wareLength <= 0)
        return alert("Please provide wareLength > 0");

      const wareManufacturingProcessType = String(
        editForm.wareManufacturingProcessType || ""
      );
      if (!wareManufacturingProcessType)
        return alert("Please select Kiểu SP gia công");

      // const paperWidth = parsePositiveNumberOrNull(editForm.paperWidth);
      // const crossCutCount = parsePositiveNumberOrNull(editForm.crossCutCount);
      // if (!paperWidth || paperWidth <= 0)
      //   return alert("Please provide paperWidth > 0");
      // if (!crossCutCount || crossCutCount <= 0)
      //   return alert("Please provide crossCutCount > 0");

      const volume = parsePositiveNumberOrNull(editForm.volume);
      const warePerSet = parsePositiveNumberOrNull(editForm.warePerSet);
      const warePerCombinedSet = parsePositiveNumberOrNull(
        editForm.warePerCombinedSet
      );
      const horizontalWareSplit = parsePositiveNumberOrNull(
        editForm.horizontalWareSplit
      );

      if (!volume || volume <= 0) return alert("Please provide volume > 0");
      if (!warePerSet || warePerSet <= 0)
        return alert("Please provide warePerSet > 0");
      if (!warePerCombinedSet || warePerCombinedSet <= 0)
        return alert("Please provide warePerCombinedSet > 0");
      if (!horizontalWareSplit || horizontalWareSplit <= 0)
        return alert("Please provide horizontalWareSplit > 0");

      if (
        !Array.isArray(editForm.printColors) ||
        editForm.printColors.length === 0
      )
        return alert("Please select at least one print color");

      const oneLayerSelected = [
        editForm.faceLayerPaperType,
        editForm.EFlutePaperType,
        editForm.EBLinerLayerPaperType,
        editForm.BFlutePaperType,
        editForm.BACLinerLayerPaperType,
        editForm.ACFlutePaperType,
        editForm.backLayerPaperType,
      ].some((v) => v && String(v).trim() !== "");
      if (!oneLayerSelected)
        return alert(
          "Please select at least one paper layer (face/inner/back)"
        );

      const payload: any = {
        code: String(editForm.code).trim(),
        unitPrice: unitPrice,
        fluteCombination: fluteCombination,
        wareWidth: wareWidth,
        wareLength: wareLength,
        wareHeight: parsePositiveNumberOrNull(editForm.wareHeight),
        wareManufacturingProcessType: wareManufacturingProcessType,
        // removed-from-input fields -> send null
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
        volume: volume,
        warePerSet: warePerSet,
        warePerCombinedSet: warePerCombinedSet,
        horizontalWareSplit: horizontalWareSplit,
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

      setDisplayWares((prev) =>
        prev.filter(
          (p) =>
            (getIdFromDoc(p) ?? p._id ?? p.code) !==
            (getIdFromDoc(w) ?? w._id ?? w.code)
        )
      );

      const deletedAt = new Date().toISOString();
      setDisplayDeletedWares((prev) => [
        { ...(w as any), isDeleted: true, deletedAt },
        ...prev,
      ]);

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

      setDisplayDeletedWares((prev) =>
        prev.filter(
          (p) =>
            (getIdFromDoc(p) ?? p._id ?? p.code) !==
            (getIdFromDoc(w) ?? w._id ?? w.code)
        )
      );

      setDisplayWares((prev) => [w, ...prev]);

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
  const displayedDeleted = displayDeletedWares;

  // PAPER LAYER options (sample strings). Replace with backend list if you have one.
  const PAPER_LAYER_OPTIONS = [
    "K/VT/120/100",
    "T/LE/100/100",
    "K/VT/150/120",
    "T/LE/120/120",
  ];

  const TYPE_OF_PRINTER_OPTIONS = ["3M - A", "2M - C", "4M"];

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
              <th>Mã hàng</th>
              <th>Sóng</th>
              <th>Đơn giá (đồng)</th>
              <th>Rộng (mm)</th>
              <th>Dài (mm)</th>
              <th>Cao (mm)</th>
              <th>Volume</th>
              <th>Kiểu SP gia công</th>
              <th>Công đoạn hoàn thiện</th>
              <th>Màu in</th>
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
                  <td style={{ textAlign: "right" }}>{w.volume ?? "-"}</td>
                  <td>{manufTypeLabel}</td>
                  <td style={{ maxWidth: 220 }}>{finishingProcesses}</td>
                  <td>{pcolors}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => openEdit(w)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleSoftDelete(w)}
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
                  <h5 className="modal-title">Tạo mã hàng</h5>
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

                      <br></br>

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

                      <br></br>

                      <label className="form-label">Màu in</label>
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

                      <label className="form-label" style={{ marginTop: 8 }}>
                        Công đoạn hoàn thiện
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
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCreateOpen(false)}
                  >
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
      )}

      {/* Edit Modal */}
      {editOpen && editForm && (
        <div className="modal-backdrop" style={{ display: "block" }}>
          <div className="modal" role="dialog" style={{ display: "block" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Sửa {editForm.code}</h5>
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
                        Mã hàng
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
                        Đơn giá (đồng)
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
                      </label>

                      <label className="form-label">
                        Sóng
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
                        Kiểu SP gia công
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
                        Rộng
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
                      </label>

                      <label className="form-label">
                        Dài
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
                      </label>

                      <label className="form-label">
                        Cao
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
                      </label>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Volume
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
                      </label>

                      <label className="form-label">
                        Số SP bộ
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
                      </label>

                      <label className="form-label">
                        Số SP ghép bộ
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
                      </label>

                      <label className="form-label">
                        Dọc chia SP 
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
                      </label>

                      <label className="form-label">Màu in</label>
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

                      <label className="form-label" style={{ marginTop: 8 }}>
                        Công đoạn hoàn thiện
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

                  <hr />

                  <div style={{ marginBottom: 8 }}>
                    <strong>Paper layers (at least one required)</strong>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">
                        Face layer
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
                      </label>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">
                        E flute
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
                      </label>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">
                        Back layer
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
                      </label>
                    </div>
                  </div>

                  <hr />

                  <div style={{ marginTop: 12 }}>
                    <label className="form-label">
                      Type of printer
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
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditOpen(false)}
                  >
                    Đóng
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleEditSubmit}
                  >
                    Lưu
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
