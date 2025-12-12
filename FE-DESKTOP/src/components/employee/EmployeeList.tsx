"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { PurchaseOrder } from "@/types/PurchaseOrderTypes";
import PurchaseOrderDetailModal from "./PurchaseOrderDetailModal";
import ProductSelectorModal from "./SubPOSelectorModal";
import {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetDeletedEmployeesQuery,
} from "@/service/api/employeeApiSlice";
import { useGetAllRolesQuery } from "@/service/api/roleApiSlice";
import EmployeeCreateModal from "./EmployeeCreateModal";
import EmployeeEditModal from "./EmployeeEditModal";
import { toaster } from "@/components/ui/toaster";
import { useConfirm } from "@/components/common/ConfirmModal";

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

function arraysEqualById(a: any[] = [], b: any[] = []) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ida = getIdFromDoc(a[i]) ?? String(a[i]);
    const idb = getIdFromDoc(b[i]) ?? String(b[i]);
    if (ida !== idb) return false;
  }
  return true;
}

const EmployeeList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  const {
    data: resp,
    refetch: refetchEmployees,
    isLoading,
  } = useGetEmployeesQuery({
    page,
    limit,
    query: search || undefined,
  });

  const { data: roleResp } = useGetAllRolesQuery();
  const roleList: any[] = roleResp?.data ?? roleResp ?? [];

  const [createEmployee] = useCreateEmployeeMutation();
  const [updateEmployee] = useUpdateEmployeeMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();
  // used for refetching deleted list
  const { refetch: refetchDeleted } = useGetDeletedEmployeesQuery(
    { page: 1, limit: 1 },
    { skip: true }
  );

  // normalize response shapes
  let employees: any[] = [];
  if (resp?.data?.data && Array.isArray(resp.data.data))
    employees = resp.data.data;
  else if (resp?.data && Array.isArray(resp.data)) employees = resp.data;
  else if (Array.isArray(resp)) employees = resp;
  else if (resp && resp.data && Array.isArray(resp.data)) employees = resp.data;
  else employees = [];

  const [displayEmployees, setDisplayEmployees] = useState<any[]>([]);
  const displayRef = useRef<any[]>(displayEmployees);
  useEffect(() => {
    displayRef.current = displayEmployees;
  }, [displayEmployees]);

  useEffect(() => {
    if (!arraysEqualById(displayRef.current, employees))
      setDisplayEmployees(employees);
  }, [employees]);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<any>({
    code: "",
    name: "",
    address: "",
    email: "",
    contactNumber: "",
    role: "",
    note: "",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any | null>(null);

  const openEdit = (empl: any) => {
    setEditForm({
      id: getIdFromDoc(empl) ?? empl._id ?? empl.id,
      code: empl.code ?? "",
      name: empl.name ?? "",
      address: empl.address ?? "",
      email: empl.email ?? "",
      contactNumber: empl.contactNumber ?? "",
      role: getIdFromDoc(empl.role) ?? empl.role?._id ?? empl.role ?? "",
      note: empl.note ?? "",
    });
    setEditOpen(true);
  };

  // confirm hook (make sure ConfirmProvider is mounted above this component)
  const showConfirm = useConfirm();

  // --- new helper: check if a code already exists in the current list ---
  const isCodeTaken = (code: string, excludeId?: string | null) => {
    const norm = String(code ?? "")
      .trim()
      .toLowerCase();
    if (!norm) return false;
    return (displayEmployees || []).some((e) => {
      const eCode = String(e?.code ?? "")
        .trim()
        .toLowerCase();
      if (!eCode) return false;
      const eid = getIdFromDoc(e) ?? e._id ?? e.id;
      if (excludeId && eid && String(eid) === String(excludeId)) return false;
      return eCode === norm;
    });
  };

  /**
   * helper validators for optional fields
   */
  const isValidEmail = (v: string) => {
    const s = String(v ?? "").trim();
    if (!s) return true; // optional
    // simple but practical email regex
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(s);
  };

  const isValidContactNumber = (v: string) => {
    const s = String(v ?? "").trim();
    if (!s) return true; // optional
    // allowed chars: digits, spaces, parentheses, plus, hyphen, dot
    if (!/^[0-9()+\-\.\s]*$/.test(s)) return false;
    const digits = s.replace(/\D/g, "");
    // reasonable length check: 7..15 digits
    return digits.length >= 7 && digits.length <= 15;
  };

  /**
   * handleCreateSubmit
   * Returns structured result:
   *  { success: true, message?: string }
   *  or { success: false, errors?: {...}, message?: string }
   */
  const handleCreateSubmit = async () => {
    try {
      const codeVal = String(createForm.code ?? "").trim();

      // validation object to return to modal
      const errors: any = {};

      if (!codeVal) {
        errors.codeRequired = true;
      }

      if (!createForm.name || String(createForm.name).trim() === "") {
        errors.nameRequired = true;
      }

      if (!createForm.role || String(createForm.role).trim() === "") {
        errors.roleRequired = true;
      }

      // optional email validation
      const emailVal = String(createForm.email ?? "").trim();
      if (emailVal && !isValidEmail(emailVal)) {
        errors.emailInvalid = true;
      }

      // optional contact number validation
      const contactVal = String(createForm.contactNumber ?? "").trim();
      if (contactVal && !isValidContactNumber(contactVal)) {
        errors.contactInvalid = true;
      }

      if (Object.keys(errors).length > 0) {
        // user-friendly message
        const parts: string[] = [];
        if (errors.codeRequired) parts.push("Mã nhân viên (Code) là bắt buộc.");
        if (errors.nameRequired) parts.push("Tên là bắt buộc.");
        if (errors.roleRequired) parts.push("Vui lòng chọn vai trò (Role).");
        if (errors.emailInvalid) parts.push("Email không hợp lệ.");
        if (errors.contactInvalid)
          parts.push(
            "Số điện thoại không hợp lệ (chỉ gồm chữ số, + - () . và độ dài chữ số 7-15)."
          );

        return {
          success: false,
          errors,
          message: parts.join(" ") || "Validation failed",
        };
      }

      // uniqueness check
      if (isCodeTaken(codeVal)) {
        return {
          success: false,
          errors: { codeDuplicate: true },
          message: `Mã nhân viên "${codeVal}" đã tồn tại.`,
        };
      }

      const payload = {
        code: codeVal,
        name: String(createForm.name).trim(),
        address: createForm.address ?? null,
        email: createForm.email ?? null,
        contactNumber: createForm.contactNumber ?? null,
        role: getIdFromDoc(createForm.role) ?? createForm.role,
        note: createForm.note ?? "",
      };

      // attempt create
      const resp: any = await createEmployee(payload).unwrap();
      let createdDoc = resp?.data ?? resp;
      if (createdDoc?.data) createdDoc = createdDoc.data;

      // update local display list
      setDisplayEmployees((prev) => [createdDoc, ...prev]);

      // reset form (keep modal open responsibility to caller)
      setCreateForm({
        code: "",
        name: "",
        address: "",
        email: "",
        contactNumber: "",
        role: "",
        note: "",
      });

      // trigger background refetches (non-blocking)
      setTimeout(() => {
        try {
          refetchEmployees?.();
          refetchDeleted?.();
        } catch {}
      }, 600);

      // Return success and server message (modal will show toast + close)
      return {
        success: true,
        message:
          resp?.message ?? `Tạo nhân viên ${payload.code} — ${payload.name}`,
      };
    } catch (err: any) {
      console.error("Create employee failed", err);
      const message = err?.data?.message ?? err?.message ?? "Create failed";
      return { success: false, message };
    }
  };

  const handleEditSubmit = async () => {
    try {
      if (!editForm?.id) {
        return { success: false, message: "No id" };
      }

      const codeVal = String(editForm.code ?? "").trim();

      const errors: any = {};
      if (!codeVal) errors.codeRequired = true;
      if (!editForm.name || String(editForm.name).trim() === "")
        errors.nameRequired = true;
      if (!editForm.role || String(editForm.role).trim() === "")
        errors.roleRequired = true;

      // optional email validation
      const emailVal = String(editForm.email ?? "").trim();
      if (emailVal && !isValidEmail(emailVal)) {
        errors.emailInvalid = true;
      }

      // optional contact validation
      const contactVal = String(editForm.contactNumber ?? "").trim();
      if (contactVal && !isValidContactNumber(contactVal)) {
        errors.contactInvalid = true;
      }

      if (Object.keys(errors).length > 0) {
        const parts: string[] = [];
        if (errors.codeRequired) parts.push("Mã nhân viên (Code) là bắt buộc.");
        if (errors.nameRequired) parts.push("Tên là bắt buộc.");
        if (errors.roleRequired) parts.push("Vui lòng chọn vai trò (Role).");
        if (errors.emailInvalid) parts.push("Email không hợp lệ.");
        if (errors.contactInvalid)
          parts.push(
            "Số điện thoại không hợp lệ (chỉ gồm chữ số, + - () . và độ dài chữ số 7-15)."
          );
        return {
          success: false,
          errors,
          message: parts.join(" ") || "Validation failed",
        };
      }

      // uniqueness check (exclude current id)
      if (isCodeTaken(codeVal, editForm.id)) {
        return {
          success: false,
          errors: { codeDuplicate: true },
          message: `Mã nhân viên "${codeVal}" đã tồn tại.`,
        };
      }

      const payload = {
        code: codeVal,
        name: String(editForm.name).trim(),
        address: editForm.address ?? null,
        email: editForm.email ?? null,
        contactNumber: editForm.contactNumber ?? null,
        role: getIdFromDoc(editForm.role) ?? editForm.role,
        note: editForm.note ?? "",
      };

      const id = editForm.id;
      const res: any = await updateEmployee({ id, body: payload }).unwrap();
      let updatedDoc = res?.data ?? res;
      if (updatedDoc?.data) updatedDoc = updatedDoc.data;

      setDisplayEmployees((prev) =>
        prev.map((p) =>
          (getIdFromDoc(p) ?? p._id ?? p.id) ===
          (getIdFromDoc(updatedDoc) ?? updatedDoc._id ?? updatedDoc.id)
            ? updatedDoc
            : p
        )
      );

      setTimeout(() => {
        try {
          refetchEmployees?.();
        } catch {}
      }, 600);

      return {
        success: true,
        message:
          res?.message ??
          `Cập nhật thành công: ${payload.code} — ${payload.name}`,
      };
    } catch (err: any) {
      console.error("Update failed", err);
      const message = err?.data?.message ?? err?.message ?? "Update failed";
      return { success: false, message };
    }
  };

  const handleSoftDelete = async (e: any) => {
    const ok = await showConfirm({
      title: "Delete employee",
      description: `Delete ${e.code}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      destructive: true,
    });
    if (!ok) return;

    try {
      const id = getIdFromDoc(e) ?? e._id ?? e.id;
      const res: any = await deleteEmployee(id).unwrap();

      setDisplayEmployees((prev) =>
        prev.filter(
          (p) =>
            (getIdFromDoc(p) ?? p._id ?? p.id) !==
            (getIdFromDoc(e) ?? e._id ?? e.id)
        )
      );

      setTimeout(() => {
        try {
          refetchEmployees?.();
          refetchDeleted?.();
        } catch {}
      }, 600);

      toaster.create({
        description: res?.message ?? "Deleted",
        type: "success",
      });
    } catch (err: any) {
      console.error("Delete failed", err);
      toaster.create({
        description: err?.data?.message ?? err?.message ?? "Delete failed",
        type: "error",
      });
    }
  };

  // pagination helpers — robust to different API shapes and missing total
  const inferredTotal =
    Number(
      resp?.data?.totalItems ??
        resp?.data?.total ??
        resp?.total ??
        resp?.data?.meta?.total ??
        resp?.data?.meta?.count ??
        resp?.meta?.total ??
        0
    ) || 0;

  // If server doesn't return a total, fall back to the number of items we actually received
  const totalCount = inferredTotal > 0 ? inferredTotal : employees?.length ?? 0;

  // totalPages: at least 1
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / limit));

  const goToPage = (p: number) => {
    if (p < 1) p = 1;
    // if server provides total, clamp to totalPages
    if (inferredTotal > 0 && p > totalPages) p = totalPages;

    // if server does NOT provide total, disallow going forward when current page has fewer items than limit
    if (inferredTotal === 0 && p > page && (employees?.length ?? 0) < limit) {
      // no more pages
      return;
    }

    setPage(p);
  };

  const roleMap = useMemo(() => {
    const m = new Map<string, any>();
    (roleList || []).forEach((r: any) => m.set(getIdFromDoc(r) ?? r.code, r));
    return m;
  }, [roleList]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div>
          <strong>Nhân viên</strong>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="form-control"
            placeholder="Tìm kiếm theo mã/tên"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ minWidth: 260 }}
          />
          <button
            className="btn btn-primary"
            style={{ maxWidth: 150, minWidth: 100 }}
            onClick={() => setCreateOpen(true)}
          >
            + Tạo
          </button>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          className="table table-bordered table-sm"
          style={{ minWidth: 900 }}
        >
          <thead>
            <tr>
              <th>Mã nhân viên</th>
              <th>Tên</th>
              <th>Quyền</th>
              <th>Email</th>
              <th>Thông tin liên lạc</th>
              <th>Ghi chú</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {displayEmployees.map((empl) => {
              const roleLabel =
                roleMap.get(getIdFromDoc(empl.role) ?? "")?.name ??
                empl.role?.name ??
                getIdFromDoc(empl.role) ??
                "-";
              return (
                <tr key={getIdFromDoc(empl) ?? empl._id ?? empl.id}>
                  <td>{empl.code}</td>
                  <td>{empl.name}</td>
                  <td>{roleLabel}</td>
                  <td>{empl.email ?? "-"}</td>
                  <td>{empl.contactNumber ?? "-"}</td>
                  <td
                    style={{
                      maxWidth: 260,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {empl.note ?? "-"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => openEdit(empl)}
                      >
                        Sửa
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleSoftDelete(empl)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {!displayEmployees.length && (
              <tr>
                <td colSpan={7} className="text-muted p-4">
                  Chưa có nhân viên
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <div>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            Trước
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => goToPage(page + 1)}
            // if server provided a total -> use page >= totalPages; otherwise, disable when current page has fewer items than limit
            disabled={
              inferredTotal > 0
                ? page >= totalPages
                : (employees?.length ?? 0) < limit
            }
            style={{ marginLeft: 8 }}
          >
            Sau
          </button>
          <span style={{ marginLeft: 12 }}>
            Trang {page} {inferredTotal > 0 && `trong ${totalPages}`}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="text-muted">Go to</span>
          <input
            type="number"
            value={page}
            min={1}
            max={totalPages}
            onChange={(e) => {
              const v = Number(e.target.value || 1);
              if (!Number.isFinite(v)) return;
              goToPage(Math.max(1, Math.floor(v)));
            }}
            style={{ width: 72 }}
            className="form-control form-control-sm"
          />
        </div>
      </div>

      <EmployeeCreateModal
        show={createOpen}
        onClose={() => setCreateOpen(false)}
        createForm={createForm}
        setCreateForm={setCreateForm}
        roleList={roleList}
        handleCreateSubmit={handleCreateSubmit}
      />

      <EmployeeEditModal
        show={editOpen}
        onClose={() => setEditOpen(false)}
        editForm={editForm}
        setEditForm={setEditForm}
        roleList={roleList}
        handleEditSubmit={handleEditSubmit}
      />
    </div>
  );
};

export default EmployeeList;
