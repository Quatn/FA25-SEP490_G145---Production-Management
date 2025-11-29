"use client"
import { Box, Checkbox, createListCollection, Field, Input, Text } from "@chakra-ui/react";
import useDataTable from "@/components/ui/data-table/hook";
import { ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { DataTableCellType } from "../ui/data-table/Cell";
import { ChangeEvent, useState } from "react";
import { useDataTableDispatch, useDataTableSelector } from "../ui/data-table/Provider";
import { getDataTableColumnHelper } from "../ui/data-table/utils/getDataTableColumnHelper";
import check from "check-types";

type Person = {
  no: number;
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  dob: Date;
};

const defaultData: Person[] = [
  {
    no: 1,
    firstName: "tanner",
    lastName: "linsley",
    age: 24,
    visits: 100,
    status: "inrelationship",
    dob: new Date("2004-01-07"),
  },
  {
    no: 2,
    firstName: "tandy",
    lastName: "miller",
    age: 40,
    visits: 40,
    status: "single",
    dob: new Date("2004-01-08"),
  },
  {
    no: 3,
    firstName: "joe",
    lastName: "dirte",
    age: 45,
    visits: 20,
    status: "complicated",
    dob: new Date("2004-01-09"),
  },
];

// Define Columns
const statuses = [
  { label: "Single", value: "single" },
  { label: "In Relationship", value: "inrelationship" },
  { label: "Complicated", value: "complicated" },
]

const statusesCol = createListCollection({
  items: statuses,
})

const columnHelper = getDataTableColumnHelper<Person>()

const columns: ColumnDef<Person>[] = [
  {
    header: "No.",
    accessorKey: "no",
  },
  columnHelper.defineDataTableAccessorColumn({
    header: "First Name",
    accessorKey: "firstName",
    cellType: DataTableCellType.Readonly,
  }),
  columnHelper.defineDataTableAccessorColumn({
    header: "Last Name (Highlighted by the input above)",
    accessorKey: "lastName",
    cellType: DataTableCellType.Highlight,
  }),
  columnHelper.defineDataTableAccessorColumn({
    header: "Age",
    accessorKey: "age",
    cellType: DataTableCellType.Number,
  }),
  columnHelper.defineDataTableAccessorColumn({
    header: "Visits",
    accessorKey: "visits",
    cellType: DataTableCellType.Text,
  }),
  columnHelper.defineDataTableAccessorColumn({
    header: "Status",
    accessorKey: "status",
    cellType: DataTableCellType.Select,
    selectCollection: statusesCol,
  }),
  columnHelper.defineDataTableAccessorColumn({
    header: "Date of Birth",
    accessorKey: "dob",
    cellType: DataTableCellType.Date,
  }),
];

const TestDataTableQueryInput = () => {
  const query = useDataTableSelector((s) => s.query)
  const dispatch = useDataTableDispatch()

  const handleSetQuery = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_QUERY", payload: e.target.value })
  }

  console.log("TestDataTableQueryInput re-rendered")

  return (
    <Field.Root required m={2}>
      <Field.Label>
        Dispatching Input Field <Field.RequiredIndicator />
      </Field.Label>
      <Input value={query} onChange={handleSetQuery} bg={"bg"} />
      <Field.HelperText>This is an input field that is defined OUTSIDE of the table component and uses the dispatch function to send a message to a data table provider. A data table, somewhere inside the same provider, can evaluate this and change its state accordingly. Since it only changes the `query` state, only the lastname column, which uses Highlight cells that subscribe to the `query` state, re-render. It does what we want in the correct way. Spamming input in it will cause (probably) minimal lag.</Field.HelperText>
    </Field.Root>
  )
}

const TestDataTableEditCheckBox = () => {
  const allowEdit = useDataTableSelector((s) => s.allowEdit)
  const dispatch = useDataTableDispatch()

  const setChecked = (val: boolean) => {
    dispatch({ type: "SET_ALLOW_EDIT", payload: val })
  }

  console.log("TestDataTableEditCheckBox re-rendered with value", allowEdit)

  return (
    <Checkbox.Root checked={allowEdit}
      onCheckedChange={(e) => setChecked(!!e.checked)}
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label>Allow edit</Checkbox.Label>
    </Checkbox.Root>
  )
}

const HoveredRowDisplay = () => {
  const hoveredRowId = useDataTableSelector((s) => s.hoveredRowId)

  const txt = !check.null(hoveredRowId)? `The hovered row's id is: ${hoveredRowId}, pass something like this component into the cell field for a column def to have cells that act different when its row is hovered` : ""

  return (
    <Text>{txt}</Text>
  )
}

export default function TestDataTable() {
  const dataTable = useDataTable({
    data: defaultData,
    getCoreRowModel: getCoreRowModel(),
    columns: columns,
    meta: {
      /* Set this to tell the table to use a different set of editable cells
      editableCellNode: (props: DataTableEditableCellProps) => {
        return <ExampleCustomDataTableEditableCell {...props} />
      },
      */
    }
  })

  const { tableComponent, tableData } = dataTable;

  console.warn("⚠ The whole test table re-rendered, if this message appears too often then you're potentially lagging the app ⚠")

  const [input, setInput] = useState("")

  return (
    <Box>
      <TestDataTableQueryInput />

      <Field.Root m={2}>
        <Field.Label>
          Unrelated Input Field INSIDE of the table component<Field.RequiredIndicator />
        </Field.Label>
        <Input value={input} onChange={(e) => setInput(e.target.value)} bg={"bg"} />
        <Field.HelperText>This is an unrelated input field that sit INSIDE of the table component. Everytime its value changes the whole component is re-rendered, the useDataTable hook is called again and the whole tanstack table + the input and checkbox is re-calulated and re-rendered while not even changing anything on the table&lsquo;s state. It is useless and spamming input in it potentially lags the app like a 𝓜𝓸𝓽𝓱𝓮𝓻𝓯𝓾𝓬𝓴𝓮𝓻.</Field.HelperText>
      </Field.Root>

      <TestDataTableEditCheckBox />

      {tableComponent}

      <Text>
        {JSON.stringify(tableData)}
      </Text>

      <HoveredRowDisplay />
    </Box>
  )
}
