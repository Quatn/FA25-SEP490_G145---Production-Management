// src/components/purchase-order-management/DeliveryNoteCreator.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQueryPurchaseOrderItemsQuery } from "@/service/api/purchaseOrderItemApiSlice";
import { useCreateDeliveryNoteMutation } from "@/service/api/deliveryNoteApiSlice";
import { useGetAllCustomersQuery } from "@/service/api/customerApiSlice";

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

function resolveId(x: any) {
  if (x == null) return "";
  const candidate = x?._id ?? x?.id ?? x;
  if (candidate === null || candidate === undefined) return "";
  return String(candidate);
}

export default function DeliveryNoteCreator() {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(25);
  const { data: customersResp } = useGetAllCustomersQuery();
  let customersArr: any[] = [];
  if (customersResp && typeof customersResp === "object") {
    const maybe = customersResp?.data ?? customersResp;
    if (Array.isArray(maybe)) customersArr = maybe;
    else if (maybe?.data && Array.isArray(maybe.data))
      customersArr = maybe.data;
    else customersArr = [];
  }
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  useEffect(() => {
    if (!selectedCustomer) {
      const first = customersArr[0];
      const id = getIdFromDoc(first) ?? first?._id ?? first?.id ?? "";
      if (id) setSelectedCustomer(String(id));
    }
  }, [customersArr, selectedCustomer]);
  useEffect(() => {
    setPage(1);
    setSelectedMap({});
  }, [selectedCustomer, limit]);

  const fetchArgs = selectedCustomer
    ? { page: 1, limit: 10000 }
    : { page, limit };
  const {
    data: poItemsResp,
    isLoading,
    isFetching,
    refetch,
  } = useQueryPurchaseOrderItemsQuery(fetchArgs as any);

  const [createDeliveryNote, { isLoading: creating }] =
    useCreateDeliveryNoteMutation();

  let itemsFromResp: any[] = [];
  if (poItemsResp && typeof poItemsResp === "object") {
    const maybePage = poItemsResp?.data ?? poItemsResp;
    if (maybePage?.data && Array.isArray(maybePage.data))
      itemsFromResp = maybePage.data;
    else if (Array.isArray(maybePage)) itemsFromResp = maybePage;
    else if (poItemsResp?.data && Array.isArray(poItemsResp.data))
      itemsFromResp = poItemsResp.data;
    else if (Array.isArray(poItemsResp)) itemsFromResp = poItemsResp;
    else itemsFromResp = [];
  } else {
    itemsFromResp = [];
  }

  const allItemsFilteredByCustomer = useMemo(() => {
    if (!selectedCustomer) return [];
    return itemsFromResp.filter((it: any) => {
      const cust =
        it?.subPurchaseOrder?.purchaseOrder?.customer ??
        it?.subPurchaseOrder?.purchaseOrder ??
        null;
      if (!cust) return false;
      if (typeof cust === "string") return cust === selectedCustomer;
      const id = getIdFromDoc(cust) ?? cust?._id ?? cust?.id ?? "";
      return String(id) === String(selectedCustomer);
    });
  }, [itemsFromResp, selectedCustomer]);

  const serverTotalCount =
    Number(
      poItemsResp?.data?.totalItems ??
        poItemsResp?.totalItems ??
        poItemsResp?.data?.total ??
        poItemsResp?.total ??
        poItemsResp?.data?.meta?.total ??
        poItemsResp?.data?.meta?.count ??
        0
    ) || 0;

  const totalCount = selectedCustomer
    ? allItemsFilteredByCustomer.length
    : serverTotalCount;
  const totalPages =
    totalCount > 0 ? Math.max(1, Math.ceil(totalCount / limit)) : 1;

  const goToPage = (p: number) => {
    if (p < 1) p = 1;
    if (totalCount > 0 && p > totalPages) p = totalPages;
    setPage(p);
  };

  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setPage(1);
  }, [limit]);

  const pageItems = useMemo(() => {
    if (selectedCustomer) {
      const start = (page - 1) * limit;
      return allItemsFilteredByCustomer.slice(start, start + limit);
    } else {
      return itemsFromResp;
    }
  }, [
    selectedCustomer,
    allItemsFilteredByCustomer,
    itemsFromResp,
    page,
    limit,
  ]);

  const visibleIds = pageItems.map((it) => resolveId(it) || "");
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => id && selectedMap[id]);

  const anySelected = useMemo(
    () => Object.keys(selectedMap).some((k) => selectedMap[k]),
    [selectedMap]
  );

  const toggleOne = (id: string) => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (allVisibleSelected) {
        visibleIds.forEach((id) => {
          if (id) delete next[id];
        });
      } else {
        visibleIds.forEach((id) => {
          if (id) next[id] = true;
        });
      }
      return next;
    });
  };

  const selectedIdsArr = Object.keys(selectedMap).filter((k) => selectedMap[k]);

  const handleCreateDeliveryNote = async () => {
    if (selectedIdsArr.length === 0) {
      alert("Vui lòng chọn ít nhất 1 mã để xuất kho.");
      return;
    }
    const payload: any = { poitems: selectedIdsArr };
    if (selectedCustomer) payload.customer = selectedCustomer;
    if (!payload.status) payload.status = "PENDINGAPPROVAL";
    if (!confirm("Xác nhận tạo phiếu xuất kho cho các mã đã chọn?")) return;
    try {
      const res = await createDeliveryNote(payload).unwrap();
      if (res?.success) {
        alert("Tạo phiếu xuất kho thành công.");
        setSelectedMap({});
        try {
          refetch();
        } catch {}
      } else {
        alert("Tạo thất bại: " + (res?.message ?? "unknown"));
      }
    } catch (err: any) {
      console.error("Create failed", err);
      alert(
        "Tạo thất bại: " + (err?.data?.message || err?.message || "unknown")
      );
    }
  };

  const getItemCode = (it: any) => it?.code ?? resolveId(it) ?? "-";
  const getWareCode = (it: any) =>
    it?.ware?.code ??
    it?.ware?._id ??
    it?.ware?.id ??
    (it?.ware ? String(it.ware) : "-");
  const getPoCode = (it: any) =>
    it?.subPurchaseOrder?.purchaseOrder?.code ??
    it?.subPurchaseOrder?.code ??
    "-";
  const getWareLength = (it: any) =>
    it?.ware?.wareLength ?? it?.wareLength ?? "-";
  const getWareWidth = (it: any) => it?.ware?.wareWidth ?? it?.wareWidth ?? "-";
  const getWareHeight = (it: any) =>
    it?.ware?.wareHeight ?? it?.wareHeight ?? "-";
  const getUnitPrice = (it: any) => it?.ware?.unitPrice ?? it?.unitPrice ?? 0;
  const getAmount = (it: any) => it?.amount ?? 0;

  const customersOptions = customersArr.map((c) => {
    const id = getIdFromDoc(c) ?? c._id ?? c.id ?? "";
    const label = c.name ?? c.code ?? id;
    return { id: String(id), label };
  });

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div>
          <strong>Phiếu xuất kho từ mã lẻ</strong>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              minWidth: 280,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <label className="small text-muted" style={{ margin: 0 }}>
              Khách hàng:
            </label>
            <select
              className="form-select form-select-sm"
              value={selectedCustomer}
              onChange={(e) => {
                setSelectedCustomer(e.target.value);
                setPage(1);
              }}
              disabled={!customersOptions.length}
              style={{ minWidth: 240 }}
            >
              {customersOptions.length === 0 && (
                <option value="">-- không có khách hàng --</option>
              )}
              {customersOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="small text-muted">Tổng: {totalCount} bản ghi</div>

          <button
            className="btn btn-primary"
            onClick={handleCreateDeliveryNote}
            disabled={!anySelected || creating}
          >
            {creating ? "Đang tạo..." : "Xuất kho"}
          </button>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          className="table table-sm table-bordered"
          style={{ minWidth: 960, tableLayout: "fixed" }}
        >
          <colgroup>
            <col style={{ width: 40 }} />
            <col style={{ width: 160 }} />
            <col style={{ width: 140 }} />
            <col style={{ width: 60 }} />
            <col style={{ width: 60 }} />
            <col style={{ width: 60 }} />
            <col style={{ width: 140 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 100 }} />
          </colgroup>

          <thead>
            <tr>
              <th
                rowSpan={2}
                style={{ verticalAlign: "middle", textAlign: "center" }}
              >
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                />
              </th>
              <th rowSpan={2}>Mã lẻ</th>
              <th rowSpan={2}>Mã hàng</th>
              <th colSpan={3} style={{ textAlign: "center" }}>
                Kích thước
              </th>
              <th rowSpan={2}>PO</th>
              <th rowSpan={2} style={{ textAlign: "right" }}>
                Đơn giá
              </th>
              <th rowSpan={2} style={{ textAlign: "right" }}>
                Số lượng yêu cầu
              </th>
            </tr>
            <tr>
              <th>Dài</th>
              <th>Rộng</th>
              <th>Cao</th>
            </tr>
          </thead>

          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-muted p-4">
                  Không có bản ghi
                </td>
              </tr>
            ) : (
              pageItems.map((it: any, idx: number) => {
                const id = resolveId(it) || `noid-${idx}`;
                const checked = !!selectedMap[id];
                return (
                  <tr key={id}>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOne(id)}
                      />
                    </td>
                    <td>{getItemCode(it)}</td>
                    <td>{getWareCode(it)}</td>
                    <td style={{ textAlign: "right" }}>{getWareLength(it)}</td>
                    <td style={{ textAlign: "right" }}>{getWareWidth(it)}</td>
                    <td style={{ textAlign: "right" }}>{getWareHeight(it)}</td>
                    <td>{getPoCode(it)}</td>
                    <td style={{ textAlign: "right" }}>
                      {Number(getUnitPrice(it)).toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>{getAmount(it)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 8,
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1 || isFetching}
          >
            Trước
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => goToPage(page + 1)}
            disabled={totalCount > 0 ? page >= totalPages : false || isFetching}
          >
            Sau
          </button>
          <div style={{ marginLeft: 8 }}>
            Trang {page} {totalCount > 0 && `of ${totalPages}`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span className="text-muted">Đi đến</span>
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

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              className="form-select form-select-sm"
              value={limit}
              onChange={(e) => {
                const v = Number(e.target.value || 25);
                setLimit(v);
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
