// src/components/ware-management/WareList.tsx
"use client";

import React, { useMemo, useState } from "react";
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
  // fallback to toString
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

function getPrintColorsLabel(
  printColors: any[] = [],
  printColorList: any[] = []
) {
  if (!Array.isArray(printColors) || printColors.length === 0) return "";
  const labels = printColors.map((p) => {
    if (!p) return "";
    if (typeof p === "object" && p.code) return p.code;
    const id = getIdFromDoc(p);
    if (id) {
      const found = printColorList.find(
        (pc: any) => getIdFromDoc(pc) === id || pc._id === id || pc.code === id
      );
      return found ? found.code ?? id : id;
    }
    return String(p);
  });
  return labels.filter(Boolean).join(", ");
}

export const WareList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page] = useState(1);
  const [limit] = useState(200);

  // main paginated fetch
  const {
    data: waresResp,
    isLoading: waresLoading,
    error: waresError,
  } = useGetWaresQuery({
    page,
    limit,
    search,
  });

  // deleted list (uses special endpoint implemented earlier)
  const { data: deletedResp } = useGetDeletedWaresQuery
    ? useGetDeletedWaresQuery({ page: 1, limit: 200 })
    : { data: undefined };

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
  // server might return { data: { data: [...] } } or { data: [...] } or just [...]
  const raw = waresResp ?? waresResp?.data ?? waresResp; // defensive
  let wares: any[] = [];

  if (waresResp?.data?.data && Array.isArray(waresResp.data.data)) {
    wares = waresResp.data.data;
  } else if (waresResp?.data && Array.isArray(waresResp.data)) {
    wares = waresResp.data;
  } else if (Array.isArray(waresResp)) {
    wares = waresResp;
  } else if (raw && raw.data && Array.isArray(raw.data)) {
    wares = raw.data;
  } else {
    wares = [];
  }

  const deletedWares: any[] =
    deletedResp?.data?.data ?? deletedResp?.data ?? [];

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

  // create handler
  const handleCreateSubmit = async () => {
    try {
      const payload: any = { ...createForm };
      // ensure referenced arrays are array of ids
      payload.printColors = (payload.printColors || []).map(
        (x: any) => getIdFromDoc(x) ?? x
      );
      payload.finishingProcesses = (payload.finishingProcesses || []).map(
        (x: any) => getIdFromDoc(x) ?? x
      );
      payload.manufacturingProcesses = (
        payload.manufacturingProcesses || []
      ).map((x: any) => getIdFromDoc(x) ?? x);
      payload.fluteCombination =
        getIdFromDoc(payload.fluteCombination) ?? payload.fluteCombination;
      payload.wareManufacturingProcessType =
        getIdFromDoc(payload.wareManufacturingProcessType) ??
        payload.wareManufacturingProcessType;

      const resp: any = await createWare(payload).unwrap();
      alert(resp?.message ?? "Created");
      setCreateOpen(false);
    } catch (err: any) {
      console.error("Create ware failed", err);
      alert(err?.data?.message ?? err?.message ?? "Create failed");
    }
  };

  const handleEditSubmit = async () => {
    try {
      const id = editForm.id;
      const payload: any = { ...editForm };
      delete payload.id;
      payload.printColors = (payload.printColors || []).map(
        (x: any) => getIdFromDoc(x) ?? x
      );
      payload.finishingProcesses = (payload.finishingProcesses || []).map(
        (x: any) => getIdFromDoc(x) ?? x
      );
      payload.manufacturingProcesses = (
        payload.manufacturingProcesses || []
      ).map((x: any) => getIdFromDoc(x) ?? x);
      payload.fluteCombination =
        getIdFromDoc(payload.fluteCombination) ?? payload.fluteCombination;
      payload.wareManufacturingProcessType =
        getIdFromDoc(payload.wareManufacturingProcessType) ??
        payload.wareManufacturingProcessType;

      const res: any = await updateWare({ id, data: payload }).unwrap();
      alert(res?.message ?? "Updated");
      setEditOpen(false);
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
      alert(res?.message ?? "Restored");
    } catch (err: any) {
      console.error("restore failed", err);
      alert(err?.data?.message ?? err?.message ?? "Restore failed");
    }
  };

  // quick derived maps (for selects)
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

  // UI
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
              <th>Print colors</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {wares.map((w) => {
              const fluteLabel = getCodeLabelForFlute(
                w.fluteCombination,
                fluteList
              );
              const pcolors = getPrintColorsLabel(
                w.printColors,
                printColorList
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
            {!wares.length && (
              <tr>
                <td colSpan={11} className="text-muted p-4">
                  No wares
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h5 style={{ marginTop: 20 }}>Deleted Wares</h5>
      <div style={{ overflowX: "auto" }}>
        <table className="table table-sm table-bordered">
          <thead>
            <tr>
              <th>Code</th>
              <th>Flute</th>
              <th>Unit price</th>
              <th>Deleted At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {deletedWares.map((w) => (
              <tr key={getIdFromDoc(w) ?? w.code}>
                <td>{w.code}</td>
                <td>{getCodeLabelForFlute(w.fluteCombination, fluteList)}</td>
                <td style={{ textAlign: "right" }}>{w.unitPrice}</td>
                <td>
                  {w.deletedAt ? new Date(w.deletedAt).toLocaleString() : "-"}
                </td>
                <td>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleRestore(w)}
                  >
                    Restore
                  </button>
                </td>
              </tr>
            ))}
            {!deletedWares.length && (
              <tr>
                <td colSpan={5} className="text-muted p-3">
                  No deleted wares
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
                  <div className="row">
                    <div className="col-md-6">
                      <label>
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
                      <label>
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
                      <label>
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
                              {f.code}{" "}
                              {f.description ? `- ${f.description}` : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
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
                      <label>
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
                      <label>
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
                      <label>
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
                      <label>
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
                      <label>
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
                      <label>
                        Print colors
                        <select
                          className="form-control"
                          multiple
                          value={createForm.printColors}
                          onChange={(e) => {
                            const opts = Array.from(
                              e.target.selectedOptions
                            ).map((o) => o.value);
                            setCreateForm((p: any) => ({
                              ...p,
                              printColors: opts,
                            }));
                          }}
                        >
                          {(printColorList || []).map((pc) => (
                            <option
                              key={getIdFromDoc(pc) ?? pc.code}
                              value={getIdFromDoc(pc)}
                            >
                              {pc.code}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
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
                  <div className="row">
                    <div className="col-md-6">
                      <label>
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
                      <label>
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
                      <label>
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
                              {f.code}{" "}
                              {f.description ? `- ${f.description}` : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
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
                      <label>
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
                    </div>

                    <div className="col-md-6">
                      <label>
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
                      <label>
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
                      <label>
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
                      <label>
                        Print colors
                        <select
                          className="form-control"
                          multiple
                          value={editForm.printColors || []}
                          onChange={(e) => {
                            const opts = Array.from(
                              e.target.selectedOptions
                            ).map((o) => o.value);
                            setEditForm((p: any) => ({
                              ...p,
                              printColors: opts,
                            }));
                          }}
                        >
                          {(printColorList || []).map((pc) => (
                            <option
                              key={getIdFromDoc(pc) ?? pc.code}
                              value={getIdFromDoc(pc)}
                            >
                              {pc.code}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
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
