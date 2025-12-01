import React from "react";
import DeletedEmployeeList from "@/components/employee/DeletedEmployeeList";

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Khôi phục nhân viên đã xóa</h2>
      <DeletedEmployeeList />
    </div>
  );
}
