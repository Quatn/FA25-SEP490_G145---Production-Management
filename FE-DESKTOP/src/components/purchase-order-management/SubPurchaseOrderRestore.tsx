"use client";

import React from "react";
import {
  useGetDeletedSubPurchaseOrdersQuery,
  useRestoreSubPurchaseOrderMutation,
} from "@/service/api/subPurchaseOrderApiSlice";
import { useConfirm } from "@/components/common/ConfirmModal";
import { toaster } from "@/components/ui/toaster";

const SubPurchaseOrderRestore: React.FC = () => {
  const { data, isLoading, refetch } = useGetDeletedSubPurchaseOrdersQuery({
    page: 1,
    limit: 100,
  });
  const [restore, { isLoading: restoring }] =
    useRestoreSubPurchaseOrderMutation();

  const confirm = useConfirm();

  const rows = data?.data ?? data ?? [];

  const handleRestore = async (id: string) => {
    const ok = await confirm({
      title: "Restore Sub-PO",
      description: "Khôi phục Sản phẩm này?",
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
      <h4>Sản phẩm đã xóa</h4>
      {isLoading ? (
        <div>Loading...</div>
      ) : rows.length === 0 ? (
        <div className="text-muted">No deleted sub-purchase orders</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="table table-sm table-bordered">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product</th>
                <th>PO</th>
                <th>Delivery</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r._id ?? r.id}>
                  <td>{r.code ?? r._id}</td>
                  <td>{r.product?.name ?? r.product?.code ?? "-"}</td>
                  <td>
                    {r.purchaseOrder
                      ? r.purchaseOrder.code ?? r.purchaseOrder._id
                      : "-"}
                  </td>
                  <td>
                    {r.deliveryDate
                      ? new Date(r.deliveryDate).toISOString().slice(0, 10)
                      : "-"}
                  </td>
                  <td>{r.status ?? "-"}</td>
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

export default SubPurchaseOrderRestore;
