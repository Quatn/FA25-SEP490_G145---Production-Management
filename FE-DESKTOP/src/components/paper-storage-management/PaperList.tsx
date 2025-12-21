// src/components/paper-storage-management/PaperList.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import PaperDetailModal from "./PaperDetailModal";
import BulkActionModal from "./BulkActionModal";
import {
  useGetPaperRollsQuery,
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

// NEW: extracted modals
import {
  CreateModal,
  CreateMultipleModal,
  UpdateModal,
  SingleReimportModal,
  QrModal,
} from "./PaperListModal";

import { toaster } from "@/components/ui/toaster";
import { useConfirm } from "@/components/common/ConfirmModal";
import { PaperType } from "@/types/PaperType";

// --- privilege check imports ---
import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import check from "check-types";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";
// ------------------------------------

function uniqueIdTimeStamp() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getIdFromDoc(doc: any) {
  if (!doc) return undefined;
  if (typeof doc === "string") return doc;
  if (doc._id?.$oid) return String(doc._id.$oid);
  if (doc._id) return String(doc._id);
  if (doc.id) return String(doc.id);
  return undefined;
}

/** stable DB id helper — use everywhere for selection keys */
function getDbId(doc: any) {
  return getIdFromDoc(doc) ?? doc._id ?? doc.paperRollId ?? undefined;
}

export const PaperList: React.FC = () => {
  // --- manual privilege check (edit list as requested) ---
  const hydrating: boolean = useAppSelector((s) => (s as any).auth?.hydrating);
  const userState: UserState | null = useAppSelector(
    (s) => (s as any).auth?.userState ?? null
  );

  const EDIT_PRIVS: AnyAccessPrivileges[] = [
    "system-admin",
    "system-readWrite",
    "paper-roll-admin",
    "paper-roll-readWrite",
    "warehouse-admin",
    "warehouse-readWrite",
  ];

  const writeAllowed =
    check.nonEmptyArray(userState?.accessPrivileges) &&
    EDIT_PRIVS.find((priv) => userState!.accessPrivileges.includes(priv));

  const writeDisabled = !writeAllowed;
  // -------------------------------------------------------

  // Header style constants (match WareList: plain light blue)
  const HEADER_BG = "#e6f7ff"; // plain light blue
  const HEADER_TEXT = "#02296a"; // dark/navy text for contrast
  const headerCellBaseStyle: React.CSSProperties = {
    background: HEADER_BG,
    color: HEADER_TEXT,
    verticalAlign: "middle",
    fontWeight: 600,
    borderColor: "#d1e7ff",
    textAlign: "center",
  };

  const [query, setQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);

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
    paperColor: "",
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
    paperColor?: string;
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
      paperColor: "",
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
    paperColor: "",
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

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // fetch paginated rolls using page/limit/search
  const { data: rollsResp } = useGetPaperRollsQuery({
    page,
    limit,
    search: debouncedSearch,
    sortBy: "sequenceNumber",
    sortOrder: "desc",
  });

  // derive array of rolls (defensive against different response shapes)
  const paperRolls: any[] =
    rollsResp?.data?.data ?? rollsResp?.data ?? rollsResp ?? [];

  // extract total count defensively
  const totalCount =
    Number(
      rollsResp?.data?.totalItems ??
        rollsResp?.data?.total ??
        rollsResp?.total ??
        rollsResp?.data?.meta?.total ??
        rollsResp?.data?.meta?.count ??
        0
    ) || 0;
  const totalPages =
    totalCount > 0 ? Math.max(1, Math.ceil(totalCount / limit)) : 1;
  const goToPage = (p: number) => {
    if (p < 1) p = 1;
    if (totalCount > 0 && p > totalPages) p = totalPages;
    setPage(p);
  };

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

  const getColorIdFromPaperType = (pt: PaperType) => {
    if (!pt) return undefined;
    if (pt.paperColor && typeof pt.paperColor === "object")
      return getIdFromDoc(pt.paperColor);
    return getIdFromDoc(pt.paperColor) ?? undefined;
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

  // confirm hook (make sure ConfirmProvider is mounted above this component)
  const showConfirm = useConfirm();

  // --- SELECTION logic using DB id keys everywhere ---
  const selectedRolls = useMemo(
    () => paperRolls.filter((r) => !!selectedIds[getDbId(r)]),
    [paperRolls, selectedIds]
  );
  const visibleRows = useMemo(() => {
    const sel = new Set(selectedRolls.map((r) => getDbId(r)));
    return [
      ...selectedRolls,
      ...paperRolls.filter((r) => !sel.has(getDbId(r))),
    ];
  }, [paperRolls, selectedRolls]);

  // toggleSelect accepts either a roll object or a DB id string
  const toggleSelect = (rollOrId: any) => {
    const id = typeof rollOrId === "string" ? rollOrId : getDbId(rollOrId);
    if (!id) return;
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAllVisible = (checked: boolean) => {
    const newSel: Record<string, boolean> = { ...selectedIds };
    visibleRows.forEach((r) => {
      const id = getDbId(r);
      if (id) newSel[id] = checked;
    });
    setSelectedIds(newSel);
  };

  const getSelectedRolls = () =>
    paperRolls
      .filter((r) => !!selectedIds[getDbId(r)])
      .map((r) => ({ ...r, paperRollId: computePaperRollId(r) })); // include computed id for UI

  const handleCreateSubmit = async () => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền tạo cuộn.",
        type: "error",
      });
      return;
    }

    try {
      const supplierId = String(createForm.paperSupplierId ?? "");
      if (!supplierId) {
        toaster.create({
          description: "Please select a supplier",
          type: "error",
        });
        return;
      }

      let paperTypeId: string | undefined = undefined;

      if (createForm.useNewType) {
        const colorId = createForm.paperColor;
        const widthStr = String(createForm.width ?? "").trim();
        const grammageStr = String(createForm.grammage ?? "").trim();

        // cannot be empty
        if (!colorId || widthStr === "" || grammageStr === "") {
          toaster.create({
            description: "Màu, rộng hoặc khổ đang trống",
            type: "error",
          });
          return;
        }

        const widthNum = Number(widthStr);
        const grammageNum = Number(grammageStr);

        // must be numeric and >= 0
        if (
          !Number.isFinite(widthNum) ||
          widthNum < 0 ||
          !Number.isFinite(grammageNum) ||
          grammageNum < 0
        ) {
          toaster.create({
            description: "Rộng và khổ >= 0",
            type: "error",
          });
          return;
        }

        if (widthNum > 2000 || grammageNum > 2000) {
          toaster.create({
            description: "Rộng và khổ không được vượt quá 2000",
            type: "error",
          });
          return;
        }

        const matched = (allTypes || []).find((t: any) => {
          const tColorId = getIdFromDoc(t.paperColor);
          return (
            String(tColorId) === String(colorId) &&
            Number(t.width) === widthNum &&
            Number(t.grammage) === grammageNum
          );
        });
        paperTypeId = matched ? getIdFromDoc(matched) : undefined;
        if (!paperTypeId) {
          const createdResp: any = await addPaperType({
            paperColor: String(colorId),
            width: widthNum,
            grammage: grammageNum,
          }).unwrap();
          const createdDoc = createdResp?.data ?? createdResp;
          paperTypeId = getIdFromDoc(createdDoc);
        }
      } else {
        paperTypeId = createForm.paperTypeId;
      }

      if (!paperTypeId) {
        toaster.create({
          description: "Please select or create paper type",
          type: "error",
        });
        return;
      }

      // weight: cannot be empty and must be numeric >= 0
      const weightStr = String(createForm.weight ?? "").trim();
      if (weightStr === "") {
        toaster.create({
          description: "Please provide weight (>= 0)",
          type: "error",
        });
        return;
      }
      const weight = Number(weightStr);
      if (!Number.isFinite(weight) || weight < 0) {
        toaster.create({
          description: "Provide valid weight (>= 0)",
          type: "error",
        });
        return;
      }

      const receivingDate = createForm.receivingDate;
      if (!receivingDate) {
        toaster.create({
          description: "Please provide receiving date",
          type: "error",
        });
        return;
      }

      const payload = {
        paperSupplierId: supplierId,
        paperTypeId,
        weight,
        receivingDate,
        note: createForm.note ?? "",
      };

      const resp: any = await createPaperRoll(payload).unwrap();
      toaster.create({
        description: resp?.message ?? "Created",
        type: "success",
      });
      setCreateOpen(false);
      setCreateForm({
        useNewType: false,
        paperTypeId: "",
        paperColor: "",
        width: "",
        grammage: "",
        paperSupplierId: "",
        weight: "",
        receivingDate: "",
        note: "",
      });
    } catch (err: any) {
      console.error(err);
      toaster.create({
        description: err?.data?.message ?? err?.message ?? "Create failed",
        type: "error",
      });
    }
  };

  const addCreateMultipleRow = () =>
    setCreateMultipleRows((prev) => [
      ...prev,
      {
        id: String(Date.now()) + Math.random().toString(36).slice(2, 7),
        useNewType: false,
        paperTypeId: "",
        paperColor: "",
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
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền tạo nhiều cuộn.",
        type: "error",
      });
      return;
    }

    try {
      if (!createMultipleRows.length) {
        toaster.create({ description: "No rows", type: "error" });
        return;
      }

      const rollsPayload: any[] = [];

      for (const row of createMultipleRows) {
        const supplierId = String(row.paperSupplierId ?? "");
        if (!supplierId) {
          toaster.create({
            description: "Please select supplier for every row",
            type: "error",
          });
          return;
        }

        let paperTypeId: string | undefined = undefined;
        if (row.useNewType) {
          const colorId = row.paperColor;
          const widthStr = String(row.width ?? "").trim();
          const grammageStr = String(row.grammage ?? "").trim();

          if (!colorId || widthStr === "" || grammageStr === "") {
            toaster.create({
              description:
                "Please provide color, width and grammage for every new-type row",
              type: "error",
            });
            return;
          }

          const widthNum = Number(widthStr);
          const grammageNum = Number(grammageStr);

          if (
            !Number.isFinite(widthNum) ||
            widthNum < 0 ||
            !Number.isFinite(grammageNum) ||
            grammageNum < 0
          ) {
            toaster.create({
              description:
                "Width and grammage must be numbers >= 0 for every new-type row",
              type: "error",
            });
            return;
          }

          const matched = (allTypes || []).find((t: any) => {
            const tColorId = getIdFromDoc(t.paperColor);
            return (
              String(tColorId) === String(colorId) &&
              Number(t.width) === widthNum &&
              Number(t.grammage) === grammageNum
            );
          });
          paperTypeId = matched ? getIdFromDoc(matched) : undefined;

          if (!paperTypeId) {
            const createdResp: any = await addPaperType({
              paperColor: String(colorId),
              width: widthNum,
              grammage: grammageNum,
            }).unwrap();
            const createdDoc = createdResp?.data ?? createdResp;
            paperTypeId = getIdFromDoc(createdDoc);
          }
        } else {
          paperTypeId = row.paperTypeId;
        }

        if (!paperTypeId) {
          toaster.create({
            description: "Please select or create paper type for every row",
            type: "error",
          });
          return;
        }

        const weightStr = String(row.weight ?? "").trim();
        const receivingDate = row.receivingDate;
        if (weightStr === "") {
          toaster.create({
            description: "Provide valid weight (>= 0) for every row",
            type: "error",
          });
          return;
        }
        const weight = Number(weightStr);
        if (!Number.isFinite(weight) || weight < 0) {
          toaster.create({
            description: "Provide valid weight (>= 0) for every row",
            type: "error",
          });
          return;
        }

        if (!receivingDate) {
          toaster.create({
            description: "Please provide receiving date for every row",
            type: "error",
          });
          return;
        }

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
      toaster.create({
        description: resp?.message ?? `Created ${rollsPayload.length} rolls`,
        type: "success",
      });
      setCreateMultipleOpen(false);
      setCreateMultipleRows([
        {
          id: String(Date.now()),
          useNewType: false,
          paperTypeId: "",
          paperColor: "",
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
      toaster.create({
        description:
          err?.data?.message ?? err?.message ?? "Create multiple failed",
        type: "error",
      });
    }
  };

  const openEdit = (r: any) => {
    const pt = r.paperType ?? r.paperTypeId ?? null;
    const colorId = getColorIdFromPaperType(pt) ?? "";
    const supplierId = getIdFromDoc(r.paperSupplier ?? r.paperSupplierId) ?? "";
    setUpdateForm({
      id: getIdFromDoc(r) ?? r.paperRollId ?? "",
      paperColor: colorId,
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
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền cập nhật cuộn.",
        type: "error",
      });
      return;
    }

    const widthStr = String(updateForm.width ?? "").trim();
    const grammageStr = String(updateForm.grammage ?? "").trim();
    const weightStr = String(updateForm.weight ?? "").trim();

    // required checks for update: color, supplier, width, grammage, receivingDate
    if (
      !updateForm.paperColor ||
      !updateForm.paperSupplierId ||
      widthStr === "" ||
      grammageStr === "" ||
      !updateForm.receivingDate
    ) {
      toaster.create({
        description: "Please fill required fields",
        type: "error",
      });
      return;
    }

    const widthNum = Number(widthStr);
    const grammageNum = Number(grammageStr);
    const weightNum = Number(weightStr);

    if (
      !Number.isFinite(widthNum) ||
      widthNum < 0 ||
      !Number.isFinite(grammageNum) ||
      grammageNum < 0
    ) {
      toaster.create({
        description: "Width and grammage must be numbers >= 0",
        type: "error",
      });
      return;
    }

    if (!Number.isFinite(weightNum) || weightNum < 0) {
      toaster.create({
        description: "Weight must be a number >= 0",
        type: "error",
      });
      return;
    }

    try {
      const matched = (allTypes || []).find((t: any) => {
        const tColorId = getIdFromDoc(t.paperColor);
        return (
          String(tColorId) === String(updateForm.paperColor) &&
          Number(t.width) === widthNum &&
          Number(t.grammage) === grammageNum
        );
      });

      let paperTypeId = matched ? getIdFromDoc(matched) : undefined;
      if (!paperTypeId) {
        const createdResp: any = await addPaperType({
          paperColor: String(updateForm.paperColor),
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
      toaster.create({
        description: res?.message ?? "Updated",
        type: "success",
      });
      setUpdateOpen(false);
    } catch (err: any) {
      console.error(err);
      toaster.create({
        description: err?.data?.message ?? err?.message ?? "Update failed",
        type: "error",
      });
    }
  };

  const handleSoftDelete = async (r: any) => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền xóa cuộn.",
        type: "error",
      });
      return;
    }

    const id = getIdFromDoc(r) ?? r.paperRollId;
    if (!id) {
      toaster.create({ description: "No id", type: "error" });
      return;
    }
    const ok = await showConfirm({
      title: "Xóa cuộn",
      description: `Xóa ${computePaperRollId(r)}?`,
      confirmText: "Xóa",
      cancelText: "Hủy",
      destructive: true,
    });
    if (!ok) return;
    try {
      const res: any = await deletePaperRoll({ id }).unwrap();
      toaster.create({
        description: res?.message ?? "Deleted",
        type: "success",
      });
    } catch (err: any) {
      console.error(err);
      toaster.create({
        description: err?.data?.message ?? err?.message ?? "Delete failed",
        type: "error",
      });
    }
  };

  const doSingleExport = async (roll: any) => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền xuất cuộn.",
        type: "error",
      });
      return;
    }

    if (!roll) return;
    const w = Number(roll.weight || 0);
    if (!w || w <= 0) {
      toaster.create({
        description: "Trọng lượng rỗng, không thể xuất",
        type: "error",
      });
      return;
    }
    const ok = await showConfirm({
      title: "Xuất cuộn",
      description: `Xuất ${computePaperRollId(roll)} (${w}kg)?`,
      confirmText: "Xuất",
      cancelText: "Hủy",
      destructive: false,
    });
    if (!ok) return;

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
      toaster.create({ description: "Xuất thành công", type: "success" });
    } catch (err: any) {
      console.error(err);
      toaster.create({ description: "Export failed", type: "error" });
    }
  };

  const doSingleReImport = async (
    rollOrPaperRollId: any,
    newWeight: number
  ) => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền nhập lại cuộn.",
        type: "error",
      });
      return;
    }

    if (
      typeof newWeight !== "number" ||
      !Number.isFinite(newWeight) ||
      newWeight < 0
    ) {
      toaster.create({
        description: "Vui lòng cung cấp trọng lượng hợp lệ (>= 0).",
        type: "error",
      });
      return;
    }

    let roll: any = null;
    if (!rollOrPaperRollId) {
      toaster.create({ description: "No roll provided", type: "error" });
      return;
    }

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

    if (!roll) {
      toaster.create({
        description: "Không tìm thấy cuộn để cập nhật.",
        type: "error",
      });
      return;
    }

    const dbId = getIdFromDoc(roll) ?? roll._id ?? roll.paperRollId;
    if (!dbId) {
      toaster.create({
        description: "Không xác định được id cuộn (db id).",
        type: "error",
      });
      return;
    }

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

      // remove selection by DB id key
      setSelectedIds((prevSel) => {
        const next = { ...prevSel };
        const key = getDbId(roll) ?? dbId;
        if (key) delete next[key];
        return next;
      });

      toaster.create({ description: "Nhập lại thành công", type: "success" });
    } catch (err: any) {
      console.error("Single re-import failed", err);
      toaster.create({
        description: err?.data?.message ?? err?.message ?? "Nhập lại thất bại",
        type: "error",
      });
    }
  };

  const doBulkReImport = async (
    updates: { paperRollId: string; newWeight: number }[]
  ) => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền nhập lại hàng loạt.",
        type: "error",
      });
      return;
    }

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

      toaster.create({
        description: "Đã cập nhật trọng lượng nhập lại cho các cuộn.",
        type: "success",
      });
      setSelectedIds({});
    } catch (err) {
      console.error("Bulk re-import failed", err);
      toaster.create({ description: "Nhập lại thất bại", type: "error" });
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
      toaster.create({
        description: "Vui lòng nhập một số trọng lượng hợp lệ (>= 0).",
        type: "error",
      });
      return;
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
      toaster.create({ description: "QR failed", type: "error" });
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
    if (!qrDataUrl || !qrModal.text) {
      toaster.create({ description: "QR not ready", type: "error" });
      return;
    }
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
    if (!w) {
      toaster.create({ description: "Popup blocked", type: "error" });
      return;
    }
    w.document.write(`<img src="${qrDataUrl}" alt="QR" />`);
  };
  const handleCopyCode = async () => {
    if (!qrModal.text) return;
    try {
      await navigator.clipboard.writeText(qrModal.text);
      toaster.create({ description: "Mã cuộn đã được copy", type: "success" });
    } catch {
      toaster.create({
        description: "Copy failed — please copy manually: " + qrModal.text,
        type: "error",
      });
    }
  };
  const handlePrintQr = () => {
    if (!qrDataUrl) {
      toaster.create({ description: "QR not ready", type: "error" });
      return;
    }
    const w = window.open("", "_blank", "width=600,height=600");
    if (!w) {
      toaster.create({ description: "Popup blocked", type: "error" });
      return;
    }
    w.document.write(`
      <html><head><title>In QR</title></head>
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

  // handle bulk export (previously inline with window.confirm)
  const handleBulkExportSelected = async () => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền xuất hàng loạt.",
        type: "error",
      });
      return;
    }

    const sel = getSelectedRolls();
    if (!sel.length) {
      toaster.create({ description: "Select at least 1", type: "error" });
      return;
    }
    const ok = await showConfirm({
      title: "Xuất nhiều cuộn",
      description: `Xuất ${sel.length} cuộn?`,
      confirmText: "Xuất",
      cancelText: "Hủy",
      destructive: false,
    });
    if (!ok) return;
    // original behaviour also confirmed each individual export inside doSingleExport;
    // keep that behaviour by calling doSingleExport for each.
    sel.forEach((r) => doSingleExport(r));
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
            placeholder="Tìm kiếm NCC / khổ / định lượng"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1); // reset to first page on new search
            }}
            style={{ minWidth: 320 }}
          />
          <button
            className="btn btn-primary"
            onClick={() => setCreateOpen(true)}
            disabled={writeDisabled}
            title={"Tạo cuộn"}
            style={{ minWidth: 67 }}
          >
            + Tạo
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => setCreateMultipleOpen(true)}
            disabled={writeDisabled}
            title={"Tạo nhiều"}
            style={{ minWidth: 127 }}
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
            handleBulkExportSelected();
          }}
          disabled={writeDisabled}
          title={"Xuất (chọn)"}
        >
          Xuất (chọn)
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() => {
            const any = visibleRows.some((r) => !!selectedIds[getDbId(r)]);
            selectAllVisible(!any);
          }}
        >
          Toggle chọn tất cả trang này
        </button>
        <div style={{ flex: 1 }} />
        <div className="small text-muted">{totalCount} cuộn tất cả</div>
      </div>

      {/* Main table */}
      <div style={{ overflowX: "auto" }}>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th style={{ ...headerCellBaseStyle, width: 36 }}>
                <input
                  type="checkbox"
                  onChange={(e) => selectAllVisible(e.target.checked)}
                  checked={
                    visibleRows.length > 0 &&
                    visibleRows.every((r) => !!selectedIds[getDbId(r)])
                  }
                />
              </th>
              <th style={headerCellBaseStyle}>Mã cuộn</th>
              <th style={headerCellBaseStyle}>Màu</th>
              <th style={headerCellBaseStyle}>Nhà cung cấp</th>
              <th style={{ ...headerCellBaseStyle, textAlign: "right" }}>
                Khổ
              </th>
              <th style={{ ...headerCellBaseStyle, textAlign: "right" }}>
                Định lượng
              </th>
              <th style={{ ...headerCellBaseStyle, textAlign: "right" }}>
                Trọng lượng
              </th>
              <th style={headerCellBaseStyle}>Ngày nhập</th>
              <th style={{ ...headerCellBaseStyle, width: 360 }}>Actions</th>
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

              const dbId = getDbId(r) ?? uniqueIdTimeStamp();

              return (
                <tr key={dbId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selectedIds[getDbId(r)]}
                      onChange={() => toggleSelect(r)}
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
                        className="btn btn-danger btn-sm"
                        onClick={() => doSingleExport(r)}
                        disabled={writeDisabled}
                        title={"Xuất"}
                      >
                        Xuất
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          if (writeDisabled) {
                            toaster.create({
                              description: "Bạn không có quyền nhập lại cuộn.",
                              type: "error",
                            });
                            return;
                          }
                          setSingleModal({ open: true, roll: r });
                          const id = getDbId(r);
                          if (id) setSelectedIds({ [id]: true });
                        }}
                        disabled={writeDisabled}
                        title={"Nhập lại"}
                      >
                        Nhập lại
                      </button>

                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleSoftDelete(r)}
                        disabled={writeDisabled}
                        title={"Xóa"}
                      >
                        Xóa
                      </button>

                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleCreateQR(r._id)}
                      >
                        Tạo QR
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

      {/* Pagination controls (same UX as WareList) */}
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
            Trang {page} {totalCount > 0 && `trong ${totalPages}`}
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

          <div style={{ marginLeft: 12 }}>
            <select
              className="form-control form-control-sm"
              value={limit}
              onChange={(e) => {
                const v = Number(e.target.value || 5);
                if (!Number.isFinite(v) || v <= 0) return;
                setLimit(v);
                setPage(1);
              }}
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>
        </div>
      </div>

      {/* extracted modal components usage */}
      <CreateModal
        show={createOpen}
        onClose={() => setCreateOpen(false)}
        createForm={createForm}
        setCreateForm={setCreateForm}
        fieldStyle={fieldStyle}
        allTypes={allTypes}
        allColors={allColors}
        allSuppliers={allSuppliers}
        colorMap={colorMap}
        getIdFromDoc={getIdFromDoc}
        findType={findType}
        handleCreateSubmit={handleCreateSubmit}
        creating={creating}
      />

      <CreateMultipleModal
        show={createMultipleOpen}
        onClose={() => setCreateMultipleOpen(false)}
        createMultipleRows={createMultipleRows}
        addCreateMultipleRow={addCreateMultipleRow}
        removeCreateMultipleRow={removeCreateMultipleRow}
        updateCreateMultipleRow={updateCreateMultipleRow}
        allTypes={allTypes}
        allColors={allColors}
        allSuppliers={allSuppliers}
        colorMap={colorMap}
        getIdFromDoc={getIdFromDoc}
        handleCreateMultipleSubmit={handleCreateMultipleSubmit}
        creatingMultiple={creatingMultiple}
      />

      <UpdateModal
        show={updateOpen}
        onClose={() => setUpdateOpen(false)}
        updateForm={updateForm}
        setUpdateForm={setUpdateForm}
        allColors={allColors}
        allSuppliers={allSuppliers}
        fieldStyle={fieldStyle}
        getIdFromDoc={getIdFromDoc}
        handleUpdateSubmit={handleUpdateSubmit}
      />

      <SingleReimportModal
        show={singleModal.open}
        onClose={() => setSingleModal({ open: false })}
        roll={singleModal.roll}
        singleWeight={singleWeight}
        setSingleWeight={setSingleWeight}
        fieldStyle={fieldStyle}
        computePaperRollId={computePaperRollId}
        handleConfirmSingleReImport={handleConfirmSingleReImport}
      />

      <QrModal
        show={qrModal.open}
        onClose={() => setQrModal({ open: false })}
        qrModal={qrModal}
        qrLoading={qrLoading}
        qrDataUrl={qrDataUrl}
        handleOpenQrInNewTab={handleOpenQrInNewTab}
        handleDownloadQr={handleDownloadQr}
        handleCopyCode={handleCopyCode}
        handlePrintQr={handlePrintQr}
        computePaperRollId={computePaperRollId}
        paperRolls={paperRolls}
      />

      <PaperDetailModal
        show={detailOpen.open}
        onHide={() => setDetailOpen({ open: false })}
        paper={detailOpen.roll}
        transactions={undefined}
        colorName={detailOpen.roll?.paperType?.paperColor?.title}
        supplierName={detailOpen.roll?.paperSupplier?.name}
        paperRollId={
          detailOpen.roll ? computePaperRollId(detailOpen.roll) : undefined
        }
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
    </div>
  );
};

export default PaperList;
