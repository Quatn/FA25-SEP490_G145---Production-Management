import React from "react";
import PurchaseOrderRestore from "@/components/purchase-order-management/PurchaseOrderRestore";
import Link from "next/link";
import ConfirmProvider from "@/components/common/ConfirmModal";

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Khôi phục Purchase Order </h2>
      <nav style={{ display: "flex", gap: 8 }}>
        <Link href="/purchase-order" passHref scroll={false} prefetch={true}>
          <button type="button">Quay lại danh sách PO</button>
        </Link>
      </nav>
      <ConfirmProvider>
        <PurchaseOrderRestore />
      </ConfirmProvider>
    </div>
  );
}
