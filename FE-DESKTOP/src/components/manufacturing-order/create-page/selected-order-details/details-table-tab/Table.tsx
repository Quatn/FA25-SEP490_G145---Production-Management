"use client";

import {
  useManufacturingOrderCreatePageDispatch,
  useManufacturingOrderCreatePageState,
} from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import {
  Box,
  BoxProps,
  Button,
  Center,
  HStack,
  Stack,
  Table,
  TableRootProps,
  Tabs,
  TabsRootProps,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";
import { ManufacturingTableTabType } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { useCreateManyManufacturingOrdersMutation, useDeleteManufacturingOrderMutation, useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery } from "@/service/api/manufacturingOrderApiSlice";
import { manufacturingOrderTableColumnsByTabs } from "@/components/manufacturing-order/full-detail-table/tableDefinition.old";
import check from "check-types";
import { CreateManyManufacturingOrdersRequestDto } from "@/types/DTO/manufacturing-order/CreateManyManufacturingOrdersDto";

type TableProps = {
  rootProps?: BoxProps;
  tabsRootProps?: TabsRootProps;
  tableRootProps?: TableRootProps;
};

export default function CreatePageManufacturingOrderTable(
  props: TableProps,
) {
  const { groupType, selectedPOIsIds } = useManufacturingOrderCreatePageState();
  const dispatch = useManufacturingOrderCreatePageDispatch();

  const [tab, setTab] = useState<ManufacturingTableTabType>("all");
  const columnsForTab = manufacturingOrderTableColumnsByTabs[tab] ?? [];

  const {
    data: fullDetailMOsResponse,
    error: fetchError,
    isLoading: isFetchingList,
  } = useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery({
    ids: selectedPOIsIds,
  });


  const [createOrders] = useCreateManyManufacturingOrdersMutation();

  if (selectedPOIsIds.length < 1) {
    return (
      <Center>
        <Box bgColor={"gray.200"} px={3} py={2} rounded={"md"}>
          <Stack alignItems={"center"}>
            <Text>Các lệnh sẽ được tạo sẽ được hiển thị ở đây</Text>
            <Text>Hãy chọn PO Item bên trên</Text>
          </Stack>
        </Box>
      </Center>
    );
  }

  const moPaginatedList = fullDetailMOsResponse?.data;

  if (isFetchingList) {
    return <Text>Loading table</Text>;
  }

  if (fetchError) {
    return <Text>{JSON.stringify(fetchError)}</Text>;
  }

  if (check.undefined(moPaginatedList)) {
    return <Text>Unable to load table</Text>;
  }

  const formValue: CreateManyManufacturingOrdersRequestDto = {
    orders: moPaginatedList.filter(order => !check.undefined(order.purchaseOrderItem)).map((order) => ({
      purchaseOrderItemId: order.purchaseOrderItem!._id,
      corrugatorLineAdjustment: null,
      manufacturingDateAdjustment: null,
      manufacturingDirective: null,
      requestedDatetime: null,
      amount: order.purchaseOrderItem!.amount,
      note: "",
    }))
  }

  function handleEditOrder(
    orders: CreateManyManufacturingOrdersRequestDto["orders"],
    id: string,
    field: keyof Omit<CreateManyManufacturingOrdersRequestDto["orders"][number], "purchaseOrderItemId">,
    value: string
  ): CreateManyManufacturingOrdersRequestDto["orders"] {
    return orders.map(order => {
      if (order.purchaseOrderItemId === id) {
        return {
          ...order,
          [field]: value,
        };
      }
      return order;
    });
  }

  const handleCreateOrder = () => {
    createOrders(formValue)
  }

  return (
    <Box mt={3} {...props.rootProps}>
      <Tabs.Root
        value={tab}
        onValueChange={(e) => setTab(e.value as ManufacturingTableTabType)}
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
            {moPaginatedList?.map((item) => (
              <Table.Row
                key={item.code}
                bg={"gray.50"}
                h="50px"
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
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      <HStack my={3} justifyContent={"end"}>
        <Button colorPalette={"blue"} onClick={handleCreateOrder}>Tạo {selectedPOIsIds.length} lệnh</Button>
        <Button colorPalette={"red"}>Đặt lại</Button>
      </HStack>
    </Box>
  );
}
