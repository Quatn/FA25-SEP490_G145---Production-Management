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
} from "@chakra-ui/react";
import check from "check-types";
import ManufacturingOrderDetailsDialogOrderDetailsCard from "./OrderDetailsCard";
import ManufacturingOrderDetailsDialogWareDetailsCard from "./WareDetailsCard";
import ManufacturingOrderDetailsDialogManufacturingDetailsCard from "./ManufacturingDetailsCard";

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
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
