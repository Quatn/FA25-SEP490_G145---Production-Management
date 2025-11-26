import { CellContext, ColumnDef, ColumnDefTemplate, createColumnHelper } from "@tanstack/react-table";
import { dataTableCells, DataTableCellType } from "../Cell";
import { DataTableEditableCellValueTypes } from "../types";
import { JSX } from "react";
import { ListCollection } from "@chakra-ui/react";
import check from "check-types";

export type DataTableAccessorColumnOptions<T> = ColumnDef<T> & {
  cellType?: DataTableCellType,
  selectCollection?: ListCollection<{ label: string, value: string }>
}

export function getDataTableColumnHelper<RowData>() {
  const columnHelper = createColumnHelper<RowData>();

  return {
    columnHelper,
    defineDataTableAccessorColumn: (o: DataTableAccessorColumnOptions<RowData>): ColumnDef<RowData> => {
      let cell = (context: CellContext<RowData, DataTableEditableCellValueTypes>) => dataTableCells.readonly({
        context,
      })

      switch (o.cellType) {
        case DataTableCellType.Highlight:
          cell = (context: CellContext<RowData, DataTableEditableCellValueTypes>) => dataTableCells.highlight({
            context,
          })
          break;

        case DataTableCellType.Text:
          cell = (context: CellContext<RowData, DataTableEditableCellValueTypes>) => dataTableCells.text({
            context,
          }) as JSX.Element
          break;

        case DataTableCellType.Select:
          if (check.undefined(o.selectCollection)) {
            throw Error("Select Cells must also be provided a selectCollection in the column definition")
          }
          cell = (context: CellContext<RowData, DataTableEditableCellValueTypes>) => dataTableCells.select({
            context,
            selectCollection: o.selectCollection,
          }) as JSX.Element
          break;

        case DataTableCellType.Date:
          cell = (context: CellContext<RowData, DataTableEditableCellValueTypes>) => dataTableCells.date({
            context,
          }) as JSX.Element
          break;

        case DataTableCellType.Number:
          cell = (context: CellContext<RowData, DataTableEditableCellValueTypes>) => dataTableCells.number({
            context,
          }) as JSX.Element
          break;
      }

      return {
        ...o,
        cell: cell as ColumnDefTemplate<CellContext<RowData, unknown>>,
      }
    },
    defineDataTableDisplayColumn: columnHelper.display,
  }
}
