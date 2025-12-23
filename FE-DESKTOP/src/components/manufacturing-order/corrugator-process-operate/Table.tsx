"use client";

import DataFetchError from "@/components/common/DataFetchError";
import { useDataTableSelector } from "@/components/ui/data-table/Provider";
import { ManufacturingOrderCorrugatorProcessOperateReducerStore } from "@/context/manufacturing-order/manufacturingOrderCorrugatorProcessOperateContext";
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import { useGetFullDetailManufacturingOrdersQuery, useUpdateManyManufacturingOrdersMutation } from "@/service/api/manufacturingOrderApiSlice";
import { useFindManyOrderFinishingProcesssByManufacturingOrderIdQuery } from "@/service/api/orderFinishingProcessApiSlice";
import { tryGetApiErrorMsg } from "@/utils/tryGetApiErrorMsg";
import { ActionBar, Box, BoxProps, Button, Center, HStack, Kbd, Portal, Spinner, Stack, Table, TableCellProps, TableColumnHeaderProps, TableHeaderProps, TableRootProps, Text } from "@chakra-ui/react";
import check from "check-types";
import { useCallback, useEffect, useMemo } from "react";
import { convertSerializedMOToManufacturingOrderCorrugatorOperatePageTableData, manufacturingOrderCorrugatorOperatePageTableColumns, ManufacturingOrderCorrugatorOperatePageTableData, manufacturingOrderCorrugatorOperatePageTableMergedHeaders } from "./tableDefinition";
import useDataTable from "@/components/ui/data-table/hook";
import { getCoreRowModel } from "@tanstack/react-table";
import { devlog } from "@/utils/devlog";
import { UpdateManyManufacturingOrdersRequestDto } from "@/types/DTO/manufacturing-order/UpdateManyManufacturingOrdersDto";
import { toaster } from "@/components/ui/toaster";
import { CorrugatorProcessStatus } from "@/types/enums/CorrugatorProcessStatus";
import { ManufacturingOrderApprovalStatus } from "@/types/enums/ManufacturingOrderApprovalStatus";
import DataEmpty from "@/components/common/DataEmpty";
import { ManufacturingOrderCorrugatorProcessOperateTableReducerStore } from "@/context/manufacturing-order/manufacturingOrderCorrugatorProcessOperateTableContext";

export type ManufacturingOrderCorrugatorOperatePageTableProps = {
  rootProps?: BoxProps;
  tableRootProps?: TableRootProps;
  tableHeaderProps?: TableHeaderProps,
  tableColumnHeaderProps?: TableCellProps,
  corrugatorProcessStatuses?: CorrugatorProcessStatus[],
  dataVariant: "WAITING" | "RUNNING" | "HISTORY"
};

