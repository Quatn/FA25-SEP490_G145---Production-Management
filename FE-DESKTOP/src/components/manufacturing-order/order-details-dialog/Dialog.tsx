"use client";

import { ManufacturingOrderDetailsDialogReducerStore } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import {
  CloseButton,
  DataList,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import check from "check-types";
import { useMemo } from "react";

export default function ManufacturingOrderDetailsDialog() {
  const { useDispatch, useSelector } = ManufacturingOrderDetailsDialogReducerStore;
  const dispatch = useDispatch();
  const open = useSelector(s => s.open)
  const order = useSelector(s => s.order)

  const stats: { label: string, value: string }[] = useMemo(() => {
    if (check.null(order)) return []
    return [
      { label: "New Users", value: "234" },
      { label: "Sales", value: "£12,340" },
      { label: "Revenue", value: "3,450" },
    ]
  }, [order])

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
            <Dialog.Body>
              {check.null(order) ? <></> : (
                <DataList.Root orientation="horizontal">
                  {stats.map((item) => (
                    <DataList.Item key={item.label}>
                      <DataList.ItemLabel>{item.label}</DataList.ItemLabel>
                      <DataList.ItemValue>{item.value}</DataList.ItemValue>
                    </DataList.Item>
                  ))}
                </DataList.Root>
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
