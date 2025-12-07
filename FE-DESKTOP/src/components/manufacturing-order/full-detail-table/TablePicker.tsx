"use client"
import ManufacturingOrderTable from "./Table";
import TruncatedManufacturingOrderTable from "./TruncatedTable";
import { BoxProps, TableRootProps, TabsRootProps } from "@chakra-ui/react";

export type ManufacturingOrderTableProps = {
  rootProps?: BoxProps;
  tabsRootProps?: TabsRootProps;
  tableRootProps?: TableRootProps;
};

export default function ManufacturingOrderTablePicker(props: ManufacturingOrderTableProps) {
  // const { useSelector } = ManufacturingOrderTableReducerStore;
  const useFullTable =  false
  //useSelector(s => s.useFullTable)

  if (useFullTable) {
    return <ManufacturingOrderTable {...props} />
  }
  return <TruncatedManufacturingOrderTable {...props} />
}
