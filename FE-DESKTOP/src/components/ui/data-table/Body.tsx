import { Table as ChakraTable, TableBodyProps, TableCellProps, TableRowProps } from "@chakra-ui/react"
import { flexRender, Row as TanstackRow, Cell as TanstackCell } from "@tanstack/react-table";
import { getCommonPinningStyles } from "./common";
import { useDataTableDispatch, useDataTableSelector } from "./Provider";

export type DataTableCellProps<TData, TValue> = {
  tableCellProps?: TableCellProps;
  cell: TanstackCell<TData, TValue>;
};

export function DataTableCell<TData, TValue>(props: DataTableCellProps<TData, TValue>) {
  return (
    <ChakraTable.Cell
      style={{
        ...getCommonPinningStyles(props.cell.column),
      }}
      {...props.tableCellProps}
    >
      {flexRender(props.cell.column.columnDef.cell, props.cell.getContext())}
    </ChakraTable.Cell>
  )
}

export type DataTableRowProps<T> = {
  tableHeaderRowProps?: TableRowProps;
  row: TanstackRow<T>;
};

export function DataTableRow<T>(props: DataTableRowProps<T>) {
  // const hoveredRowId = useDataTableSelector((state) => state.hoveredRowId)
  const dispatch = useDataTableDispatch()

  return (
    <ChakraTable.Row
      key={props.row.id}
      h={"3.2rem"}
      onMouseEnter={() => dispatch({ type: "SET_HOVERED_ROW_ID", payload: props.row.id })}
      onMouseLeave={() => dispatch({ type: "SET_HOVERED_ROW_ID", payload: null })}
    >
      {props.row.getVisibleCells().map((cell) => (
        <DataTableCell key={cell.id} cell={cell} />
      ))}
    </ChakraTable.Row>
  )
}

export type DataTableBodyProps<T> = {
  tableBodyProps?: TableBodyProps;
  rows: TanstackRow<T>[];
};

export function DataTableBody<T>(props: DataTableBodyProps<T>) {
  return (
    <ChakraTable.Body>
      {props.rows.map((row) => (
        <DataTableRow key={row.id} row={row} />
      ))}
    </ChakraTable.Body>
  )
}
