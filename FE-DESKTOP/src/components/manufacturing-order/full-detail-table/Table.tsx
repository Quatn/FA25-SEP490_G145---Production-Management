"use client";

import {
  ManufacturingOrderTableReducerStore,
  ManufacturingTableTabType,
} from "@/context/manufacturing-order/manufacturingOrderTableContext";
import {
  useGetFullDetailManufacturingOrdersQuery,
  useUpdateManyManufacturingOrdersMutation,
} from "@/service/api/manufacturingOrderApiSlice";
import {
  ActionBar,
  Box,
  Button,
  Center,
  Kbd,
  Portal,
  Spinner,
  Stack,
  Table,
  Tabs,
  Text,
} from "@chakra-ui/react";
import check from "check-types";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";
import { manufacturingOrderColumnsByTabs, manufacturingOrderMergedHeaders, ManufacturingOrderTableDataType } from "./tableDefinition";
import { useEffect } from "react";
import { getCoreRowModel } from "@tanstack/react-table";
import { UpdateManyManufacturingOrdersRequestDto } from "@/types/DTO/manufacturing-order/UpdateManyManufacturingOrdersDto";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import useDataTable from "@/components/ui/data-table/hook";
import DataFetchError from "@/components/common/DataFetchError";
import { useDataTableSelector } from "@/components/ui/data-table/Provider";
import { toaster } from "@/components/ui/toaster";
import { tryGetApiErrorMsg } from "@/utils/tryGetApiErrorMsg";
import { ManufacturingOrderTableProps } from "./TablePicker";
import { devlog } from "@/utils/devlog";

export default function ManufacturingOrderTable(
  props: ManufacturingOrderTableProps,
) {
  const [updateOrders] = useUpdateManyManufacturingOrdersMutation();
  const { useDispatch, useSelector } = ManufacturingOrderTableReducerStore;
  const dispatch = useDispatch();
  const page = useSelector(s => s.page)
  const limit = useSelector(s => s.limit)
  const tab = useSelector(s => s.tab)
  const query = useDataTableSelector(s => s.query)
  const sorts = useSelector(s => s.sorts)

  const {
    data: fullDetailMOPaginatedResponse,
    error: fetchError,
    isFetching: isFetchingList,
    refetch: refetchTable,
  } = useGetFullDetailManufacturingOrdersQuery({ page, limit, query: query, sort: sorts });

  const rawTableData: (Omit<ManufacturingOrderTableDataType, "isEdited">)[] = fullDetailMOPaginatedResponse?.data?.data ?? []

  const { table, tableComponent, tableData, resetTable } = useDataTable({
    data: rawTableData,
    columns: manufacturingOrderColumnsByTabs[tab],
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

  useEffect(() => {
    devlog("Table hook re-calculated")
  }, [table, tableComponent, tableData]);

  useEffect(() => {
    devlog("SET_TOTAL_ITEMS effect Triggered")
    dispatch({
      type: "SET_TOTAL_ITEMS",
      payload: fullDetailMOPaginatedResponse?.data ? fullDetailMOPaginatedResponse?.data.totalItems : 0,
    });
  }, [dispatch, fullDetailMOPaginatedResponse?.data, fullDetailMOPaginatedResponse?.data?.totalItems]);

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
    return <DataFetchError h={"full"} flexGrow={1} refetch={refetchTable} />;
  }

  if (check.undefined(fullDetailMOPaginatedResponse?.data)) {
    return <DataFetchError h={"full"} flexGrow={1} />;
  }

  const editedItemsNum = tableData.filter(row => row.isEdited).length

  const getTabBarOffset = () => {
    try {
      return (table.getColumn("code")?.getStart("left") ?? 0) + (table.getColumn("code")?.getSize() ?? 0);
    }
    catch {
      return 0
    }
  }

  const handleUpdateOrders = () => {
    const dto: UpdateManyManufacturingOrdersRequestDto = {
      orders: tableData.filter(order => check.nonEmptyObject(order.purchaseOrderItem)).filter((row) => row.isEdited).map((order) => ({
        id: order._id,
        corrugatorLineAdjustment: order.corrugatorLineAdjustment,
        manufacturingDirective: order.manufacturingDirective,
        amount: order.amount,
        note: order.note,
        manufacturingDateAdjustment: order.manufacturingDateAdjustment,
        requestedDatetime: order.requestedDatetime,
        purchaseOrderItemId: (order.purchaseOrderItem as Serialized<PurchaseOrderItem>)._id,
      }))
    }

    updateOrders(dto).unwrap().then((res) => {
      if (check.greaterOrEqual(res.data?.patchedAmount as number, res.data?.patchedAmount as number)) {
        toaster.success({
          title: "Success",
          description: "All orders updated successfully",
        })
      }
      else if (check.greaterOrEqual(res.data?.patchedAmount as number, 1)) {
        toaster.warning({
          title: "Some orders was not updated",
        })
      }
      else {
        toaster.warning({
          title: "No orders updated",
        })
      }
    }).catch(error => {
      toaster.warning({
        title: "Error updating order",
        description: tryGetApiErrorMsg(error),
      })
    })
  }

  const handleResetTable = () => {
    dispatch({ type: "SET_PREPARED_SUBMIT_ASK_TEXT", payload: `Hoàn tác tất cả thao tác?` })
    dispatch({ type: "SET_PREPARED_SUBMIT_FUNCTION", payload: resetTable })
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
        {tableComponent}
      </Table.ScrollArea>

      <ActionBar.Root open={editedItemsNum > 0}>
        <Portal>
          <ActionBar.Positioner>
            <ActionBar.Content zIndex={9999}>
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
              <Button colorPalette={"yellow"} size="sm" onClick={handleResetTable}>
                Hoàn tác <Kbd>⌫</Kbd>
              </Button>
            </ActionBar.Content>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
    </Box >
  );
}
