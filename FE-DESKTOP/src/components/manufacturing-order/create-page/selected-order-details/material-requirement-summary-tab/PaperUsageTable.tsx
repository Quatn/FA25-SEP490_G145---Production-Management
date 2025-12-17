"use client";

import { Box, BoxProps, Mark, Table, TableRootProps, TabsRootProps } from "@chakra-ui/react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useContext } from "react";
import { paperUsageTableColumns } from "./paperUsageTableDefinition";
import { CreatePageStoreContext } from "../TabbedContainer";
import { useStore } from "@tanstack/react-store";

export type PaperUsageTableProps = {
  rootProps?: BoxProps;
  tabsRootProps?: TabsRootProps;
  tableRootProps?: TableRootProps;
  type: "FACE" | "RAW"
  header: string,
};

export default function PaperUsageTable(
  props: PaperUsageTableProps,
) {
  const store = useContext(CreatePageStoreContext);
  if (!store) throw new Error("Must be used inside CreatePageStoreContext");
  const tableData = useStore(store, (s) => props.type === "FACE" ? s.facePaperUsage : s.rawPaperUsage)

  const table = useReactTable({
    data: tableData,
    columns: paperUsageTableColumns(props.header),
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.code,
  });

  /*
  if (isFetchingList || paperrollsByTypeListIsFetchingList) {
    return <DataLoading />
  }

  if (fetchError || paperrollsByTypeListFetchError) {
    return <DataFetchError refetch={refetchDraft} />
  }

  if (check.undefined(fullDetailMOsResponse?.data) || fullDetailMOsResponse?.data.length < 1) {
    return (
      <Center>
        <Box bgColor={"colorPalette.muted"} px={3} py={2} rounded={"md"}>
          <Stack alignItems={"center"}>
            <Text>Các lệnh sẽ được tạo sẽ được hiển thị ở đây</Text>
            <Text>Hãy chọn PO Item bên trên</Text>
          </Stack>
        </Box>
      </Center>
    );
  }
  */

  return (
    <Box mt={3} {...props.rootProps}>
      <Table.ScrollArea borderWidth="1px">
        <Table.Root
          minW={table.getTotalSize()}
          size="sm"
          variant={"outline"}
          showColumnBorder
          {...props.tableRootProps}
        >
          <Table.Header colorPalette={"blue"} bgColor={"colorPalette.muted"}>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id} h={"3rem"}>
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeader key={header.id}
                    colorPalette={"blue"} bgColor={"colorPalette.muted"}
                    colSpan={header.colSpan}
                    textAlign={header.colSpan > 1 ? "center" : "start"}
                    textWrap={"wrap"}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows.map((row) => (
              <Table.Row
                key={row.id}
                h={"3.2rem"}
                bg={"bg"}
              >
                {row.getVisibleCells().map((cell) => {
                  const insufficient = row.original.inventoryWeight < row.original.requirementWeight
                  return (
                    <Table.Cell
                      key={cell.id}
                    >
                      {
                        cell.column.id === "inventoryWeight" ?
                          <Mark colorPalette={insufficient ? "red" : "green"} variant={insufficient ? "solid" : "plain"}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Mark>
                          : flexRender(cell.column.columnDef.cell, cell.getContext())
                      }
                    </Table.Cell>
                  )
                })}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box >
  );
}
