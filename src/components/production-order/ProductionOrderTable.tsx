"use client";

import { useGetProductionOrdersQuery } from "@/service/api/productionOrderApiSlice";
import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Input,
  Portal,
  Stack,
  Table,
  Tabs,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import check from "check-types";
import { useState } from "react";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";

export default function ProductionOrderTable() {
  const {
    data: productionOrderListQuery,
    error: fetchError,
    isLoading: isFetchingList,
  } = useGetProductionOrdersQuery({ page: 1, limit: 20 });
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const productionOrderList = productionOrderListQuery?.productionOrders;

  const [tab, setTab] = useState<string | null>("order");

  const { open, onOpen, onClose } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const handleViewDetailsClick = (order: any) => {
    console.log(order);
    console.log(open);
    setSelectedOrder(order);
    onOpen();
  };

  if (isFetchingList) {
    return <Text>Loading table</Text>;
  }

  if (fetchError) {
    return <Text>Error loading table</Text>;
  }

  if (check.undefined(productionOrderList)) {
    return <Text>Unable to load table</Text>;
  }

  return (
    <>
      <Tabs.Root value={tab} onValueChange={(e) => setTab(e.value)} mt={3}>
        <Tabs.List ms="200px">
          <Tabs.Trigger value="order">
            <LuUser />
            Thông tin đơn hàng
          </Tabs.Trigger>
          <Tabs.Trigger value="manufacture">
            <LuFolder />
            Gia công
          </Tabs.Trigger>
          <Tabs.Trigger value="layers">
            <LuSquareCheck />
            Cấu trúc lớp
          </Tabs.Trigger>
          <Tabs.Trigger value="notes">
            <LuSquareCheck />
            Ghi chú
          </Tabs.Trigger>
          <Tabs.Trigger value="weigth">
            <LuSquareCheck />
            Trọng lượng giấy sử dụng
          </Tabs.Trigger>
          <Tabs.Trigger value="processes">
            <LuSquareCheck />
            Công đoạn hoàn thiện
          </Tabs.Trigger>
        </Tabs.List>{" "}
        <Table.Root
          size="sm"
          variant={"outline"}
          borderWidth={1}
          borderColor={"gray"}
          showColumnBorder
        >
          <Table.Header bgColor={"blue.100"}>
            <Table.Row h="60px">
              <Table.ColumnHeader w="100px">KH Giao</Table.ColumnHeader>
              <Table.ColumnHeader w="100px" borderEnd={"3px solid #66b5cf"}>
                Mã lệnh
              </Table.ColumnHeader>
              {tab == "order" && (
                <>
                  <Table.ColumnHeader>Khách hàng</Table.ColumnHeader>
                  <Table.ColumnHeader>Mã hàng</Table.ColumnHeader>
                  <Table.ColumnHeader>Sóng</Table.ColumnHeader>
                  <Table.ColumnHeader>Dài / Khổ</Table.ColumnHeader>
                  <Table.ColumnHeader>Rộng</Table.ColumnHeader>
                  <Table.ColumnHeader>Cao</Table.ColumnHeader>
                  <Table.ColumnHeader>Tồn kho</Table.ColumnHeader>
                  <Table.ColumnHeader>Số lượng</Table.ColumnHeader>
                </>
              )}
              {tab == "manufacture" && (
                <>
                  <Table.ColumnHeader>Ngày nhận</Table.ColumnHeader>
                  <Table.ColumnHeader>Ngày giao</Table.ColumnHeader>
                  <Table.ColumnHeader>Đơn hàng</Table.ColumnHeader>
                  <Table.ColumnHeader>Khổ</Table.ColumnHeader>
                  <Table.ColumnHeader>Cắt dài</Table.ColumnHeader>
                  <Table.ColumnHeader>Cánh</Table.ColumnHeader>
                  <Table.ColumnHeader>Số sản phẩm</Table.ColumnHeader>
                  <Table.ColumnHeader>Số tấm</Table.ColumnHeader>
                  <Table.ColumnHeader>Tấm chặt</Table.ColumnHeader>
                  <Table.ColumnHeader>Mét dài</Table.ColumnHeader>
                  <Table.ColumnHeader>Đ/C Part</Table.ColumnHeader>
                  <Table.ColumnHeader>Part SX</Table.ColumnHeader>
                  <Table.ColumnHeader>Khổ giấy</Table.ColumnHeader>
                  <Table.ColumnHeader>Lề biên</Table.ColumnHeader>
                </>
              )}

              {tab == "layers" && (
                <>
                  <Table.ColumnHeader>Mặt SP</Table.ColumnHeader>
                  <Table.ColumnHeader>Sóng E</Table.ColumnHeader>
                  <Table.ColumnHeader>Lớp giữa</Table.ColumnHeader>
                  <Table.ColumnHeader>Sóng B</Table.ColumnHeader>
                  <Table.ColumnHeader>Lớp giữa</Table.ColumnHeader>
                  <Table.ColumnHeader>Sóng A/C</Table.ColumnHeader>
                  <Table.ColumnHeader>Mặt trong</Table.ColumnHeader>
                </>
              )}

              {tab == "notes" && (
                <>
                  <Table.ColumnHeader>Ghi chú</Table.ColumnHeader>
                  <Table.ColumnHeader>Ngày SX</Table.ColumnHeader>
                  <Table.ColumnHeader>ĐC / SX</Table.ColumnHeader>
                  <Table.ColumnHeader>Ngày và giờ cần</Table.ColumnHeader>
                  <Table.ColumnHeader>Dàn</Table.ColumnHeader>
                  <Table.ColumnHeader>Đổi dàn</Table.ColumnHeader>
                </>
              )}

              {tab == "weigth" && (
                <>
                  <Table.ColumnHeader>Mặt SP</Table.ColumnHeader>
                  <Table.ColumnHeader>Sóng E</Table.ColumnHeader>
                  <Table.ColumnHeader>Lớp giữa</Table.ColumnHeader>
                  <Table.ColumnHeader>Sóng B</Table.ColumnHeader>
                  <Table.ColumnHeader>Lớp giữa</Table.ColumnHeader>
                  <Table.ColumnHeader>Sóng A/C</Table.ColumnHeader>
                  <Table.ColumnHeader>Mặt trong</Table.ColumnHeader>
                  <Table.ColumnHeader>Khối</Table.ColumnHeader>
                  <Table.ColumnHeader>Tổng trọng lượng</Table.ColumnHeader>
                </>
              )}

              {tab == "processes" && (
                <>
                  <Table.ColumnHeader>printingProcess</Table.ColumnHeader>
                  <Table.ColumnHeader>printingMachine</Table.ColumnHeader>
                  <Table.ColumnHeader>printingSize</Table.ColumnHeader>
                  <Table.ColumnHeader>colorOne</Table.ColumnHeader>
                  <Table.ColumnHeader>colorTwo</Table.ColumnHeader>
                  <Table.ColumnHeader>colorThree</Table.ColumnHeader>
                  <Table.ColumnHeader>manufactureStageOne</Table.ColumnHeader>
                  <Table.ColumnHeader>manufactureStageTwo</Table.ColumnHeader>
                  <Table.ColumnHeader>manufactureStageThree</Table.ColumnHeader>
                  <Table.ColumnHeader>manufactureStageFour</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign={"start"}>
                    finishingProcess
                  </Table.ColumnHeader>
                </>
              )}
              <Table.ColumnHeader w="120px" border="none" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {productionOrderList.map((item) => (
              <Table.Row
                key={item.id}
                bg={"gray.50"}
                h="50px"
                onMouseEnter={() => setHoveredRow(item.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <Table.Cell>{item.status}</Table.Cell>
                <Table.Cell borderEnd={"3px solid #66b5cf"}>
                  {item.productionOrderCode}
                </Table.Cell>
                {tab == "order" && (
                  <>
                    <Table.Cell>{item.customer}</Table.Cell>
                    <Table.Cell>{item.wareCode}</Table.Cell>
                    <Table.Cell>{item.waveType}</Table.Cell>
                    <Table.Cell>{item.wareLength}</Table.Cell>
                    <Table.Cell>{item.wareWidth}</Table.Cell>
                    <Table.Cell>{item.wareHeight}</Table.Cell>
                    <Table.Cell>{item.excessInventory}</Table.Cell>
                    <Table.Cell>{item.amount}</Table.Cell>
                  </>
                )}
                {tab == "manufacture" && (
                  <>
                    <Table.Cell>{item.orderReceivedDate}</Table.Cell>
                    <Table.Cell>{item.deliveryDate}</Table.Cell>
                    <Table.Cell>{item.purchaseOrder}</Table.Cell>
                    <Table.Cell>{item.blankWidth}</Table.Cell>
                    <Table.Cell>{item.sheetLength}</Table.Cell>
                    <Table.Cell>{item.flap}</Table.Cell>
                    <Table.Cell>{item.warePerBlank}</Table.Cell>
                    <Table.Cell>{item.numberOfBlanks}</Table.Cell>
                    <Table.Cell>{item.numberOfSheets}</Table.Cell>
                    <Table.Cell>{item.paperLength}</Table.Cell>
                    <Table.Cell>{item.DCPart}</Table.Cell>
                    <Table.Cell>{item.partSX}</Table.Cell>
                    <Table.Cell>{item.paperWidth}</Table.Cell>
                    <Table.Cell>{item.edgeTrim}</Table.Cell>
                  </>
                )}

                {tab == "layers" && (
                  <>
                    <Table.Cell>{item.FaceLayerPaperType}</Table.Cell>
                    <Table.Cell>{item.WaveEPaperType}</Table.Cell>
                    <Table.Cell>{item.EBLayerPaperType}</Table.Cell>
                    <Table.Cell>{item.WaveBPaperType}</Table.Cell>
                    <Table.Cell>{item.BACLayerPaperType}</Table.Cell>
                    <Table.Cell>{item.WaveACPaperType}</Table.Cell>
                    <Table.Cell>{item.InnerLayerPaperType}</Table.Cell>
                  </>
                )}

                {tab == "notes" && (
                  <>
                    <Table.Cell>{item.Note}</Table.Cell>
                    <Table.Cell>{item.manufactureDate}</Table.Cell>
                    <Table.Cell>{item.DCSX}</Table.Cell>
                    <Table.Cell>{item.requirementDateTime}</Table.Cell>
                    <Table.Cell>{item.productionLine}</Table.Cell>
                    <Table.Cell>{item.lineSwitch}</Table.Cell>
                  </>
                )}

                {tab == "weigth" && (
                  <>
                    <Table.Cell>{item.FaceLayerPaperWeigth}</Table.Cell>
                    <Table.Cell>{item.WaveEPaperWeigth}</Table.Cell>
                    <Table.Cell>{item.EBLayerPaperWeigth}</Table.Cell>
                    <Table.Cell>{item.WaveBPaperWeigth}</Table.Cell>
                    <Table.Cell>{item.BACLayerPaperWeigth}</Table.Cell>
                    <Table.Cell>{item.WaveACPaperWeigth}</Table.Cell>
                    <Table.Cell>{item.InnerLayerPaperWeigth}</Table.Cell>
                    <Table.Cell>{item.AreaUnit}</Table.Cell>
                    <Table.Cell>{item.TotalWeigth}</Table.Cell>
                  </>
                )}

                {tab == "processes" && (
                  <>
                    <Table.Cell>{item.printingProcess}</Table.Cell>
                    <Table.Cell>{item.printingMachine}</Table.Cell>
                    <Table.Cell>{item.printingSize}</Table.Cell>
                    <Table.Cell>{item.colorOne}</Table.Cell>
                    <Table.Cell>{item.colorTwo}</Table.Cell>
                    <Table.Cell>{item.colorThree}</Table.Cell>
                    <Table.Cell>{item.manufactureStageOne}</Table.Cell>
                    <Table.Cell>{item.manufactureStageTwo}</Table.Cell>
                    <Table.Cell>{item.manufactureStageThree}</Table.Cell>
                    <Table.Cell>{item.manufactureStageFour}</Table.Cell>
                    <Table.Cell textAlign={"start"}>
                      {item.finishingProcess}
                    </Table.Cell>
                  </>
                )}
                <Table.Cell
                  w="120px"
                  border="none"
                  bg="none"
                >
                  {hoveredRow === item.id && (
                    <Button
                      size="xs"
                      colorPalette={"blue"}
                      onClick={() => handleViewDetailsClick(item)}
                    >
                       Chi tiết
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Tabs.Root>
      {selectedOrder && (
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
                    <CloseButton onClick={onClose} size="sm" />
                  </Dialog.CloseTrigger>
                </Dialog.Header>
                <Dialog.Body>
                  <Stack gap={4}>
                    <Field.Root>
                      <Field.Label>Khách hàng</Field.Label>
                      <Input value={selectedOrder.customer} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Mã hàng</Field.Label>
                      <Input value={selectedOrder.wareCode} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Sóng</Field.Label>
                      <Input value={selectedOrder.waveType} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Dài / Khổ</Field.Label>
                      <Input value={selectedOrder.wareLength} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Rộng</Field.Label>
                      <Input value={selectedOrder.wareWidth} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Cao</Field.Label>
                      <Input value={selectedOrder.wareHeight} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Tồn kho</Field.Label>
                      <Input value={selectedOrder.excessInventory} />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>Số lượng</Field.Label>
                      <Input value={selectedOrder.amount} />
                    </Field.Root>
                  </Stack>
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      )}
    </>
  );
}
