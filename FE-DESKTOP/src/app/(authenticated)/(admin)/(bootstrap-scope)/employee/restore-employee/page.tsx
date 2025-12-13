import React from "react";
import DeletedEmployeeList from "@/components/employee/DeletedEmployeeList";
import ConfirmProvider from "@/components/common/ConfirmModal";

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Khôi phục nhân viên đã xóa</h2>
      <ConfirmProvider>
        <DeletedEmployeeList />
      </ConfirmProvider>
    </div>
  );
}
