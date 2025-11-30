"use client"
import { CellContext } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { DataTableEditableCellInputTypes } from "./constants";
import { DataTableEditableCellValueTypes, DataTableMeta } from "./types";
import { Highlight, ListCollection, Text } from "@chakra-ui/react";
import check from "check-types";
import { formatDateToDDMMYYYY, formatDateToYYYYMMDD } from "@/utils/dateUtils";
import { useDataTableSelector } from "./Provider";

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
  if (check.date(value)) value = formatDateToYYYYMMDD(value)

  return <Text>{value}</Text>;
}

function HighlightCell<RowData>(props: CellProps<RowData, DataTableEditableCellValueTypes>) {
  let value: DataTableEditableCellValueTypes = props.context.cell.getValue()
  if (check.date(value)) value = formatDateToYYYYMMDD(value)
  const query = useDataTableSelector((state) => state.query)

  return (
    <Highlight query={[query ?? ""]} styles={{ bg: "yellow.emphasized" }}>
      {value + ""}
    </Highlight>
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

  return value;
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
  return colItem?.label ?? value;
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

  return value;
}

export const dataTableCells = {
  readonly: ReadonlyCell,
  highlight: HighlightCell,
  text: TextCell,
  select: SelectCell,
  date: DateCell,
  number: NumberCell,
}
