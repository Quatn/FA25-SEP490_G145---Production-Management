// src/components/ware/WareList.tsx
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  useGetWaresQuery,
  useCreateWareMutation,
  useUpdateWareMutation,
  useDeleteWareMutation,
} from "@/service/api/wareApiSlice";
import { useGetAllFluteCombinationQuery } from "@/service/api/fluteCombinationApiSlice";
import { useGetAllPrintColorsQuery } from "@/service/api/printColorApiSlice";
import { useGetAllWareManufacturingTypesQuery } from "@/service/api/wareManufacturingProcessTypeApiSlice";
import { useGetAllWareFinishingTypesQuery } from "@/service/api/wareFinishingProcessTypeApiSlice";
import WareCreateModal from "@/components/ware/WareCreateModal";
import WareEditModal from "@/components/ware/WareEditModal";

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
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);

  const {
    data: waresResp,
    refetch: refetchWares,
    isLoading: waresLoading,
  } = useGetWaresQuery({ page, limit, search });

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
    if (s === undefined || s === null) return null;
    if (s === "" || s === 0) return null;
    const n = Number(s);
    if (!Number.isFinite(n)) return null;
    return n;
  };

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

      setTimeout(() => {
        try {
          refetchWares?.();
        } catch {}
      }, 800);

      alert(res?.message ?? "Deleted");
    } catch (err: any) {
      console.error("delete failed", err);
      alert(err?.data?.message ?? err?.message ?? "Delete failed");
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

  const PAPER_LAYER_OPTIONS = [
    "K/VT/120/100",
    "T/LE/100/100",
    "K/VT/150/120",
    "T/LE/120/120",
  ];

  const TYPE_OF_PRINTER_OPTIONS = ["3M - A", "2M - C", "4M"];

  const PAPER_LAYER_KEYS: { key: string; label: string }[] = [
    { key: "faceLayerPaperType", label: "Mặt" },
    { key: "EFlutePaperType", label: "Sóng E" },
    { key: "EBLinerLayerPaperType", label: "Lớp Giữa E/B" },
    { key: "BFlutePaperType", label: "Sóng B" },
    { key: "BACLinerLayerPaperType", label: "Lớp Giữa B A/C" },
    { key: "ACFlutePaperType", label: "Sóng A/C" },
    { key: "backLayerPaperType", label: "Đáy" },
  ];

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
            }}
            style={{ minWidth: 300 }}
          />
          <button
            className="btn btn-primary"
            onClick={() => setCreateOpen(true)}
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
            <col style={{ width: 90 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 90 }} />
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
              <th rowSpan={2}>Số SP bộ</th>
              <th rowSpan={2}>Số SP ghép bộ</th>
              <th rowSpan={2}>Dọc chia SP</th>
              <th rowSpan={2}>Kiểu SP gia công</th>
              <th rowSpan={2}>Công đoạn hoàn thiện</th>
              <th rowSpan={2}>Màu in</th>

              {/* Mặt giấy main header spanning small subcolumns */}
              <th colSpan={PAPER_LAYER_KEYS.length} style={{ textAlign: 'center', verticalAlign: 'middle' }}>Mặt giấy</th>

              <th rowSpan={2}>Máy in</th>
              <th rowSpan={2}>Ghi chú</th>
              <th rowSpan={2}>Thao tác</th>
            </tr>

            {/* second header row: small paper-layer headers */}
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
                  <td style={{ textAlign: "right" }}>{w.warePerSet ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>
                    {w.warePerCombinedSet ?? "-"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {w.horizontalWareSplit ?? "-"}
                  </td>
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
                {/* new total columns count = previous columns - 1 + 7 = 23 */}
                <td colSpan={23} className="text-muted p-4">
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
      />
    </div>
  );
};

export default WareList;
