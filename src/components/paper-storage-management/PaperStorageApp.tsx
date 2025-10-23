// src/components/paper-storage-management/PaperStorageApp.tsx
"use client";

import React, { useState } from "react";
import PaperList from "./PaperList";
import HistoryTab from "./HistoryTab";

export const PaperStorageApp = () => {
  const [activeTab, setActiveTab] = useState<"list" | "history">("list");

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button className={activeTab === "list" ? "btn btn-primary" : "btn btn-outline-secondary"} onClick={() => setActiveTab("list")}>Danh sách</button>
        <button className={activeTab === "history" ? "btn btn-primary" : "btn btn-outline-secondary"} onClick={() => setActiveTab("history")}>Lịch sử</button>
      </div>

      <div>
        {activeTab === "list" ? <PaperList /> : <HistoryTab />}
      </div>
    </div>
  );
}

export default PaperStorageApp;
