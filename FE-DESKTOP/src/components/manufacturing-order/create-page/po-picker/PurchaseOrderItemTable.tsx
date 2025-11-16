"use client";

import {
  ManufacturingOrderCreatePageTreeNode,
  PurchaseOrderItemPickerTabType,
  useManufacturingOrderCreatePageDispatch,
  useManufacturingOrderCreatePageState,
} from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import {
  Box,
  BoxProps,
  Button,
  Checkbox,
  Group,
  HStack,
  Table,
  TableRootProps,
  Tabs,
  TabsRootProps,
} from "@chakra-ui/react";
import { purchaseOrderItemTableColumns, purchaseOrderItemTableColumnsByTabs } from "./poiTableDefinition";
import { useMemo, useState } from "react";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import { QueryOrdersWithUnmanufacturedItemsDto_PurchaseOrderItem } from "@/types/DTO/purchase-order/query-orders-with-unmanufactured-items";

type TableProps = {
  rootProps?: BoxProps;
  tabsRootProps?: TabsRootProps;
  tableRootProps?: TableRootProps;
  items: Serialized<QueryOrdersWithUnmanufacturedItemsDto_PurchaseOrderItem>[];
  tree: ManufacturingOrderCreatePageTreeNode[];
};

export default function PurchaseOrderItemPickerTable(
  props: TableProps,
) {
  const { groupType, checkedOrderNodes } =
    useManufacturingOrderCreatePageState();
  const dispatch = useManufacturingOrderCreatePageDispatch();

  const getChecked = (id: string) => {
    return checkedOrderNodes[id] || false;
  };

  const handleToggle = (id: string) =>
    dispatch({
      type: "TOGGLE_ORDER_TREE_NODE",
      payload: { id, tree: props.tree },
    });

  const sorted = useMemo(() => {
    return props.items.toSorted((a, b) => (a.isManufactured ? 1 : 0) - (b.isManufactured ? 1 : 0))
  }, [props.items])

  const [tab, setTab] = useState<PurchaseOrderItemPickerTabType>("all");
  // const columnsForTab = purchaseOrderItemTableColumnsByTabs[tab] ?? [];

  return (
    <Box mt={3} {...props.rootProps}>
      {/*
      <Tabs.Root
        value={tab}
        onValueChange={(e) => setTab(e.value as PurchaseOrderItemPickerTabType)}
        {...props.tabsRootProps}
      >
        <Tabs.List ms="200px">
          <Tabs.Trigger value="all">
            <LuUser />
            Tổng quan
          </Tabs.Trigger>
          <Tabs.Trigger value="ware">
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
      */}

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
              <Table.ColumnHeader />
              <Table.ColumnHeader
                data-sticky
                minW="160px"
                w="160px"
                left="0"
              >
                Mã PO Item
              </Table.ColumnHeader>
              <Table.ColumnHeader
                minW="160px"
                w="160px"
                left="160px"
                data-sticky="end"
              >
                Mã hàng
              </Table.ColumnHeader>
              {purchaseOrderItemTableColumns.map((col) => (
                <Table.ColumnHeader key={col.key}>
                  {col.header}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sorted.map((item) => (
              <Table.Row
                key={item._id}
                colorPalette={"gray"}
                bg={item.isManufactured ? "gray.muted" : "gray.subtle"}
                h="50px"
              >
                <Table.Cell>
                  <Checkbox.Root
                    size="sm"
                    top="0.5"
                    aria-label="Select row"
                    disabled={item.isManufactured}
                    checked={(item.isManufactured) ? true : getChecked(item._id)}
                    onCheckedChange={() => {
                      if (!item.isManufactured) handleToggle(item._id)
                    }}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>
                </Table.Cell>

                <Table.Cell minW="160px" w="160px" left="0" data-sticky>
                  {item.code}
                </Table.Cell>
                <Table.Cell
                  minW="160px"
                  w="160px"
                  left="160px"
                  data-sticky="end"
                >
                  {item.ware?.code}
                </Table.Cell>
                {purchaseOrderItemTableColumns.map((col) => (
                  <Table.Cell key={col.key}>{col.render(item)}</Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  );
}
