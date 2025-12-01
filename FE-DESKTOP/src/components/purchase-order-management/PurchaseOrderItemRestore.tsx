"use client";

import React from "react";
import {
  useGetDeletedPurchaseOrderItemsQuery,
  useRestorePurchaseOrderItemMutation,
} from "@/service/api/purchaseOrderItemApiSlice";

const PurchaseOrderItemRestore: React.FC = () => {
  const { data, isLoading, refetch } = useGetDeletedPurchaseOrderItemsQuery({
    page: 1,
    limit: 200,
  });
  const [restore, { isLoading: restoring }] =
    useRestorePurchaseOrderItemMutation();

  const rows = data?.data ?? data ?? [];

  const handleRestore = async (id: string) => {
    if (!confirm("Khôi phục mã lẻ này?")) return;
    try {
      await restore(id).unwrap();
      await refetch();
      alert("Đã khôi phục");
    } catch (err: any) {
      console.error(err);
      alert(
        "Khôi phục thất bại: " +
          (err?.data?.message || err?.message || "unknown")
      );
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h4>Mã lẻ đã xóa</h4>
      {isLoading ? (
        <div>Loading...</div>
      ) : rows.length === 0 ? (
        <div className="text-muted">No deleted items</div>
      ) : (
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
              {rows.map((r: any) => (
                <tr key={r._id ?? r.id}>
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

export default PurchaseOrderItemRestore;
