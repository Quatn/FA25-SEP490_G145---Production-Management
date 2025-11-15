"use client";

import {
  ManufacturingTableTabType,
  useManufacturingTableDispatch,
  useManufacturingTableState,
} from "@/context/manufacturing-order/manufacturingOrderTableContext";
import {
  useDeleteManufacturingOrderMutation,
  useGetFullDetailManufacturingOrdersQuery,
} from "@/service/api/manufacturingOrderApiSlice";
import {
  Box,
  BoxProps,
  Button,
  Group,
  Popover,
  Portal,
  Stack,
  Table,
  TableRootProps,
  Tabs,
  TabsRootProps,
  Text,
} from "@chakra-ui/react";
import check from "check-types";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";
import { manufacturingOrderColumnsByTabs } from "./tableDefinition";
import { useManufacturingDialogDispatch } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import { CSSProperties, useEffect, useState } from "react";
import { BiSolidDownArrow } from "react-icons/bi";
import { Column, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";

export type ManufacturingOrderTableProps = {
  rootProps?: BoxProps;
  tabsRootProps?: TabsRootProps;
  tableRootProps?: TableRootProps;
};

const getCommonPinningStyles = (column: Column<Serialized<ManufacturingOrder>>): CSSProperties => {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn =
    isPinned === 'left' && column.getIsLastColumn('left')
  const isFirstRightPinnedColumn =
    isPinned === 'right' && column.getIsFirstColumn('right')

  return {
    boxShadow: isLastLeftPinnedColumn
      ? '-4px 0 4px -4px gray inset'
      : isFirstRightPinnedColumn
        ? '4px 0 4px -4px gray inset'
        : undefined,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    opacity: isPinned ? 0.95 : 1,
    position: isPinned ? 'sticky' : 'relative',
    // width: column.getIsLastColumn() ? "100%" : column.getSize(),
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  }
}

export default function ManufacturingOrderTable(
  props: ManufacturingOrderTableProps,
) {
  const {
    page,
    limit,
    tab,
    search,
    hoveredRowId,
    selectedOrderId,
    pinnedOrderIds,
    allowEdit,
  } = useManufacturingTableState();
  const dispatch = useManufacturingTableDispatch();

  const {
    data: fullDetailMOPaginatedResponse,
    error: fetchError,
    isLoading: isFetchingList,
  } = useGetFullDetailManufacturingOrdersQuery({ page, limit });

  const dialogDispatch = useManufacturingDialogDispatch();
  const [deleteOrder] = useDeleteManufacturingOrderMutation();

  const moPaginatedList = fullDetailMOPaginatedResponse?.data;
  const [tableData, setTableData] = useState<Serialized<ManufacturingOrder>[]>(() => moPaginatedList?.data ?? [])

  useEffect(() => {
    setTableData(moPaginatedList?.data ?? [])
  }, [moPaginatedList])

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

    meta: {
      updateData: (rowIndex: number, columnId: number, value: string) => {
        // Skip page index reset until after next rerender
        // skipAutoResetPageIndex()
        setTableData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex]!,
                [columnId]: value,
              }
            }
            return row
          })
        )
      },
      allowEdit,
    },
  }
  );

  useEffect(() => {
    dispatch({
      type: "SET_TOTAL_ITEMS",
      payload: moPaginatedList ? moPaginatedList.totalItems : 0,
    });
  }, [dispatch, moPaginatedList, moPaginatedList?.totalItems]);

  if (isFetchingList) {
    return <Text>Loading table</Text>;
  }

  if (fetchError) {
    return <Text>{JSON.stringify(fetchError)}</Text>;
  }

  if (check.undefined(moPaginatedList)) {
    return <Text>Unable to load table</Text>;
  }

  const getTabBarOffset = () => {
    try {
      return (table.getColumn("code")?.getStart("left") ?? 0) + (table.getColumn("code")?.getSize() ?? 0);
    }
    catch {
      return 0
    }
  }

  return (
    <Box mt={3} {...props.rootProps}>
      <Tabs.Root
        value={tab}
        onValueChange={(e) =>
          dispatch({
            type: "SET_TAB",
            payload: e.value as ManufacturingTableTabType,
          })}
        {...props.tabsRootProps}
      >
        <Tabs.List ms={`${getTabBarOffset()}px`}>
          <Tabs.Trigger value="all">
            <LuUser />
            Tổng quan
          </Tabs.Trigger>
          <Tabs.Trigger value="order">
            <LuUser />
            Thông tin đơn hàng
          </Tabs.Trigger>
          <Tabs.Trigger value="manufacture">
            <LuFolder />
            Gia công
          </Tabs.Trigger>
          <Tabs.Trigger value="layers">
            <LuSquareCheck />
            Cấu trúc lớp
          </Tabs.Trigger>
          <Tabs.Trigger value="notes">
            <LuSquareCheck />
            Ghi chú
          </Tabs.Trigger>
          <Tabs.Trigger value="weight">
            <LuSquareCheck />
            Trọng lượng giấy sử dụng
          </Tabs.Trigger>
          <Tabs.Trigger value="processes">
            <LuSquareCheck />
            Công đoạn hoàn thiện
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

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
                    style={{ ...getCommonPinningStyles(header.column) }}
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
                onMouseEnter={() => dispatch({ type: "SET_HOVERED_ROW_ID", payload: row.id })}
                onMouseLeave={() => dispatch({ type: "SET_HOVERED_ROW_ID", payload: null })}
                h={"3.2rem"}
              >
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell
                    key={cell.id}
                    style={{
                      ...getCommonPinningStyles(cell.column),
                      background: cell.column.getIsPinned() ? "#fefefe" : "#f3f3f3"
                    }}
                  >
                    {(cell.column.id === "actions-column" && row.id === hoveredRowId) ? (
                      <Popover.Root size="xs">
                        <Box>
                          <Group attached>
                            <Button
                              size="xs"
                              colorPalette={"blue"}
                              onClick={() =>
                                dialogDispatch({
                                  type: "OPEN_DIALOG_WITH_ORDER",
                                  payload: row.original,
                                })
                              }
                            >
                              Chi tiết
                            </Button>

                            <Popover.Trigger asChild>
                              <Button variant="solid" size="xs" colorPalette={"gray"} bg={{ base: "colorPalette.emphasized", _hover: "colorPalette.muted" }}>
                                <BiSolidDownArrow />
                              </Button>
                            </Popover.Trigger>
                          </Group>

                          <Portal>
                            <Popover.Positioner>
                              <Popover.Content>
                                <Stack>
                                  <Button size="xs" colorPalette={"yellow"} bg={{ base: "colorPalette.emphasized", _hover: "colorPalette.muted" }}>Hoàn tác</Button>
                                  <Button size="xs" colorPalette={"blue"} bg={{ base: "colorPalette.solid", _hover: "colorPalette.emphasized" }}>Ghim lệnh</Button>
                                  <Button size="xs" colorPalette={"red"} bg={{ base: "colorPalette.solid", _hover: "colorPalette.emphasized" }} onClick={() => deleteOrder({ id: row.id })}>Xóa</Button>
                                </Stack>
                              </Popover.Content>
                            </Popover.Positioner>
                          </Portal>
                        </Box>
                      </Popover.Root>
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
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
