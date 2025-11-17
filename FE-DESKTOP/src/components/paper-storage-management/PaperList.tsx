"use client";

import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import PaperDetailModal from "./PaperDetailModal";
import BulkActionModal from "./BulkActionModal";
import {
  useGetPaperRollsQuery,
  useGetDeletedPaperRollsQuery,
  useCreatePaperRollMutation,
  useCreateMultiplePaperRollsMutation,
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

  const [singleModal, setSingleModal] = useState<{ open: boolean; roll?: any }>(
    { open: false }
  );
  const [singleWeight, setSingleWeight] = useState<string>("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createMultipleOpen, setCreateMultipleOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    useNewType: false,
    paperTypeId: "",
    paperColorId: "",
    width: "",
    grammage: "",
    paperSupplierId: "",
    weight: "",
    receivingDate: "",
    note: "",
  });

  type CreateMultipleRow = {
    id: string;
    useNewType: boolean;
    paperTypeId?: string;
    paperColorId?: string;
    width?: string;
    grammage?: string;
    paperSupplierId?: string;
    weight?: string;
    receivingDate?: string;
    note?: string;
  };
  const [createMultipleRows, setCreateMultipleRows] = useState<
    CreateMultipleRow[]
  >([
    {
      id: String(Date.now()),
      useNewType: false,
      paperTypeId: "",
      paperColorId: "",
      width: "",
      grammage: "",
      paperSupplierId: "",
      weight: "",
      receivingDate: "",
      note: "",
    },
  ]);

  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    id: "",
    paperColorId: "",
    paperSupplierId: "",
    width: "",
    grammage: "",
    weight: "",
    receivingDate: "",
    note: "",
  });

  const [qrModal, setQrModal] = useState<{ open: boolean; text?: string }>({
    open: false,
  });
  const [qrDataUrl, setQrDataUrl] = useState<string | undefined>();
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data: rollsResp } = useGetPaperRollsQuery({
    page: 1,
    limit: 200,
    search: debouncedSearch,
    sortBy: "both",
    sortOrder: "desc",
  });
  const paperRolls: any[] = rollsResp?.data?.data ?? [];

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
  const [createMultiplePaperRolls, { isLoading: creatingMultiple }] =
    useCreateMultiplePaperRollsMutation();
  const [updatePaperRoll] = useUpdatePaperRollMutation();
  const [deletePaperRoll] = useDeletePaperRollMutation();
  const [restorePaperRoll] = useRestorePaperRollMutation();
  const [createTransaction] = useCreateTransactionMutation();

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

  const findType = (id?: string) =>
    (allTypes || []).find((t: any) => String(getIdFromDoc(t)) === String(id));

  const getColorIdFromPaperType = (pt: any) => {
    if (!pt) return undefined;
    if (pt.paperColorId && typeof pt.paperColorId === "object")
      return getIdFromDoc(pt.paperColorId);
    return getIdFromDoc(pt.paperColorId) ?? undefined;
  };

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
      if (seq > 0 && seq < 10) {
        return `${colorCode}/${supplierCode}/${width}/${grammage}/${supplierCode}0000${seq}XC${String(
          yy
        ).padStart(2, "0")}`;
      }
      if (seq >= 10 && seq < 100) {
        return `${colorCode}/${supplierCode}/${width}/${grammage}/${supplierCode}000${seq}XC${String(
          yy
        ).padStart(2, "0")}`;
      }
      if (seq >= 100 && seq < 1000) {
        return `${colorCode}/${supplierCode}/${width}/${grammage}/${supplierCode}00${seq}XC${String(
          yy
        ).padStart(2, "0")}`;
      }
      if (seq >= 1000 && seq < 10000) {
        return `${colorCode}/${supplierCode}/${width}/${grammage}/${supplierCode}0${seq}XC${String(
          yy
        ).padStart(2, "0")}`;
      }
      return `${colorCode}/${supplierCode}/${width}/${grammage}/${supplierCode}${seq}XC${String(
        yy
      ).padStart(2, "0")}`;
    }
    return r.paperRollId ?? "-";
  };

  const LOW_WEIGHT_THRESHOLD = 1000;
  const isLowWeight = (rollOrWeight: any) => {
    const w =
      rollOrWeight && typeof rollOrWeight === "object"
        ? Number(rollOrWeight.weight ?? 0)
        : Number(rollOrWeight ?? 0);
    return !isNaN(w) && w > 0 && w < LOW_WEIGHT_THRESHOLD;
  };

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

  const handleCreateSubmit = async () => {
    try {
      const supplierId = String(createForm.paperSupplierId ?? "");
      if (!supplierId) return alert("Please select a supplier");

      let paperTypeId: string | undefined = undefined;

      if (createForm.useNewType) {
        const colorId = createForm.paperColorId;
        const widthNum = Number(createForm.width || 0);
        const grammageNum = Number(createForm.grammage || 0);
        if (!colorId || !widthNum || !grammageNum)
          return alert("Please provide color, width and grammage for new type");

        const matched = (allTypes || []).find((t: any) => {
          const tColorId = getIdFromDoc(t.paperColorId);
          return (
            String(tColorId) === String(colorId) &&
            Number(t.width) === widthNum &&
            Number(t.grammage) === grammageNum
          );
        });
        paperTypeId = matched ? getIdFromDoc(matched) : undefined;
        if (!paperTypeId) {
          const createdResp: any = await addPaperType({
            paperColorId: String(colorId),
            width: widthNum,
            grammage: grammageNum,
          }).unwrap();
          const createdDoc = createdResp?.data ?? createdResp;
          paperTypeId = getIdFromDoc(createdDoc);
        }
      } else {
        paperTypeId = createForm.paperTypeId;
      }

      if (!paperTypeId) return alert("Please select or create paper type");

      const weight = Number(createForm.weight || 0);
      const receivingDate = createForm.receivingDate;
      if (!Number.isFinite(weight) || weight <= 0)
        return alert("Provide valid weight (>0)");
      if (!receivingDate) return alert("Please provide receiving date");

      const payload = {
        paperSupplierId: supplierId,
        paperTypeId,
        weight,
        receivingDate,
        note: createForm.note ?? "",
      };

      const resp: any = await createPaperRoll(payload).unwrap();
      alert(resp?.message ?? "Created");
      setCreateOpen(false);
      setCreateForm({
        useNewType: false,
        paperTypeId: "",
        paperColorId: "",
        width: "",
        grammage: "",
        paperSupplierId: "",
        weight: "",
        receivingDate: "",
        note: "",
      });
    } catch (err: any) {
      console.error(err);
      alert(err?.data?.message ?? err?.message ?? "Create failed");
    }
  };

  const addCreateMultipleRow = () =>
    setCreateMultipleRows((prev) => [
      ...prev,
      {
        id: String(Date.now()) + Math.random().toString(36).slice(2, 7),
        useNewType: false,
        paperTypeId: "",
        paperColorId: "",
        width: "",
        grammage: "",
        paperSupplierId: "",
        weight: "",
        receivingDate: "",
        note: "",
      },
    ]);

  const removeCreateMultipleRow = (id: string) =>
    setCreateMultipleRows((prev) => prev.filter((r) => r.id !== id));

  const updateCreateMultipleRow = (
    id: string,
    patch: Partial<CreateMultipleRow>
  ) =>
    setCreateMultipleRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );

  const handleCreateMultipleSubmit = async () => {
    try {
      if (!createMultipleRows.length) return alert("No rows");

      const rollsPayload: any[] = [];

      for (const row of createMultipleRows) {
        const supplierId = String(row.paperSupplierId ?? "");
        if (!supplierId) return alert("Please select supplier for every row");

        let paperTypeId: string | undefined = undefined;
        if (row.useNewType) {
          const colorId = row.paperColorId;
          const widthNum = Number(row.width || 0);
          const grammageNum = Number(row.grammage || 0);
          if (!colorId || !widthNum || !grammageNum)
            return alert(
              "Please provide color, width and grammage for every new-type row"
            );

          const matched = (allTypes || []).find((t: any) => {
            const tColorId = getIdFromDoc(t.paperColorId);
            return (
              String(tColorId) === String(colorId) &&
              Number(t.width) === widthNum &&
              Number(t.grammage) === grammageNum
            );
          });
          paperTypeId = matched ? getIdFromDoc(matched) : undefined;

          if (!paperTypeId) {
            const createdResp: any = await addPaperType({
              paperColorId: String(colorId),
              width: widthNum,
              grammage: grammageNum,
            }).unwrap();
            const createdDoc = createdResp?.data ?? createdResp;
            paperTypeId = getIdFromDoc(createdDoc);
          }
        } else {
          paperTypeId = row.paperTypeId;
        }

        if (!paperTypeId)
          return alert("Please select or create paper type for every row");

        const weight = Number(row.weight || 0);
        const receivingDate = row.receivingDate;
        if (!Number.isFinite(weight) || weight <= 0)
          return alert("Provide valid weight (>0) for every row");
        if (!receivingDate)
          return alert("Please provide receiving date for every row");

        rollsPayload.push({
          paperSupplierId: supplierId,
          paperTypeId,
          weight,
          receivingDate,
          note: row.note ?? "",
        });
      }

      const resp: any = await createMultiplePaperRolls({
        rolls: rollsPayload,
      }).unwrap();
      alert(resp?.message ?? `Created ${rollsPayload.length} rolls`);
      setCreateMultipleOpen(false);
      setCreateMultipleRows([
        {
          id: String(Date.now()),
          useNewType: false,
          paperTypeId: "",
          paperColorId: "",
          width: "",
          grammage: "",
          paperSupplierId: "",
          weight: "",
          receivingDate: "",
          note: "",
        },
      ]);
    } catch (err: any) {
      console.error(err);
      alert(err?.data?.message ?? err?.message ?? "Create multiple failed");
    }
  };

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

  const doSingleReImport = async (
    rollOrPaperRollId: any,
    newWeight: number
  ) => {
    if (
      typeof newWeight !== "number" ||
      !Number.isFinite(newWeight) ||
      newWeight < 0
    ) {
      return alert("Vui lòng cung cấp trọng lượng hợp lệ (>= 0).");
    }

    let roll: any = null;
    if (!rollOrPaperRollId) return alert("No roll provided");

    if (typeof rollOrPaperRollId === "string") {
      roll = paperRolls.find((r) => r.paperRollId === rollOrPaperRollId);
      if (!roll)
        roll = paperRolls.find(
          (r) =>
            getIdFromDoc(r) === rollOrPaperRollId || r._id === rollOrPaperRollId
        );
    } else {
      const candidateDbId =
        getIdFromDoc(rollOrPaperRollId) ??
        rollOrPaperRollId._id ??
        rollOrPaperRollId.paperRollId;
      roll =
        paperRolls.find((r) => {
          return (
            getIdFromDoc(r) === candidateDbId ||
            r._id === candidateDbId ||
            r.paperRollId === candidateDbId
          );
        }) || rollOrPaperRollId;
    }

    if (!roll) return alert("Không tìm thấy cuộn để cập nhật.");

    const dbId = getIdFromDoc(roll) ?? roll._id ?? roll.paperRollId;
    if (!dbId) return alert("Không xác định được id cuộn (db id).");

    const prev = Number(roll.weight || 0);
    const newW = Number(newWeight);

    try {
      await createTransaction({
        paperRollId: dbId,
        employeeId: "69146dd889bf8e8ca320bcff",
        transactionType: "NHAPLAI",
        initialWeight: prev,
        finalWeight: newW,
        timeStamp: new Date().toISOString(),
        inCharge: "Operator A",
      }).unwrap();

      await updatePaperRoll({ id: dbId, data: { weight: newW } }).unwrap();

      setSelectedIds((prevSel) => {
        const next = { ...prevSel };
        const prId = roll.paperRollId ?? dbId;
        delete next[prId];
        return next;
      });

      alert("Nhập lại thành công");
    } catch (err: any) {
      console.error("Single re-import failed", err);
      alert(err?.data?.message ?? err?.message ?? "Nhập lại thất bại");
    }
  };

  const doBulkReImport = async (
    updates: { paperRollId: string; newWeight: number }[]
  ) => {
    if (!updates || updates.length === 0) return;

    try {
      await Promise.all(
        updates.map(async (u) => {
          const roll = paperRolls.find((r) => r.paperRollId === u.paperRollId);
          if (!roll) return;
          const dbId = getIdFromDoc(roll) ?? roll._id ?? roll.paperRollId;
          const prev = Number(roll.weight || 0);
          const newW = Number(u.newWeight || 0);

          await createTransaction({
            paperRollId: dbId,
            employeeId: "69146dd889bf8e8ca320bcff",
            transactionType: "NHAPLAI",
            initialWeight: prev,
            finalWeight: newW,
            timeStamp: new Date().toISOString(),
            inCharge: "Operator A",
          }).unwrap();

          await updatePaperRoll({ id: dbId, data: { weight: newW } }).unwrap();
        })
      );

      alert("Đã cập nhật trọng lượng nhập lại cho các cuộn.");
      setSelectedIds({});
    } catch (err) {
      console.error("Bulk re-import failed", err);
      alert("Nhập lại thất bại");
    }
  };

  useEffect(() => {
    if (singleModal.open && singleModal.roll) {
      setSingleWeight(String(singleModal.roll.weight ?? 0));
    }
  }, [singleModal]);

  const handleConfirmSingleReImport = async () => {
    if (!singleModal.roll) return;
    const newW = Number(singleWeight);
    if (!Number.isFinite(newW) || newW < 0) {
      return alert("Vui lòng nhập một số trọng lượng hợp lệ (>= 0).");
    }
    await doSingleReImport(singleModal.roll, newW);
    setSingleModal({ open: false });
    setSingleWeight("");
  };

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

  const handleCloseQr = () => {
    setQrModal({ open: false, text: undefined });
    setQrDataUrl(undefined);
    setQrLoading(false);
  };
  const handleDownloadQr = () => {
    if (!qrDataUrl || !qrModal.text) return alert("QR not ready");
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${qrModal.text}-qr.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const handleOpenQrInNewTab = () => {
    if (!qrDataUrl) return;
    const w = window.open();
    if (!w) return alert("Popup blocked");
    w.document.write(`<img src="${qrDataUrl}" alt="QR" />`);
  };
  const handleCopyCode = async () => {
    if (!qrModal.text) return;
    try {
      await navigator.clipboard.writeText(qrModal.text);
      alert("Mã cuộn đã được copy");
    } catch {
      alert("Copy failed — please copy manually: " + qrModal.text);
    }
  };
  const handlePrintQr = () => {
    if (!qrDataUrl) return alert("QR not ready");
    const w = window.open("", "_blank", "width=600,height=600");
    if (!w) return alert("Popup blocked");
    w.document.write(`
      <html><head><title>QR Print</title></head>
      <body style="text-align:center;font-family:sans-serif;margin-top:40px">
        <img src="${qrDataUrl}" style="width:300px;height:300px" />
        <div class="code">${qrModal.text ?? ""}</div>
        <script>window.onload = () => window.print()</script>
      </body></html>
    `);
    w.document.close();
  };

  const fieldStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 12,
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
            + Tạo
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => setCreateMultipleOpen(true)}
          >
            + Tạo nhiều
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
              <th>Mã cuộn</th>
              <th>Màu</th>
              <th>Nhà cung cấp</th>
              <th style={{ textAlign: "right" }}>Rộng</th>
              <th style={{ textAlign: "right" }}>Khổ</th>
              <th style={{ textAlign: "right" }}>Trọng lượng</th>
              <th>Ngày nhập</th>
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
                  <td style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 8,
                        minWidth: 80,
                      }}
                    >
                      <span style={{ minWidth: 32, textAlign: "right" }}>
                        {r.weight ?? "-"}
                      </span>
                      {isLowWeight(r) && (
                        <span
                          title={`Weight below ${LOW_WEIGHT_THRESHOLD}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "2px 6px",
                            borderRadius: 999,
                            background: "rgba(220,53,69,0.12)",
                            color: "#c82333",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden
                          >
                            <path d="M12 2L22 20H2L12 2Z" fill="#ffc107" />
                            <path
                              d="M12 8V12"
                              stroke="#212529"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 16H12.01"
                              stroke="#212529"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span style={{ lineHeight: 1 }}>{"Low"}</span>
                        </span>
                      )}
                    </div>
                  </td>
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
                          setSingleModal({ open: true, roll: r });
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
                  Rỗng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h5 style={{ marginTop: 24 }}>Các cuộn đã xóa</h5>
      <div style={{ overflowX: "auto", marginBottom: 24 }}>
        <table className="table table-sm table-bordered">
          <thead>
            <tr>
              <th>Mã cuộn</th>
              <th>Màu</th>
              <th>Nhà cung cấp</th>
              <th style={{ textAlign: "right" }}>Rộng</th>
              <th style={{ textAlign: "right" }}>Khổ</th>
              <th style={{ textAlign: "right" }}>Trọng lượng</th>
              <th>Ngày xóa</th>
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
                  <td style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 8,
                        minWidth: 80,
                      }}
                    >
                      <span style={{ minWidth: 32, textAlign: "right" }}>
                        {r.weight ?? "-"}
                      </span>
                      {isLowWeight(r) && (
                        <span
                          title={`Weight below ${LOW_WEIGHT_THRESHOLD}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "2px 6px",
                            borderRadius: 999,
                            background: "rgba(220,53,69,0.12)",
                            color: "#c82333",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden
                          >
                            <path d="M12 2L22 20H2L12 2Z" fill="#ffc107" />
                            <path
                              d="M12 8V12"
                              stroke="#212529"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 16H12.01"
                              stroke="#212529"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span style={{ lineHeight: 1 }}>{"Low"}</span>
                        </span>
                      )}
                    </div>
                  </td>

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

      {createOpen && (
        <div className="modal-backdrop" style={{ display: "block" }}>
          <div className="modal" role="dialog" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Tạo cuộn</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setCreateOpen(false)}
                  />
                </div>
                <div className="modal-body">
                  <label style={fieldStyle}>
                    <input
                      type="checkbox"
                      checked={createForm.useNewType}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          useNewType: e.target.checked,
                        }))
                      }
                    />{" "}
                    Tạo loại giấy mới
                  </label>

                  {!createForm.useNewType ? (
                    <label style={fieldStyle}>
                      Loại giấy
                      <select
                        className="form-control"
                        value={createForm.paperTypeId}
                        onChange={(e) =>
                          setCreateForm((f) => ({
                            ...f,
                            paperTypeId: e.target.value,
                          }))
                        }
                      >
                        <option value="">-- chọn loại giấy --</option>
                        {(allTypes || []).map((t) => (
                          <option
                            key={getIdFromDoc(t) ?? `${t.width}_${t.grammage}`}
                            value={getIdFromDoc(t)}
                          >
                            {`${
                              t.paperColor?.title ??
                              colorMap.get(String(getIdFromDoc(t.paperColorId)))
                                ?.title ??
                              ""
                            } — ${t.width} x ${t.grammage}`}
                          </option>
                        ))}
                      </select>
                      {createForm.paperTypeId && (
                        <div style={{ marginTop: 8 }}>
                          <small className="text-muted">
                            Width:{" "}
                            {findType(createForm.paperTypeId)?.width ?? "-"} |
                            Grammage:{" "}
                            {findType(createForm.paperTypeId)?.grammage ?? "-"}{" "}
                            | Color:{" "}
                            {findType(createForm.paperTypeId)?.paperColor
                              ?.title ??
                              colorMap.get(
                                String(
                                  getIdFromDoc(
                                    findType(createForm.paperTypeId)
                                      ?.paperColorId
                                  )
                                )
                              )?.title ??
                              "-"}
                          </small>
                        </div>
                      )}
                    </label>
                  ) : (
                    <>
                      <label style={fieldStyle}>
                        Màu
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
                          <option value="">-- chọn màu --</option>
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

                      <label style={fieldStyle}>
                        Rộng
                        <input
                          className="form-control"
                          type="number"
                          value={createForm.width}
                          onChange={(e) =>
                            setCreateForm((f) => ({
                              ...f,
                              width: e.target.value,
                            }))
                          }
                        />
                      </label>

                      <label style={fieldStyle}>
                        Khổ
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
                    </>
                  )}

                  <label style={fieldStyle}>
                    Nhà cung cấp
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
                      <option value="">-- chọn nhà cung cấp --</option>
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

                  <label style={fieldStyle}>
                    Trọng lượng
                    <input
                      className="form-control"
                      type="number"
                      value={createForm.weight}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, weight: e.target.value }))
                      }
                    />
                  </label>

                  <label style={fieldStyle}>
                    Ngày nhập
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

                  <label style={fieldStyle}>
                    Note
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

      {createMultipleOpen && (
        <div className="modal-backdrop" style={{ display: "block" }}>
          <div className="modal" role="dialog" style={{ display: "block" }}>
            {/* <-- changed modal-lg to modal-xl here --> */}
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Tạo nhiều cuộn</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setCreateMultipleOpen(false)}
                  />
                </div>
                <div className="modal-body">
                  <div
                    style={{
                      marginBottom: 8,
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={addCreateMultipleRow}
                    >
                      Thêm dòng
                    </button>
                    <small className="text-muted">
                      Mỗi dòng tương ứng 1 cuộn — mỗi dòng có thể có
                      loại/supplier/trọng lượng riêng
                    </small>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table className="table table-sm table-bordered">
                      <thead>
                        <tr>
                          <th style={{ width: 36 }}>#</th>
                          <th style={{ minWidth: 420 }}>Loại giấy</th>{" "}
                          <th>Nhà cung cấp</th>
                          <th style={{ width: 150 }}>Trọng lượng</th>
                          <th style={{ width: 140 }}>Ngày nhập</th>
                          <th>Ghi chú</th>
                          <th style={{ width: 80 }}>Xóa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {createMultipleRows.map((row, idx) => (
                          <tr key={row.id}>
                            <td>{idx + 1}</td>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  alignItems: "center",
                                  flexDirection: "column",
                                }}
                              >
                                {!row.useNewType ? (
                                  (() => {
                                    // compute a friendly title so user can hover and see full text
                                    const st = findType(row.paperTypeId);
                                    const titleText = st
                                      ? `${
                                          st.paperColor?.title ??
                                          colorMap.get(
                                            String(
                                              getIdFromDoc(st.paperColorId)
                                            )
                                          )?.title ??
                                          ""
                                        } — ${st.width} x ${st.grammage}`
                                      : "";

                                    return (
                                      <select
                                        className="form-control"
                                        value={row.paperTypeId}
                                        onChange={(e) =>
                                          updateCreateMultipleRow(row.id, {
                                            paperTypeId: e.target.value,
                                          })
                                        }
                                        style={{ minWidth: 420 }}
                                        title={titleText}
                                      >
                                        <option value="">
                                          -- chọn loại giấy --
                                        </option>
                                        {(allTypes || []).map((t) => (
                                          <option
                                            key={
                                              getIdFromDoc(t) ??
                                              `${t.width}_${t.grammage}`
                                            }
                                            value={getIdFromDoc(t)}
                                          >
                                            {`${
                                              t.paperColor?.title ??
                                              colorMap.get(
                                                String(
                                                  getIdFromDoc(t.paperColorId)
                                                )
                                              )?.title ??
                                              ""
                                            } — ${t.width} x ${t.grammage}`}
                                          </option>
                                        ))}
                                      </select>
                                    );
                                  })()
                                ) : (
                                  <>
                                    <select
                                      className="form-control"
                                      value={row.paperColorId}
                                      onChange={(e) =>
                                        updateCreateMultipleRow(row.id, {
                                          paperColorId: e.target.value,
                                        })
                                      }
                                      style={{ minWidth: 200 }}
                                    >
                                      <option value="">-- chọn màu --</option>
                                      {(allColors || []).map((c) => (
                                        <option
                                          key={getIdFromDoc(c) ?? c.code}
                                          value={getIdFromDoc(c)}
                                        >
                                          {c.title}
                                        </option>
                                      ))}
                                    </select>
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: 8,
                                        marginTop: 8,
                                      }}
                                    >
                                      <input
                                        className="form-control"
                                        placeholder="Width"
                                        type="number"
                                        value={row.width}
                                        onChange={(e) =>
                                          updateCreateMultipleRow(row.id, {
                                            width: e.target.value,
                                          })
                                        }
                                      />
                                      <input
                                        className="form-control"
                                        placeholder="Grammage"
                                        type="number"
                                        value={row.grammage}
                                        onChange={(e) =>
                                          updateCreateMultipleRow(row.id, {
                                            grammage: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>

                            <td>
                              <select
                                className="form-control"
                                value={row.paperSupplierId}
                                onChange={(e) =>
                                  updateCreateMultipleRow(row.id, {
                                    paperSupplierId: e.target.value,
                                  })
                                }
                              >
                                <option value="">
                                  -- chọn nhà cung cấp --
                                </option>
                                {(allSuppliers || []).map((s) => (
                                  <option
                                    key={getIdFromDoc(s) ?? s.code}
                                    value={getIdFromDoc(s)}
                                  >
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td>
                              <input
                                className="form-control"
                                type="number"
                                min={0}
                                value={row.weight}
                                onChange={(e) =>
                                  updateCreateMultipleRow(row.id, {
                                    weight: e.target.value,
                                  })
                                }
                              />
                            </td>

                            <td>
                              <input
                                className="form-control"
                                type="date"
                                value={row.receivingDate}
                                onChange={(e) =>
                                  updateCreateMultipleRow(row.id, {
                                    receivingDate: e.target.value,
                                  })
                                }
                              />
                            </td>

                            <td>
                              <input
                                className="form-control"
                                value={row.note}
                                onChange={(e) =>
                                  updateCreateMultipleRow(row.id, {
                                    note: e.target.value,
                                  })
                                }
                              />
                            </td>

                            <td>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeCreateMultipleRow(row.id)}
                              >
                                X
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCreateMultipleOpen(false)}
                  >
                    Đóng
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateMultipleSubmit}
                    disabled={creatingMultiple}
                  >
                    {creatingMultiple ? "Đang tạo..." : "Tạo nhiều"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {updateOpen && (
        <div className="modal-backdrop" style={{ display: "block" }}>
          <div className="modal" role="dialog" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Sửa thông tin</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setUpdateOpen(false)}
                  />
                </div>
                <div className="modal-body">
                  <label style={fieldStyle}>
                    Màu
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
                  <label style={fieldStyle}>
                    Nhà cung cấp
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
                  <label style={fieldStyle}>
                    Rộng{" "}
                    <input
                      className="form-control"
                      type="number"
                      value={updateForm.width}
                      onChange={(e) =>
                        setUpdateForm((f) => ({ ...f, width: e.target.value }))
                      }
                    />
                  </label>
                  <label style={fieldStyle}>
                    Khổ{" "}
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
                  <label style={fieldStyle}>
                    Trọng lượng{" "}
                    <input
                      className="form-control"
                      type="number"
                      value={updateForm.weight}
                      onChange={(e) =>
                        setUpdateForm((f) => ({ ...f, weight: e.target.value }))
                      }
                    />
                  </label>
                  <label style={fieldStyle}>
                    Ngày nhập{" "}
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
                  <label style={fieldStyle}>
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
                    Đóng
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleUpdateSubmit}
                  >
                    Lưu
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
        onConfirmBulkReImport={(updates) => {
          doBulkReImport(updates);
          setBulkModal({ open: false });
        }}
      />

      {/* SINGLE re-import modal */}
      {singleModal.open && singleModal.roll && (
        <div className="modal-backdrop" style={{ display: "block" }}>
          <div className="modal" role="dialog" style={{ display: "block" }}>
            <div className="modal-dialog modal-sm">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Nhập lại (single)</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setSingleModal({ open: false })}
                  />
                </div>

                <div className="modal-body">
                  <p>
                    Nhập lại trọng lượng cho:{" "}
                    <strong>{computePaperRollId(singleModal.roll)}</strong>
                  </p>
                  <label style={fieldStyle}>
                    Trọng lượng (kg)
                    <input
                      className="form-control"
                      type="number"
                      min={0}
                      value={singleWeight}
                      onChange={(e) => setSingleWeight(e.target.value)}
                    />
                  </label>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSingleModal({ open: false })}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleConfirmSingleReImport()}
                  >
                    Xác nhận Nhập lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {qrModal.open && (
        <div className="modal-backdrop" style={{ display: "block" }}>
          <div className="modal" role="dialog" style={{ display: "block" }}>
            <div className="modal-dialog modal-sm">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">QR: {qrModal.text}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setQrModal({ open: false })}
                  />
                </div>
                <div className="modal-body" style={{ textAlign: "center" }}>
                  {qrLoading ? (
                    <div>Đang tạo QR...</div>
                  ) : qrDataUrl ? (
                    <>
                      <img
                        src={qrDataUrl}
                        alt="QR"
                        style={{ maxWidth: "100%", height: "auto" }}
                      />
                      <div
                        style={{
                          marginTop: 12,
                          display: "flex",
                          gap: 8,
                          justifyContent: "center",
                        }}
                      >
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={handleOpenQrInNewTab}
                        >
                          Mở tab mới
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={handleDownloadQr}
                        >
                          Download
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={handleCopyCode}
                        >
                          Copy mã cuộn
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={handlePrintQr}
                        >
                          In
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-danger">Tạo QR thất bại</div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setQrModal({ open: false })}
                  >
                    Đóng
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

export default PaperList;
