// src/app/purchase-order/page.tsx
import React from "react";
import PurchaseOrderList from "@/components/purchase-order-management/PurchaseOrderList";

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý Purchase Order</h2>
      <PurchaseOrderList />
    </div>
  );
}
