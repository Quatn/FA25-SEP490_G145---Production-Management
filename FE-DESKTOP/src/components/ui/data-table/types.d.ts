import { ListCollection } from "@chakra-ui/react";
import { DataTableEditableCellInputTypes } from "./constants";

export type DataTableEditableCellValueTypes = string | number | Date
export type DataTableEditableCellProps = {
  type: DataTableEditableCellInputTypes,
  value: DataTableEditableCellValueTypes,
  setValue: (value: DataTableEditableCellValueTypes) => void,
  onBlur?: (value: DataTableEditableCellValueTypes) => void,
  updateTableData: (value: DataTableEditableCellValueTypes) => void,
  selectValues?: { label: string, value: string }[]
  selectCollection?: ListCollection<{ label: string, value: string }>
}

export type DataTableMeta = {
  allowEdit?: boolean;
  updateData?: (rowIndex: number, columnId: string, value: DataTableEditableCellValueTypes) => void;
  editableCellNode?: (props: DataTableEditableCellProps) => React.ReactNode
  hoveredRowId?: string | null;
  query?: string;
};
