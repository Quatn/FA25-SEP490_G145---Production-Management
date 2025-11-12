"use client";

import {
  PurchaseOrderItemPickerTabType,
  useManufacturingPageDispatch,
  useManufacturingPageState,
} from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import {
  Box,
  BoxProps,
  Button,
  Group,
  HStack,
  Table,
  TableRootProps,
  Tabs,
  TabsRootProps,
} from "@chakra-ui/react";
import { purchaseOrderItemTableColumnsByTabs } from "./poiTableDefinition";
import { useState } from "react";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";

type TableProps = {
  rootProps?: BoxProps;
  tabsRootProps?: TabsRootProps;
  tableRootProps?: TableRootProps;
  items: Serialized<PurchaseOrderItem>[];
};

export default function PurchaseOrderItemPickerTable(
  props: TableProps,
) {
  const { groupType } = useManufacturingPageState();
  const dispatch = useManufacturingPageDispatch();

  const [tab, setTab] = useState<PurchaseOrderItemPickerTabType>("all");
  const columnsForTab = purchaseOrderItemTableColumnsByTabs[tab] ?? [];

  return (
    <Box mt={3} {...props.rootProps}>
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
                Mã PO Item
              </Table.ColumnHeader>
              <Table.ColumnHeader
                minW="100px"
                w="100px"
                left="100px"
                data-sticky="end"
              >
                Mã hàng
              </Table.ColumnHeader>
              {columnsForTab.map((col) => (
                <Table.ColumnHeader key={col.key}>
                  {col.header}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {props.items.map((item) => (
              <Table.Row
                key={item._id}
                bg={"gray.50"}
                h="50px"
              >
                <Table.Cell minW="100px" w="100px" left="0" data-sticky>
                  {item.code}
                </Table.Cell>
                <Table.Cell
                  minW="100px"
                  w="100px"
                  left="100px"
                  data-sticky="end"
                >
                  {item.ware?.code}
                </Table.Cell>
                {columnsForTab.map((col) => (
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
