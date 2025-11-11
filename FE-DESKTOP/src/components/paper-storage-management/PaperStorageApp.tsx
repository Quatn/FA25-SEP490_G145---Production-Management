// src/components/paper-storage-management/PaperStorageApp.tsx
"use client";

import React from "react";
import PaperList from "./PaperList";
import HistoryTab from "./HistoryTab";

export const PaperStorageApp: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<"list" | "history">("list");

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        {/* tabs */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className={activeTab === "list" ? "btn btn-primary" : "btn btn-outline-secondary"}
            onClick={() => setActiveTab("list")}
          >
            Danh sách
          </button>
          <button
            className={activeTab === "history" ? "btn btn-primary" : "btn btn-outline-secondary"}
            onClick={() => setActiveTab("history")}
          >
            Nhập/Xuất/Tồn
          </button>
        </div>

        {/* spacer */}
        <div style={{ flex: 1 }} />

        {/* raw action buttons (no modals) — visible when on the list tab */}
        {/* {activeTab === "list" && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline-success" >
              Tạo nhà cung cấp
            </button>

            <button className="btn btn-outline-info" >
              Tạo loại giấy
            </button>

            <button className="btn btn-outline-primary" >
              Nhập cuộn giấy
            </button>
          </div>
        )} */}
      </div>

      <div>{activeTab === "list" ? <PaperList /> : <HistoryTab />}</div>
    </div>
  );
};

export default PaperStorageApp;
