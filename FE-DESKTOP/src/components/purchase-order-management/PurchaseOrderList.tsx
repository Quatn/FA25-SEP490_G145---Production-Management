// src/components/purchase-order/PurchaseOrderList.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { PurchaseOrder } from "@/types/PurchaseOrderTypes";
import PurchaseOrderDetailModal from "./PurchaseOrderDetailModal";
import ProductSelectorModal from "./SubPOSelectorModal";
import {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderWithSubsQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useGetDeletedPurchaseOrdersQuery,
} from "@/service/api/purchaseOrderApiSlice";
import {
  useUpdatePurchaseOrderItemMutation,
  useDeletePurchaseOrderItemMutation,
} from "@/service/api/purchaseOrderItemApiSlice";
import {
  useCreateFromProductsMutation,
  useUpdateSubPurchaseOrderMutation,
  useDeleteSubPurchaseOrderMutation,
} from "@/service/api/subPurchaseOrderApiSlice";
import { toaster } from "@/components/ui/toaster";
import { useConfirm } from "@/components/common/ConfirmModal";

// --- privilege imports & check ---
import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import check from "check-types";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";
// -------------------------------------

function makeId(prefix = "") {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
}

function normalizeServerPo(raw: any): PurchaseOrder {
  const id = raw._id?.$oid ?? raw._id ?? raw.id ?? String(Math.random());
  let customerId: string | undefined = undefined;
  let customerName = "";
  if (raw.customer) {
    if (typeof raw.customer === "string") {
      customerId = raw.customer;
      customerName = "";
    } else if (raw.customer._id || raw.customer.$oid) {
      customerId = raw.customer._id?.$oid ?? raw.customer._id ?? raw.customer;
      customerName = raw.customer.name ?? "";
    } else {
      customerId = raw.customer;
      customerName = "";
    }
  }

  return {
    id,
    poNumber: raw.code ?? "",
    poDate:
      raw.orderDate && typeof raw.orderDate === "string"
        ? raw.orderDate.slice(0, 10)
        : raw.orderDate
        ? new Date(raw.orderDate).toISOString().slice(0, 10)
        : "",
    customer: customerName || raw.customer?.name || "",
    customerId,
    address: raw.deliveryAddress ?? raw.deliveryAdress ?? "",
    phone: raw.customer?.contactNumber ?? raw.phone ?? "",
    email: raw.customer?.email ?? raw.email ?? "",
    taxTemplate: (raw as any).paymentTerms ?? "",
    poType: (raw as any).poType ?? "",
    style: (raw as any).style ?? "",
    styleDetails: (raw as any).styleDetails ?? "",
    // default to DRAFT if missing
    status: raw.status ?? "DRAFT",
    subPOs: raw.subPOs ?? [],
    totalItems: (raw as any).totalItems ?? 0,
    totalValue: (raw as any).totalValue ?? 0,
    notes: raw.note ?? raw.notes ?? "",
    createdBy: (raw as any).createdBy ?? "",
  } as any;
}

const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => (
  <input
    className="form-control"
    placeholder="Tìm kiếm mã PO "
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);

// reduced statuses (selectable)
const PO_STATUS_OPTIONS = ["DRAFT", "PENDINGAPPROVAL", "APPROVED"];
const SUBPO_STATUS_OPTIONS = ["DRAFT", "PENDINGAPPROVAL", "APPROVED"];
const POITEM_STATUS_OPTIONS = ["DRAFT", "PENDINGAPPROVAL", "APPROVED"];

// read-only statuses (displayed but not selectable)
// include common variants to be safe
const READONLY_STATUSES = [
  "COMPLETED",
  "PARTIALLYCOMPLETE",
  "PARTIALLYCOMPLETED",
];

const includeCurrentStatus = (base: string[], current?: string) => {
  if (!current) return base;
  if (base.includes(current)) return base;
  return [...base, current];
};

// Map english status tokens -> Vietnamese label
const statusLabel = (status?: string) => {
  const s = (status ?? "DRAFT").toString().toUpperCase();
  switch (s) {
    case "DRAFT":
      return "Nháp";
    case "PENDINGAPPROVAL":
      return "Chờ duyệt";
    case "APPROVED":
      return "Đã duyệt";
    case "PARTIALLYCOMPLETED":
    case "PARTIALLYCOMPLETE":
      return "Sắp hoàn thành";
    case "COMPLETED":
      return "Đã hoàn thành";
    default:
      return status ?? "";
  }
};

