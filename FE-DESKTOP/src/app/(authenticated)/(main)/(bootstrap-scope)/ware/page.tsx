// src/app/purchase-order/page.tsx
import React from "react";
import WareList from "@/components/ware/WareList";

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Ware Management</h2>
      <WareList />
    </div>
  );
}
