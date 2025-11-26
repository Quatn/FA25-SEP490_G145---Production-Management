import { CloseButton } from "@/components/ui/close-button";
import { useManufacturingOrderCreatePageDispatch, useManufacturingOrderCreatePageState } from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { Button, Dialog, HStack, Portal, Stack, Text } from "@chakra-ui/react";
import check from "check-types";

export default function ManufacturingOrderCreatePageConfirmSaveDialog() {
  const { preparedSubmitFunction, selectedPOIsIds } = useManufacturingOrderCreatePageState();
  const dispatch = useManufacturingOrderCreatePageDispatch();

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
              <Dialog.Title>Tạo lệnh</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  onClick={() => dispatch({ type: "SET_PREPARED_SUBMIT_FUNCTION", payload: undefined })}
                  size="sm"
                />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={5}>
                <Text>Xác nhận tạo {selectedPOIsIds.length} lệnh?</Text>
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
