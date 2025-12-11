"use client";

import React from "react";
import {
  useGetDeletedPurchaseOrdersQuery,
  useRestorePurchaseOrderMutation,
} from "@/service/api/purchaseOrderApiSlice";
import { useConfirm } from "@/components/common/ConfirmModal";
import { toaster } from "@/components/ui/toaster";

const PurchaseOrderRestore: React.FC = () => {
  const { data, isLoading, refetch } = useGetDeletedPurchaseOrdersQuery({
    page: 1,
    limit: 100,
  });
  const [restore, { isLoading: restoring }] = useRestorePurchaseOrderMutation();

  const confirm = useConfirm();

  const rows = data?.data ?? data ?? [];

  const handleRestore = async (id: string) => {
    const ok = await confirm({
      title: "Restore Purchase Order",
      description: "Khôi phục Purchase Order này?",
      confirmText: "Restore",
      cancelText: "Cancel",
      destructive: false,
    });
    if (!ok) return;

    try {
      await restore(id).unwrap();
      await refetch();
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
      <h4>Purchase Order đã xóa</h4>
      {isLoading ? (
        <div>Loading...</div>
      ) : rows.length === 0 ? (
        <div className="text-muted">No deleted purchase orders</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="table table-sm table-bordered">
            <thead>
              <tr>
                <th>PO</th>
                <th>Customer</th>
                <th>PO Date</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r._id ?? r.id}>
                  <td>{r.code ?? r._id}</td>
                  <td>{r.customer?.name ?? r.customer ?? "-"}</td>
                  <td>
                    {r.orderDate
                      ? new Date(r.orderDate).toISOString().slice(0, 10)
                      : "-"}
                  </td>
                  <td>{r.note ?? "-"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleRestore(String(r._id ?? r.id))}
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
      )}
    </div>
  );
};

export default PurchaseOrderRestore;
