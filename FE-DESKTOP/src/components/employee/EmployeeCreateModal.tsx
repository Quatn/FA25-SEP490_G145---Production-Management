"use client";

import React from "react";

type CreateForm = any;

type Props = {
  show: boolean;
  onClose: () => void;
  createForm: CreateForm;
  setCreateForm: (updater: any) => void;
  roleList: any[];
  handleCreateSubmit: () => Promise<void>;
  creating?: boolean;
};

const EmployeeCreateModal: React.FC<Props> = ({
  show,
  onClose,
  createForm,
  setCreateForm,
  roleList,
  handleCreateSubmit,
  creating,
}) => {
  if (!show) return null;

  const Label: React.FC<{
    label: string;
    required?: boolean;
    children?: React.ReactNode;
  }> = ({ label, required, children }) => (
    <label className="form-label" style={{ display: "block", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span>{label}</span>
        {required && <span style={{ color: "red" }}>*</span>}
      </div>
      {children}
    </label>
  );

  const getIdFromDoc = (doc: any) => {
    if (!doc) return undefined;
    if (typeof doc === "string") return doc;
    if (doc._id?.$oid) return String(doc._id.$oid);
    if (doc._id) return String(doc._id);
    if (doc.id) return String(doc.id);
    return undefined;
  };

  return (
    <div className="modal-backdrop" style={{ display: "block" }}>
      <div className="modal" role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-md">
          <div className="modal-content">
            <div
              className="modal-header"
              style={{ borderBottom: "1px solid #e9ecef" }}
            >
              <h5 className="modal-title">Create Employee</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div style={{ display: "grid", gap: 12 }}>
                <Label label="Code" required>
                  <input
                    className="form-control"
                    value={createForm.code}
                    onChange={(e) =>
                      setCreateForm((p: any) => ({
                        ...p,
                        code: e.target.value,
                      }))
                    }
                  />
                </Label>

                <Label label="Name" required>
                  <input
                    className="form-control"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm((p: any) => ({
                        ...p,
                        name: e.target.value,
                      }))
                    }
                  />
                </Label>

                <Label label="Role" required>
                  <select
                    className="form-control"
                    value={getIdFromDoc(createForm.role) ?? createForm.role}
                    onChange={(e) =>
                      setCreateForm((p: any) => ({
                        ...p,
                        role: e.target.value,
                      }))
                    }
                  >
                    <option value="">-- select --</option>
                    {(roleList || []).map((r) => (
                      <option
                        key={getIdFromDoc(r) ?? r.code}
                        value={getIdFromDoc(r) ?? r._id ?? r.code}
                      >
                        {r.name ?? r.code}
                      </option>
                    ))}
                  </select>
                </Label>

                <Label label="Email">
                  <input
                    className="form-control"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm((p: any) => ({
                        ...p,
                        email: e.target.value,
                      }))
                    }
                  />
                </Label>

                <Label label="Contact number">
                  <input
                    className="form-control"
                    value={createForm.contactNumber}
                    onChange={(e) =>
                      setCreateForm((p: any) => ({
                        ...p,
                        contactNumber: e.target.value,
                      }))
                    }
                  />
                </Label>

                <Label label="Address">
                  <input
                    className="form-control"
                    value={createForm.address}
                    onChange={(e) =>
                      setCreateForm((p: any) => ({
                        ...p,
                        address: e.target.value,
                      }))
                    }
                  />
                </Label>

                <Label label="Note">
                  <textarea
                    className="form-control"
                    value={createForm.note}
                    onChange={(e) =>
                      setCreateForm((p: any) => ({
                        ...p,
                        note: e.target.value,
                      }))
                    }
                  />
                </Label>
              </div>
            </div>

            <div
              className="modal-footer"
              style={{ borderTop: "1px solid #e9ecef" }}
            >
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateSubmit}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCreateModal;
