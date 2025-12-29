"use client";

import { ManufacturingOrderDetailsDialogReducerStore, ManufacturingOrderDetailsDialogTabType } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import {
  Box,
  CloseButton,
  Dialog,
  GridItem,
  Portal,
  SimpleGrid,
  Tabs,
} from "@chakra-ui/react";
import check from "check-types";
import ManufacturingOrderDetailsDialogOrderDetailsCard from "./OrderDetailsCard";
import ManufacturingOrderDetailsDialogWareDetailsCard from "./WareDetailsCard";
import ManufacturingOrderDetailsDialogManufacturingDetailsCard from "./ManufacturingDetailsCard";
import ManufacturingOrderDetailsDialogCorrugatorProcessDetailsCard from "./CorrugatorProcessDetailsCard";
import { LuCombine, LuFolder, LuUser } from "react-icons/lu";
import ManufacturingOrderDetailsDialogFinishingProcessDetailsCard from "./FinishingProcessesCard";
import { useGetByIdFullDetailsQuery } from "@/service/api/manufacturingOrderApiSlice";
import DataLoading from "@/components/common/DataLoading";
import DataFetchError from "@/components/common/DataFetchError";
import { defaultAltHandler, tryGetApiErrorMsg } from "@/utils/tryGetApiErrorMsg";
import ManufacturingOrderDetailsDialogDeleteCancelMenu from "./DeleteCancelMenu";
import { ManufacturingOrderOperativeStatus } from "@/types/enums/ManufacturingOrderOperativeStatus";

export default function ManufacturingOrderDetailsDialog() {
  const { useDispatch, useSelector } = ManufacturingOrderDetailsDialogReducerStore;
  const dispatch = useDispatch();
  const open = useSelector(s => s.open)
  // const order = useSelector(s => s.order)
  const orderId = useSelector(s => s.orderId)
  const tab = useSelector(s => s.tab)

  const switchTab = (tab: ManufacturingOrderDetailsDialogTabType) => {
    dispatch({ type: "SET_TAB", payload: tab })
  }

  const { data: fetchedMOResponse, isFetching: isFetching, error: fetchError, refetch } = useGetByIdFullDetailsQuery(
    { id: orderId ?? "noid" },
    { skip: !check.string(orderId) }
  )

  const order = fetchedMOResponse?.data

  return (
    <Dialog.Root
      size="cover"
      placement="center"
      motionPreset="slide-in-bottom"
      open={open}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Chi tiết lệnh</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  onClick={() => dispatch({ type: "CLOSE_DIALOG" })}
                  size="sm"
                />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body overflowY={"auto"}>
              {
                isFetching ? (
                  <DataLoading h="full" />
                ) :
                  fetchError ? (
                    <DataFetchError h={"full"} flexGrow={1} errorText={tryGetApiErrorMsg(fetchError, defaultAltHandler)} refetch={refetch} />
                  ) : check.null(order) || check.undefined(order) ? (
                    <DataFetchError h={"full"} flexGrow={1} errorText={"Không tìm thấy lệnh"} refetch={refetch} />
                  ) :
                    (
                      <Tabs.Root
                        value={tab}
                        variant={"outline"}
                      >
                        <Tabs.List>
                          <Tabs.Trigger value="order" onClick={() => switchTab("order")}>
                            <LuFolder />
                            Chi tiết lệnh và PO
                          </Tabs.Trigger>
                          <Tabs.Trigger value="processes" onClick={() => switchTab("processes")}>
                            <LuCombine />
                            Chi tiết các công đoạn
                          </Tabs.Trigger>

                          <Box flexGrow={1} />

                          {!check.in(order.operativeStatus, [ManufacturingOrderOperativeStatus.COMPLETED, ManufacturingOrderOperativeStatus.CANCELLED])
                            && <ManufacturingOrderDetailsDialogDeleteCancelMenu order={order} />
                          }
                        </Tabs.List>
                        <Tabs.Content value="order">
                          <SimpleGrid columns={{ base: 1, md: 2 }} gap="40px" justifyItems={"stretch"}>
                            <GridItem colSpan={{ base: 1 }}>
                              <ManufacturingOrderDetailsDialogOrderDetailsCard order={order} />
                            </GridItem>
                            <GridItem colSpan={{ base: 1 }}>
                              <ManufacturingOrderDetailsDialogWareDetailsCard order={order} />
                            </GridItem>
                            <GridItem colSpan={{ base: 1, md: 2 }}>
                              <ManufacturingOrderDetailsDialogManufacturingDetailsCard order={order} />
                            </GridItem>
                          </SimpleGrid>
                        </Tabs.Content>
                        <Tabs.Content value="processes">
                          <SimpleGrid columns={{ base: 1, md: 2 }} gap="40px" justifyItems={"stretch"}>
                            <GridItem colSpan={{ base: 1, md: 2 }}>
                              <ManufacturingOrderDetailsDialogCorrugatorProcessDetailsCard order={order} />
                            </GridItem>
                            <GridItem colSpan={{ base: 1, md: 2 }}>
                              <ManufacturingOrderDetailsDialogFinishingProcessDetailsCard order={order} />
                            </GridItem>
                          </SimpleGrid>
                        </Tabs.Content>
                      </Tabs.Root>
                    )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
