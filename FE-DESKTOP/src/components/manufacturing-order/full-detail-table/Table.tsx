"use client";

import {
  ManufacturingTableTabType,
  useManufacturingTableDispatch,
  useManufacturingTableState,
} from "@/context/manufacturing-order/manufacturingOrderTableContext";
import {
  useDeleteManufacturingOrderMutation,
  useGetFullDetailManufacturingOrdersQuery,
  useUpdateManyManufacturingOrdersMutation,
} from "@/service/api/manufacturingOrderApiSlice";
import {
  ActionBar,
  Box,
  BoxProps,
  Button,
  Center,
  Editable,
  Group,
  Input,
  Kbd,
  NumberInput,
  Popover,
  Portal,
  Select,
  Spinner,
  Stack,
  Table,
  TableRootProps,
  Tabs,
  TabsRootProps,
  Text,
} from "@chakra-ui/react";
import check from "check-types";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";
import { manufacturingOrderColumnsByTabs, ManufacturingOrderTableDataType } from "./tableDefinition";
import { useManufacturingDialogDispatch } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import { CSSProperties, useEffect, useMemo, useReducer, useState } from "react";
import { BiSolidDownArrow } from "react-icons/bi";
import { Column, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { ManufacturingTableEditableCellInputTypes, ManufacturingTableEditableCellProps, ManufacturingTableMeta } from "./tableCellNodes";
import { UpdateManyManufacturingOrdersRequestDto } from "@/types/DTO/manufacturing-order/UpdateManyManufacturingOrdersDto";
import { recalculatePurchaseOrderItem, recalculateWare, refreshPurchaseOrderItems, refreshWares } from "@/service/mock-data/recalculation";
import { formatDateToYYYYMMDD } from "@/utils/dateUtils";

export type ManufacturingOrderTableProps = {
  rootProps?: BoxProps;
  tabsRootProps?: TabsRootProps;
  tableRootProps?: TableRootProps;
};

const getCommonPinningStyles = (column: Column<ManufacturingOrderTableDataType>): CSSProperties => {
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

const EditableCell = (props: ManufacturingTableEditableCellProps) => {
  switch (props.type) {
    case ManufacturingTableEditableCellInputTypes.text:
      return (
        <Input
          bg={"bg"}
          value={props.value as string}
          onChange={(ev) => props.setValue(ev.target.value)}
          placeholder={"Nhấn để nhập"} onBlur={(ev) => {
            if (props.onBlur)
              props.onBlur(ev.target.value)
          }}
        />
      )
    case ManufacturingTableEditableCellInputTypes.select:
      if (props.selectCollection) {
        const col = props.selectCollection
        return (
          <Select.Root
            collection={col}
            size="sm"
            maxW="100px"
            value={[props.value as string]}
            onValueChange={(e) => props.updateTableData(check.undefined(e.value.at(0)) ? "" : e.value.at(0)!)}
            bg="bg"
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Chọn" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {col.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        )
      }
      return <p>Chưa có lựa chọn</p>
    case ManufacturingTableEditableCellInputTypes.number:
      return (
        <NumberInput.Root
          bg={"bg"}
          value={props.value as string}
          onValueChange={(ev) => props.setValue(ev.value)}
          defaultValue={"0"} onFocusChange={(ev) => {
            if (!ev.focused && props.onBlur)
              props.onBlur(ev.value)
          }}
        >

          <NumberInput.Control />
          <NumberInput.Input />
        </NumberInput.Root>
      )
    case ManufacturingTableEditableCellInputTypes.date:
      return (
        <Input
          bg={"bg"}
          type="date"
          value={[formatDateToYYYYMMDD(props.value as string)]}
          onChange={(ev) => {
            return props.setValue(new Date(ev.target.value))
          }}
          placeholder={"Nhấn để nhập"} onBlur={(ev) => {
            if (props.onBlur)
              props.onBlur(ev.target.value)
          }}
        />
      )
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
  } = useGetFullDetailManufacturingOrdersQuery({ page, limit, query: search });


  const dialogDispatch = useManufacturingDialogDispatch();
  const [updateOrders] = useUpdateManyManufacturingOrdersMutation();
  const [deleteOrder] = useDeleteManufacturingOrderMutation();

  const moPaginatedList = useMemo(() => {
    if (fullDetailMOPaginatedResponse?.data) {
      const calculatedMoPaginatedList = fullDetailMOPaginatedResponse?.data?.data.map((mo) => {
        const calculatedWare = recalculateWare(mo.purchaseOrderItem?.ware)
        const calculatedPOI = recalculatePurchaseOrderItem({
          ...mo.purchaseOrderItem!,
          ware: calculatedWare
        })

        return {
          ...mo,
          purchaseOrderItem: calculatedPOI,
        }
      })
      return {
        ...fullDetailMOPaginatedResponse.data,
        data: calculatedMoPaginatedList
      }
    }
    else {
      return undefined
    }
  }, [fullDetailMOPaginatedResponse?.data])

  const [tableData, setTableData] = useState<(ManufacturingOrderTableDataType)[]>(() => (moPaginatedList?.data?.map((mo) => ({
    ...mo,
    isEdited: false,
  })) ?? []))

  const [flag, forceDataReset] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    setTableData(
      moPaginatedList?.data.map((mo) => ({
        ...mo,
        isEdited: false,
      }))
      ??
      [])
  }, [moPaginatedList, flag])

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
                isEdited: true,
              }
            }
            return row
          })
        )
      },
      allowEdit,
      editableCellNode: (props: ManufacturingTableEditableCellProps) => {
        return <EditableCell {...props} />
      },
      query: search,
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

  const getTabBarOffset = () => {
    try {
      return (table.getColumn("code")?.getStart("left") ?? 0) + (table.getColumn("code")?.getSize() ?? 0);
    }
    catch {
      return 0
    }
  }

  const editedItemsNum = tableData.filter(row => row.isEdited).length

  const handleResetRow = (id: string) => {
    const curOrder = tableData.find((row) => row._id === id)
    const orgOrder = moPaginatedList?.data?.find((row) => row._id === id)
    if (curOrder && orgOrder && curOrder.isEdited) {
      setTableData(old =>
        old.map((row) => {
          if (row._id === id) {
            return { ...orgOrder, isEdited: false }
          }
          return row
        })
      )
    }
  }

  const handleUpdateOrder = (id: string) => {
    const order = tableData.find((row) => row._id === id)
    if (order && order.isEdited) {
      const dto: UpdateManyManufacturingOrdersRequestDto = {
        orders: [{ ...order, id: order._id, purchaseOrderItemId: order.purchaseOrderItem!._id }]
      }
      updateOrders(dto)
    }
  }

  const handleUpdateOrders = () => {
    const dto: UpdateManyManufacturingOrdersRequestDto = {
      orders: tableData.filter((row) => row.isEdited).map((order) => ({
        ...order,
        id: order._id,
        purchaseOrderItemId: order.purchaseOrderItem!._id,
      }))
    }

    updateOrders(dto)
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
                      background: row.original.isEdited ? (cell.column.getIsPinned() ? "#F5F5D5" : "#E7E7CB") : (cell.column.getIsPinned() ? "#fefefe" : "white")
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
                                  <Button size="xs" colorPalette={"green"} bg={{ base: "colorPalette.emphasized", _hover: "colorPalette.muted" }} onClick={() => handleUpdateOrder(row.id)}>Lưu</Button>
                                  <Button size="xs" colorPalette={"yellow"} bg={{ base: "colorPalette.emphasized", _hover: "colorPalette.muted" }} onClick={() => handleResetRow(row.id)}>Hoàn tác</Button>
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

      <ActionBar.Root open={editedItemsNum > 0}>
        <Portal>
          <ActionBar.Positioner>
            <ActionBar.Content>
              <ActionBar.SelectionTrigger>
                Đã sửa {editedItemsNum} lệnh
              </ActionBar.SelectionTrigger>
              <ActionBar.Separator />
              <Button colorPalette={"blue"} size="sm" onClick={() => {
                dispatch({ type: "SET_PREPARED_SUBMIT_ASK_TEXT", payload: `Lưu tất cả ${editedItemsNum} lệnh?` })
                dispatch({ type: "SET_PREPARED_SUBMIT_FUNCTION", payload: handleUpdateOrders })
              }}>
                Lưu tất cả
              </Button>
              <Button colorPalette={"yellow"} size="sm" onClick={forceDataReset}>
                Hoàn tác <Kbd>⌫</Kbd>
              </Button>
            </ActionBar.Content>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
    </Box >
  );
}
