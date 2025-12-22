"use client"
import { ManufacturingOrderTrackPanelListReducerStore } from "@/context/manufacturing-order/manufacturingOrderTrackPanelContext";
import { useGetFullDetailManufacturingOrdersQuery } from "@/service/api/manufacturingOrderApiSlice";
import { Center, Spinner, Stack, Text } from "@chakra-ui/react";
import check from "check-types";
import { useEffect, useMemo } from "react";
import ManufacturingOrderTrackPanelListItem from "./ListItem";
import { ManufacturingOrderApprovalStatus } from "@/types/enums/ManufacturingOrderApprovalStatus";
import DataFetchError from "@/components/common/DataFetchError";
import { QueryListFullDetailsManufacturingOrderRequestSortOptions } from "@/types/enums/QueryListFullDetailsManufacturingOrderRequestSortOptions";
import DataEmpty from "@/components/common/DataEmpty";

export default function ManufacturingOrderTrackPanelList() {
  const { useDispatch, useSelector } = ManufacturingOrderTrackPanelListReducerStore;
  const dispatch = useDispatch()
  const page = useSelector(s => s.page)
  const limit = useSelector(s => s.limit)
  const search = useSelector(s => s.search)

  const {
    data: fullDetailMOPaginatedResponse,
    error: fetchError,
    isLoading: isFetchingList,
    refetch: refetchList,
  } = useGetFullDetailManufacturingOrdersQuery({ page, limit, query: search, approvalStatuses: [ManufacturingOrderApprovalStatus.Approved], sort: [QueryListFullDetailsManufacturingOrderRequestSortOptions.OperativeStatus + "_desc"] });

  const moList = useMemo(() => fullDetailMOPaginatedResponse?.data?.data ?? [], [fullDetailMOPaginatedResponse?.data?.data])

  useEffect(() => {
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

  if (moList.length <= 0) {
    return <DataEmpty h={"full"} flexGrow={1} text={"Không có lệnh"} />
  }

  return (
    <Stack flexGrow={1}>
      {moList.map(mo => <ManufacturingOrderTrackPanelListItem key={mo._id} mo={mo} />)}
    </Stack>
  )
}
