import React from "react";
import WareList from "@/components/ware/WareList";
import ConfirmProvider from "@/components/common/ConfirmModal";

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý mã hàng</h2>
      <ConfirmProvider>
        <WareList />
      </ConfirmProvider>
    </div>
  );
}
