import { Table as ChakraTable, TableCellProps, TableHeaderProps, TableRowProps } from "@chakra-ui/react"
import { Header as TanstackHeader, HeaderGroup, flexRender } from "@tanstack/react-table";
import { getCommonPinningStyles } from "./common";
import check from "check-types";
import calculateTanstackTableHeaderRowSpan from "@/lib/functions/calculateTanstackTableHeaderRowSpan";

export type DataTableHeaderCellProps<TData, TValue> = {
  tableHeaderCellProps?: TableCellProps;
  header: TanstackHeader<TData, TValue>;
};

export function DataTableHeaderCell<TData, TValue>(props: DataTableHeaderCellProps<TData, TValue>) {
  return (
    <ChakraTable.ColumnHeader key={props.header.id}
      colorPalette={"blue"} bgColor={"colorPalette.muted"}
      style={{ ...getCommonPinningStyles(props.header.column) }}
      colSpan={props.header.colSpan}
      rowSpan={props.header.rowSpan}
      {...props.tableHeaderCellProps}
    >
      {props.header.isPlaceholder
        ? null
        : flexRender(props.header.column.columnDef.header, props.header.getContext())}
    </ChakraTable.ColumnHeader>
  )
}

export type DataTableHeaderRowProps<TData, TValue> = {
  tableHeaderRowProps?: TableRowProps;
  headers: TanstackHeader<TData, TValue>[];
};

export function DataTableHeaderRow<TData, TValue>(props: DataTableHeaderRowProps<TData, TValue>) {
  return (
    <ChakraTable.Row h={"3rem"} {...props.tableHeaderRowProps}>
      {props.headers.map((header) => (
        <DataTableHeaderCell key={header.id} header={header} />
      ))}
    </ChakraTable.Row>
  )
}

export type DataTableHeaderProps<T> = {
  mergedHeadersIds?: string[][],
  tableHeaderProps?: TableHeaderProps;
  headerGroups: HeaderGroup<T>[];
};

export function DataTableHeader<T>(props: DataTableHeaderProps<T>) {
  const calculatedHeaderGroups = calculateTanstackTableHeaderRowSpan(props.headerGroups, props.mergedHeadersIds)
  return (
    <ChakraTable.Header colorPalette={"blue"} bgColor={"colorPalette.muted"} {...props.tableHeaderProps}>
      {calculatedHeaderGroups.map((headerGroup) => (
        <DataTableHeaderRow key={headerGroup.id} headers={headerGroup.headers} />
      ))}
    </ChakraTable.Header>
  )
}
