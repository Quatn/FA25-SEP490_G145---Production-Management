// src/components/ware/WareRestore.tsx
"use client";

import React, { useState } from "react";
import {
  useGetDeletedWaresQuery,
  useRestoreWareMutation,
} from "@/service/api/wareApiSlice";
import { useConfirm } from "@/components/common/ConfirmModal";
import { toaster } from "@/components/ui/toaster";

function getIdFromDoc(doc: any): string {
  if (!doc) return "";
  if (typeof doc === "string") return doc;
  if (typeof doc === "number") return String(doc);
  if (doc._id?.$oid) return String(doc._id.$oid);
  if (doc.$oid) return String(doc.$oid);
  if (doc._id) return String(doc._id);
  if (doc.id) return String(doc.id);
  try {
    return String(doc);
  } catch {
    return "";
  }
}

function getCodeLabelForFlute(flute: any, fluteList: any[] = []) {
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

const WareRestore: React.FC = () => {
  const confirm = useConfirm();

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");

  const {
    data: resp,
    isFetching,
    refetch,
  } = useGetDeletedWaresQuery({ page, limit, search });

  const [restoreWare, { isLoading: restoring }] = useRestoreWareMutation();

  // items: support PaginatedList/response.data/data, response.data, or plain array
  const items: any[] =
    (resp as any)?.data?.data ??
    (resp as any)?.data ??
    (Array.isArray(resp) ? resp : []) ??
    [];

  // extract totalCount from multiple possible shapes (same approach as WareList)
  const totalCount =
    Number(
      (resp as any)?.data?.total ??
        (resp as any)?.total ??
        (resp as any)?.data?.meta?.total ??
        (resp as any)?.data?.meta?.count ??
        (resp as any)?.meta?.total ??
        0
    ) || 0;

  const totalPages =
    totalCount > 0 ? Math.max(1, Math.ceil(totalCount / limit)) : 1;

  const goToPage = (p: number) => {
    if (p < 1) p = 1;
    if (totalCount > 0 && p > totalPages) p = totalPages;
    setPage(p);
  };

  const handleRestore = async (id: string) => {
    const ok = await confirm({
      title: "Khôi phục mã hàng",
      description: "Khôi phục mục này?",
      confirmText: "Khôi phục",
      cancelText: "Hủy",
      destructive: false,
    });
    if (!ok) return;

    try {
      await restoreWare(id).unwrap();
      toaster.create({ description: "Đã khôi phục", type: "success" });
      // refetch deleted list
      try {
        refetch();
      } catch {}
    } catch (err: any) {
      console.error("restore failed", err);
      toaster.create({
        description: err?.data?.message ?? err?.message ?? "Khôi phục thất bại",
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
          marginBottom: 12,
        }}
      >
        <div>
          <strong>Deleted wares</strong>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="form-control"
            placeholder="Search deleted by code"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ minWidth: 220 }}
          />
          <button className="btn btn-secondary" onClick={() => refetch()}>
            Refresh
          </button>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="table table-sm table-bordered">
          <thead>
            <tr>
              <th>Mã hàng</th>
              <th>Sóng</th>
              <th>Đơn giá (đồng)</th>
              <th>Rộng (mm)</th>
              <th>Dài (mm)</th>
              <th>Cao (mm)</th>
              <th>Thể tích (m2)</th>
              <th>Thời gian xóa</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={9} className="text-muted p-4">
                  {isFetching ? "Loading..." : "No deleted wares"}
                </td>
              </tr>
            )}

            {items.map((w: any) => {
              const id = getIdFromDoc(w) ?? w._id ?? w.code;
              const fluteLabel = getCodeLabelForFlute(w.fluteCombination);

              return (
                <tr key={id}>
                  <td style={{ whiteSpace: "nowrap" }}>{w.code ?? "-"}</td>
                  <td>{fluteLabel}</td>
                  <td style={{ textAlign: "right" }}>{w.unitPrice ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>{w.wareWidth ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>{w.wareLength ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>{w.wareHeight ?? "-"}</td>
                  <td style={{ textAlign: "right" }}>{w.volume ?? "-"}</td>
                  <td>
                    {w.deletedAt ? new Date(w.deletedAt).toLocaleString() : "-"}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleRestore(id)}
                      disabled={restoring}
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* pagination UI similar to WareList */}
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
    </div>
  );
};

export default WareRestore;
