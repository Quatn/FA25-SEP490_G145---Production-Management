/*
"use client";

import { useGetMaterialRequirementsQuery } from "@/service/api/materialRequirementApiSlice";
import { MaterialRequirementDto } from "@/types/DTO/material-requirement-summary/MaterialRequirement";
import { BoxProps, Table, TableRootProps, TabsRootProps } from "@chakra-ui/react";
import { Column, flexRender, useReactTable } from "@tanstack/react-table";
import { useEffect, useReducer, useState } from "react";

export type MaterialRequirementTableProps = {
  rootProps?: BoxProps;
  tabsRootProps?: TabsRootProps;
  tableRootProps?: TableRootProps;
};

export default function MaterialRequirementDto(
  props: MaterialRequirementTableProps,
) {
  const {
    data: materialRequirementResponse,
    error: fetchError,
    isLoading: isFetchingList,
  } = useGetMaterialRequirementsQuery({ orderId: "asca" });

  const materialRequirementList = materialRequirementResponse?.data;
  const [tableData, setTableData] = useState<Serialized<MaterialRequirementDto>[]>(materialRequirementList ?? [])

  const [flag, forceDataReset] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    setTableData(materialRequirementList ?? [])
  }, [materialRequirementList, flag])

  /*
  const table = useReactTable({
    data: tableData,
    columns: manufacturingOrderColumnsByTabs[tab],
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnPinning: {
        left: ['manufacturingDirective', "code"],
        right: ['actions-column'],
      },
    },
    getRowId: (row) => row._id,
  }
  );
  */

  /*
  useEffect(() => {
    dispatch({
      type: "SET_TOTAL_ITEMS",
      payload: moPaginatedList ? moPaginatedList.totalItems : 0,
    });
  }, [dispatch, moPaginatedList, moPaginatedList?.totalItems]);

  if (isFetchingList) {
    return (
      <Center h={"full"} flex={1} flexGrow={1}>
        <Stack alignItems={"center"}>
          <Spinner size="xl" />
          <Text>Đang tải lệnh</Text>
        </Stack>
      </Center>
    );
  }

  if (fetchError) {
    return <Text>{JSON.stringify(fetchError)}</Text>;
  }

  if (check.undefined(moPaginatedList)) {
    return <Text>Unable to load table</Text>;
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
              >
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box >
  );
}
*/
