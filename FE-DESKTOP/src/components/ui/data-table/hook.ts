"use client"
import { getCoreRowModel, Table, TableOptions, useReactTable } from "@tanstack/react-table";
import { useState } from "react";
import { DataTableEditableCellProps } from "./types";
import { DataTableEditableCell } from "./DefaultEditableCell";
import { DataTable } from "./Table";

export default function useDataTable<TData>(o: TableOptions<TData>): {
  table: Table<TData & { isEdited: boolean }>,
  tableData: (TData & { isEdited: boolean })[],
  tableComponent: React.ReactNode,
} {
  type TRowData = TData & { isEdited: boolean }

  const [tableData, setTableData] = useState<TRowData[]>(o.data.map(d => ({ ...d, isEdited: false })))

  const meta = {
    updateData: (rowIndex: number, columnId: string, value: unknown) => {
      setTableData(old =>
        old.map((row, index) => {
          if (index === rowIndex) {
            return {
              ...old[rowIndex]!,
              [columnId]: value,
              isEdited: true,
            }
          }
          return row
        })
      )
    },
    editableCellNode: (props: DataTableEditableCellProps) => {
      return DataTableEditableCell(props)
    },
    ...o.meta,
  }

  const table = useReactTable({
    ...o,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
    meta,
  });

  return {
    table: table as Table<TRowData>,
    tableData,
    tableComponent: DataTable({ table }),
  }
}
