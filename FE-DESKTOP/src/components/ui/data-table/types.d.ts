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
  disabled?: boolean,
}

export type DataTableMeta = {
  updateData?: (rowIndex: number, columnId: string, value: DataTableEditableCellValueTypes) => void;
  resetRow?: (id: string) => void,
  editableCellNode?: (props: DataTableEditableCellProps) => React.ReactNode
};
