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
  BoxProps,
  Button,
  Center,
  Kbd,
  Portal,
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
import { manufacturingOrderColumnsByTabs, manufacturingOrderMergedHeaders } from "./tableDefinition";
import { useCallback, useEffect, useMemo } from "react";
import { getCoreRowModel } from "@tanstack/react-table";
import { UpdateManyManufacturingOrdersRequestDto } from "@/types/DTO/manufacturing-order/UpdateManyManufacturingOrdersDto";
import { recalculatePurchaseOrderItem, recalculateWare } from "@/service/mock-data/recalculation";
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import useDataTable from "@/components/ui/data-table/hook";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import DataFetchError from "@/components/common/DataFetchError";
import { useDataTableSelector } from "@/components/ui/data-table/Provider";
import { convertSerializedMOToTruncatedManufacturingOrderTableData, truncatedManufacturingOrderTableColumns, TruncatedManufacturingOrderTableData } from "./truncatedTableDefinition";
import { logTimestamp } from "@/utils/logTimestamp";
import { toaster } from "@/components/ui/toaster";
import { tryGetApiErrorMsg } from "@/utils/tryGetApiErrorMsg";

export type TruncatedManufacturingOrderTableProps = {
  rootProps?: BoxProps;
  tabsRootProps?: TabsRootProps;
  tableRootProps?: TableRootProps;
};

export default function TruncatedManufacturingOrderTable(
  props: TruncatedManufacturingOrderTableProps,
) {
  const [updateOrders] = useUpdateManyManufacturingOrdersMutation();
  const { useDispatch, useSelector } = ManufacturingOrderTableReducerStore;
  const dispatch = useDispatch();
  const page = useSelector(s => s.page)
  const limit = useSelector(s => s.limit)
  const tab = useSelector(s => s.tab)
  const query = useDataTableSelector(s => s.query)

  const {
    data: fullDetailMOPaginatedResponse,
    error: fetchError,
    isLoading: isFetchingList,
  } = useGetFullDetailManufacturingOrdersQuery({ page, limit, query: query });

  const moPaginatedList = useMemo(() => {
    if (fullDetailMOPaginatedResponse?.data) {
      const calculatedMoPaginatedList = fullDetailMOPaginatedResponse?.data?.data.map((mo) => {
        if (check.string(mo.purchaseOrderItem)) {
          throw new UnpopulatedFieldError("mo.purchaseOrderItem should have been populated before it is sent here")
        }

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

  const moList = useMemo(() => moPaginatedList?.data ?? [], [moPaginatedList?.data])
  const getMo = useCallback((id: string) => moList.find(mo => mo._id === id), [moList])
  const rawTableData: TruncatedManufacturingOrderTableData[] = useMemo(() => moList.map(mo =>
    convertSerializedMOToTruncatedManufacturingOrderTableData(mo, getMo)
  ), [moList, getMo])

  const { table, tableComponent, tableData, resetTable } = useDataTable({
    data: rawTableData,
    columns: truncatedManufacturingOrderTableColumns,
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
    logTimestamp("Table hook re-calculated")
  }, [table, tableComponent, tableData]);

  useEffect(() => {
    logTimestamp("SET_TOTAL_ITEMS effect Triggered")
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
    return <DataFetchError h={"full"} flexGrow={1} />;
  }

  if (check.undefined(moPaginatedList)) {
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
      orders: tableData.filter((row) => row.isEdited).map((order) => ({
        id: order._id,
        corrugatorLineAdjustment: order.corrugatorLineAdjustment,
        manufacturingDirective: order.manufacturingDirective,
        amount: order.amount,
        note: order.note,
        manufacturingDateAdjustment: order.manufacturingDateAdjustment?.toString(),
        requestedDatetime: order.requestedDatetime?.toString(),
        purchaseOrderItemId: order.purchaseOrderItemId,
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
      <Table.ScrollArea borderWidth="1px">
        {tableComponent}
      </Table.ScrollArea>

      <ActionBar.Root open={editedItemsNum > 0}>
        <Portal>
          <ActionBar.Positioner zIndex={9999}>
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
