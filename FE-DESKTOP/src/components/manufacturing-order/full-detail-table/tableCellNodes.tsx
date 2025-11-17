import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { createListCollection, ListCollection } from "@chakra-ui/react";
import { CellContext } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { ManufacturingOrderTableDataType } from "./tableDefinition";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";

export enum ManufacturingTableEditableCellInputTypes {
  text = "TEXT",
  select = "SELECT",
  number = "NUMBER",
  date = "DATE",
}

export type ManufacturingTableEditableCellValueTypes = string | number | Date
export type ManufacturingTableEditableCellProps = {
  type: ManufacturingTableEditableCellInputTypes,
  value: ManufacturingTableEditableCellValueTypes,
  setValue: (value: ManufacturingTableEditableCellValueTypes) => void,
  onBlur?: (value: ManufacturingTableEditableCellValueTypes) => void,
  updateTableData: (value: ManufacturingTableEditableCellValueTypes) => void,
  selectValues?: { label: string, value: ManufacturingTableEditableCellValueTypes }[]
  selectCollection?: ListCollection<{ label: string, value: string }>
}

export type ManufacturingTableMeta = {
  allowEdit?: boolean;
  updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
  editableCellNode?: (props: ManufacturingTableEditableCellProps) => React.ReactNode
};

type NodeCellProps = {
  context: CellContext<ManufacturingOrderTableDataType, unknown>
}

