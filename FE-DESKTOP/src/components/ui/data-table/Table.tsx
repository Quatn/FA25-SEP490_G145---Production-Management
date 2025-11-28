import { Table as TanstackTable } from "@tanstack/react-table";
import { DataTableRoot } from "./Root";
import { DataTableHeader } from "./Header";
import { DataTableBody } from "./Body";

export type DataTableProps<T> = {
  table: TanstackTable<T>;
};

export function DataTable<T>(props: DataTableProps<T>) {
  console.log("Hmm")

  return (
    <DataTableRoot tableRootProps={{
      minW: props.table.getTotalSize(),
    }}>
      <DataTableHeader headerGroups={props.table.getHeaderGroups()} />
      <DataTableBody rows={props.table.getCoreRowModel().rows} />
    </DataTableRoot>
  )
}
