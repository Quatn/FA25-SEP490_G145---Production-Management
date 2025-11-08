"use client";

import {
  useManufacturingDialogDispatch,
  useManufacturingDialogState,
} from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import {
  CloseButton,
  Dialog,
  Field,
  Input,
  Portal,
  Stack,
} from "@chakra-ui/react";
import check from "check-types";

export default function ManufacturingOrderDetailsDialog() {
  const { open, order } = useManufacturingDialogState();
  const dispatch = useManufacturingDialogDispatch();

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
                <Stack gap={4}>
                  <Field.Root>
                    <Field.Label>Khách hàng</Field.Label>
                    <Input value={order.customerCode} />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Mã hàng</Field.Label>
                    <Input value={order.wareCode} />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Sóng</Field.Label>
                    <Input value={order.fluteCombinationCode} />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Dài / Khổ</Field.Label>
                    <Input value={order.wareLength} />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Rộng</Field.Label>
                    <Input value={order.wareWidth} />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Cao</Field.Label>
                    <Input
                      value={check.null(order.wareHeight)
                        ? ""
                        : order.wareHeight}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Số lượng</Field.Label>
                    <Input value={order.amount} />
                  </Field.Root>
                </Stack>
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
