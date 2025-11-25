import { Table as ChakraTable, TableRootProps, TableScrollAreaProps } from "@chakra-ui/react"
import { Table as TanstackTable } from "@tanstack/react-table";

export type DataTableRootProps<T> = {
  children: React.ReactNode;
  scrollAreaProps?: TableScrollAreaProps;
  tableRootProps?: TableRootProps;
};

export function DataTableRoot<T>(props: DataTableRootProps<T>) {
  return (
    <ChakraTable.ScrollArea borderWidth="1px" {...props.scrollAreaProps}>
      <ChakraTable.Root
        size="sm"
        variant={"outline"}
        showColumnBorder
        {...props.tableRootProps}
      >
        {props.children}
      </ChakraTable.Root>
    </ChakraTable.ScrollArea>
  )
}
