// src/components/paper-storage-management/PaperRollRestore.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import PaperDetailModal from "./PaperDetailModal";
import {
  useGetDeletedPaperRollsQuery,
  useRestorePaperRollMutation,
} from "@/service/api/paperRollApiSlice";
import { useGetAllPaperColorsQuery } from "@/service/api/paperColorApiSlice";
import { useGetAllPaperSuppliersQuery } from "@/service/api/paperSupplierApiSlice";
import { useGetAllPaperTypesQuery } from "@/service/api/paperTypeApiSlice";
import { toaster } from "@/components/ui/toaster";
import { useConfirm } from "@/components/common/ConfirmModal";

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

export const PaperRollRestore: React.FC = () => {
  // pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>(""); // optional search (unused by backend if not supported)
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [detailOpen, setDetailOpen] = useState<{ open: boolean; roll?: any }>({
    open: false,
  });

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // fetch deleted rolls (paginated)
  const { data: deletedResp } = useGetDeletedPaperRollsQuery
    ? useGetDeletedPaperRollsQuery({ page, limit, search: debouncedSearch })
    : { data: undefined };

  // defensive extraction of list and total count
  const deletedRolls: any[] =
    deletedResp?.data?.data ?? deletedResp?.data ?? deletedResp ?? [];

  const totalCount =
    Number(
      deletedResp?.data?.totalItems ??
        deletedResp?.data?.total ??
        deletedResp?.total ??
        deletedResp?.data?.meta?.total ??
        deletedResp?.data?.meta?.count ??
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

  const [restorePaperRoll] = useRestorePaperRollMutation();

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

  const getColorIdFromPaperType = (pt: any) => {
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
      const seqStr = String(seq).padStart(5, "0");
      return `${colorCode}/${supplierCode}/${width}/${grammage}/${supplierCode}${seqStr}XC${String(
        yy
      ).padStart(2, "0")}`;
    }
    return r.paperRollId ?? "-";
  };

  // confirm hook (make sure ConfirmProvider is mounted above this component)
  const showConfirm = useConfirm();

  const handleRestore = async (r: any) => {
    const id = getIdFromDoc(r) ?? r.paperRollId;
    if (!id) {
      toaster.create({ description: "No id", type: "error" });
      return;
    }

    const ok = await showConfirm({
      title: "Restore roll",
      description: `Restore ${computePaperRollId(r)}?`,
      confirmText: "Restore",
      cancelText: "Cancel",
      destructive: false,
    });
    if (!ok) return;

    try {
      const res: any = await restorePaperRoll({ id }).unwrap();
      toaster.create({
        description: res?.message ?? "Restored",
        type: "success",
      });
      // naive page refresh by re-setting page (RTK query will refetch automatically)
      setPage(1);
    } catch (err: any) {
      console.error(err);
      toaster.create({
        description: err?.data?.message ?? err?.message ?? "Restore failed",
        type: "error",
      });
    }
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
          <strong>Cuộn đã xóa</strong>
        </div>
        {/* <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="form-control"
            placeholder="Search (optional)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ minWidth: 320 }}
          />
        </div> */}
      </div>

      <div style={{ overflowX: "auto" }}>
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
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleRestore(r)}
                      >
                        Khôi phục
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {(!deletedRolls || deletedRolls.length === 0) && (
              <tr>
                <td colSpan={8} className="text-muted p-3">
                  Chưa có cuộn giấy nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
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

          <div style={{ marginLeft: 12 }}>
            <select
              className="form-control form-control-sm"
              value={limit}
              onChange={(e) => {
                const v = Number(e.target.value || 10);
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
    </div>
  );
};

export default PaperRollRestore;