const NoteCell = (props: NodeCellProps) => {
  const { row, column, table } = props.context;
  const initialValue = row.original.note ?? "";
  const [value, setValue] = useState<ManufacturingTableEditableCellValueTypes>(initialValue);

  const meta = (table.options.meta as ManufacturingTableMeta | undefined)

  const updateTableData = (value: ManufacturingTableEditableCellValueTypes) => {
    if (meta?.updateData) {
      meta.updateData(row.index, column.id, value);
    }
  }

  const onBlur = (value: ManufacturingTableEditableCellValueTypes) => {
    updateTableData(value)
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (meta?.allowEdit) {
    if (meta.editableCellNode) {
      return meta.editableCellNode({ value, updateTableData, setValue, onBlur, type: ManufacturingTableEditableCellInputTypes.text })
    }
  }

  return value;
}

const RequestedDatetimeCell = (props: NodeCellProps) => {
  const { row, column, table } = props.context;
  const initialValue = row.original.requestedDatetime ?? "";
  const [value, setValue] = useState<ManufacturingTableEditableCellValueTypes>(initialValue);

  const meta = (table.options.meta as ManufacturingTableMeta | undefined)

  const updateTableData = (value: ManufacturingTableEditableCellValueTypes) => {
    if (meta?.updateData) {
      meta.updateData(row.index, column.id, value);
    }
  }

  const onBlur = (value: ManufacturingTableEditableCellValueTypes) => {
    updateTableData(value)
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (meta?.allowEdit) {
    if (meta.editableCellNode) {
      return meta.editableCellNode({ value, updateTableData, setValue, onBlur, type: ManufacturingTableEditableCellInputTypes.date })
    }
  }

  return formatDateToDDMMYYYY(value as string);
}

const ManufacturingDateCell = (props: NodeCellProps) => {
  const { row, column, table } = props.context;
  const initialValue = row.original.manufacturingDateAdjustment ?? row.original.manufacturingDate ?? "";
  const [value, setValue] = useState<ManufacturingTableEditableCellValueTypes>(initialValue);

  const meta = (table.options.meta as ManufacturingTableMeta | undefined)

  const updateTableData = (value: ManufacturingTableEditableCellValueTypes) => {
    if (meta?.updateData) {
      meta.updateData(row.index, column.id, value);
    }
  }

  const onBlur = (value: ManufacturingTableEditableCellValueTypes) => {
    updateTableData(value)
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (meta?.allowEdit) {
    if (meta.editableCellNode) {
      console.log(value)
      console.log(new Date(value))
      return meta.editableCellNode({ value: new Date(value), updateTableData, setValue, onBlur, type: ManufacturingTableEditableCellInputTypes.date })
    }
  }

  return formatDateToDDMMYYYY(value as string);
}

const corrugatorLines = [{ label: "Dàn 5", value: "5" }, { label: "Dàn 7", value: "7" }]
const corrugatorLinesCol = createListCollection({
  items: corrugatorLines,
})
const CorrugatorLineCell = (props: NodeCellProps) => {
  const { row, column, table } = props.context;
  const initialValue = row.original.corrugatorLineAdjustment ?? row.original.corrugatorLine ?? 0;
  const [value, setValue] = useState<ManufacturingTableEditableCellValueTypes>(initialValue);

  const meta = (table.options.meta as ManufacturingTableMeta | undefined)

  const updateTableData = (value: ManufacturingTableEditableCellValueTypes) => {
    if (meta?.updateData) {
      meta.updateData(row.index, column.id, value);
    }
  }

  const onBlur = (value: ManufacturingTableEditableCellValueTypes) => {
    updateTableData(value)
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (meta?.allowEdit) {
    if (meta.editableCellNode) {
      return meta.editableCellNode({ value, updateTableData, setValue, onBlur, type: ManufacturingTableEditableCellInputTypes.select, selectCollection: corrugatorLinesCol })
    }
  }

  return value;
}

const AmountCell = (props: NodeCellProps) => {
  const { row, column, table } = props.context;
  const initialValue = row.original.amount ?? "";
  const [value, setValue] = useState<ManufacturingTableEditableCellValueTypes>(initialValue);

  const meta = (table.options.meta as ManufacturingTableMeta | undefined)

  const updateTableData = (value: ManufacturingTableEditableCellValueTypes) => {
    if (meta?.updateData) {
      meta.updateData(row.index, column.id, value);
    }
  }

  const onBlur = (value: ManufacturingTableEditableCellValueTypes) => {
    updateTableData(value)
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (meta?.allowEdit) {
    if (meta.editableCellNode) {
      return meta.editableCellNode({ value, updateTableData, setValue, onBlur, type: ManufacturingTableEditableCellInputTypes.number })
    }
  }

  return value;
}

const manufacturingDirectives = [{ label: "DỪNG", value: "DUNG" }, { label: "BẮT BUỘC", value: "BATBUOC" }]
const manufacturingDirectivesCol = createListCollection({
  items: manufacturingDirectives,
})
const ManufacturingDirectiveCell = (props: NodeCellProps) => {
  const { row, column, table } = props.context;
  const initialValue = row.original.manufacturingDirective ?? "";
  const [value, setValue] = useState<ManufacturingTableEditableCellValueTypes>(initialValue);

  const meta = (table.options.meta as ManufacturingTableMeta | undefined)

  const updateTableData = (value: ManufacturingTableEditableCellValueTypes) => {
    if (meta?.updateData) {
      meta.updateData(row.index, column.id, value);
    }
  }

  const onBlur = (value: ManufacturingTableEditableCellValueTypes) => {
    updateTableData(value)
  };


  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (meta?.allowEdit) {
    if (meta.editableCellNode) {
      return meta.editableCellNode({ value, updateTableData, setValue, onBlur, type: ManufacturingTableEditableCellInputTypes.select, selectCollection: manufacturingDirectivesCol })
    }
  }

  const dir = manufacturingDirectives.find(d => d.value === value)

  return (dir) ? dir.label : value;
}

export const manufacturingOrderTableCells = {
  note: NoteCell,
  requestedDatetime: RequestedDatetimeCell,
  manufacturingDate: ManufacturingDateCell,
  corrugatorLine: CorrugatorLineCell,
  amount: AmountCell,
  manufacturingDirective: ManufacturingDirectiveCell,
}
