import React from "react";
import WareRestore from "@/components/ware/WareRestore";
import ConfirmProvider from "@/components/common/ConfirmModal";

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Mã hàng đã xóa</h2>
      <ConfirmProvider>
        <WareRestore />
      </ConfirmProvider>
    </div>
  );
}
