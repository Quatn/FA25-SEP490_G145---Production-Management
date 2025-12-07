"use client";

import DataFetchError from "@/components/common/DataFetchError";
import { useDataTableSelector } from "@/components/ui/data-table/Provider";
import { ManufacturingOrderCorrugatorProcessOperateReducerStore } from "@/context/manufacturing-order/manufacturingOrderCorrugatorProcessOperateContext";
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import { useGetFullDetailManufacturingOrdersQuery, useUpdateManyManufacturingOrdersMutation } from "@/service/api/manufacturingOrderApiSlice";
import { useFindManyOrderFinishingProcesssByManufacturingOrderIdQuery } from "@/service/api/orderFinishingProcessApiSlice";
import { tryGetApiErrorMsg } from "@/utils/tryGetApiErrorMsg";
import { ActionBar, Box, BoxProps, Button, Center, Kbd, Portal, Spinner, Stack, Table, TableRootProps, Text } from "@chakra-ui/react";
import check from "check-types";
import { useCallback, useEffect, useMemo } from "react";
import { convertSerializedMOToManufacturingOrderCorrugatorOperatePageTableData, manufacturingOrderCorrugatorOperatePageTableColumns, ManufacturingOrderCorrugatorOperatePageTableData, manufacturingOrderCorrugatorOperatePageTableMergedHeaders } from "./tableDefinition";
import useDataTable from "@/components/ui/data-table/hook";
import { getCoreRowModel } from "@tanstack/react-table";
import { devlog } from "@/utils/devlog";
import { UpdateManyManufacturingOrdersRequestDto } from "@/types/DTO/manufacturing-order/UpdateManyManufacturingOrdersDto";
import { toaster } from "@/components/ui/toaster";

export type ManufacturingOrderCorrugatorOperatePageTableProps = {
  rootProps?: BoxProps;
  tableRootProps?: TableRootProps;
};

export default function ManufacturingOrderCorrugatorOperatePageTable(
  props: ManufacturingOrderCorrugatorOperatePageTableProps,
) {
  const [updateOrders] = useUpdateManyManufacturingOrdersMutation();
  const { useDispatch, useSelector } = ManufacturingOrderCorrugatorProcessOperateReducerStore;
  const dispatch = useDispatch();
  const page = useSelector(s => s.page)
  const limit = useSelector(s => s.limit)
  const query = useDataTableSelector(s => s.query)

  const {
    data: fullDetailMOPaginatedResponse,
    error: fetchError,
    isLoading: isFetchingList,
    refetch: refetchTable,
  } = useGetFullDetailManufacturingOrdersQuery({ page, limit, query: query });

  const ids = fullDetailMOPaginatedResponse?.data?.data.map(mo => mo._id)

  const {
    data: orderFinishingProcessesResponse,
    error: orderFinishingProcessFetchError,
    isLoading: isOrderFinishingProcessFetchingList,
  } = useFindManyOrderFinishingProcesssByManufacturingOrderIdQuery({ orders: ids ?? [] });

  const moPaginatedList = useMemo(() => {
    if (fullDetailMOPaginatedResponse?.data) {
      const calculatedMoPaginatedList = fullDetailMOPaginatedResponse?.data?.data.map((mo) => {
        if (check.string(mo.purchaseOrderItem)) {
          throw new UnpopulatedFieldError("mo.purchaseOrderItem should have been populated before it is sent here")
        }

        const process = orderFinishingProcessesResponse?.data.filter(p => (p.manufacturingOrder as unknown as string) === mo._id)

        return {
          ...mo,
          finishingProcesses: process ?? [],
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
  }, [fullDetailMOPaginatedResponse?.data, orderFinishingProcessesResponse?.data])

  const moList = useMemo(() => moPaginatedList?.data ?? [], [moPaginatedList?.data])
  const getMo = useCallback((id: string) => {
    const mo = moList.find(mo => mo._id === id)
    if (!mo) {
      return undefined
    }
    return {
      order: mo, processes: mo.finishingProcesses ?? []
    }
  }, [moList])

  const rawTableData: ManufacturingOrderCorrugatorOperatePageTableData[] = useMemo(() => moList.map(mo =>
    convertSerializedMOToManufacturingOrderCorrugatorOperatePageTableData(mo, getMo)
  ), [moList, getMo])

  const { tableComponent, tableData, resetTable } = useDataTable({
    data: rawTableData,
    columns: manufacturingOrderCorrugatorOperatePageTableColumns,
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
    mergedHeadersIds: manufacturingOrderCorrugatorOperatePageTableMergedHeaders,
    initialState: {
      columnPinning: {
        left: ['manufacturingDirective', "code"],
        right: ['actions-column'],
      },
    },
  });

  useEffect(() => {
    devlog("SET_TOTAL_ITEMS effect Triggered")
    dispatch({
      type: "SET_TOTAL_ITEMS",
      payload: moPaginatedList ? moPaginatedList.totalItems : 0,
    });
  }, [dispatch, moPaginatedList, moPaginatedList?.totalItems]);

  if (isFetchingList || isOrderFinishingProcessFetchingList) {
    return (
      <Center h={"full"} flex={1} flexGrow={1}>
        <Stack alignItems={"center"}>
          <Spinner size="xl" />
          <Text>Đang tải lệnh</Text>
        </Stack>
      </Center>
    );
  }

  if (fetchError || orderFinishingProcessFetchError) {
    return <DataFetchError h={"full"} flexGrow={1} errorText={tryGetApiErrorMsg(fetchError)} refetch={refetchTable} />;
  }

  if (check.undefined(moPaginatedList)) {
    return <DataFetchError h={"full"} flexGrow={1} refetch={refetchTable} />;
  }

  const editedItemsNum = tableData.filter(row => row.isEdited).length

  const handleUpdateOrders = () => {
    const dto: UpdateManyManufacturingOrdersRequestDto = {
      orders: tableData.filter((row) => row.isEdited).map((order) => ({
        id: order._id,
        purchaseOrderItemId: order.purchaseOrderItemId,
        corrugatorProcess: {
          manufacturedAmount: order.manufacturedAmount,
          note: order.corrugatorProcess.note,
          status: order.corrugatorProcess.status,
        },
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