const PurchaseOrderList: React.FC = () => {
  const confirm = useConfirm();

  // --- manual privilege check (same as WareList) ---
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
  // -----------------------------------------------------

  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(4);
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);

  const [productModalOpenForPo, setProductModalOpenForPo] = useState<{
    open: boolean;
    poId?: string;
  }>({
    open: false,
  });

  // get paginated purchase orders (now uses page, limit and search)
  const {
    data: poResp,
    isLoading,
    refetch,
  } = useGetPurchaseOrdersQuery({
    page,
    limit,
    search: query || undefined,
  });

  const { data: deletedResp, isLoading: isLoadingDeleted } =
    useGetDeletedPurchaseOrdersQuery({ page: 1, limit: 1000 });

  const [createPo] = useCreatePurchaseOrderMutation();
  const [updatePo] = useUpdatePurchaseOrderMutation();
  const [deletePo] = useDeletePurchaseOrderMutation();
  const [createSubFromProducts] = useCreateFromProductsMutation();

  const [updateSub] = useUpdateSubPurchaseOrderMutation();
  const [deleteSub] = useDeleteSubPurchaseOrderMutation();

  const [updatePoItem] = useUpdatePurchaseOrderItemMutation();
  const [deletePoItem] = useDeletePurchaseOrderItemMutation();

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [expandedLocalDoc, setExpandedLocalDoc] = useState<any | null>(null);

  const deletedList = useMemo(() => {
    const raw = (deletedResp && (deletedResp.data || deletedResp)) || [];
    return Array.isArray(raw) ? raw : [];
  }, [deletedResp]);

  // expanded PO id to show server-side sub-POs; fetch details only when expanded
  const [expandedPoId, setExpandedPoId] = useState<string | null>(null);
  const {
    data: expandedPoResp,
    isFetching: isFetchingSubs,
    refetch: refetchSubs,
  } = useGetPurchaseOrderWithSubsQuery(expandedPoId ?? "", {
    skip: !expandedPoId,
  });

  // guard for creating sub-POs to avoid double submissions
  const [isCreatingSubs, setIsCreatingSubs] = useState(false);

  // safe refetch helper for the subs query
  const safeRefetchSubs = async () => {
    try {
      if (!expandedPoId) return; // don't call refetch if no target id
      if (typeof refetchSubs !== "function") return;
      await refetchSubs();
    } catch (err) {
      console.warn("safeRefetchSubs: skipping refetch because it failed", err);
    }
  };

  // Helper: resolve id from server shapes
  const resolveId = (x: any) => {
    if (x == null) return "";
    const candidate = x?._id?.$oid ?? x?._id ?? x?.id ?? null;
    if (candidate !== null && candidate !== undefined) return String(candidate);
    if (
      typeof x === "string" ||
      typeof x === "number" ||
      typeof x === "boolean"
    )
      return String(x);
    return "";
  };

  // Helper: check if a status is read-only (treat the PARTIAL variants)
  const isReadOnlyStatus = (s?: string) =>
    !s ? false : READONLY_STATUSES.includes(String(s).toUpperCase());

  // Helper: compute derived statuses (display only) from items -> subs -> po
  const computeDerivedStatuses = (doc: any) => {
    if (!doc) return doc;
    const copy = doc;

    // Ensure arrays exist
    copy.subPurchaseOrders = Array.isArray(copy.subPurchaseOrders)
      ? copy.subPurchaseOrders
      : [];

    // Flag if any item completed anywhere
    let anyItemCompletedGlobal = false;

    // Compute each sub
    copy.subPurchaseOrders.forEach((s: any) => {
      s.items = Array.isArray(s.items) ? s.items : [];
      const itemStatuses = s.items.map((it: any) =>
        (it?.status ?? "DRAFT").toString().toUpperCase()
      );
      const completedCount = itemStatuses.filter(
        (st) => st === "COMPLETED"
      ).length;
      if (completedCount === itemStatuses.length && itemStatuses.length > 0) {
        s.status = "COMPLETED";
      } else if (completedCount > 0) {
        s.status = "PARTIALLYCOMPLETE";
      } else {
        // leave existing status if not derived
        // keep s.status as-is (usually DRAFT / PENDINGAPPROVAL / APPROVED)
      }
      if (completedCount > 0) anyItemCompletedGlobal = true;
    });

    // Compute parent PO status
    const subStatuses = copy.subPurchaseOrders.map((s: any) =>
      (s?.status ?? "DRAFT").toString().toUpperCase()
    );
    const allSubsCompleted =
      subStatuses.length > 0 && subStatuses.every((st) => st === "COMPLETED");
    const anySubPartial = subStatuses.some(
      (st) => st === "PARTIALLYCOMPLETE" || st === "PARTIALLYCOMPLETED"
    );
    if (allSubsCompleted) {
      copy.status = "COMPLETED";
    } else if (anySubPartial || anyItemCompletedGlobal) {
      copy.status = "PARTIALLYCOMPLETE";
    } else {
      // otherwise leave current status
    }

    return copy;
  };

  // Sync totals and also propagate any derived status from expanded local doc into 'orders' list for display
  const syncTotalsToOrders = (localDoc: any | null) => {
    if (!localDoc) return;
    const poId =
      String(localDoc._id ?? localDoc._id?.$oid ?? localDoc.id ?? "") || "";
    const totals = { items: 0, value: 0 };
    (localDoc.subPurchaseOrders || []).forEach((s: any) => {
      (s.items || []).forEach((it: any) => {
        totals.items += 1;
        const unit = Number(it.ware?.unitPrice ?? 0);
        const amt = Number(it.amount ?? 0);
        totals.value += unit * amt;
      });
    });

    setOrders((prev) =>
      prev.map((p) =>
        String(p.id) === String(poId)
          ? {
              ...p,
              totalItems: totals.items,
              totalValue: totals.value,
              // also reflect derived status for display
              status: localDoc.status ?? p.status,
              // and update subPOs preview (if you want)
              subPOs: localDoc.subPurchaseOrders || p.subPOs,
            }
          : p
      )
    );
  };

  // Normalize server response -> orders for the current page
  useEffect(() => {
    const payload = poResp?.data?.data ?? poResp?.data ?? [];
    if (Array.isArray(payload)) {
      setOrders(payload.map(normalizeServerPo));
    } else {
      setOrders([]);
    }
  }, [poResp]);

  // When expandedPoResp arrives, compute derived statuses and set expandedLocalDoc
  useEffect(() => {
    if (!expandedPoResp) {
      setExpandedLocalDoc(null);
      return;
    }
    const rawDoc = expandedPoResp?.data ?? expandedPoResp ?? null;
    if (!rawDoc) {
      setExpandedLocalDoc(null);
      return;
    }
    // deep clone then compute derived statuses
    try {
      const cloned = JSON.parse(JSON.stringify(rawDoc));
      const computed = computeDerivedStatuses(cloned);
      setExpandedLocalDoc(computed ? computed : null);
      syncTotalsToOrders(computed);
    } catch (err) {
      // fallback to original if JSON parse fails
      const copied = typeof rawDoc === "object" ? rawDoc : rawDoc;
      const computed = computeDerivedStatuses(copied);
      setExpandedLocalDoc(computed ? computed : null);
      syncTotalsToOrders(computed);
    }
  }, [expandedPoResp]);

  const displayList = orders;

  const handleCreateNewPO = () => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền tạo PO.",
        type: "error",
      });
      return;
    }

    const newPo: PurchaseOrder = {
      id: makeId("local-"),
      poNumber: "",
      poDate: new Date().toISOString().slice(0, 10),
      customer: "",
      customerId: undefined,
      address: "",
      phone: "",
      email: "",
      taxTemplate: "",
      poType: "",
      style: "",
      styleDetails: "",
      status: "DRAFT",
      subPOs: [],
      totalItems: 0,
      totalValue: 0,
      notes: "",
      createdBy: "",
    } as any;
    setSelected(newPo);
  };

  const handleSaveFromModal = async (updated: PurchaseOrder) => {
    try {
      // permission guard
      if (writeDisabled) {
        const message = "Bạn không có quyền lưu thay đổi cho PO.";
        toaster.create({ description: message, type: "error" });
        return { success: false, message };
      }

      const trimmedPoNumber = (updated.poNumber || "").trim();

      const errors: any = {};

      if (!trimmedPoNumber) {
        errors.poNumberRequired = true;
      }

      const customerId = (updated as any).customerId ?? undefined;
      if (!customerId || String(customerId).trim() === "") {
        errors.customerRequired = true;
      }

      const paymentTerms = String((updated as any).taxTemplate ?? "").trim();
      if (!paymentTerms) {
        errors.taxTemplateRequired = true;
      }

      if (Object.keys(errors).length > 0) {
        return { success: false, errors };
      }

      const conflict = orders.find(
        (o) =>
          (o.poNumber || "").trim().toLowerCase() ===
            trimmedPoNumber.toLowerCase() && String(o.id) !== String(updated.id)
      );

      const isCodeInDeleted = (code?: string) => {
        if (!code) return false;
        return deletedList.some(
          (d: any) =>
            (d.code || d.orderCode || d._id) === code ||
            (d.code || d.orderCode) === code
        );
      };

      if (conflict) {
        return {
          success: false,
          errors: { poNumberDuplicate: true },
          message: `PO number "${trimmedPoNumber}" already exists (PO id: ${conflict.id}). Please use a different PO number.`,
        };
      }

      if (isCodeInDeleted(trimmedPoNumber)) {
        toaster.create({
          description:
            "Mã đơn hàng đã tồn tại trong danh sách bị xóa, liên hệ admin để khôi phục",
          type: "error",
        });
        return;
      }

      const payload: any = {
        code: trimmedPoNumber,
        orderDate: updated.poDate,
        deliveryAddress: updated.address,
        paymentTerms: updated.taxTemplate,
        note: updated.notes,
      };
      if ((updated as any).customerId) {
        payload.customer = (updated as any).customerId;
      }

      let created = false;
      if (!updated.id || String(updated.id).startsWith("local-")) {
        await createPo(payload).unwrap();
        created = true;
      } else {
        await updatePo({ id: updated.id, body: payload }).unwrap();
      }

      try {
        if (typeof refetch === "function") await refetch();
      } catch (e) {
        console.warn("refetch purchase orders failed", e);
      }

      // success -> parent returns success to modal, which will close
      setSelected(null);

      toaster.create({
        description: created ? "Tạo PO thành công." : "Cập nhật PO thành công.",
        type: "success",
      });

      return { success: true };
    } catch (err: any) {
      console.error("Save PO failed", err);
      const message =
        "Save failed: " + (err?.data?.message || err?.message || "unknown");
      toaster.create({ description: message, type: "error" });
      return { success: false, message };
    }
  };

  const handleDeleteFromList = async (po: PurchaseOrder) => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền xóa PO.",
        type: "error",
      });
      return;
    }

    if (!po?.id) return;
    if (po.status !== "DRAFT") {
      toaster.create({
        description: "Chỉ có thể xóa khi PO ở trạng thái DRAFT.",
        type: "error",
      });
      return;
    }
    const ok = await confirm({
      title: "Delete Purchase Order",
      description: "Delete this Purchase Order?",
      confirmText: "Delete",
      cancelText: "Cancel",
      destructive: true,
    });
    if (!ok) return;
    try {
      await deletePo(po.id).unwrap();
      try {
        if (typeof refetch === "function") await refetch();
      } catch (e) {
        console.warn("refetch purchase orders failed", e);
      }
      toaster.create({
        description: "Xóa PO thành công.",
        type: "success",
      });
    } catch (err: any) {
      console.error("Delete failed", err);
      toaster.create({
        description:
          "Delete failed: " + (err?.data?.message || err?.message || "unknown"),
        type: "error",
      });
    }
  };

  const toggleExpandSubs = (poId: string) => {
    // read-only toggle — do not restrict by writeDisabled
    setExpandedPoId((prev) => (prev === poId ? null : poId));
  };

  // Handler: update server item amount
  const handleUpdateServerItemAmount = async (
    itemIdRaw: any,
    newAmount: number
  ) => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền sửa số lượng sản phẩm.",
        type: "error",
      });
      return;
    }

    const idStr = String(resolveId(itemIdRaw));

    if (!expandedLocalDoc) {
      toaster.create({
        description: "Không thể sửa - dữ liệu chưa tải xong.",
        type: "error",
      });
      return;
    }

    const parentPOId = String(
      expandedLocalDoc._id ?? expandedLocalDoc.id ?? expandedPoId ?? ""
    );
    const parentPO = orders.find((o) => String(o.id) === String(parentPOId));
    if (!parentPO || parentPO.status !== "DRAFT") {
      toaster.create({
        description: "Chỉ có thể sửa item khi PO ở trạng thái DRAFT.",
        type: "error",
      });
      return;
    }

    let itemStatus: string | null = null;
    let parentSubStatus: string | null = null;
    (expandedLocalDoc.subPurchaseOrders || []).forEach((s: any) => {
      (s.items || []).forEach((it: any) => {
        if (String(resolveId(it)) === idStr) {
          itemStatus = it.status ?? "DRAFT";
          parentSubStatus = s.status ?? "DRAFT";
        }
      });
    });
    if (itemStatus !== "DRAFT" || parentSubStatus !== "DRAFT") {
      toaster.create({
        description:
          "Chỉ có thể sửa item khi PO và Sub-PO đều ở trạng thái DRAFT.",
        type: "error",
      });
      return;
    }

    // Optimistic update locally
    setExpandedLocalDoc((prev: any) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      let touched = false;
      (copy.subPurchaseOrders || []).forEach((s: any) => {
        (s.items || []).forEach((it: any) => {
          const itId = String(resolveId(it));
          if (itId === idStr) {
            it.amount = Number(newAmount ?? 0);
            touched = true;
          }
        });
      });
      if (touched) {
        // recompute derived statuses after change (no actual state change of statuses, but keep in sync)
        const derived = computeDerivedStatuses(copy);
        syncTotalsToOrders(derived);
        return derived;
      }
      return prev;
    });

    try {
      await updatePoItem({
        id: idStr,
        body: { amount: Number(newAmount ?? 0) },
      }).unwrap();
    } catch (err: any) {
      console.error("Update failed, refetching sub-POs", err);
      await safeRefetchSubs();
    }
  };

  // Handler: update server item status
  const handleUpdateServerItemStatus = async (
    itemRaw: any,
    newStatus: string
  ) => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền thay đổi trạng thái sản phẩm.",
        type: "error",
      });
      return;
    }

    const idStr = String(resolveId(itemRaw));

    if (!expandedLocalDoc) {
      toaster.create({
        description:
          "Không thể thay đổi trạng thái item - dữ liệu chưa tải xong.",
        type: "error",
      });
      return;
    }
    const parentPOId = String(
      expandedLocalDoc._id ?? expandedLocalDoc.id ?? expandedPoId ?? ""
    );
    const parentPO = orders.find((o) => String(o.id) === String(parentPOId));
    if (!parentPO) {
      toaster.create({ description: "Parent PO not found.", type: "error" });
      return;
    }

    // locate item and parent sub
    let itemStatus: string | null = null;
    let parentSub: any = null;
    (expandedLocalDoc.subPurchaseOrders || []).forEach((s: any) => {
      (s.items || []).forEach((it: any) => {
        if (String(resolveId(it)) === idStr) {
          itemStatus = it.status ?? "DRAFT";
          parentSub = s;
        }
      });
    });

    if (!itemStatus) {
      toaster.create({ description: "Item không tồn tại.", type: "error" });
      return;
    }

    const parentSubStatus = parentSub?.status ?? "DRAFT";

    // Allowed flows:
    // - If parent PO and parent Sub are DRAFT and item is DRAFT -> allow changes (to PENDINGAPPROVAL or APPROVED) as before.
    // - If item is PENDINGAPPROVAL -> allow only APPROVED (confirm).
    // Otherwise deny.
    if (
      parentPO.status === "DRAFT" &&
      parentSubStatus === "DRAFT" &&
      itemStatus === "DRAFT"
    ) {
      if (newStatus === "PENDINGAPPROVAL") {
        const ok = await confirm({
          title: "Confirm change",
          description:
            "Xác nhận chuyển item này sang trạng thái PENDINGAPPROVAL? Sau khi xác nhận, không thể chỉnh sửa.",
          confirmText: "Confirm",
          cancelText: "Cancel",
          destructive: true,
        });
        if (!ok) {
          return;
        }
      }

      if (newStatus === "APPROVED") {
        const ok = await confirm({
          title: "Confirm approve item",
          description:
            "Xác nhận duyệt item này (APPROVED)? Sau khi duyệt, không thể chỉnh sửa.",
          confirmText: "Confirm",
          cancelText: "Cancel",
          destructive: true,
        });
        if (!ok) return;
      }

      setExpandedLocalDoc((prev: any) => {
        if (!prev) return prev;
        const copy = JSON.parse(JSON.stringify(prev));
        (copy.subPurchaseOrders || []).forEach((s: any) => {
          (s.items || []).forEach((it: any) => {
            if (String(resolveId(it)) === idStr) {
              it.status = newStatus;
            }
          });
        });
        // recompute derived statuses after change
        const derived = computeDerivedStatuses(copy);
        syncTotalsToOrders(derived);
        return derived;
      });

      try {
        await updatePoItem({ id: idStr, body: { status: newStatus } }).unwrap();
      } catch (err: any) {
        console.error("Update item status failed", err);
        await safeRefetchSubs();
        toaster.create({
          description:
            "Update failed: " +
            (err?.data?.message || err?.message || "unknown"),
          type: "error",
        });
      }
      return;
    }

    if (itemStatus === "PENDINGAPPROVAL" && newStatus === "APPROVED") {
      const ok = await confirm({
        title: "Confirm approve item",
        description:
          "Xác nhận duyệt item này (APPROVED)? Sau khi duyệt, không thể chỉnh sửa.",
        confirmText: "Confirm",
        cancelText: "Cancel",
        destructive: true,
      });
      if (!ok) return;

      setExpandedLocalDoc((prev: any) => {
        if (!prev) return prev;
        const copy = JSON.parse(JSON.stringify(prev));
        (copy.subPurchaseOrders || []).forEach((s: any) => {
          (s.items || []).forEach((it: any) => {
            if (String(resolveId(it)) === idStr) {
              it.status = "APPROVED";
            }
          });
        });
        const derived = computeDerivedStatuses(copy);
        syncTotalsToOrders(derived);
        return derived;
      });

      try {
        await updatePoItem({
          id: idStr,
          body: { status: "APPROVED" },
        }).unwrap();
      } catch (err: any) {
        console.error("Approve item failed", err);
        await safeRefetchSubs();
        toaster.create({
          description:
            "Update failed: " +
            (err?.data?.message || err?.message || "unknown"),
          type: "error",
        });
      }
      return;
    }

    toaster.create({
      description:
        "Chỉ có thể thay đổi trạng thái item khi nó đang ở DRAFT, hoặc duyệt khi nó đang PENDINGAPPROVAL.",
      type: "error",
    });
    return;
  };

  // Delete item (only if allowed)
  const handleDeleteServerItem = async (itemRaw: any) => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền xóa sản phẩm.",
        type: "error",
      });
      return;
    }

    const idStr = String(resolveId(itemRaw));
    if (!expandedLocalDoc) {
      toaster.create({
        description: "Cannot delete - data not loaded.",
        type: "error",
      });
      return;
    }
    const parentPOId = String(
      expandedLocalDoc._id ?? expandedLocalDoc.id ?? expandedPoId ?? ""
    );
    const parentPO = orders.find((o) => String(o.id) === String(parentPOId));
    if (!parentPO || parentPO.status !== "DRAFT") {
      toaster.create({
        description: "Only deletable when PO is DRAFT.",
        type: "error",
      });
      return;
    }
    let itemStatus: string | null = null;
    let parentSubStatus: string | null = null;
    (expandedLocalDoc.subPurchaseOrders || []).forEach((s: any) => {
      (s.items || []).forEach((it: any) => {
        if (String(resolveId(it)) === idStr) {
          itemStatus = it.status ?? "DRAFT";
          parentSubStatus = s.status ?? "DRAFT";
        }
      });
    });
    if (itemStatus !== "DRAFT" || parentSubStatus !== "DRAFT") {
      toaster.create({
        description: "Only deletable when PO/Sub-PO/Item are DRAFT.",
        type: "error",
      });
      return;
    }

    const ok = await confirm({
      title: "Delete item",
      description: "Delete this item?",
      confirmText: "Delete",
      cancelText: "Cancel",
      destructive: true,
    });
    if (!ok) return;

    const prevCopy = expandedLocalDoc
      ? JSON.parse(JSON.stringify(expandedLocalDoc))
      : null;
    setExpandedLocalDoc((prev: any) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      (copy.subPurchaseOrders || []).forEach((s: any) => {
        s.items = (s.items || []).filter(
          (it: any) => String(resolveId(it)) !== idStr
        );
      });
      const derived = computeDerivedStatuses(copy);
      syncTotalsToOrders(derived);
      return derived;
    });

    try {
      await deletePoItem(idStr).unwrap();
    } catch (err: any) {
      console.error("Delete failed, rolling back & refetching", err);
      if (prevCopy) setExpandedLocalDoc(prevCopy);
      await safeRefetchSubs();
      toaster.create({
        description:
          "Delete failed: " + (err?.data?.message || err?.message || "unknown"),
        type: "error",
      });
    }
  };

  // Delete sub (only when allowed)
  const handleDeleteServerSub = async (subRaw: any) => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền xóa sản phẩm trong PO.",
        type: "error",
      });
      return;
    }

    const subId = String(resolveId(subRaw));
    if (!expandedLocalDoc) {
      toaster.create({ description: "Data not loaded.", type: "error" });
      return;
    }
    const parentPOId = String(
      expandedLocalDoc._id ?? expandedLocalDoc.id ?? expandedPoId ?? ""
    );
    const parentPO = orders.find((o) => String(o.id) === String(parentPOId));
    if (!parentPO || parentPO.status !== "DRAFT") {
      toaster.create({
        description: "Only deletable when PO is DRAFT.",
        type: "error",
      });
      return;
    }
    const sub = (expandedLocalDoc.subPurchaseOrders || []).find(
      (x: any) => String(resolveId(x)) === subId
    );
    if (!sub || (sub.status ?? "DRAFT") !== "DRAFT") {
      toaster.create({
        description: "Only deletable when Sub-PO is DRAFT.",
        type: "error",
      });
      return;
    }

    const ok = await confirm({
      title: "Delete Sub-PO",
      description: "Xác nhận xóa sản phẩm này?",
      confirmText: "Delete",
      cancelText: "Cancel",
      destructive: true,
    });
    if (!ok) return;

    const prevCopy = expandedLocalDoc
      ? JSON.parse(JSON.stringify(expandedLocalDoc))
      : null;
    setExpandedLocalDoc((prev: any) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      copy.subPurchaseOrders = (copy.subPurchaseOrders || []).filter(
        (s: any) => resolveId(s) !== subId
      );
      const derived = computeDerivedStatuses(copy);
      syncTotalsToOrders(derived);
      return derived;
    });

    try {
      await deleteSub(subId).unwrap();
    } catch (err: any) {
      console.error("Delete sub-PO failed, rolling back & refetching", err);
      if (prevCopy) setExpandedLocalDoc(prevCopy);
      await safeRefetchSubs();
      toaster.create({
        description:
          "Xóa sản phẩm thất bại: " +
          (err?.data?.message || err?.message || "unknown"),
        type: "error",
      });
    }
  };

  // Handler: update PO status with propagation
  const handleUpdatePoStatus = async (poId: string, newStatus: string) => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền thay đổi trạng thái PO.",
        type: "error",
      });
      return;
    }

    const po = orders.find((o) => String(o.id) === String(poId));
    if (!po) {
      toaster.create({ description: "PO not found", type: "error" });
      return;
    }
    if (newStatus === po.status) return;

    try {
      // === Case: PO is DRAFT (existing behavior) ===
      if (po.status === "DRAFT") {
        // Only allow transition from DRAFT. If target is PENDINGAPPROVAL, propagate.
        if (newStatus === "PENDINGAPPROVAL") {
          const ok = await confirm({
            title: "Confirm change PO",
            description:
              "Xác nhận chuyển PO này sang PENDINGAPPROVAL? Sau khi xác nhận, PO và toàn bộ Sub-PO và Item sẽ được khoá.",
            confirmText: "Confirm",
            cancelText: "Cancel",
            destructive: true,
          });
          if (!ok) {
            return;
          }
          try {
            await updatePo({
              id: poId,
              body: { status: "PENDINGAPPROVAL" },
            }).unwrap();

            const poSnapshot =
              orders.find((o) => String(o.id) === String(poId)) ?? po;
            const subs = (poSnapshot as any).subPOs ?? [];

            let subsToUpdate = subs;
            if (
              expandedLocalDoc &&
              String(resolveId(expandedLocalDoc)) === String(poId)
            ) {
              subsToUpdate = expandedLocalDoc.subPurchaseOrders || subs;
            }

            for (const s of subsToUpdate) {
              const sid = String(resolveId(s));
              try {
                await updateSub({
                  id: sid,
                  body: { status: "PENDINGAPPROVAL" },
                }).unwrap();
              } catch (e) {
                console.warn("updateSub failed for", sid, e);
              }
              const items = s.items || [];
              for (const it of items) {
                const iid = String(resolveId(it));
                try {
                  await updatePoItem({
                    id: iid,
                    body: { status: "PENDINGAPPROVAL" },
                  }).unwrap();
                } catch (e) {
                  console.warn("updatePoItem failed for", iid, e);
                }
              }
            }

            await safeRefetchSubs();
            try {
              if (typeof refetch === "function") await refetch();
            } catch (e) {
              console.warn("refetch purchase orders failed", e);
            }
            toaster.create({
              description: "PO đã chuyển sang PENDINGAPPROVAL.",
              type: "success",
            });
          } catch (err: any) {
            console.error("Update PO status failed", err);
            try {
              if (typeof refetch === "function") await refetch();
            } catch (e) {
              console.warn("refetch purchase orders failed", e);
            }
            toaster.create({
              description:
                "Update PO status failed: " +
                (err?.data?.message || err?.message || "unknown"),
              type: "error",
            });
          }
        } else {
          if (newStatus === "APPROVED") {
            const ok = await confirm({
              title: "Confirm approve PO",
              description:
                "Xác nhận chuyển PO này sang APPROVED? Sau khi xác nhận, PO và tất cả Sub-PO và Item liên quan sẽ được cập nhật thành APPROVED và không thể chỉnh sửa.",
              confirmText: "Confirm",
              cancelText: "Cancel",
              destructive: true,
            });
            if (!ok) return;
          }

          try {
            await updatePo({ id: poId, body: { status: "APPROVED" } }).unwrap();

            let subsToUpdate: any[] = [];
            const poSnapshot =
              orders.find((o) => String(o.id) === String(poId)) ?? po;
            const subsFromSnapshot = (poSnapshot as any).subPOs ?? [];
            subsToUpdate = subsFromSnapshot;

            if (
              expandedLocalDoc &&
              String(resolveId(expandedLocalDoc)) === String(poId)
            ) {
              subsToUpdate = expandedLocalDoc.subPurchaseOrders || subsToUpdate;
            }

            for (const s of subsToUpdate) {
              const sid = String(resolveId(s));
              try {
                await updateSub({
                  id: sid,
                  body: { status: "APPROVED" },
                }).unwrap();
              } catch (e) {
                console.warn("updateSub failed for", sid, e);
              }

              const items = s.items || [];
              for (const it of items) {
                const iid = String(resolveId(it));
                try {
                  await updatePoItem({
                    id: iid,
                    body: { status: "APPROVED" },
                  }).unwrap();
                } catch (e) {
                  console.warn("updatePoItem failed for", iid, e);
                }
              }
            }

            await safeRefetchSubs();
            try {
              if (typeof refetch === "function") await refetch();
            } catch (e) {
              console.warn("refetch purchase orders failed", e);
            }
            toaster.create({
              description: "PO đã được DUYỆT (APPROVED).",
              type: "success",
            });
          } catch (err: any) {
            console.error("Update PO status failed", err);
            try {
              if (typeof refetch === "function") await refetch();
            } catch (e) {
              console.warn("refetch purchase orders failed", e);
            }
            toaster.create({
              description:
                "Update PO status failed: " +
                (err?.data?.message || err?.message || "unknown"),
              type: "error",
            });
          }
        }
      }
      // === Case: PO is PENDINGAPPROVAL -> allow only APPROVED and propagate to subs/items ===
      else if (po.status === "PENDINGAPPROVAL") {
        if (newStatus !== "APPROVED") {
          toaster.create({
            description:
              "Only transition allowed from PENDINGAPPROVAL is to APPROVED.",
            type: "error",
          });
          return;
        }

        const ok = await confirm({
          title: "Confirm approve PO",
          description:
            "Xác nhận duyệt PO này (APPROVED)? Sau khi xác nhận, PO và tất cả Sub-PO và Item liên quan sẽ được cập nhật thành APPROVED và không thể chỉnh sửa.",
          confirmText: "Confirm",
          cancelText: "Cancel",
          destructive: true,
        });
        if (!ok) return;

        try {
          await updatePo({ id: poId, body: { status: "APPROVED" } }).unwrap();

          let subsToUpdate: any[] = [];
          const poSnapshot =
            orders.find((o) => String(o.id) === String(poId)) ?? po;
          const subsFromSnapshot = (poSnapshot as any).subPOs ?? [];
          subsToUpdate = subsFromSnapshot;

          if (
            expandedLocalDoc &&
            String(resolveId(expandedLocalDoc)) === String(poId)
          ) {
            subsToUpdate = expandedLocalDoc.subPurchaseOrders || subsToUpdate;
          }

          for (const s of subsToUpdate) {
            const sid = String(resolveId(s));
            try {
              await updateSub({
                id: sid,
                body: { status: "APPROVED" },
              }).unwrap();
            } catch (e) {
              console.warn("updateSub failed for", sid, e);
            }

            const items = s.items || [];
            for (const it of items) {
              const iid = String(resolveId(it));
              try {
                await updatePoItem({
                  id: iid,
                  body: { status: "APPROVED" },
                }).unwrap();
              } catch (e) {
                console.warn("updatePoItem failed for", iid, e);
              }
            }
          }

          await safeRefetchSubs();
          try {
            if (typeof refetch === "function") await refetch();
          } catch (e) {
            console.warn("refetch purchase orders failed", e);
          }
          toaster.create({
            description: "PO đã được DUYỆT (APPROVED).",
            type: "success",
          });
        } catch (err: any) {
          console.error("Approve PO (from PENDINGAPPROVAL) failed", err);
          try {
            if (typeof refetch === "function") await refetch();
          } catch (e) {
            console.warn("refetch purchase orders failed", e);
          }
          toaster.create({
            description:
              "Update PO status failed: " +
              (err?.data?.message || err?.message || "unknown"),
            type: "error",
          });
        }
      } else {
        toaster.create({
          description:
            "Only editable when PO is DRAFT, or can be approved when in PENDINGAPPROVAL.",
          type: "error",
        });
        return;
      }
    } catch (err: any) {
      console.error("handleUpdatePoStatus unexpected error", err);
      toaster.create({
        description:
          "Update failed: " + (err?.data?.message || err?.message || "unknown"),
        type: "error",
      });
    }
  };

  // Handler: update Sub status with propagation to items when going to pending
  const handleUpdateSubStatus = async (subIdRaw: any, newStatus: string) => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền thay đổi trạng thái Sub-PO.",
        type: "error",
      });
      return;
    }

    const subId = String(resolveId(subIdRaw));
    if (!expandedLocalDoc) {
      toaster.create({ description: "Data not loaded.", type: "error" });
      return;
    }
    const poId = String(
      expandedLocalDoc._id ?? expandedLocalDoc.id ?? expandedPoId ?? ""
    );
    const poSnapshot = orders.find((o) => String(o.id) === String(poId));
    if (!poSnapshot) {
      toaster.create({
        description: "Parent PO not found.",
        type: "error",
      });
      return;
    }

    const sub = (expandedLocalDoc.subPurchaseOrders || []).find(
      (s: any) => String(resolveId(s)) === subId
    );
    const current = sub?.status ?? "DRAFT";
    if (newStatus === current) return;

    try {
      if (poSnapshot.status === "DRAFT" && current === "DRAFT") {
        if (newStatus === "PENDINGAPPROVAL") {
          const ok = await confirm({
            title: "Confirm change Sub-PO",
            description:
              "Xác nhận chuyển Sub-PO này sang PENDINGAPPROVAL? Sau khi xác nhận, Sub-PO và toàn bộ Item bên trong sẽ bị khoá.",
            confirmText: "Confirm",
            cancelText: "Cancel",
            destructive: true,
          });
          if (!ok) {
            return;
          }
          try {
            await updateSub({
              id: subId,
              body: { status: "PENDINGAPPROVAL" },
            }).unwrap();
            const items = sub.items || [];
            for (const it of items) {
              const iid = String(resolveId(it));
              try {
                await updatePoItem({
                  id: iid,
                  body: { status: "PENDINGAPPROVAL" },
                }).unwrap();
              } catch (e) {
                console.warn("updatePoItem failed for", iid, e);
              }
            }
            await safeRefetchSubs();
          } catch (err: any) {
            console.error("Update sub-PO status failed", err);
            await safeRefetchSubs();
            toaster.create({
              description:
                "Update failed: " +
                (err?.data?.message || err?.message || "unknown"),
              type: "error",
            });
          }
          return;
        }

        if (newStatus === "APPROVED") {
          const ok = await confirm({
            title: "Confirm approve Sub-PO",
            description:
              "Xác nhận duyệt Sub-PO này (APPROVED)? Sau khi xác nhận, Sub-PO sẽ được khoá và không thể chỉnh sửa.",
            confirmText: "Confirm",
            cancelText: "Cancel",
            destructive: true,
          });
          if (!ok) return;

          try {
            await updateSub({
              id: subId,
              body: { status: "APPROVED" },
            }).unwrap();
            const items = sub.items || [];
            for (const it of items) {
              const iid = String(resolveId(it));
              try {
                await updatePoItem({
                  id: iid,
                  body: { status: "APPROVED" },
                }).unwrap();
              } catch (e) {
                console.warn("updatePoItem failed for", iid, e);
              }
            }
            await safeRefetchSubs();
          } catch (err: any) {
            console.error("Update sub-PO status failed", err);
            await safeRefetchSubs();
            toaster.create({
              description:
                "Update failed: " +
                (err?.data?.message || err?.message || "unknown"),
              type: "error",
            });
          }
          return;
        }

        toaster.create({
          description: "Invalid sub-PO transition.",
          type: "error",
        });
        return;
      }

      if (current === "PENDINGAPPROVAL") {
        if (newStatus !== "APPROVED") {
          toaster.create({
            description:
              "Only transition allowed from PENDINGAPPROVAL for Sub-PO is to APPROVED.",
            type: "error",
          });
          return;
        }
        const ok = await confirm({
          title: "Confirm approve Sub-PO",
          description:
            "Xác nhận duyệt Sub-PO này (APPROVED)? Sau khi xác nhận, Sub-PO và tất cả Item bên trong sẽ được cập nhật thành APPROVED và không thể chỉnh sửa.",
          confirmText: "Confirm",
          cancelText: "Cancel",
          destructive: true,
        });
        if (!ok) return;

        try {
          await updateSub({ id: subId, body: { status: "APPROVED" } }).unwrap();

          const items = sub.items || [];
          for (const it of items) {
            const iid = String(resolveId(it));
            try {
              await updatePoItem({
                id: iid,
                body: { status: "APPROVED" },
              }).unwrap();
            } catch (e) {
              console.warn("updatePoItem failed for", iid, e);
            }
          }
          await safeRefetchSubs();
        } catch (err: any) {
          console.error("Approve sub-PO failed", err);
          await safeRefetchSubs();
          toaster.create({
            description:
              "Update failed: " +
              (err?.data?.message || err?.message || "unknown"),
            type: "error",
          });
        }
        return;
      }

      toaster.create({
        description:
          "Only editable when Sub-PO is DRAFT (and parent PO is DRAFT), or can be approved when Sub-PO is PENDINGAPPROVAL.",
        type: "error",
      });
      return;
    } catch (err: any) {
      console.error("handleUpdateSubStatus unexpected error", err);
      toaster.create({
        description:
          "Update failed: " + (err?.data?.message || err?.message || "unknown"),
        type: "error",
      });
    }
  };

  const handleUpdateSubDeliveryDate = async (
    subIdRaw: any,
    newDateStr: string
  ) => {
    if (writeDisabled) {
      toaster.create({
        description: "Bạn không có quyền thay đổi ngày giao Sub-PO.",
        type: "error",
      });
      return;
    }

    const subId = String(resolveId(subIdRaw));
    if (!expandedLocalDoc) {
      toaster.create({ description: "Data not loaded.", type: "error" });
      return;
    }
    const poId = String(
      expandedLocalDoc._id ?? expandedLocalDoc.id ?? expandedPoId ?? ""
    );
    const poSnapshot = orders.find((o) => String(o.id) === String(poId));
    if (!poSnapshot || poSnapshot.status !== "DRAFT") {
      toaster.create({
        description: "Only editable when PO is DRAFT.",
        type: "error",
      });
      return;
    }
    const sub = (expandedLocalDoc.subPurchaseOrders || []).find(
      (s: any) => String(resolveId(s)) === subId
    );
    if (!sub || (sub.status ?? "DRAFT") !== "DRAFT") {
      toaster.create({
        description: "Chỉ có thể chỉnh ngày giao khi Sub-PO đang DRAFT.",
        type: "error",
      });
      return;
    }

    setExpandedLocalDoc((prev: any) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      (copy.subPurchaseOrders || []).forEach((s: any) => {
        if (resolveId(s) === subId) s.deliveryDate = newDateStr || null;
      });
      const derived = computeDerivedStatuses(copy);
      return derived;
    });

    try {
      await updateSub({
        id: subId,
        body: { deliveryDate: newDateStr },
      }).unwrap();
      await safeRefetchSubs();
    } catch (err: any) {
      console.error("Update sub-PO delivery failed", err);
      await safeRefetchSubs();
      toaster.create({
        description:
          "Update failed: " + (err?.data?.message || err?.message || "unknown"),
        type: "error",
      });
    }
  };

  // --- pagination helpers (robust like the employee list) ---
  const inferredTotal =
    Number(
      poResp?.data?.totalItems ??
        poResp?.data?.total ??
        poResp?.total ??
        poResp?.data?.meta?.total ??
        poResp?.data?.meta?.count ??
        poResp?.meta?.total ??
        0
    ) || 0;

  const totalCount = inferredTotal > 0 ? inferredTotal : orders?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / limit));

  const goToPage = (p: number) => {
    if (p < 1) p = 1;
    if (inferredTotal > 0 && p > totalPages) p = totalPages;

    if (inferredTotal === 0 && p > page && (orders?.length ?? 0) < limit) {
      // no more pages available
      return;
    }

    setPage(p);
  };

  // when search changes, reset to page 1
  const onSearchChange = (v: string) => {
    setQuery(v);
    setPage(1);
  };

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <button
          className="btn btn-outline-primary"
          onClick={handleCreateNewPO}
          disabled={writeDisabled}
          title={writeDisabled ? "Bạn không có quyền tạo PO" : "Tạo PO"}
        >
          Tạo PO
        </button>
        <div style={{ flex: 1 }} />

        <div style={{ width: 360 }}>
          <SearchInput value={query} onChange={onSearchChange} />
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="text-muted">Loading purchase orders...</div>
        ) : displayList.length === 0 ? (
          <div className="text-muted">No purchase orders found</div>
        ) : (
          displayList.map((po) => {
            const isExpanded = expandedPoId === po.id;

            const expandedDocMatchesPo =
              expandedLocalDoc &&
              String(resolveId(expandedLocalDoc)) === String(po.id);

            const serverSubs =
              (expandedDocMatchesPo || isExpanded) && expandedLocalDoc
                ? expandedLocalDoc.subPurchaseOrders ?? []
                : [];

            const usedSubs = expandedDocMatchesPo
              ? expandedLocalDoc.subPurchaseOrders || []
              : isExpanded
              ? serverSubs
              : po.subPOs || [];

            const totals = {
              items: po.totalItems ?? 0,
              value: po.totalValue ?? 0,
            };

            // PO editable only in DRAFT (read-only statuses and APPROVED disallow editing)
            const poEditable = po.status === "DRAFT";
            const poStatusSelectable =
              (po.status === "DRAFT" || po.status === "PENDINGAPPROVAL") &&
              !writeDisabled;

            const poStatusUpper = (po.status ?? "").toString().toUpperCase();
            const poIsCompleted = poStatusUpper === "COMPLETED";

            return (
              <div
                key={String(po.id)}
                className="card mb-3"
                style={{
                  backgroundColor: poIsCompleted ? "#e6ffed" : undefined,
                }}
              >
                <div className="card-body">
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <strong>{po.poNumber}</strong>
                          <span className="text-muted">
                            {" "}
                            ({statusLabel(po.status)})
                          </span>
                          <small className="text-muted"> • {po.poDate}</small>
                          <div className="small text-muted">{po.customer}</div>
                          <div className="small text-muted">{po.address}</div>
                        </div>

                        <div
                          style={{
                            marginLeft: 12,
                            minWidth: 200,
                            maxWidth: 280,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ marginBottom: 8 }}>
                        <select
                          className="form-select form-select-sm"
                          value={po.status}
                          onChange={(e) =>
                            handleUpdatePoStatus(po.id, e.target.value)
                          }
                          disabled={!poStatusSelectable}
                        >
                          {includeCurrentStatus(
                            PO_STATUS_OPTIONS,
                            po.status
                          ).map((s) => {
                            const optionDisabled =
                              po.status === "PENDINGAPPROVAL" &&
                              s !== "APPROVED" &&
                              s !== po.status;
                            const globallyDisabled =
                              READONLY_STATUSES.includes(s);
                            return (
                              <option
                                key={s}
                                value={s}
                                disabled={optionDisabled || globallyDisabled}
                              >
                                {statusLabel(s)}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          gap: 8,
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => {
                            if (writeDisabled || !poEditable) return;
                            setSelected(po);
                          }}
                          disabled={!poEditable || writeDisabled}
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          className="btn btn-outline-info btn-sm"
                          onClick={() => toggleExpandSubs(po.id)}
                        >
                          {isExpanded ? "Hiện sản phẩm" : "Ẩn sản phẩm"}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteFromList(po)}
                          disabled={!poEditable || writeDisabled}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <h6 className="m-0">Sản phẩm</h6>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() =>
                            setProductModalOpenForPo({
                              open: true,
                              poId: po.id,
                            })
                          }
                          disabled={!poEditable || writeDisabled}
                          title={
                            writeDisabled
                              ? "Bạn không có quyền thêm Sub-PO"
                              : "+ Tạo Sub-PO (Chọn sản phẩm)"
                          }
                        >
                          + Tạo Sub-PO (Chọn sản phẩm)
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginBottom: 12 }}>
                        {isFetchingSubs ? (
                          <div className="text-muted">Loading sản phẩm...</div>
                        ) : serverSubs.length === 0 ? (
                          <div className="text-muted">Không có sản phẩm</div>
                        ) : (
                          serverSubs.map((s: any, sIdx: number) => {
                            const subKey =
                              resolveId(s) ||
                              `sub-noid-${String(po.id)}-${sIdx}`;
                            const subStatus = (s.status ?? "DRAFT")
                              .toString()
                              .toUpperCase();
                            const poStatusUpper = (po.status ?? "")
                              .toString()
                              .toUpperCase();

                            // If PO is read-only (COMPLETED / PARTIALLY* / APPROVED), disable sub actions
                            const parentPoIsReadOnly =
                              poStatusUpper === "APPROVED" ||
                              READONLY_STATUSES.includes(poStatusUpper);

                            const subStatusSelectable =
                              ((po.status === "DRAFT" &&
                                subStatus === "DRAFT") ||
                                subStatus === "PENDINGAPPROVAL") &&
                              !writeDisabled &&
                              !parentPoIsReadOnly;

                            return (
                              <div key={subKey} className="card mb-2">
                                <div className="card-body">
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      gap: 8,
                                    }}
                                  >
                                    <div>
                                      <strong>
                                        {s.product?.name ??
                                          s.product?.code ??
                                          "-"}
                                      </strong>
                                      <div className="small text-muted">
                                        Vận chuyển:{" "}
                                        {s.deliveryDate
                                          ? new Date(s.deliveryDate)
                                              .toISOString()
                                              .slice(0, 10)
                                          : "-"}
                                      </div>
                                    </div>

                                    <div style={{ textAlign: "right" }}>
                                      <div style={{ marginBottom: 6 }}>
                                        <select
                                          className="form-select form-select-sm"
                                          value={subStatus}
                                          onChange={(e) =>
                                            handleUpdateSubStatus(
                                              s._id ?? s.id,
                                              e.target.value
                                            )
                                          }
                                          disabled={!subStatusSelectable}
                                        >
                                          {includeCurrentStatus(
                                            SUBPO_STATUS_OPTIONS,
                                            subStatus
                                          ).map((st) => {
                                            const optionDisabled =
                                              subStatus === "PENDINGAPPROVAL" &&
                                              st !== "APPROVED" &&
                                              st !== subStatus;
                                            const globallyDisabled =
                                              READONLY_STATUSES.includes(st);
                                            return (
                                              <option
                                                key={st}
                                                value={st}
                                                disabled={
                                                  optionDisabled ||
                                                  globallyDisabled
                                                }
                                              >
                                                {statusLabel(st)}
                                              </option>
                                            );
                                          })}
                                        </select>
                                      </div>

                                      <div
                                        style={{
                                          display: "flex",
                                          gap: 8,
                                          justifyContent: "flex-end",
                                          alignItems: "center",
                                        }}
                                      >
                                        <input
                                          type="date"
                                          className="form-control form-control-sm"
                                          style={{ width: 160 }}
                                          value={
                                            s.deliveryDate
                                              ? typeof s.deliveryDate ===
                                                "string"
                                                ? s.deliveryDate.slice(0, 10)
                                                : new Date(s.deliveryDate)
                                                    .toISOString()
                                                    .slice(0, 10)
                                              : ""
                                          }
                                          onChange={(e) =>
                                            handleUpdateSubDeliveryDate(
                                              s._id ?? s.id,
                                              e.target.value
                                            )
                                          }
                                          disabled={
                                            !(
                                              !parentPoIsReadOnly &&
                                              po.status === "DRAFT" &&
                                              (s.status ?? "DRAFT") === "DRAFT"
                                            ) || writeDisabled
                                          }
                                        />

                                        <button
                                          className="btn btn-danger btn-sm"
                                          onClick={() =>
                                            handleDeleteServerSub(s)
                                          }
                                          disabled={
                                            !(
                                              !parentPoIsReadOnly &&
                                              po.status === "DRAFT" &&
                                              (s.status ?? "DRAFT") === "DRAFT"
                                            ) || writeDisabled
                                          }
                                        >
                                          Xóa sản phẩm
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* items for sub-PO */}
                                  <div style={{ marginTop: 8 }}>
                                    <table className="table table-sm table-bordered">
                                      <thead>
                                        <tr>
                                          <th>Mã sản phẩm</th>
                                          <th>Mã hàng</th>
                                          <th>Trạng thái</th>
                                          <th>Số lượng</th>
                                          <th>Đơn giá</th>
                                          <th style={{ textAlign: "right" }}>
                                            Thành tiền
                                          </th>
                                          <th style={{ width: 120 }}>
                                            Thao tác
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(s.items || []).map(
                                          (it: any, idx: number) => {
                                            const itemId = resolveId(it);
                                            const stableKey = itemId
                                              ? String(itemId)
                                              : `noid-${
                                                  resolveId(s) || String(po.id)
                                                }-${idx}`;
                                            const itemStatus = (
                                              it.status ?? "DRAFT"
                                            )
                                              .toString()
                                              .toUpperCase();

                                            // Disable item actions if parent PO is read-only (COMPLETED / PARTIALLY* / APPROVED)
                                            const itemSelectable =
                                              !writeDisabled &&
                                              !isReadOnlyStatus(po.status) &&
                                              po.status !== "APPROVED" &&
                                              (po.status === "DRAFT" &&
                                              (s.status ?? "DRAFT") ===
                                                "DRAFT" &&
                                              itemStatus === "DRAFT"
                                                ? true
                                                : itemStatus ===
                                                  "PENDINGAPPROVAL");

                                            const amountVal = it.amount ?? 0;
                                            const unitPrice =
                                              it.ware?.unitPrice ?? 0;
                                            return (
                                              <tr key={stableKey}>
                                                <td>
                                                  {s.product?.code ??
                                                    it.id ??
                                                    ""}
                                                </td>

                                                <td>
                                                  {it.ware
                                                    ? it.ware.code ??
                                                      it.ware._id
                                                    : "-"}
                                                </td>

                                                <td>
                                                  <select
                                                    className="form-select form-select-sm"
                                                    value={itemStatus}
                                                    onChange={(e) =>
                                                      handleUpdateServerItemStatus(
                                                        it,
                                                        e.target.value
                                                      )
                                                    }
                                                    disabled={!itemSelectable}
                                                  >
                                                    {includeCurrentStatus(
                                                      POITEM_STATUS_OPTIONS,
                                                      itemStatus
                                                    ).map((opt) => {
                                                      const optionDisabled =
                                                        itemStatus ===
                                                          "PENDINGAPPROVAL" &&
                                                        opt !== "APPROVED" &&
                                                        opt !== itemStatus;
                                                      // For items, COMPLETED also should be read-only:
                                                      const globallyDisabled =
                                                        READONLY_STATUSES.includes(
                                                          opt
                                                        );
                                                      return (
                                                        <option
                                                          key={opt}
                                                          value={opt}
                                                          disabled={
                                                            optionDisabled ||
                                                            globallyDisabled
                                                          }
                                                        >
                                                          {statusLabel(opt)}
                                                        </option>
                                                      );
                                                    })}
                                                  </select>
                                                </td>

                                                <td>
                                                  <input
                                                    className="form-control form-control-sm"
                                                    type="number"
                                                    min={0}
                                                    step={1}
                                                    inputMode="numeric"
                                                    value={Number(
                                                      it.amount ?? 0
                                                    )}
                                                    onKeyDown={(e) => {
                                                      if (
                                                        e.key === "-" ||
                                                        e.key === "+" ||
                                                        e.key === "e" ||
                                                        e.key === "."
                                                      ) {
                                                        e.preventDefault();
                                                      }
                                                    }}
                                                    onChange={(e) => {
                                                      let v =
                                                        e.target.value === ""
                                                          ? 0
                                                          : Math.floor(
                                                              Number(
                                                                e.target.value
                                                              ) || 0
                                                            );
                                                      if (v < 0) v = 0;

                                                      setExpandedLocalDoc(
                                                        (prev: any) => {
                                                          if (!prev)
                                                            return prev;
                                                          const copy =
                                                            JSON.parse(
                                                              JSON.stringify(
                                                                prev
                                                              )
                                                            );
                                                          (
                                                            copy.subPurchaseOrders ||
                                                            []
                                                          ).forEach(
                                                            (s2: any) => {
                                                              (
                                                                s2.items || []
                                                              ).forEach(
                                                                (ii: any) => {
                                                                  if (
                                                                    String(
                                                                      resolveId(
                                                                        ii
                                                                      )
                                                                    ) ===
                                                                    String(
                                                                      resolveId(
                                                                        it
                                                                      )
                                                                    )
                                                                  ) {
                                                                    ii.amount =
                                                                      v;
                                                                  }
                                                                }
                                                              );
                                                            }
                                                          );
                                                          const derived =
                                                            computeDerivedStatuses(
                                                              copy
                                                            );
                                                          syncTotalsToOrders(
                                                            derived
                                                          );
                                                          return derived;
                                                        }
                                                      );
                                                    }}
                                                    onBlur={(e) => {
                                                      let finalVal = Math.floor(
                                                        Number(
                                                          e.target.value || 0
                                                        ) || 0
                                                      );
                                                      if (finalVal < 0)
                                                        finalVal = 0;
                                                      handleUpdateServerItemAmount(
                                                        it,
                                                        finalVal
                                                      );
                                                    }}
                                                    onWheel={(e) => {
                                                      (
                                                        e.currentTarget as HTMLInputElement
                                                      ).blur();
                                                    }}
                                                    disabled={
                                                      !(
                                                        !writeDisabled &&
                                                        po.status === "DRAFT" &&
                                                        (s.status ??
                                                          "DRAFT") ===
                                                          "DRAFT" &&
                                                        (it.status ??
                                                          "DRAFT") === "DRAFT"
                                                      )
                                                    }
                                                  />
                                                </td>

                                                <td
                                                  style={{ textAlign: "right" }}
                                                >
                                                  {unitPrice ?? "-"}
                                                </td>

                                                <td
                                                  style={{ textAlign: "right" }}
                                                >
                                                  {(
                                                    Number(it.amount ?? 0) *
                                                    Number(unitPrice ?? 0)
                                                  ).toLocaleString()}
                                                </td>

                                                <td>
                                                  <div
                                                    style={{
                                                      display: "flex",
                                                      gap: 6,
                                                    }}
                                                  >
                                                    <button
                                                      className="btn btn-danger btn-sm"
                                                      onClick={() =>
                                                        handleDeleteServerItem(
                                                          it
                                                        )
                                                      }
                                                      disabled={
                                                        !(
                                                          !writeDisabled &&
                                                          po.status ===
                                                            "DRAFT" &&
                                                          (s.status ??
                                                            "DRAFT") ===
                                                            "DRAFT" &&
                                                          (it.status ??
                                                            "DRAFT") === "DRAFT"
                                                        )
                                                      }
                                                    >
                                                      Xóa
                                                    </button>
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          }
                                        )}
                                        {(s.items || []).length === 0 && (
                                          <tr>
                                            <td
                                              colSpan={7}
                                              className="text-muted"
                                            >
                                              Chưa có mã nào
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- Pagination controls --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          alignItems: "center",
        }}
      >
        <div>
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
            disabled={
              inferredTotal > 0
                ? page >= totalPages
                : (orders?.length ?? 0) < limit
            }
            style={{ marginLeft: 8 }}
          >
            Sau
          </button>
          <span style={{ marginLeft: 12 }}>
            Trang {page} {inferredTotal > 0 && `trong ${totalPages}`}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="text-muted">Go to</span>
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

      <ProductSelectorModal
        show={productModalOpenForPo.open}
        onHide={() => setProductModalOpenForPo({ open: false })}
        onConfirm={async (selectedProducts) => {
          if (writeDisabled) {
            toaster.create({
              description: "Bạn không có quyền thêm sản phẩm vào PO.",
              type: "error",
            });
            setProductModalOpenForPo({ open: false });
            return;
          }

          const poId = productModalOpenForPo.poId;
          if (!poId) {
            setProductModalOpenForPo({ open: false });
            return;
          }

          if (isCreatingSubs) return;
          setIsCreatingSubs(true);

          try {
            const existingProductIds = new Set<string>();
            const poSnapshot = orders.find(
              (o) => String(o.id) === String(poId)
            );
            if (poSnapshot && Array.isArray(poSnapshot.subPOs)) {
              poSnapshot.subPOs.forEach((s: any) => {
                const pid = s.product?._id ?? s.product ?? s.productId;
                if (pid) existingProductIds.add(String(pid));
              });
            }
            if (
              expandedLocalDoc &&
              String(resolveId(expandedLocalDoc)) === String(poId)
            ) {
              (expandedLocalDoc.subPurchaseOrders || []).forEach((s: any) => {
                const pid = s.product?._id ?? s.product ?? s.productId;
                if (pid) existingProductIds.add(String(pid));
              });
            }

            const duplicates: string[] = [];
            const payloadProducts = selectedProducts.map((p: any) => {
              const productId = p.productId ?? p._id ?? p.unique_id;
              if (existingProductIds.has(String(productId)))
                duplicates.push(String(productId));
              return {
                productId: productId,
                deliveryDate: p.deliveryDate,
                status: "DRAFT",
              };
            });

            if (duplicates.length > 0) {
              toaster.create({
                description: `Không thể thêm: có ${duplicates.length} sản phẩm đã tồn tại trong PO này.`,
                type: "error",
              });
              setIsCreatingSubs(false);
              return;
            }

            const payload = {
              purchaseOrderId: poId,
              products: payloadProducts,
            };

            // === New logic: use mutation result to update UI optimistically ===
            const result = await createSubFromProducts(payload).unwrap();

            // Attempt to extract created sub-POs from common shapes of response:
            const createdSubs =
              (Array.isArray(result) && result) ||
              result?.data ||
              result?.subPurchaseOrders ||
              result?.subPOs ||
              result?.created ||
              [];

            toaster.create({
              description: "Thêm sản phẩm vào PO thành công.",
              type: "success",
            });

            // If the PO is currently expanded, merge created subs into expandedLocalDoc
            if (
              String(expandedPoId) === String(poId) &&
              createdSubs &&
              createdSubs.length
            ) {
              setExpandedLocalDoc((prev: any) => {
                if (!prev) return prev;
                const copy = JSON.parse(JSON.stringify(prev));
                copy.subPurchaseOrders = (copy.subPurchaseOrders || []).concat(
                  createdSubs
                );
                // recompute derived statuses and update totals for display
                const derived = computeDerivedStatuses(copy);
                syncTotalsToOrders(derived);
                return derived;
              });
            }

            // Also update the orders list (so the PO card shows updated totals / sub list)
            if (createdSubs && createdSubs.length) {
              const addedTotals = createdSubs.reduce(
                (acc: { items: number; value: number }, s: any) => {
                  const itemsCount = Array.isArray(s.items)
                    ? s.items.length
                    : 0;
                  let value = 0;
                  if (Array.isArray(s.items)) {
                    s.items.forEach((it: any) => {
                      const unit = Number(it.ware?.unitPrice ?? 0);
                      const amt = Number(it.amount ?? 0);
                      value += unit * amt;
                    });
                  }
                  acc.items += itemsCount;
                  acc.value += value;
                  return acc;
                },
                { items: 0, value: 0 }
              );

              setOrders((prev) =>
                prev.map((o) =>
                  String(o.id) === String(poId)
                    ? {
                        ...o,
                        subPOs: (o.subPOs || []).concat(createdSubs),
                        totalItems:
                          (Number(o.totalItems) || 0) + addedTotals.items,
                        totalValue:
                          (Number(o.totalValue) || 0) + addedTotals.value,
                      }
                    : o
                )
              );
            }

            // Keep the server / cache in sync (still call refetch)
            await safeRefetchSubs();
            try {
              if (typeof refetch === "function") await refetch();
            } catch (e) {
              console.warn("refetch purchase orders failed", e);
            }

            setProductModalOpenForPo({ open: false });
          } catch (err: any) {
            console.error("Create sub-POs failed", err);
            toaster.create({
              description:
                "Create sub-POs failed: " +
                (err?.data?.message || err?.message || "unknown"),
              type: "error",
            });
          } finally {
            setIsCreatingSubs(false);
          }
        }}
      />

      <PurchaseOrderDetailModal
        po={selected}
        onClose={() => setSelected(null)}
        onSave={handleSaveFromModal}
        onOpenSubPOSelector={() => {}}
      />
    </div>
  );
};

export default PurchaseOrderList;
