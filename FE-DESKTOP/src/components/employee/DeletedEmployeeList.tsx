"use client";

import React, { useState } from "react";
import {
  useGetDeletedEmployeesQuery,
  useRestoreEmployeeMutation,
} from "@/service/api/employeeApiSlice";

function getIdFromDoc(doc: any): string | undefined {
  if (doc === null || doc === undefined) return undefined;
  if (typeof doc === "string") return doc;
  if (typeof doc === "number") return String(doc);
  if (doc._id?.$oid) return String(doc._id.$oid);
  if (doc.$oid) return String(doc.$oid);
  if (doc._id) return String(doc._id);
  if (doc.id) return String(doc.id);
  try {
    if (typeof doc.toString === "function") return doc.toString();
  } catch {}
  return undefined;
}

const DeletedEmployeeList: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, refetch } = useGetDeletedEmployeesQuery({
    page,
    limit,
  });
  const [restore] = useRestoreEmployeeMutation();

  // normalize response shapes (supports: { data: { data: [...] } }, { data: [...] }, [...], etc.)
  let items: any[] = [];
  const resp = data;
  if (resp?.data?.data && Array.isArray(resp.data.data)) items = resp.data.data;
  else if (resp?.data && Array.isArray(resp.data)) items = resp.data;
  else if (Array.isArray(resp)) items = resp;
  else if (resp && resp.data && Array.isArray(resp.data)) items = resp.data;
  else items = [];

  const totalCount =
    Number(
      resp?.data?.totalItems ??
        resp?.total ??
        resp?.data?.meta?.total ??
        resp?.data?.meta?.count ??
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
      const id =
        getIdFromDoc(idRaw) ??
        (typeof idRaw === "object" ? idRaw._id ?? idRaw.id : idRaw);
      if (!id) return alert("No id provided");
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
      {isLoading && <div>Loading...</div>}

      {items.length > 0 ? (
        <table
          className="table table-bordered table-sm"
          style={{ minWidth: 800 }}
        >
          <thead>
            <tr>
              <th>Mã nhân viên</th>
              <th>Tên</th>
              <th>Thời gian xóa</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it: any) => (
              <tr key={getIdFromDoc(it) ?? it._id ?? it.id}>
                <td>{it.code}</td>
                <td>{it.name}</td>
                <td>
                  {it.deletedAt
                    ? new Date(it.deletedAt).toLocaleDateString("en-CA", {
                        timeZone: "Asia/Bangkok",
                      })
                    : "—"}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleRestore(it)}
                  >
                    Khôi phục
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-muted">Chưa có nhân viên bị xóa</div>
      )}

      <div
        style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}
      >
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
        >
          Trước
        </button>
        <span>
          Trang {page} {totalCount > 0 && `trong ${totalPages}`}
        </span>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => goToPage(page + 1)}
          disabled={totalCount > 0 ? page >= totalPages : false}
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default DeletedEmployeeList;
