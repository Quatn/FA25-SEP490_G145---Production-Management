"use client";

import {
  ManufacturingOrderTableReducerStore,
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
  Text,
} from "@chakra-ui/react";
import check from "check-types";
import { useCallback, useEffect, useMemo } from "react";
import { getCoreRowModel } from "@tanstack/react-table";
import { UpdateManyManufacturingOrdersRequestDto } from "@/types/DTO/manufacturing-order/UpdateManyManufacturingOrdersDto";
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import useDataTable from "@/components/ui/data-table/hook";
import DataFetchError from "@/components/common/DataFetchError";
import { useDataTableSelector } from "@/components/ui/data-table/Provider";
import { convertSerializedMOToTruncatedManufacturingOrderTableData, truncatedManufacturingOrderTableColumns, TruncatedManufacturingOrderTableData, truncatedManufacturingOrderTableMergedHeaders } from "./truncatedTableDefinition";
import { logTimestamp } from "@/utils/logTimestamp";
import { toaster } from "@/components/ui/toaster";
import { tryGetApiErrorMsg } from "@/utils/tryGetApiErrorMsg";
import { ManufacturingOrderTableProps } from "./TablePicker";
import { useFindManyOrderFinishingProcesssByManufacturingOrderIdQuery } from "@/service/api/orderFinishingProcessApiSlice";
import { QueryListFullDetailsManufacturingOrderRequestSortOptions } from "@/types/enums/QueryListFullDetailsManufacturingOrderRequestSortOptions";
import DataEmpty from "@/components/common/DataEmpty";

export default function TruncatedManufacturingOrderTable(
  props: ManufacturingOrderTableProps,
) {
  const [updateOrders] = useUpdateManyManufacturingOrdersMutation();
  const { useDispatch, useSelector } = ManufacturingOrderTableReducerStore;
  const dispatch = useDispatch();
  const page = useSelector(s => s.page)
  const limit = useSelector(s => s.limit)
  const query = useDataTableSelector(s => s.query)
  const sorts = useSelector(s => s.sorts)

  const {
    data: fullDetailMOPaginatedResponse,
    error: fetchError,
    isLoading: isFetchingList,
    refetch: refetchTable,
  } = useGetFullDetailManufacturingOrdersQuery({ page, limit, query: query, sort: sorts });

  const moList = useMemo(() => fullDetailMOPaginatedResponse?.data?.data ?? [], [fullDetailMOPaginatedResponse?.data?.data])

  const getMo = useCallback((id: string) => {
    const mo = moList.find(mo => mo._id === id)
    if (!mo) {
      return undefined
    }
    return {
      order: mo, processes: mo.finishingProcesses ?? []
    }
  }, [moList])

  const rawTableData: TruncatedManufacturingOrderTableData[] = useMemo(() => moList.map(mo =>
    convertSerializedMOToTruncatedManufacturingOrderTableData(mo, getMo)
  ), [moList, getMo])

  const { tableComponent, tableData, resetTable } = useDataTable({
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
    mergedHeadersIds: truncatedManufacturingOrderTableMergedHeaders,
    initialState: {
      columnPinning: {
        left: ['manufacturingDirective', "code"],
        right: ['actions-column'],
      },
    },
  });

  useEffect(() => {
    logTimestamp("SET_TOTAL_ITEMS effect Triggered")
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
    return <DataFetchError h={"full"} flexGrow={1} errorText={tryGetApiErrorMsg(fetchError)} refetch={refetchTable} />;
  }

  if (check.undefined(fullDetailMOPaginatedResponse?.data)) {
    return <DataFetchError h={"full"} flexGrow={1} refetch={refetchTable} />;
  }

  if (fullDetailMOPaginatedResponse?.data.totalItems < 1) {
    return <DataEmpty h={"full"} flexGrow={1} />;
  }

  const editedItemsNum = tableData.filter(row => row.isEdited).length

  const handleUpdateOrders = () => {
    const dto: UpdateManyManufacturingOrdersRequestDto = {
      orders: tableData.filter((row) => row.isEdited).map((order) => ({
        id: order._id,
        corrugatorLineAdjustment: order.corrugatorLineAdjustment,
        approvalStatus: order.approvalStatus,
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
          description: "Cập nhật tất cả lệnh thành công",
        })
      }
      else if (check.greaterOrEqual(res.data?.patchedAmount as number, 1)) {
        toaster.warning({
          title: "Một vài lệnh cập nhật không thành công",
        })
      }
      else {
        toaster.warning({
          title: "Cập nhật lệnh không thành công",
        })
      }
    }).catch(error => {
      toaster.warning({
        title: "Có lỗi xảy ra trong quá trình cập nhật lệnh",
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
