import { CloseButton } from "@/components/ui/close-button";
import { ManufacturingOrderCreatePageReducerStore } from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { Box, Button, DataList, Dialog, HStack, Portal, Stack, Text } from "@chakra-ui/react";
import check from "check-types";
import { LuTriangleAlert } from "react-icons/lu";

export default function ManufacturingOrderCreatePageConfirmSaveDialog() {
  const { useSelector, useDispatch } = ManufacturingOrderCreatePageReducerStore;
  const dispatch = useDispatch();
  const preparedSubmitFunction = useSelector(s => s.preparedSubmitFunction);
  const preparedSubmitAskText = useSelector(s => s.preparedSubmitAskText);
  const insufficientPaperTypes = useSelector(s => s.insufficientPaperTypes);

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
                <Text>{preparedSubmitAskText}</Text>
                {check.nonEmptyArray(insufficientPaperTypes) && <Stack gap={2}>
                  <HStack>
                    <LuTriangleAlert color={"#ee6666"} />
                    <Text colorPalette={"orange"} color={"colorPalette.fg"}>Các loại giấy sau được dự đoán là thiếu </Text>
                  </HStack>
                  <DataList.Root orientation="horizontal">
                    {insufficientPaperTypes?.map((item, index) => (
                      <DataList.Item key={item.type + index}>
                        <DataList.ItemLabel>{item.type}</DataList.ItemLabel>
                        <DataList.ItemValue><Text colorPalette={"orange"} color={"colorPalette.fg"}>{item.missingAmount.toFixed(2)}</Text></DataList.ItemValue>
                      </DataList.Item>
                    ))}
                  </DataList.Root>
                </Stack>}
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
