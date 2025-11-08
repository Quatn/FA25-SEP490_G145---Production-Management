"use client";

import {
  ManufacturingTableTabType,
  useManufacturingTableDispatch,
  useManufacturingTableState,
} from "@/context/manufacturing-order/manufacturingOrderTableContext";
import {
  useGetFullDetailManufacturingOrdersQuery,
} from "@/service/api/manufacturingOrderApiSlice";
import {
  Box,
  BoxProps,
  Button,
  Grid,
  GridItem,
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

const items = [
  { id: 1, name: "Laptop", category: "Electronics", price: 999.99 },
  { id: 2, name: "Coffee Maker", category: "Home Appliances", price: 49.99 },
  { id: 3, name: "Desk Chair", category: "Furniture", price: 150.0 },
  { id: 4, name: "Smartphone", category: "Electronics", price: 799.99 },
  { id: 5, name: "Headphones", category: "Accessories", price: 199.99 },
];

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

  const moList = fullDetailMOPaginatedResponse?.data;

  if (isFetchingList) {
    return <Text>Loading table</Text>;
  }

  if (fetchError) {
    return <Text>{JSON.stringify(fetchError)}</Text>;
  }

  if (check.undefined(moList)) {
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
              <Table.ColumnHeader minW="100px" w="100px" left="100px" data-sticky="end">
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
            {moList.map((item) => (
              <Table.Row
                key={item.id}
                bg={"gray.50"}
                h="50px"
                onMouseEnter={() =>
                  dispatch({ type: "SET_HOVERED_ROW_ID", payload: item.id })}
                onMouseLeave={() =>
                  dispatch({ type: "SET_HOVERED_ROW_ID", payload: null })}
              >
                <Table.Cell minW="100px" w="100px" left="0" data-sticky>
                  {item.manufacturingDirective}
                </Table.Cell>
                <Table.Cell minW="100px" w="100px" left="100px" data-sticky="end">
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
                  {hoveredRowId === item.id && (
                    <>
                      {dialogDispatch &&
                        (
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
