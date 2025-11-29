"use client";

import React, { useState } from "react";
import {
  useGetDeletedEmployeesQuery,
  useRestoreEmployeeMutation,
} from "@/service/api/employeeApiSlice";

const DeletedEmployeeList: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, refetch } = useGetDeletedEmployeesQuery({
    page,
    limit,
  });
  const [restore] = useRestoreEmployeeMutation();

  let items: any[] = [];
  if (data?.data && Array.isArray(data.data)) items = data.data;
  else if (data && Array.isArray(data)) items = data;
  else items = [];

  const totalCount =
    Number(
      data?.data?.total ??
        data?.total ??
        data?.data?.meta?.total ??
        data?.meta?.total ??
        0
    ) || 0;
  const totalPages =
    totalCount > 0 ? Math.max(1, Math.ceil(totalCount / limit)) : 1;
  const goToPage = (p: number) => {
    if (p < 1) p = 1;
    if (totalCount > 0 && p > totalPages) p = totalPages;
    setPage(p);
  };

  const handleRestore = async (idRaw: any) => {
    if (!confirm("Restore this employee?")) return;
    try {
      const id = typeof idRaw === "string" ? idRaw : idRaw._id ?? idRaw.id;
      const res: any = await restore(id).unwrap();
      alert(res?.message ?? "Restored");
      try {
        refetch();
      } catch {}
    } catch (err: any) {
      console.error("Restore failed", err);
      alert(err?.data?.message ?? err?.message ?? "Restore failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 className="text-xl font-bold mb-4">Deleted Employees</h2>
      {isLoading && <div>Loading...</div>}

      {items.length > 0 ? (
        <table
          className="table table-bordered table-sm"
          style={{ minWidth: 800 }}
        >
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Deleted At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it: any) => (
              <tr key={it._id ?? it.id}>
                <td>{it.code}</td>
                <td>{it.name}</td>
                <td>{it.deletedAt ?? "—"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleRestore(it._id ?? it.id)}
                  >
                    Restore
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-muted">No deleted employees</div>
      )}

      <div
        style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}
      >
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
        >
          Prev
        </button>
        <span>
          Page {page} {totalCount > 0 && `of ${totalPages}`}
        </span>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => goToPage(page + 1)}
          disabled={totalCount > 0 ? page >= totalPages : false}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DeletedEmployeeList;
