"use client"
import { ManufacturingOrderTrackPanelListReducerStore } from "@/context/manufacturing-order/manufacturingOrderTrackPanelContext";
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import { useGetFullDetailManufacturingOrdersQuery } from "@/service/api/manufacturingOrderApiSlice";
import { Box, Button, Center, HStack, Link, Spinner, Stack, Text } from "@chakra-ui/react";
import check from "check-types";
import { useMemo } from "react";
import ManufacturingOrderTrackPanelListItem from "./ListItem";
import { useFindManyOrderFinishingProcesssByManufacturingOrderIdQuery } from "@/service/api/orderFinishingProcessApiSlice";
import { ManufacturingOrderApprovalStatus } from "@/types/enums/ManufacturingOrderApprovalStatus";
import DataFetchError from "@/components/common/DataFetchError";

export default function ManufacturingOrderTrackPanelList() {
  const { useSelector } = ManufacturingOrderTrackPanelListReducerStore;
  const page = useSelector(s => s.page)
  const limit = useSelector(s => s.limit)
  const search = useSelector(s => s.search)

  const {
    data: fullDetailMOPaginatedResponse,
    error: fetchError,
    isLoading: isFetchingList,
    refetch: refetchList,
  } = useGetFullDetailManufacturingOrdersQuery({ page, limit, query: search, approvalStatuses: [ManufacturingOrderApprovalStatus.Approved] });

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

  if (isFetchingList || isOrderFinishingProcessFetchingList) {
    return (
      <Center h={"full"} flex={1} flexGrow={1}>
        <Stack alignItems={"center"}>
          <Spinner size="xl" />
          <Text>Đang tải danh sách lệnh</Text>
        </Stack>
      </Center>
    );
  }

  if (fetchError || orderFinishingProcessFetchError) {
    return <DataFetchError h={"full"} flexGrow={1} refetch={refetchList} />;
  }

  if (check.undefined(moPaginatedList)) {
    return <DataFetchError h={"full"} flexGrow={1} />;
  }

  return (
    <Stack flexGrow={1}>
      {moList.map(mo => <ManufacturingOrderTrackPanelListItem key={mo._id} mo={mo} processes={mo.finishingProcesses} />)}
    </Stack>
  )
}
