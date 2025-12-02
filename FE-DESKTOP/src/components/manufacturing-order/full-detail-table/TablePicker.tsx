"use client"
import { ManufacturingOrderTableReducerStore } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import ManufacturingOrderTable from "./Table";
import TruncatedManufacturingOrderTable from "./TruncatedTable";

export default function ManufacturingOrderTablePicker() {
  // const { useSelector } = ManufacturingOrderTableReducerStore;
  const useFullTable =  false
  //useSelector(s => s.useFullTable)

  if (useFullTable) {
    return <ManufacturingOrderTable />
  }
  return <TruncatedManufacturingOrderTable />
}
