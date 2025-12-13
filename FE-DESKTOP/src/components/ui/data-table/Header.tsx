import { Table as ChakraTable, TableCellProps, TableHeaderProps, TableRowProps } from "@chakra-ui/react"
import { Header as TanstackHeader, HeaderGroup, flexRender } from "@tanstack/react-table";
import { getCommonPinningStyles } from "./common";
import check from "check-types";
import calculateTanstackTableHeaderRowSpan from "@/lib/functions/calculateTanstackTableHeaderRowSpan";

export type DataTableHeaderPropsStack = {
  tableHeaderProps?: TableHeaderProps;
  tableHeaderCellProps?: TableCellProps;
}

export type DataTableHeaderCellProps<TData, TValue> = {
  header: TanstackHeader<TData, TValue>;
  propsStack?: DataTableHeaderPropsStack;
};

export function DataTableHeaderCell<TData, TValue>(props: DataTableHeaderCellProps<TData, TValue>) {
  return (
    <ChakraTable.ColumnHeader key={props.header.id}
      zIndex={0}
      border={{ base: "1px solid black", _dark: "1px solid white" }}
      colorPalette="blue"
      bgColor="colorPalette.muted"
      wordWrap={"break-word"}
      whiteSpace={"normal"}
      style={{ ...getCommonPinningStyles(props.header.column) }}
      colSpan={props.header.colSpan}
      rowSpan={props.header.rowSpan}
      {...((props.header.colSpan > 1) ? { textAlign: "center" } : {})}
      {...props.propsStack?.tableHeaderCellProps}
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
  propsStack?: DataTableHeaderPropsStack;
};

export function DataTableHeaderRow<TData, TValue>(props: DataTableHeaderRowProps<TData, TValue>) {
  return (
    <ChakraTable.Row h={"3rem"} {...props.tableHeaderRowProps}>
      {props.headers.map((header) => (
        <DataTableHeaderCell key={header.id} header={header} propsStack={props.propsStack} />
      ))}
    </ChakraTable.Row>
  )
}

export type DataTableHeaderProps<T> = {
  mergedHeadersIds?: string[][],
  propsStack?: DataTableHeaderPropsStack;
  headerGroups: HeaderGroup<T>[];
};

export function DataTableHeader<T>(props: DataTableHeaderProps<T>) {
  const calculatedHeaderGroups = calculateTanstackTableHeaderRowSpan(props.headerGroups, props.mergedHeadersIds)
  return (
    <ChakraTable.Header colorPalette={"blue"} bgColor={"colorPalette.muted"} {...props.propsStack?.tableHeaderProps}>
      {calculatedHeaderGroups.map((headerGroup) => (
        <DataTableHeaderRow key={headerGroup.id} headers={headerGroup.headers} propsStack={props.propsStack} />
      ))}
    </ChakraTable.Header>
  )
}
