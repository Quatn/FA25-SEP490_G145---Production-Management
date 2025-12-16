import { CellContext, ColumnDef, ColumnDefTemplate, createColumnHelper } from "@tanstack/react-table";
import { CellOptions, dataTableCells, DataTableCellType } from "../Cell";
import { DataTableEditableCellValueTypes } from "../types";
import { JSX } from "react";
import { ListCollection } from "@chakra-ui/react";
import check from "check-types";

export type DataTableAccessorColumnOptions<T> = ColumnDef<T> & {
  cellType?: DataTableCellType,
  selectCollection?: ListCollection<{ label: string, value: string }>
  options?: CellOptions<T>,
}

export function getDataTableColumnHelper<TData>() {
  type RowData = TData & { isEdited: boolean }
  const columnHelper = createColumnHelper<RowData>();

  return {
    columnHelper,
    defineDataTableAccessorColumn: (o: DataTableAccessorColumnOptions<RowData>): ColumnDef<RowData> => {
      let cell = (context: CellContext<RowData, DataTableEditableCellValueTypes>) => dataTableCells.readonly({
        context,
        options: o.options
      })

      switch (o.cellType) {
        case DataTableCellType.Highlight:
          cell = (context: CellContext<RowData, DataTableEditableCellValueTypes>) => dataTableCells.highlight({
            context,
            options: o.options
          })
          break;

        case DataTableCellType.Text:
          cell = (context: CellContext<RowData, DataTableEditableCellValueTypes>) => dataTableCells.text({
            context,
            options: o.options
          }) as JSX.Element
          break;

        case DataTableCellType.Select:
          if (check.undefined(o.selectCollection)) {
            throw Error("Select Cells must also be provided a selectCollection in the column definition")
          }
          cell = (context: CellContext<RowData, DataTableEditableCellValueTypes>) => dataTableCells.select({
            context,
            selectCollection: o.selectCollection,
            options: o.options
          }) as JSX.Element
          break;

        case DataTableCellType.Date:
          cell = (context: CellContext<RowData, DataTableEditableCellValueTypes>) => dataTableCells.date({
            context,
            options: o.options
          }) as JSX.Element
          break;

        case DataTableCellType.Number:
          cell = (context: CellContext<RowData, DataTableEditableCellValueTypes>) => dataTableCells.number({
            context,
            options: o.options
          }) as JSX.Element
          break;
      }

      return {
        ...o,
        cell: cell as ColumnDefTemplate<CellContext<RowData, unknown>>,
      }
    },
    defineDataTableDisplayColumn: columnHelper.display,
    defineHeaderGroup: columnHelper.group,
  }
}
