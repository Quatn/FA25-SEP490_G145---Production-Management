"use client"
import { ManufacturingOrderTrackPanelListReducerStore } from "@/context/manufacturing-order/manufacturingOrderTrackPanelContext";
import { useGetFullDetailManufacturingOrdersQuery } from "@/service/api/manufacturingOrderApiSlice";
import { Center, Spinner, Stack, Text } from "@chakra-ui/react";
import check from "check-types";
import { useMemo } from "react";
import ManufacturingOrderTrackPanelListItem from "./ListItem";
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

  const moList = useMemo(() => fullDetailMOPaginatedResponse?.data?.data ?? [], [fullDetailMOPaginatedResponse?.data?.data])

  if (isFetchingList) {
    return (
      <Center h={"full"} flex={1} flexGrow={1}>
        <Stack alignItems={"center"}>
          <Spinner size="xl" />
          <Text>Đang tải danh sách lệnh</Text>
        </Stack>
      </Center>
    );
  }

  if (fetchError) {
    return <DataFetchError h={"full"} flexGrow={1} refetch={refetchList} />;
  }

  if (check.undefined(fullDetailMOPaginatedResponse?.data?.data)) {
    return <DataFetchError h={"full"} flexGrow={1} />;
  }

  return (
    <Stack flexGrow={1}>
      {moList.map(mo => <ManufacturingOrderTrackPanelListItem key={mo._id} mo={mo} />)}
    </Stack>
  )
}
