"use client"
import { ColumnDef, getCoreRowModel, Table, TableOptions, useReactTable } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTableEditableCellProps } from "./types";
import { DataTableEditableCell } from "./DefaultEditableCell";
import { DataTable } from "./Table";
import { DataTableBodyPropsStack } from "./Body";
import { devlog } from "@/utils/devlog";
import { DataTableHeaderPropsStack } from "./Header";

export type DataTableOptions<TData> = Omit<TableOptions<TData>, "columns"> & {
  headerPropsStack?: DataTableHeaderPropsStack;
  bodyPropsStack?: DataTableBodyPropsStack;
  mergedHeadersIds?: string[][],
  getRowId: (row: TData) => string;
  columns: ColumnDef<TData & { isEdited: boolean }>[]
}

export default function useDataTable<TData>(o: DataTableOptions<TData>): {
  table: Table<TData & { isEdited: boolean }>,
  tableData: (TData & { isEdited: boolean })[],
  tableComponent: React.ReactNode,
  updateTableData: (rowIndex: number, columnId: string, value: unknown) => void,
  resetRow: (id: string) => void,
  resetTable: () => void,
} {
  type TRowData = TData & { isEdited: boolean }

  const initTableData: TRowData[] = useMemo(() => {
    return o.data.map(d => ({ ...d, isEdited: false }))
  }, [o.data])

  const [tableData, setTableData] = useState<TRowData[]>(initTableData)

  useEffect(() => {
    devlog("initTableData effect triggered, reloading the entire table")
    setTableData(initTableData);
  }, [initTableData]);

  const handleUpdateData = useCallback((rowIndex: number, columnId: string, value: unknown) => {
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
  }, [])

  const handleResetRow = useCallback((id: string) => {
    const initRow = initTableData.find((row) => o.getRowId(row) === id)
    const curRow = tableData.find((row) => o.getRowId(row) === id)
    if (curRow && initRow && curRow.isEdited) {
      setTableData(old =>
        old.map((row) => {
          if (o.getRowId(row) === id) {
            return { ...initRow, isEdited: false }
          }
          return row
        })
      )
    }
  }, [o, initTableData, tableData])

  const handleResetTable = useCallback(() => {
    setTableData(initTableData);
  }, [initTableData])

  const meta = {
    updateData: handleUpdateData,
    resetRow: handleResetRow,
    editableCellNode: (props: DataTableEditableCellProps) => {
      return DataTableEditableCell(props)
    },
    ...o.meta,
  }

  const table = useReactTable({
    ...(o as Omit<TableOptions<TData>, "data">),
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
    getRowId: o.getRowId,
    meta,
  });

  return {
    table: table as Table<TRowData>,
    tableData,
    tableComponent: DataTable({ table, bodyPropsStack: o.bodyPropsStack, headerPropsStack: o.headerPropsStack, mergedHeadersIds: o.mergedHeadersIds }),
    updateTableData: handleUpdateData,
    resetRow: handleResetRow,
    resetTable: handleResetTable,
  }
}
