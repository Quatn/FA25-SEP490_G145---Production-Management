"use client";

import { ManufacturingOrderCreatePageReducerStore } from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import {
  Box,
  BoxProps,
  Button,
  Center,
  HStack,
  Spinner,
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
import check from "check-types";
import { CreateManyManufacturingOrdersRequestDto } from "@/types/DTO/manufacturing-order/CreateManyManufacturingOrdersDto";
import { Column, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { recalculatePurchaseOrderItem, recalculateWare } from "@/service/mock-data/recalculation";
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import { toaster } from "@/components/ui/toaster";
import { tryGetApiErrorMsg } from "@/utils/tryGetApiErrorMsg";
import { manufacturingOrderColumnsByTabs, manufacturingOrderMergedHeaders, ManufacturingOrderTableDataType } from "@/components/manufacturing-order/full-detail-table/tableDefinition";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import DataFetchError from "@/components/common/DataFetchError";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import useDataTable from "@/components/ui/data-table/hook";

type TableProps = {
  rootProps?: BoxProps;
  tabsRootProps?: TabsRootProps;
  tableRootProps?: TableRootProps;
};

export default function CreatePageManufacturingOrderTable(
  props: TableProps,
) {
  const { useSelector, useDispatch } = ManufacturingOrderCreatePageReducerStore;
  const dispatch = useDispatch();
  const selectedPOIsIds = useSelector(s => s.selectedPOIsIds);

  const [tab, setTab] = useState<ManufacturingTableTabType>("all");
  const columnsForTab = manufacturingOrderColumnsByTabs[tab] ?? [];

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
        if (check.string(mo.purchaseOrderItem)) {
          throw new UnpopulatedFieldError("mo.purchaseOrderItem should have been populated before it is sent here")
        }

        const calculatedWare = recalculateWare(mo.purchaseOrderItem?.ware)
        const calculatedPOI = recalculatePurchaseOrderItem({
          ...mo.purchaseOrderItem,
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

  const rawTableData: Serialized<ManufacturingOrder>[] = moPaginatedList?.data ?? []

  const { table, tableComponent, tableData, resetTable } = useDataTable({
    data: rawTableData,
    columns: columnsForTab.filter((r) => r.id !== "actions-column"),
    getCoreRowModel: getCoreRowModel(),
    getRowId: (mo) => mo._id,
    bodyPropsStack: {
      tableRowProps: {
        bg: { base: "bg", _hover: "bg.muted" }
      },
      pinnedCellProps: {
        bg: "bg.subtle",
      },
      editedRowProps: {
        colorPalette: "yellow",
        bg: { base: "colorPalette.subtle", _hover: "colorPalette.muted" }
      },
      editedRowPinnedCellProps: {
        colorPalette: "yellow",
        bg: { base: "colorPalette.muted" }
      },
    },
    mergedHeadersIds: manufacturingOrderMergedHeaders,
    initialState: {
      columnPinning: {
        left: ['manufacturingDirective', "code"],
        right: ['actions-column'],
      },
    },
  });

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
    return <DataFetchError h={"full"} flexGrow={1} />;
  }

  if (check.undefined(moPaginatedList)) {
    return <DataFetchError h={"full"} flexGrow={1} />;
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
    const formValue: CreateManyManufacturingOrdersRequestDto = {
      orders: tableData.filter(order => check.nonEmptyObject(order.purchaseOrderItem)).filter((row) => row.isEdited).map((order) => ({
        purchaseOrderItemId: (order.purchaseOrderItem as Serialized<PurchaseOrderItem>)._id,
        corrugatorLineAdjustment: order.corrugatorLineAdjustment ?? null,
        manufacturingDirective: order.manufacturingDirective ?? null,
        amount: order.amount,
        note: order.note,
        manufacturingDateAdjustment: order.manufacturingDateAdjustment,
        requestedDatetime: order.requestedDatetime,
      }))
    }

    createOrders(formValue).unwrap().then((res) => {
      if (check.greaterOrEqual(res.data?.createdAmount as number, res.data?.createdAmount as number)) {
        toaster.success({
          title: "Success",
          description: "All orders created successfully",
        })
      }
      else if (check.greaterOrEqual(res.data?.createdAmount as number, 1)) {
        toaster.warning({
          title: "Some orders was not created",
        })
      }
      else {
        toaster.warning({
          title: "No orders created",
        })
      }
      dispatch({ type: "RESET_TREE_STATE" })
    }).catch(error => {
      toaster.warning({
        title: "Error creating order",
        description: tryGetApiErrorMsg(error),
      })
    })
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
        {tableComponent}
      </Table.ScrollArea>

      <HStack my={3} justifyContent={"end"}>
        <Button colorPalette={"blue"} onClick={() => dispatch({ type: "SET_PREPARED_SUBMIT_FUNCTION", payload: handleCreateOrder })}>Tạo {selectedPOIsIds.length} lệnh</Button>
        <Button colorPalette={"red"}>Đặt lại</Button>
      </HStack>
    </Box>
  );
}
