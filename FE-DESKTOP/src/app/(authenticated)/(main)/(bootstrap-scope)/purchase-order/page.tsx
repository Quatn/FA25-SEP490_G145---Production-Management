// src/app/purchase-order/page.tsx
import React from "react";
import PurchaseOrderList from "@/components/purchase-order-management/PurchaseOrderList";
import ConfirmProvider from "@/components/common/ConfirmModal";

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý Purchase Order</h2>
      <ConfirmProvider>
        <PurchaseOrderList />
      </ConfirmProvider>
    </div>
  );
}
