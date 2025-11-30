import { Table as TanstackTable } from "@tanstack/react-table";
import { DataTableRoot } from "./Root";
import { DataTableHeader } from "./Header";
import { DataTableBody, DataTableBodyPropsStack } from "./Body";

export type DataTableProps<T> = {
  table: TanstackTable<T>;
  bodyPropsStack?: DataTableBodyPropsStack;
  mergedHeadersIds?: string[][],
};

export function DataTable<T>(props: DataTableProps<T>) {
  return (
    <DataTableRoot tableRootProps={{
      minW: props.table.getTotalSize(),
    }}>
      <DataTableHeader headerGroups={props.table.getHeaderGroups()} mergedHeadersIds={props.mergedHeadersIds} />
      <DataTableBody rows={props.table.getCoreRowModel().rows} propsStack={props.bodyPropsStack} />
    </DataTableRoot>
  )
}
