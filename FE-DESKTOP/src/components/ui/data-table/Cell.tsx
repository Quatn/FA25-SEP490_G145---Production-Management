"use client"
import { CellContext } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { DataTableEditableCellInputTypes } from "./constants";
import { DataTableEditableCellValueTypes, DataTableMeta } from "./types";
import { Highlight, ListCollection, Text } from "@chakra-ui/react";
import check from "check-types";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";
import { useDataTableSelector } from "./Provider";
import { numToFixedBounded } from "@/utils/numToFixedBounded";

export enum DataTableCellType {
  Readonly = "READONLY",
  Highlight = "HIGHLIGHT",
  Text = "TEXT",
  Number = "NUMBER",
  Date = "DATE",
  Select = "SELECT",
}

export type CellOptions<RowData> = {
  nullIfNumLessOrEqual?: number,
  boundFloat?: boolean,
  parseDate?: boolean,
  forBiddenIfNumValIsLessThan?: number,
  getDisabled?: (data: RowData) => boolean,
  onForbidden?: () => void,
  onWarning?: () => void,
}

type CellProps<RowData, TValue> = {
  context: CellContext<RowData, TValue>
  selectCollection?: ListCollection<{ label: string, value: string }>
  options?: CellOptions<RowData>,
}

function formatDisplayValue<RowData>(value: DataTableEditableCellValueTypes, options?: CellOptions<RowData>): string {
  if (check.null(value) || check.undefined(value)) {
    return ""
  }

  const num = parseFloat(value + "")

  if (check.number(options?.nullIfNumLessOrEqual) && num <= options.nullIfNumLessOrEqual) {
    return ""
  }

  if (options?.boundFloat && check.number(num)) return numToFixedBounded(num)

  if (check.date(value)) return formatDateToDDMMYYYY(value)

  if (options?.parseDate) {
    const date = new Date(value)
    if ((check.string(value) && check.date(date))) return formatDateToDDMMYYYY(date)
    else return ""
  }

  return value + ""
}

function ReadonlyCell<RowData>(props: CellProps<RowData, DataTableEditableCellValueTypes>) {
  const value: DataTableEditableCellValueTypes = props.context.cell.getValue()

  const displayText = formatDisplayValue(value, props.options)

  return <Text textWrap={"wrap"}>
    {displayText}
  </Text>;
}

function HighlightCell<RowData>(props: CellProps<RowData, DataTableEditableCellValueTypes>) {
  let value: DataTableEditableCellValueTypes = props.context.cell.getValue()
  if (check.date(value)) value = formatDateToDDMMYYYY(value)
  const query = useDataTableSelector((state) => state.query)

  return (
    <Text textWrap={"wrap"}>
      <Highlight query={[query ?? ""]} styles={{ bg: "yellow.emphasized" }}>
        {value + ""}
      </Highlight>
    </Text>
  );
}

