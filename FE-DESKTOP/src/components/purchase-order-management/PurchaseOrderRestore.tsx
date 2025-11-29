"use client";

import React from "react";
import {
  useGetDeletedPurchaseOrdersQuery,
  useRestorePurchaseOrderMutation,
} from "@/service/api/purchaseOrderApiSlice";

const PurchaseOrderRestore: React.FC = () => {
  const { data, isLoading, refetch } = useGetDeletedPurchaseOrdersQuery({
    page: 1,
    limit: 100,
  });
  const [restore, { isLoading: restoring }] = useRestorePurchaseOrderMutation();

  const rows = data?.data ?? data ?? [];

  const handleRestore = async (id: string) => {
    if (!confirm("Khôi phục Purchase Order này?")) return;
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