export default function ManufacturingOrderCorrugatorOperatePageTable(
  props: ManufacturingOrderCorrugatorOperatePageTableProps,
) {
  const [updateOrders] = useUpdateManyManufacturingOrdersMutation();
  const { useDispatch, useSelector } = ManufacturingOrderCorrugatorProcessOperateReducerStore;
  const { useDispatch: useTableDispatch, useSelector: useTableSelector } = ManufacturingOrderCorrugatorProcessOperateTableReducerStore;
  const dispatch = useDispatch();
  const tableDispatch = useTableDispatch()
  const page = useTableSelector(s => s.page)
  const limit = useTableSelector(s => s.limit)
  const query = useDataTableSelector(s => s.query)
  const corrugatorLine = useSelector(s => s.corrugatorLine)

  const {
    data: fullDetailMOPaginatedResponse,
    error: fetchError,
    isFetching: isFetchingList,
    refetch: refetchTable,
  } = useGetFullDetailManufacturingOrdersQuery({
    page,
    limit,
    query: query,
    approvalStatuses: [ManufacturingOrderApprovalStatus.Approved],
    corrugatorLines: [corrugatorLine],
    corrugatorProcessStatuses: props.corrugatorProcessStatuses,
  });

  const moList = useMemo(() => fullDetailMOPaginatedResponse?.data?.data ?? [], [fullDetailMOPaginatedResponse?.data?.data])
  const getMo = useCallback((id: string) => {
    const mo = moList.find(mo => mo._id === id)
    if (!mo) {
      return undefined
    }
    return {
      order: mo
    }
  }, [moList])

  const rawTableData: ManufacturingOrderCorrugatorOperatePageTableData[] = useMemo(() => moList.map(mo =>
    convertSerializedMOToManufacturingOrderCorrugatorOperatePageTableData(mo, getMo)
  ), [moList, getMo])

  const { tableComponent, tableData, resetTable } = useDataTable({
    data: rawTableData,
    columns: manufacturingOrderCorrugatorOperatePageTableColumns(props.dataVariant),
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
    headerPropsStack: {
      tableHeaderProps: props.tableHeaderProps,
      tableHeaderCellProps: props.tableColumnHeaderProps,
    },
    mergedHeadersIds: manufacturingOrderCorrugatorOperatePageTableMergedHeaders,
    initialState: {
      columnPinning: {
        left: ['manufacturingDirective', "corrugatorProcessStatus", "code"],
        right: ['actions-column'],
      },
    },
  });

  useEffect(() => {
    devlog("SET_TOTAL_ITEMS effect Triggered")
    tableDispatch({
      type: "SET_TOTAL_ITEMS",
      payload: fullDetailMOPaginatedResponse?.data ? fullDetailMOPaginatedResponse?.data.totalItems : 0,
    });
  }, [tableDispatch, fullDetailMOPaginatedResponse?.data, fullDetailMOPaginatedResponse?.data?.totalItems]);

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
    return <DataEmpty h={"full"} flexGrow={1} text={"Không có lệnh"} />;
  }

  const editedItemsNum = tableData.filter(row => row.isEdited).length

  const handleUpdateOrders = () => {
    // TODO: Handle parse error
    const ordersToUpdate = tableData.filter((row) => row.isEdited).map(o => ({ ...o, manufacturedAmount: parseInt(o.manufacturedAmount + "") }))
    const dto: UpdateManyManufacturingOrdersRequestDto = {
      orders: ordersToUpdate.map((order) => ({
        id: order._id,
        purchaseOrderItemId: order.purchaseOrderItemId,
        corrugatorProcess: {
          manufacturedAmount: order.manufacturedAmount,
          note: order.corrugatorProcess.note,
          status: order.corrugatorProcessStatus,
        },
      }))
    }

    const ordersToSetStatusToRunning = ordersToUpdate
      .filter(o => check.in(o.corrugatorProcess?.status, [CorrugatorProcessStatus.NOTSTARTED, CorrugatorProcessStatus.PAUSED])
        && check.greater(o.manufacturedAmount, o.initialManufacturedAmount))
      .map(o => o.code)

    const ordersToSetStatusToCompleted = ordersToUpdate
      .filter(o => !check.in(o.corrugatorProcess?.status, [CorrugatorProcessStatus.COMPLETED, CorrugatorProcessStatus.CANCELLED, CorrugatorProcessStatus.OVERCOMPLETED])
        && check.greaterOrEqual(o.manufacturedAmount, o.numberOfBlanks))
      .map(o => o.code)

    let askText = `Lưu tất cả ${editedItemsNum} lệnh?`

    if (ordersToSetStatusToRunning.length) {
      askText = askText.concat(` Công đoạn sóng của lệnh ${ordersToSetStatusToRunning.join(", ")} sẽ được chuyển sang trạng thái chạy.`)
    }

    if (ordersToSetStatusToCompleted.length) {
      askText = askText.concat(` Công đoạn sóng của lệnh ${ordersToSetStatusToCompleted.join(", ")} sẽ được chuyển sang trạng thái hoàn thành.`)
    }

    dispatch({ type: "SET_PREPARED_SUBMIT_ASK_TEXT", payload: askText })
    dispatch({
      type: "SET_PREPARED_SUBMIT_FUNCTION", payload: () =>
        updateOrders(dto).unwrap().then((res) => {
          if (check.greaterOrEqual(res.data?.patchedAmount as number, res.data?.patchedAmount as number)) {
            toaster.success({
              description: "Cập nhật tất cả công đoạn sóng thành công",
            })
          }
          else if (check.greaterOrEqual(res.data?.patchedAmount as number, 1)) {
            toaster.warning({
              title: "Một vài công đoạn sóng cập nhật không thành công",
            })
          }
          else {
            toaster.warning({
              title: "Cập nhật công đoạn sóng không thành công",
            })
          }
        }).catch(error => {
          toaster.warning({
            title: "Có lỗi xảy ra trong quá trình cập nhật công đoạn sóng",
            description: tryGetApiErrorMsg(error),
          })
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

      {editedItemsNum > 0 && <Stack>
        <Text>Đã sửa {editedItemsNum} lệnh</Text>
        <HStack>
          <Button colorPalette={"blue"} size="sm" onClick={handleUpdateOrders}>
            Lưu tất cả
          </Button>
          <Button colorPalette={"yellow"} size="sm" onClick={handleResetTable}>
            Hoàn tác
          </Button>
        </HStack>
      </Stack>}
    </Box >
  );
}