function TextCell<RowData>(props: CellProps<RowData, DataTableEditableCellValueTypes>) {
  const { row, column, table, getValue } = props.context;
  const initialValue = getValue();
  const [value, setValue] = useState<DataTableEditableCellValueTypes>(initialValue);

  const handleSetValue = (value: DataTableEditableCellValueTypes) => {
    if (check.date(value)) {
      setValue(formatDateToDDMMYYYY(value))
    }
    setValue(value + "")
  }

  const meta = (table.options.meta as DataTableMeta | undefined)

  const updateTableData = (value: DataTableEditableCellValueTypes) => {
    if (meta?.updateData) {
      meta.updateData(row.index, column.id, value);
    }
  }

  const onBlur = (value: DataTableEditableCellValueTypes) => {
    updateTableData(value)
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const allowEdit = useDataTableSelector((state) => state.allowEdit)
  const disabled = (props.options?.getDisabled) ? props.options.getDisabled(row.original) : false

  if (allowEdit) {
    if (meta?.editableCellNode) {
      return meta.editableCellNode({ value, updateTableData, setValue: handleSetValue, onBlur, type: DataTableEditableCellInputTypes.Text, disabled })
    }
  }

  return <Text textWrap={"wrap"}>{check.date(value) ? formatDateToDDMMYYYY(value) : value}</Text>;
}

function SelectCell<RowData>(props: CellProps<RowData, DataTableEditableCellValueTypes>) {
  if (check.undefined(props.selectCollection)) {
    throw Error("Select Cells must also be provided a selectCollection in the column definition")
  }

  const { row, column, table, getValue } = props.context;
  const initialValue = getValue();
  const [value, setValue] = useState<DataTableEditableCellValueTypes>(initialValue);

  const handleSetValue = (value: DataTableEditableCellValueTypes) => {
    if (check.date(value)) {
      setValue(formatDateToDDMMYYYY(value))
    }
    setValue(value + "")
  }

  const meta = (table.options.meta as DataTableMeta | undefined)

  const updateTableData = (value: DataTableEditableCellValueTypes) => {
    if (meta?.updateData) {
      meta.updateData(row.index, column.id, value);
    }
  }

  const onBlur = (value: DataTableEditableCellValueTypes) => {
    updateTableData(value)
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const allowEdit = useDataTableSelector((state) => state.allowEdit)
  const disabled = (props.options?.getDisabled) ? props.options.getDisabled(row.original) : false

  if (allowEdit) {
    if (meta?.editableCellNode) {
      return meta.editableCellNode({
        value,
        updateTableData,
        setValue: handleSetValue,
        onBlur,
        type: DataTableEditableCellInputTypes.Select,
        selectCollection: props.selectCollection,
        disabled,
      })
    }
  }

  const colItem = props.selectCollection.find(value + "")
  return colItem?.label ?? <Text textWrap={"wrap"}>{check.date(value) ? formatDateToDDMMYYYY(value) : value}</Text>;
}


function DateCell<RowData>(props: CellProps<RowData, DataTableEditableCellValueTypes>) {
  const { row, column, table, getValue } = props.context;
  const initialValue = getValue();

  const [value, setValue] = useState<DataTableEditableCellValueTypes>(initialValue);
  const handleSetValue = (value: DataTableEditableCellValueTypes) => {
    setValue(value)
  }

  const meta = (table.options.meta as DataTableMeta | undefined)

  const updateTableData = (value: DataTableEditableCellValueTypes) => {
    if (meta?.updateData) {
      meta.updateData(row.index, column.id, value);
    }
  }

  const onBlur = (value: DataTableEditableCellValueTypes) => {
    updateTableData(value)
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const allowEdit = useDataTableSelector((state) => state.allowEdit)
  const disabled = (props.options?.getDisabled) ? props.options.getDisabled(row.original) : false

  if (allowEdit) {
    if (meta?.editableCellNode) {
      return meta.editableCellNode({ value, updateTableData, setValue: handleSetValue, onBlur, type: DataTableEditableCellInputTypes.Date, disabled })
    }
  }

  return formatDateToDDMMYYYY(value as string | Date);
}

function NumberCell<RowData>(props: CellProps<RowData, DataTableEditableCellValueTypes>) {
  const { row, column, table, getValue } = props.context;
  const initialValue = getValue();
  const [value, setValue] = useState<DataTableEditableCellValueTypes>(initialValue);

  const handleSetValue = (value: DataTableEditableCellValueTypes) => {
    setValue(value)
  }

  const meta = (table.options.meta as DataTableMeta | undefined)

  const updateTableData = (value: DataTableEditableCellValueTypes) => {
    if (meta?.updateData) {
      meta.updateData(row.index, column.id, value);
    }
  }

  const onBlur = (value: DataTableEditableCellValueTypes) => {
    if (props.options?.onForbidden) {
      if (check.number(props.options?.forBiddenIfNumValIsLessThan)) {
        const num = parseFloat(value + "")
        if (check.number(num) && num < props.options.forBiddenIfNumValIsLessThan) {
          props.options.onForbidden()
          setValue(initialValue)
          return;
        }
      }
    }
    updateTableData(value)
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const allowEdit = useDataTableSelector((state) => state.allowEdit)
  const disabled = (props.options?.getDisabled) ? props.options.getDisabled(row.original) : false

  if (allowEdit) {
    if (meta?.editableCellNode) {
      return meta.editableCellNode({ value, updateTableData, setValue: handleSetValue, onBlur, type: DataTableEditableCellInputTypes.Number, disabled })
    }
  }

  return <Text textWrap={"wrap"}>{check.date(value) ? formatDateToDDMMYYYY(value) : value}</Text>;
}

export const dataTableCells = {
  readonly: ReadonlyCell,
  highlight: HighlightCell,
  text: TextCell,
  select: SelectCell,
  date: DateCell,
  number: NumberCell,
}
