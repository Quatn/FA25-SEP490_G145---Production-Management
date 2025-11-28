import { Table as ChakraTable, TableCellProps, TableHeaderProps, TableRowProps, TableScrollAreaProps } from "@chakra-ui/react"
import { Header as TanstackHeader, HeaderGroup, flexRender } from "@tanstack/react-table";
import { getCommonPinningStyles } from "./common";

export type DataTableHeaderCellProps<TData, TValue> = {
  tableHeaderCellProps?: TableCellProps;
  header: TanstackHeader<TData, TValue>;
};

export function DataTableHeaderCell<TData, TValue>(props: DataTableHeaderCellProps<TData, TValue>) {
  return (
    <ChakraTable.ColumnHeader key={props.header.id}
      colorPalette={"blue"} bgColor={"colorPalette.muted"}
      style={{ ...getCommonPinningStyles(props.header.column) }}
      {...props.tableHeaderCellProps}
    >
      {flexRender(props.header.column.columnDef.header, props.header.getContext())}
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
  tableHeaderProps?: TableHeaderProps;
  headerGroups: HeaderGroup<T>[];
};

export function DataTableHeader<T>(props: DataTableHeaderProps<T>) {
  return (
    <ChakraTable.Header colorPalette={"blue"} bgColor={"colorPalette.muted"} {...props.tableHeaderProps}>
      {props.headerGroups.map((headerGroup) => (
        <DataTableHeaderRow key={headerGroup.id} headers={headerGroup.headers} />
      ))}
    </ChakraTable.Header>
  )
}
