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
  Grid,
  GridItem,
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
import { manufacturingOrderTableColumnsByTabs } from "./tableDefinition";
import { useOptionalManufacturingDialogDispatch } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import { useEffect } from "react";
import { BiSolidDownArrow } from "react-icons/bi";

export type ManufacturingOrderTableProps = {
  rootProps?: BoxProps;
  tabsRootProps?: TabsRootProps;
  tableRootProps?: TableRootProps;
};

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
  } = useManufacturingTableState();
  const dispatch = useManufacturingTableDispatch();

  const {
    data: fullDetailMOPaginatedResponse,
    error: fetchError,
    isLoading: isFetchingList,
  } = useGetFullDetailManufacturingOrdersQuery({ page, limit });

  const dialogDispatch = useOptionalManufacturingDialogDispatch();

  const columnsForTab = manufacturingOrderTableColumnsByTabs[tab] ?? [];

  const moPaginatedList = fullDetailMOPaginatedResponse?.data;

  const [deleteOrder] = useDeleteManufacturingOrderMutation();

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
        <Tabs.List ms="200px">
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

      <Table.ScrollArea borderWidth="1px" rounded="md">
        <Table.Root
          size="sm"
          css={{
            "& [data-sticky]": {
              position: "sticky",
              zIndex: 1,
              bg: "bg",

              _after: {
                content: '""',
                position: "absolute",
                pointerEvents: "none",
                top: "0",
                bottom: "-1px",
                width: "32px",
              },
            },

            "& [data-sticky=end]": {
              _after: {
                insetInlineEnd: "0",
                translate: "100% 0",
                shadow: "inset 8px 0px 8px -8px rgba(0, 0, 0, 0.16)",
              },
            },

            "& [data-sticky=start]": {
              _after: {
                insetInlineStart: "0",
                translate: "-100% 0",
                shadow: "inset -8px 0px 8px -8px rgba(0, 0, 0, 0.16)",
              },
            },
          }}
          {...props.tableRootProps}
        >
          <Table.Header bgColor={"blue.100"}>
            <Table.Row h="60px">
              <Table.ColumnHeader
                data-sticky
                minW="100px"
                w="100px"
                left="0"
              >
                KH Giao
              </Table.ColumnHeader>
              <Table.ColumnHeader
                minW="100px"
                w="100px"
                left="100px"
                data-sticky="end"
              >
                Mã lệnh
              </Table.ColumnHeader>
              {columnsForTab.map((col) => (
                <Table.ColumnHeader key={col.key}>
                  {col.header}
                </Table.ColumnHeader>
              ))}

              <Table.ColumnHeader w="120px" border="none" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {moPaginatedList.data.map((item) => (
              <Table.Row
                key={item._id}
                bg={"gray.50"}
                h="50px"
                onMouseEnter={() =>
                  dispatch({ type: "SET_HOVERED_ROW_ID", payload: item._id })}
                onMouseLeave={() =>
                  dispatch({ type: "SET_HOVERED_ROW_ID", payload: null })}
              >
                <Table.Cell minW="100px" w="100px" left="0" data-sticky>
                  {item.manufacturingDirective}
                </Table.Cell>
                <Table.Cell
                  minW="100px"
                  w="100px"
                  left="100px"
                  data-sticky="end"
                >
                  {item.code}
                </Table.Cell>
                {columnsForTab.map((col) => (
                  <Table.Cell key={col.key}>{col.render(item)}</Table.Cell>
                ))}
                <Table.Cell
                  w="120px"
                  border="none"
                  bg="none"
                >
                  {hoveredRowId === item._id && (
                    <>
                      {dialogDispatch &&
                        (
                          <Popover.Root size="xs">
                            <Box h={"30px"}>
                              <Group attached>
                                <Button
                                  size="xs"
                                  colorPalette={"blue"}
                                  onClick={() =>
                                    dialogDispatch({
                                      type: "OPEN_DIALOG_WITH_ORDER",
                                      payload: item,
                                    })}
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
                                      <Button size="xs" colorPalette={"red"} bg={{ base: "colorPalette.solid", _hover: "colorPalette.emphasized" }} onClick={() => deleteOrder({ id: item._id })}>Xóa</Button>
                                    </Stack>
                                  </Popover.Content>
                                </Popover.Positioner>
                              </Portal>
                            </Box>
                          </Popover.Root>
                        )}
                    </>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  );
}
