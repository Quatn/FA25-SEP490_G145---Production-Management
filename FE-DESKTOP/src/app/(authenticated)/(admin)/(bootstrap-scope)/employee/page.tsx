import React from "react";
import EmployeeList from "@/components/employee/EmployeeList";

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý nhân viên</h2>
      <EmployeeList />
    </div>
  );
}
