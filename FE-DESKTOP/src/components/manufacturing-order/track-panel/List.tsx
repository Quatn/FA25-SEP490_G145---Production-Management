"use client"
import { ManufacturingOrderTrackPanelListReducerStore } from "@/context/manufacturing-order/manufacturingOrderTrackPanelContext";
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import { useGetFullDetailManufacturingOrdersQuery, useUpdateManyManufacturingOrdersMutation } from "@/service/api/manufacturingOrderApiSlice";
import { Box, Button, HStack, Link, Stack, Text } from "@chakra-ui/react";
import check from "check-types";
import { useCallback, useMemo } from "react";
import ManufacturingOrderTrackPanelListItem from "./ListItem";
import { useFindManyOrderFinishingProcesssByManufacturingOrderIdQuery } from "@/service/api/orderFinishingProcessApiSlice";

export default function ManufacturingOrderTrackPanelList() {
  const [updateOrders] = useUpdateManyManufacturingOrdersMutation();
  const { useDispatch, useSelector } = ManufacturingOrderTrackPanelListReducerStore;
  const dispatch = useDispatch();
  const page = useSelector(s => s.page)
  const limit = useSelector(s => s.limit)
  const search = useSelector(s => s.search)

  const {
    data: fullDetailMOPaginatedResponse,
    error: fetchError,
    isLoading: isFetchingList,
  } = useGetFullDetailManufacturingOrdersQuery({ page, limit, query: search });

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

        // Unpopulated field
        const process = orderFinishingProcessesResponse?.data.filter(p => (p.manufacturingOrder as unknown as string) === mo._id)

        return {
          ...mo,
          finishingProcesses: process ?? [],
          // purchaseOrderItem: calculatedPOI,
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
  const getMo = useCallback((id: string) => moList.find(mo => mo._id === id), [moList])

  return (
    <Box
      m={5}
      p={2}
      flexGrow={1}
    >
      <Box
        px={3}
        py={5}
        rounded={"md"}
        colorPalette={"gray"}
        backgroundColor={"colorPalette.subtle"}
      >
        <Stack
          gapY={2}
          minHeight={"80vh"}
        >
          <Text fontWeight={"semibold"} color={"blackAlpha.800"}>
            Các lệnh đáng chú ý
          </Text>
          <HStack justifyContent={"space-between"}>

            <Link href="/manufacturing-order/create">
              <Button size={"sm"} colorPalette={"cyan"}>Xem danh sách chi tiết</Button>
            </Link>
          </HStack>

          <Stack flexGrow={1}>
            {moList.map(mo => <ManufacturingOrderTrackPanelListItem key={mo._id} mo={mo} processes={mo.finishingProcesses} />)}
          </Stack>

        </Stack>
      </Box>
    </Box>
  )
}
