import { Table as ChakraTable, TableBodyProps, TableCellProps, TableRowProps } from "@chakra-ui/react"
import { flexRender, Row as TanstackRow, Cell as TanstackCell } from "@tanstack/react-table";
import { getCommonPinningStyles } from "./common";
import { useDataTableDispatch, useDataTableSelector } from "./Provider";
import check from "check-types";

// This seems... wrong? Dirty? idk
export type DataTableBodyPropsStack = {
  tableBodyProps?: TableBodyProps;

  tableRowProps?: TableRowProps;
  editedRowProps?: TableRowProps;

  tableCellProps?: TableCellProps;
  pinnedCellProps?: TableCellProps;
  editedRowPinnedCellProps?: TableCellProps;
}

export type DataTableCellProps<TData, TValue> = {
  propsStack?: DataTableBodyPropsStack;
  isEdited?: boolean,
  cell: TanstackCell<TData, TValue>;
};

export function DataTableCell<TData, TValue>(props: DataTableCellProps<TData, TValue>) {
  const isPinned = props.cell.column.getIsPinned()

  return (
    <ChakraTable.Cell
      style={{
        ...getCommonPinningStyles(props.cell.column),
      }}
      {...props.propsStack?.tableCellProps}
      {...(isPinned ? props.propsStack?.pinnedCellProps : {})}
      {...((isPinned && props.isEdited) ? props.propsStack?.editedRowPinnedCellProps : {})}
    >
      {flexRender(props.cell.column.columnDef.cell, props.cell.getContext())}
    </ChakraTable.Cell>
  )
}

export type DataTableRowProps<T> = {
  propsStack?: DataTableBodyPropsStack;
  cellFunc?: (props: TableRowProps) => React.ReactNode;
  row: TanstackRow<T>;
};

export function DataTableRow<T>(props: DataTableRowProps<T>) {
  // const hoveredRowId = useDataTableSelector((state) => state.hoveredRowId)
  const dispatch = useDataTableDispatch()
  const isEdited = check.equal((props.row.original as { isEdited: true }).isEdited, true)

  return (
    <ChakraTable.Row
      key={props.row.id}
      h={"3.2rem"}
      onMouseEnter={() => dispatch({ type: "SET_HOVERED_ROW_ID", payload: props.row.id })}
      onMouseLeave={() => dispatch({ type: "SET_HOVERED_ROW_ID", payload: null })}
      {...props.propsStack?.tableRowProps}
      {...(isEdited ? props.propsStack?.editedRowProps : {})}
    >
      {props.row.getVisibleCells().map((cell) => (
        <DataTableCell key={cell.id} cell={cell} propsStack={props.propsStack} isEdited={isEdited} />
      ))}

    </ChakraTable.Row>
  )
}

export type DataTableBodyProps<T> = {
  propsStack?: DataTableBodyPropsStack;
  rows: TanstackRow<T>[];
};

export function DataTableBody<T>(props: DataTableBodyProps<T>) {
  return (
    <ChakraTable.Body {...props.propsStack?.tableBodyProps}>
      {props.rows.map((row) => (
        <DataTableRow key={row.id} row={row} propsStack={props.propsStack} />
      ))}
    </ChakraTable.Body>
  )
}
