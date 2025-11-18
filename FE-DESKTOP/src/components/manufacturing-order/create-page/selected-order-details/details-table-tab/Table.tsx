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
import { CSSProperties, useMemo, useState } from "react";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";
import { ManufacturingTableTabType } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { useCreateManyManufacturingOrdersMutation, useDeleteManufacturingOrderMutation, useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery } from "@/service/api/manufacturingOrderApiSlice";
import { manufacturingOrderTableColumnsByTabs } from "@/components/manufacturing-order/full-detail-table/tableDefinition.old";
import check from "check-types";
import { CreateManyManufacturingOrdersRequestDto } from "@/types/DTO/manufacturing-order/CreateManyManufacturingOrdersDto";
import { useSelectedOrdersState } from "../TabbedContainer";
import { Column, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { recalculatePurchaseOrderItem, recalculateWare } from "@/service/mock-data/recalculation";
import { manufacturingOrderColumnsByTabs, ManufacturingOrderTableDataType } from "@/components/manufacturing-order/full-detail-table/tableDefinition";

type TableProps = {
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

  const moPaginatedList = useMemo(() => {
    if (fullDetailMOsResponse?.data) {
      const calculatedMoPaginatedList = fullDetailMOsResponse.data.map((mo) => {
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
        data: calculatedMoPaginatedList
      }
    }
    else {
      return undefined
    }
  }, [fullDetailMOsResponse?.data])

  console.log(moPaginatedList?.data)

  const tableData = useMemo<ManufacturingOrderTableDataType[]>(() => (moPaginatedList?.data?.map((mo) => ({
    ...mo,
    isEdited: false,
  })) ?? []), [moPaginatedList?.data])

  console.log(tableData)

  const table = useReactTable({
    data: tableData,
    columns: manufacturingOrderColumnsByTabs[tab].filter((r) => r.id !== "actions-column"),
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnPinning: {
        left: ['manufacturingDirective', "code"],
      },
    },
    getRowId: (row) => row._id,
  }
  );

  const [createOrders] = useCreateManyManufacturingOrdersMutation();

  // const { selectedManufacturingOrders } = useSelectedOrdersState();

  if (check.undefined(selectedPOIsIds) || selectedPOIsIds.length < 1) {
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

  // const moPaginatedList = selectedManufacturingOrders;

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
    orders: moPaginatedList?.data.filter(order => !check.undefined(order.purchaseOrderItem)).map((order) => ({
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
    dispatch({ type: "RESET_TREE_STATE" })
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
        onValueChange={(e) => setTab(e.value as ManufacturingTableTabType)}
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
                h={"3.2rem"}
              >
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell
                    key={cell.id}
                    style={{
                      ...getCommonPinningStyles(cell.column),
                      background: cell.column.getIsPinned() ? "#fefefe" : "white"
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      <HStack my={3} justifyContent={"end"}>
        <Button colorPalette={"blue"} onClick={() => dispatch({ type: "SET_PREPARED_SUBMIT_FUNCTION", payload: handleCreateOrder })}>Tạo {selectedPOIsIds.length} lệnh</Button>
        <Button colorPalette={"red"}>Đặt lại</Button>
      </HStack>
    </Box>
  );
}
