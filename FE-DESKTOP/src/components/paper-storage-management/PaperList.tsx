// src/components/paper-storage-management/PaperList.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import PaperDetailModal from "./PaperDetailModal";
import BulkActionModal from "./BulkActionModal";
import {
  useGetPaperRollsQuery,
  useGetDeletedPaperRollsQuery,
  useCreatePaperRollMutation,
  useUpdatePaperRollMutation,
  useDeletePaperRollMutation,
  useRestorePaperRollMutation,
} from "@/service/api/paperRollApiSlice";
import { useCreateTransactionMutation } from "@/service/api/paperRollTransactionApiSlice";
import { useGetAllPaperColorsQuery } from "@/service/api/paperColorApiSlice";
import { useGetAllPaperSuppliersQuery } from "@/service/api/paperSupplierApiSlice";
import {
  useGetAllPaperTypesQuery,
  useAddPaperTypeMutation,
} from "@/service/api/paperTypeApiSlice";

function getIdFromDoc(doc: any) {
  if (!doc) return undefined;
  if (typeof doc === "string") return doc;
  if (doc._id?.$oid) return String(doc._id.$oid);
  if (doc._id) return String(doc._id);
  if (doc.id) return String(doc.id);
  return undefined;
}

export const PaperList: React.FC = () => {
  const [query, setQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [detailOpen, setDetailOpen] = useState<{ open: boolean; roll?: any }>({
    open: false,
  });
  const [bulkModal, setBulkModal] = useState<{
    open: boolean;
    mode?: "XUAT" | "NHAPLAI";
  }>({ open: false });

  // Create form
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    paperColorId: "",
    paperSupplierId: "",
    width: "",
    grammage: "",
    weight: "",
    receivingDate: "",
    note: "",
  });

  // Update form (for editing ANY visible field)
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    id: "",
    paperColorId: "", // user edits color (title -> selects a PaperColor)
    paperSupplierId: "",
    width: "",
    grammage: "",
    weight: "",
    receivingDate: "",
    note: "",
  });

  // QR
  const [qrModal, setQrModal] = useState<{ open: boolean; text?: string }>({
    open: false,
  });
  const [qrDataUrl, setQrDataUrl] = useState<string | undefined>();
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // data queries
  const { data: rollsResp } = useGetPaperRollsQuery({
    page: 1,
    limit: 200,
    search: debouncedSearch,
    sortBy: "both",
    sortOrder: "desc",
  });
  const paperRolls: any[] = rollsResp?.data?.data ?? [];

  // Deleted rows
  const { data: deletedResp } = useGetDeletedPaperRollsQuery
    ? useGetDeletedPaperRollsQuery({ page: 1, limit: 200 })
    : { data: undefined };
  const deletedRolls: any[] = (deletedResp?.data?.data ??
    deletedResp ??
    []) as any[];

  const { data: colorsResp } = useGetAllPaperColorsQuery();
  const allColors: any[] = colorsResp?.data ?? colorsResp ?? [];

  const { data: suppliersResp } = useGetAllPaperSuppliersQuery();
  const allSuppliers: any[] = suppliersResp?.data ?? suppliersResp ?? [];

  const { data: typesResp } = useGetAllPaperTypesQuery();
  const allTypes: any[] = typesResp?.data ?? typesResp ?? [];

  const [addPaperType] = useAddPaperTypeMutation();
  const [createPaperRoll, { isLoading: creating }] =
    useCreatePaperRollMutation();
  const [updatePaperRoll] = useUpdatePaperRollMutation();
  const [deletePaperRoll] = useDeletePaperRollMutation();
  const [restorePaperRoll] = useRestorePaperRollMutation();
  const [createTransaction] = useCreateTransactionMutation();

  // maps for quick lookup: id -> doc
  const colorMap = useMemo(() => {
    const m = new Map<string, any>();
    (allColors || []).forEach((c: any) =>
      m.set(String(getIdFromDoc(c) ?? c.code ?? c.title), c)
    );
    return m;
  }, [allColors]);

  const supplierMap = useMemo(() => {
    const m = new Map<string, any>();
    (allSuppliers || []).forEach((s: any) =>
      m.set(String(getIdFromDoc(s) ?? s.code ?? s.name), s)
    );
    return m;
  }, [allSuppliers]);

  // util to extract colorId from paperType
  const getColorIdFromPaperType = (pt: any) => {
    if (!pt) return undefined;
    if (pt.paperColorId && typeof pt.paperColorId === "object")
      return getIdFromDoc(pt.paperColorId);
    return getIdFromDoc(pt.paperColorId) ?? undefined;
  };

  // compute paperRollId using color.code and supplier.code
  const computePaperRollId = (r: any) => {
    const pt = r.paperType ?? r.paperTypeId ?? null;
    const colorId = getColorIdFromPaperType(pt);
    const colorObj = colorId ? colorMap.get(String(colorId)) : undefined;
    const colorCode = colorObj?.code;

    const supplierObj =
      r.paperSupplier ??
      (r.paperSupplierId
        ? supplierMap.get(String(getIdFromDoc(r.paperSupplierId)))
        : undefined);
    const supplierCode = supplierObj?.code ?? r.paperSupplier?.code;

    const width = pt?.width ?? r.width;
    const grammage = pt?.grammage ?? r.grammage;
    const seq = r.sequenceNumber ?? r.sequence;
    const receiving = r.receivingDate ?? r.createdAt;
    const yy = receiving
      ? new Date(receiving).getFullYear() % 100
      : new Date().getFullYear() % 100;

    if (
      colorCode &&
      supplierCode &&
      width != null &&
      grammage != null &&
      seq != null
    ) {
      return `${colorCode}/${supplierCode}/${width}/${grammage}/${seq}XC${String(
        yy
      ).padStart(2, "0")}`;
    }
    return r.paperRollId ?? "-";
  };

  // table selection helpers
  const selectedRolls = useMemo(
    () => paperRolls.filter((r) => selectedIds[r.paperRollId]),
    [paperRolls, selectedIds]
  );
  const visibleRows = useMemo(() => {
    const sel = new Set(selectedRolls.map((r) => r.paperRollId));
    return [
      ...selectedRolls,
      ...paperRolls.filter((r) => !sel.has(r.paperRollId)),
    ];
  }, [paperRolls, selectedRolls]);

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  const selectAllVisible = (checked: boolean) => {
    const newSel: Record<string, boolean> = { ...selectedIds };
    visibleRows.forEach((r) => (newSel[r.paperRollId] = checked));
    setSelectedIds(newSel);
  };
  const getSelectedRolls = () =>
    paperRolls.filter((r) => selectedIds[r.paperRollId]);

  // CREATE: identical to earlier flows (create paperType when needed)
  const handleCreateSubmit = async () => {
    // validate
    const w = Number(createForm.width || 0);
    const g = Number(createForm.grammage || 0);
    const weight = Number(createForm.weight || 0);
    if (
      !createForm.paperColorId ||
      !createForm.paperSupplierId ||
      !w ||
      !g ||
      !weight ||
      !createForm.receivingDate
    )
      return alert("Please fill required fields");

    try {
      // find or create paperType
      const matched = (allTypes || []).find((t: any) => {
        const tColorId = getIdFromDoc(t.paperColorId);
        return (
          String(tColorId) === String(createForm.paperColorId) &&
          Number(t.width) === w &&
          Number(t.grammage) === g
        );
      });

      let paperTypeId = matched ? getIdFromDoc(matched) : undefined;
      if (!paperTypeId) {
        const createdResp: any = await addPaperType({
          paperColorId: String(createForm.paperColorId),
          width: w,
          grammage: g,
        }).unwrap();
        const createdDoc = createdResp?.data ?? createdResp;
        paperTypeId = getIdFromDoc(createdDoc);
      }

      if (!paperTypeId) throw new Error("Failed to get paperTypeId");

      const payload = {
        paperSupplierId: String(createForm.paperSupplierId),
        paperTypeId,
        weight,
        receivingDate: createForm.receivingDate,
        note: createForm.note,
      };
      const resp: any = await createPaperRoll(payload).unwrap();
      alert(resp?.message ?? "Created");
      setCreateOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err?.data?.message ?? err?.message ?? "Create failed");
    }
  };

  // EDIT: open update modal prefilled with current values
  const openEdit = (r: any) => {
    const pt = r.paperType ?? r.paperTypeId ?? null;
    const colorId = getColorIdFromPaperType(pt) ?? "";
    const supplierId = getIdFromDoc(r.paperSupplier ?? r.paperSupplierId) ?? "";
    setUpdateForm({
      id: getIdFromDoc(r) ?? r.paperRollId ?? "",
      paperColorId: colorId,
      paperSupplierId: supplierId,
      width: pt?.width ?? r.width ?? "",
      grammage: pt?.grammage ?? r.grammage ?? "",
      weight: r.weight ?? "",
      receivingDate: r.receivingDate
        ? new Date(r.receivingDate).toISOString().slice(0, 10)
        : "",
      note: r.note ?? "",
    });
    setUpdateOpen(true);
  };

  const handleUpdateSubmit = async () => {
    // validate
    const widthNum = Number(updateForm.width || 0);
    const grammageNum = Number(updateForm.grammage || 0);
    const weightNum = Number(updateForm.weight ?? 0);
    if (
      !updateForm.paperColorId ||
      !updateForm.paperSupplierId ||
      !widthNum ||
      !grammageNum ||
      isNaN(weightNum) ||
      !updateForm.receivingDate
    ) {
      return alert("Please fill required fields");
    }

    try {
      // If color/width/grammage changed (i.e. paper type identity changed), find or create PaperType
      const matched = (allTypes || []).find((t: any) => {
        const tColorId = getIdFromDoc(t.paperColorId);
        return (
          String(tColorId) === String(updateForm.paperColorId) &&
          Number(t.width) === widthNum &&
          Number(t.grammage) === grammageNum
        );
      });

      let paperTypeId = matched ? getIdFromDoc(matched) : undefined;
      if (!paperTypeId) {
        const createdResp: any = await addPaperType({
          paperColorId: String(updateForm.paperColorId),
          width: widthNum,
          grammage: grammageNum,
        }).unwrap();
        const createdDoc = createdResp?.data ?? createdResp;
        paperTypeId = getIdFromDoc(createdDoc);
      }

      if (!paperTypeId) throw new Error("Failed to obtain paperTypeId");

      // Build update payload: set paperTypeId, paperSupplierId, weight, receivingDate, note
      const payload: any = {
        paperTypeId,
        paperSupplierId: String(updateForm.paperSupplierId),
        weight: weightNum,
        receivingDate: updateForm.receivingDate,
        note: updateForm.note,
      };

      const res: any = await updatePaperRoll({
        id: updateForm.id,
        data: payload,
      }).unwrap();
      alert(res?.message ?? "Updated");
      setUpdateOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err?.data?.message ?? err?.message ?? "Update failed");
    }
  };

  // Soft delete (sets isDeleted via backend)
  const handleSoftDelete = async (r: any) => {
    const id = getIdFromDoc(r) ?? r.paperRollId;
    if (!id) return alert("No id");
    if (!confirm(`Delete ${computePaperRollId(r)}?`)) return;
    try {
      const res: any = await deletePaperRoll({ id }).unwrap();
      alert(res?.message ?? "Deleted");
    } catch (err: any) {
      console.error(err);
      alert(err?.data?.message ?? err?.message ?? "Delete failed");
    }
  };

  // Restore deleted
  const handleRestore = async (r: any) => {
    const id = getIdFromDoc(r) ?? r.paperRollId;
    if (!id) return alert("No id");
    try {
      const res: any = await restorePaperRoll({ id }).unwrap();
      alert(res?.message ?? "Restored");
    } catch (err: any) {
      console.error(err);
      alert(err?.data?.message ?? err?.message ?? "Restore failed");
    }
  };

  // Export single / bulk re-import etc (unchanged)
  const doSingleExport = async (roll: any) => {
    if (!roll) return;
    const w = Number(roll.weight || 0);
    if (!w || w <= 0) return alert("Trọng lượng rỗng, không thể xuất");
    if (!confirm(`Xuất ${computePaperRollId(roll)} (${w}kg)?`)) return;

    const id = getIdFromDoc(roll) ?? roll.paperRollId;
    try {
      await createTransaction({
        paperRollId: id,
        employeeId: "69146dd889bf8e8ca320bcff",
        transactionType: "XUAT",
        initialWeight: w,
        finalWeight: 0,
        timeStamp: new Date().toISOString(),
        inCharge: "Operator A",
      }).unwrap();
      await updatePaperRoll({ id, data: { weight: 0 } }).unwrap();
      alert("Xuất thành công");
    } catch (err: any) {
      console.error(err);
      alert("Export failed");
    }
  };

  // QR helpers (same as before)
  const handleCreateQR = async (text: string) => {
    setQrModal({ open: true, text });
    setQrLoading(true);
    try {
      const dataUrl = await QRCode.toDataURL(text, { width: 400 });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error(err);
      alert("QR failed");
    } finally {
      setQrLoading(false);
    }
  };

  // render
  return (
    <div>
      {/* Header & create button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div>
          <strong>List cuộn giấy</strong>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="form-control"
            placeholder="Search supplier / width / grammage"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ minWidth: 320 }}
          />
          <button
            className="btn btn-primary"
            onClick={() => setCreateOpen(true)}
          >
            + Create
          </button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button
          className="btn btn-danger"
          onClick={() => {
            const sel = getSelectedRolls();
            if (!sel.length) return alert("Select at least 1");
            sel.length &&
              window.confirm(`Xuất ${sel.length} cuộn?`) &&
              sel.forEach((r) => doSingleExport(r));
          }}
        >
          Xuất (chọn)
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            const sel = getSelectedRolls();
            if (!sel.length) return alert("Select at least 1");
            setBulkModal({ open: true, mode: "NHAPLAI" });
          }}
        >
          Nhập lại (chọn)
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() => {
            const any = visibleRows.some((r) => selectedIds[r.paperRollId]);
            selectAllVisible(!any);
          }}
        >
          Toggle chọn tất cả trang này
        </button>
        <div style={{ flex: 1 }} />
        <div className="small text-muted">{paperRolls.length} rows total</div>
      </div>

      {/* Main table */}
      <div style={{ overflowX: "auto" }}>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input
                  type="checkbox"
                  onChange={(e) => selectAllVisible(e.target.checked)}
                  checked={
                    visibleRows.length > 0 &&
                    visibleRows.every((r) => selectedIds[r.paperRollId])
                  }
                />
              </th>
              <th>PaperRollId</th>
              <th>Color</th>
              <th>Supplier</th>
              <th style={{ textAlign: "right" }}>Width</th>
              <th style={{ textAlign: "right" }}>Grammage</th>
              <th style={{ textAlign: "right" }}>Weight</th>
              <th>Receive date</th>
              <th style={{ width: 360 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((r) => {
              const pt = r.paperType ?? r.paperTypeId ?? null;
              const colorId = getColorIdFromPaperType(pt);
              const colorObj = colorId
                ? colorMap.get(String(colorId))
                : undefined;
              const supplierObj =
                r.paperSupplier ??
                (r.paperSupplierId
                  ? supplierMap.get(String(getIdFromDoc(r.paperSupplierId)))
                  : undefined);

              return (
                <tr key={r.paperRollId ?? getIdFromDoc(r) ?? Math.random()}>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selectedIds[r.paperRollId]}
                      onChange={() => toggleSelect(r.paperRollId)}
                    />
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {computePaperRollId(r)}
                  </td>
                  <td>{colorObj?.title ?? "-"}</td>
                  <td>{supplierObj?.name ?? r.paperSupplier?.name ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>
                    {pt?.width ?? r.width ?? "-"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {pt?.grammage ?? r.grammage ?? "-"}
                  </td>
                  <td style={{ textAlign: "right" }}>{r.weight ?? "-"}</td>
                  <td>
                    {r.receivingDate
                      ? new Date(r.receivingDate).toISOString().slice(0, 10)
                      : "-"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setDetailOpen({ open: true, roll: r })}
                      >
                        Xem chi tiết
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => openEdit(r)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => doSingleExport(r)}
                      >
                        Xuất
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setBulkModal({ open: true, mode: "NHAPLAI" });
                          setSelectedIds({ [r.paperRollId]: true });
                        }}
                      >
                        Nhập lại
                      </button>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleCreateQR(computePaperRollId(r))}
                      >
                        Tạo QR
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleSoftDelete(r)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={9} className="text-muted p-4">
                  No rows
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Deleted table */}
      <h5 style={{ marginTop: 24 }}>Deleted rolls</h5>
      <div style={{ overflowX: "auto", marginBottom: 24 }}>
        <table className="table table-sm table-bordered">
          <thead>
            <tr>
              <th>PaperRollId</th>
              <th>Color</th>
              <th>Supplier</th>
              <th style={{ textAlign: "right" }}>Width</th>
              <th style={{ textAlign: "right" }}>Grammage</th>
              <th style={{ textAlign: "right" }}>Weight</th>
              <th>Deleted At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(deletedRolls || []).map((r) => {
              const pt = r.paperType ?? r.paperTypeId ?? null;
              const colorId = getColorIdFromPaperType(pt);
              const colorObj = colorId
                ? colorMap.get(String(colorId))
                : undefined;
              const supplierObj =
                r.paperSupplier ??
                (r.paperSupplierId
                  ? supplierMap.get(String(getIdFromDoc(r.paperSupplierId)))
                  : undefined);
              return (
                <tr key={getIdFromDoc(r) ?? Math.random()}>
                  <td>{computePaperRollId(r)}</td>
                  <td>{colorObj?.title ?? "-"}</td>
                  <td>{supplierObj?.name ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>
                    {pt?.width ?? r.width ?? "-"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {pt?.grammage ?? r.grammage ?? "-"}
                  </td>
                  <td style={{ textAlign: "right" }}>{r.weight ?? "-"}</td>
                  <td>
                    {r.deletedAt
                      ? new Date(r.deletedAt)
                          .toISOString()
                          .slice(0, 19)
                          .replace("T", " ")
                      : "-"}
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleRestore(r)}
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              );
            })}
            {(!deletedRolls || deletedRolls.length === 0) && (
              <tr>
                <td colSpan={8} className="text-muted p-3">
                  No deleted rolls
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create modal (same fields as before) */}
      {createOpen && (
        <div className="modal-backdrop" style={{ display: "block" }}>
          <div className="modal" role="dialog" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Create Paper Roll</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setCreateOpen(false)}
                  />
                </div>
                <div className="modal-body">
                  <label>
                    Color (title)
                    <select
                      className="form-control"
                      value={createForm.paperColorId}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          paperColorId: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- select color --</option>
                      {(allColors || []).map((c) => (
                        <option
                          key={getIdFromDoc(c) ?? c.code}
                          value={getIdFromDoc(c)}
                        >
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Supplier
                    <select
                      className="form-control"
                      value={createForm.paperSupplierId}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          paperSupplierId: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- select supplier --</option>
                      {(allSuppliers || []).map((s) => (
                        <option
                          key={getIdFromDoc(s) ?? s.code}
                          value={getIdFromDoc(s)}
                        >
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Width{" "}
                    <input
                      className="form-control"
                      type="number"
                      value={createForm.width}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, width: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Grammage{" "}
                    <input
                      className="form-control"
                      type="number"
                      value={createForm.grammage}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          grammage: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Weight{" "}
                    <input
                      className="form-control"
                      type="number"
                      value={createForm.weight}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, weight: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Receiving Date{" "}
                    <input
                      className="form-control"
                      type="date"
                      value={createForm.receivingDate}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          receivingDate: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Note{" "}
                    <textarea
                      className="form-control"
                      value={createForm.note}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, note: e.target.value }))
                      }
                    />
                  </label>
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

      {/* Update modal (editing all visible fields) */}
      {updateOpen && (
        <div className="modal-backdrop" style={{ display: "block" }}>
          <div className="modal" role="dialog" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Paper Roll</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setUpdateOpen(false)}
                  />
                </div>
                <div className="modal-body">
                  <label>
                    Color (title)
                    <select
                      className="form-control"
                      value={updateForm.paperColorId}
                      onChange={(e) =>
                        setUpdateForm((f) => ({
                          ...f,
                          paperColorId: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- select color --</option>
                      {(allColors || []).map((c) => (
                        <option
                          key={getIdFromDoc(c) ?? c.code}
                          value={getIdFromDoc(c)}
                        >
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Supplier
                    <select
                      className="form-control"
                      value={updateForm.paperSupplierId}
                      onChange={(e) =>
                        setUpdateForm((f) => ({
                          ...f,
                          paperSupplierId: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- select supplier --</option>
                      {(allSuppliers || []).map((s) => (
                        <option
                          key={getIdFromDoc(s) ?? s.code}
                          value={getIdFromDoc(s)}
                        >
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Width{" "}
                    <input
                      className="form-control"
                      type="number"
                      value={updateForm.width}
                      onChange={(e) =>
                        setUpdateForm((f) => ({ ...f, width: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Grammage{" "}
                    <input
                      className="form-control"
                      type="number"
                      value={updateForm.grammage}
                      onChange={(e) =>
                        setUpdateForm((f) => ({
                          ...f,
                          grammage: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Weight{" "}
                    <input
                      className="form-control"
                      type="number"
                      value={updateForm.weight}
                      onChange={(e) =>
                        setUpdateForm((f) => ({ ...f, weight: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Receiving Date{" "}
                    <input
                      className="form-control"
                      type="date"
                      value={updateForm.receivingDate}
                      onChange={(e) =>
                        setUpdateForm((f) => ({
                          ...f,
                          receivingDate: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Note{" "}
                    <textarea
                      className="form-control"
                      value={updateForm.note}
                      onChange={(e) =>
                        setUpdateForm((f) => ({ ...f, note: e.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setUpdateOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleUpdateSubmit}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <PaperDetailModal
        show={detailOpen.open}
        onHide={() => setDetailOpen({ open: false })}
        paper={detailOpen.roll}
        transactions={undefined}
        colorName={detailOpen.roll?.paperType?.paperColor?.title}
        supplierName={detailOpen.roll?.paperSupplier?.name}
      />

      <BulkActionModal
        show={bulkModal.open}
        mode={bulkModal.mode ?? "NHAPLAI"}
        selectedRolls={getSelectedRolls()}
        onClose={() => setBulkModal({ open: false })}
        onConfirmBulkReImport={() => {
          /* uses previous logic */
        }}
      />

      {/* QR modal block omitted for brevity — same as earlier in your component; keep handleDownload/Print helpers */}
    </div>
  );
};

export default PaperList;
