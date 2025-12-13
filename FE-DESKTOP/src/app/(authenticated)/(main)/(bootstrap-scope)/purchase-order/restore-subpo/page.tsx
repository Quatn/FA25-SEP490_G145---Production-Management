import React from "react";
import SubPurchaseOrderRestore from "@/components/purchase-order-management/SubPurchaseOrderRestore";
import Link from "next/link";
import ConfirmProvider from "@/components/common/ConfirmModal";

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Khôi phục sản phẩm </h2>
      <nav style={{ display: "flex", gap: 8 }}>
        <Link href="/purchase-order" passHref scroll={false} prefetch={true}>
          <button type="button">Quay lại danh sách PO</button>
        </Link>
      </nav>
      <ConfirmProvider>
        <SubPurchaseOrderRestore />
      </ConfirmProvider>
    </div>
  );
}
