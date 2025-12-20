import { CloseButton } from "@/components/ui/close-button";
import { Tooltip } from "@/components/ui/tooltip";
import { productionModuleConfigs } from "@/config/production-module.config";
import { ManufacturingOrderCreatePageReducerStore } from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";
import { Box, Button, DataList, Dialog, Heading, HStack, Portal, Stack, Text } from "@chakra-ui/react";
import check from "check-types";
import { LuTriangleAlert, LuX } from "react-icons/lu";

export default function ManufacturingOrderCreatePageConfirmSaveDialog() {
  const { useSelector, useDispatch } = ManufacturingOrderCreatePageReducerStore;
  const dispatch = useDispatch();
  const preparedSubmitFunction = useSelector(s => s.preparedSubmitFunction);
  const preparedSubmitAskText = useSelector(s => s.preparedSubmitAskText);
  const insufficientPaperTypes = useSelector(s => s.insufficientPaperTypes);
  const insufficientOrderBufferTimes = useSelector(s => s.insufficientOrderBufferTimes);
  const currentDate = new Date()

  const shouldDisableSubmitButton = check.nonEmptyArray(insufficientPaperTypes) && check.nonEmptyArray(insufficientOrderBufferTimes)

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
                    <Text colorPalette={"orange"} color={"colorPalette.fg"}>Các loại giấy sau được dự đoán là thiếu</Text>
                  </HStack>
                  <DataList.Root orientation="horizontal" gapY={2}>
                    <DataList.Item key={"headers"}>
                      <DataList.ItemLabel><Heading size={"sm"} color={"fg"}>Mã giấy</Heading></DataList.ItemLabel>
                      <DataList.ItemValue>
                        <Heading size={"sm"}>Khối lượng thiếu (kg)</Heading>
                      </DataList.ItemValue>
                    </DataList.Item>

                    {insufficientPaperTypes?.map((item, index) => (
                      <DataList.Item key={item.type + index}>
                        <DataList.ItemLabel>{item.type}</DataList.ItemLabel>
                        <DataList.ItemValue><Text colorPalette={"orange"} color={"colorPalette.fg"}>{item.missingAmount.toFixed(2)}</Text></DataList.ItemValue>
                      </DataList.Item>
                    ))}
                  </DataList.Root>
                </Stack>}
                {shouldDisableSubmitButton && <Stack>
                  <HStack>
                    {/*<LuX color={"#ee6666"} />*/}
                    <Text colorPalette={"red"} color={"colorPalette.fg"}>Các lệnh sau có ngày sản xuất cách thời điểm hiện tại ít hơn khoảng thời gian cho phép đối với các lệnh không đủ nguyên vật liệu ({productionModuleConfigs.MIN_SCHEDULE_TIME_MS_DISTANCE_ALLOWED_FOR_UNFULFILLED_MATERIAL_REQUIREMENTS / (24 * 60 * 60 * 1000)} ngày)</Text>
                  </HStack>
                  <DataList.Root orientation="horizontal" gapY={2}>
                    <DataList.Item key={"headers"}>
                      <DataList.ItemLabel><Heading size={"sm"} color={"fg"}>Mã lệnh</Heading></DataList.ItemLabel>
                      <DataList.ItemValue>
                        <Heading size={"sm"}>Ngày sản xuất</Heading>
                      </DataList.ItemValue>
                    </DataList.Item>

                    {insufficientOrderBufferTimes?.map((item, index) => {
                      const time = (item.date.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000)
                      const bufferTime = time < 0 ? Math.ceil(time) : Math.floor(time)

                      return (
                        <DataList.Item key={item.code + index}>
                          <DataList.ItemLabel>{item.code}</DataList.ItemLabel>
                          <DataList.ItemValue>
                            <Text colorPalette={"red"} color={"colorPalette.fg"}>
                              {formatDateToDDMMYYYY(item.date)} (sản xuất {
                                (bufferTime == 0) ? "trong hôm nay"
                                  : (bufferTime > 0) ? `trong  ${Math.abs(bufferTime)} ngày`
                                    : `muộn ${Math.abs(bufferTime)} ngày`
                              })
                            </Text></DataList.ItemValue>
                        </DataList.Item>
                      )
                    })}
                  </DataList.Root>
                </Stack>}
                <HStack justifyContent={"end"}>
                  <Tooltip
                    showArrow
                    content="Không thể tạo lệnh, hãy bỏ chọn các lệnh không đủ khối lượng giấy hoặc điều chỉnh thời gian sản xuất của lệnh"
                    contentProps={{ css: { "--tooltip-bg": "colors.red.solid" } }}
                    disabled={!shouldDisableSubmitButton}
                  >
                    <Button
                      disabled={shouldDisableSubmitButton}
                      onClick={() => {
                        if (preparedSubmitFunction) preparedSubmitFunction()
                        dispatch({ type: "SET_PREPARED_SUBMIT_FUNCTION", payload: undefined })
                      }} colorPalette={"blue"} bg={"colorPalette.solid"}>
                      Tạo
                    </Button>
                  </Tooltip>
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
