"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  useGetDeletedPurchaseOrderItemsQuery,
  useRestorePurchaseOrderItemMutation,
} from "@/service/api/purchaseOrderItemApiSlice";
import { useConfirm } from "@/components/common/ConfirmModal";
import { toaster } from "@/components/ui/toaster";

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

const PurchaseOrderItemRestore: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(5);

  const {
    data: resp,
    isLoading,
    refetch,
  } = useGetDeletedPurchaseOrderItemsQuery({ page, limit });
  const [restore, { isLoading: restoring }] =
    useRestorePurchaseOrderItemMutation();

  const confirm = useConfirm();

  // normalize response shapes into items array
  let items: any[] = [];
  if (resp?.data?.data && Array.isArray(resp.data.data)) items = resp.data.data;
  else if (resp?.data && Array.isArray(resp.data)) items = resp.data;
  else if (Array.isArray(resp)) items = resp;
  else if (resp && resp.data && Array.isArray(resp.data)) items = resp.data;
  else items = [];

  const [displayRows, setDisplayRows] = useState<any[]>(items);
  const displayRef = useRef<any[]>(displayRows);
  useEffect(() => {
    displayRef.current = displayRows;
  }, [displayRows]);

  useEffect(() => {
    if (!arraysEqualById(displayRef.current, items)) setDisplayRows(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // pagination helpers — robust to different API shapes and missing total
  const inferredTotal =
    Number(
      resp?.data?.totalItems ??
        resp?.data?.total ??
        resp?.total ??
        resp?.data?.meta?.total ??
        resp?.data?.meta?.count ??
        resp?.meta?.total ??
        0
    ) || 0;

  const totalCount = inferredTotal > 0 ? inferredTotal : items?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / limit));

  const goToPage = (p: number) => {
    if (p < 1) p = 1;
    if (inferredTotal > 0 && p > totalPages) p = totalPages;
    if (inferredTotal === 0 && p > page && (items?.length ?? 0) < limit) {
      // no more pages when server doesn't provide total
      return;
    }
    setPage(p);
  };

  const handleRestore = async (id: string) => {
    const ok = await confirm({
      title: "Restore Item",
      description: "Khôi phục mã lẻ này?",
      confirmText: "Restore",
      cancelText: "Cancel",
      destructive: false,
    });
    if (!ok) return;

    try {
      await restore(id).unwrap();

      // optimistic local removal
      setDisplayRows((prev) =>
        prev.filter((r) => (getIdFromDoc(r) ?? r._id ?? r.id) !== String(id))
      );

      // ensure server list updated
      setTimeout(() => {
        try {
          refetch();
        } catch {}
      }, 600);

      toaster.create({ description: "Đã khôi phục", type: "success" });
    } catch (err: any) {
      console.error(err);
      toaster.create({
        description:
          "Khôi phục thất bại: " +
          (err?.data?.message || err?.message || "unknown"),
        type: "error",
      });
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h4>Mã lẻ đã xóa</h4>

      {isLoading ? (
        <div>Loading...</div>
      ) : !displayRows.length ? (
        <div className="text-muted">No deleted items</div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table className="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>Item code</th>
                  <th>Ware</th>
                  <th>Sub-PO</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((r: any) => (
                  <tr key={getIdFromDoc(r) ?? r._id ?? r.id}>
                    <td>{r.code ?? r._id}</td>
                    <td>{r.ware ? r.ware.code ?? r.ware._id : "-"}</td>
                    <td>
                      {r.subPurchaseOrder
                        ? r.subPurchaseOrder.code ?? r.subPurchaseOrder._id
                        : "-"}
                    </td>
                    <td>{r.amount ?? 0}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() =>
                          handleRestore(
                            String(getIdFromDoc(r) ?? r._id ?? r.id)
                          )
                        }
                        disabled={restoring}
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
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
                    : (items?.length ?? 0) < limit
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
        </>
      )}
    </div>
  );
};

export default PurchaseOrderItemRestore;
