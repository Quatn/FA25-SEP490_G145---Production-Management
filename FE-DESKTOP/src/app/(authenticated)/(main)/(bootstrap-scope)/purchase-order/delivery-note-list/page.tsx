import React from "react";
import DeliveryNoteList from "@/components/purchase-order-management/DeliveryNoteList";

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Danh sách phiếu xuất kho</h2>
      <DeliveryNoteList />
    </div>
  );
}
