"use client";

import { ManufacturingOrderDetailsDialogReducerStore } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import {
  Box,
  CloseButton,
  DataList,
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
import { LuFolder, LuUser } from "react-icons/lu";
import ManufacturingOrderDetailsDialogFinishingProcessDetailsCard from "./FinishingProcessesCard";

export default function ManufacturingOrderDetailsDialog() {
  const { useDispatch, useSelector } = ManufacturingOrderDetailsDialogReducerStore;
  const dispatch = useDispatch();
  const open = useSelector(s => s.open)
  const order = useSelector(s => s.order)

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
              {check.null(order) ? <></> : (
                <Tabs.Root
                  defaultValue="details"
                  variant={"outline"}
                >
                  <Tabs.List>
                    <Tabs.Trigger value="details">
                      <LuUser />
                      Chi tiết lệnh và PO
                    </Tabs.Trigger>
                    <Tabs.Trigger value="processes">
                      <LuFolder />
                      Chi tiết các công đoạn
                    </Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="details">
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
