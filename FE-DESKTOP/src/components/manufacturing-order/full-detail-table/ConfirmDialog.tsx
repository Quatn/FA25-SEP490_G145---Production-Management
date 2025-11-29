"use client"

import { ManufacturingOrderTableReducerStore } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { Button, CloseButton, Dialog, HStack, Portal, Stack, Text } from "@chakra-ui/react";
import check from "check-types";

export default function ManufacturingOrderFullDetailTableConfirmDialog() {
  const { useDispatch, useSelector } = ManufacturingOrderTableReducerStore;
  const dispatch = useDispatch();
  const preparedSubmitFunction = useSelector(s => s.preparedSubmitFunction);
  const preparedSubmitAskText = useSelector(s => s.preparedSubmitAskText);

  return (
    <Dialog.Root
      size="lg"
      placement="center"
      motionPreset="slide-in-bottom"
      open={!check.undefined(preparedSubmitFunction)}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Xác nhận</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  onClick={() => dispatch({ type: "SET_PREPARED_SUBMIT_FUNCTION", payload: undefined })}
                  size="sm"
                />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={5}>
                <Text>{preparedSubmitAskText}</Text>
                <HStack justifyContent={"end"}>
                  <Button onClick={() => {
                    if (preparedSubmitFunction) preparedSubmitFunction()
                    dispatch({ type: "SET_PREPARED_SUBMIT_FUNCTION", payload: undefined })
                  }} colorPalette={"blue"} bg={"colorPalette.solid"}>Tạo</Button>
                  <Button
                    onClick={() => dispatch({ type: "SET_PREPARED_SUBMIT_FUNCTION", payload: undefined })}
                    colorPalette={"red"}
                    bg={"colorPalette.solid"}
                  >
                    Hủy
                  </Button>
                </HStack>
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
