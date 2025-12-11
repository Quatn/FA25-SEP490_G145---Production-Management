"use client"
import { CellContext } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { DataTableEditableCellInputTypes } from "./constants";
import { DataTableEditableCellValueTypes, DataTableMeta } from "./types";
import { Highlight, ListCollection, Text } from "@chakra-ui/react";
import check from "check-types";
import { formatDateToDDMMYYYY, formatDateToYYYYMMDD } from "@/utils/dateUtils";
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

type CellProps<RowData, TValue> = {
  context: CellContext<RowData, TValue>
  selectCollection?: ListCollection<{ label: string, value: string }>
}

function ReadonlyCell<RowData>(props: CellProps<RowData, DataTableEditableCellValueTypes>) {
  let value: DataTableEditableCellValueTypes = props.context.cell.getValue()
  const date = new Date(value)
  if (check.string(value) && check.date(date)) value = formatDateToDDMMYYYY(date)

  const num = parseFloat(value + "")

  return <Text textWrap={"wrap"}>{check.number(num) ? (num == 0) ? "" : numToFixedBounded(num) : check.assigned(value) ? value + "" : ""}</Text>;
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

  if (allowEdit) {
    if (meta?.editableCellNode) {
      return meta.editableCellNode({ value, updateTableData, setValue: handleSetValue, onBlur, type: DataTableEditableCellInputTypes.Text })
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

  if (allowEdit) {
    if (meta?.editableCellNode) {
      return meta.editableCellNode({
        value,
        updateTableData,
        setValue: handleSetValue,
        onBlur,
        type: DataTableEditableCellInputTypes.Select,
        selectCollection: props.selectCollection,
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

  if (allowEdit) {
    if (meta?.editableCellNode) {
      return meta.editableCellNode({ value, updateTableData, setValue: handleSetValue, onBlur, type: DataTableEditableCellInputTypes.Date })
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
    updateTableData(value)
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const allowEdit = useDataTableSelector((state) => state.allowEdit)

  if (allowEdit) {
    if (meta?.editableCellNode) {
      return meta.editableCellNode({ value, updateTableData, setValue: handleSetValue, onBlur, type: DataTableEditableCellInputTypes.Number })
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
