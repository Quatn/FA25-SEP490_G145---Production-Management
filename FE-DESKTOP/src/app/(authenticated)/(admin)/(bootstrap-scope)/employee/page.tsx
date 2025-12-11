import React from "react";
import EmployeeList from "@/components/employee/EmployeeList";
import ConfirmProvider from "@/components/common/ConfirmModal";

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý nhân viên</h2>
      <ConfirmProvider>
        <EmployeeList />
      </ConfirmProvider>
    </div>
  );
}
