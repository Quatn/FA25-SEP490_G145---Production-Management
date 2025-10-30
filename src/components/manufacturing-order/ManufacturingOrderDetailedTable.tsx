"use client";

import {
  useGetFullDetailManufacturingOrdersQuery,
  useGetManufacturingOrdersQuery,
} from "@/service/api/manufacturingOrderApiSlice";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";
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

export default function ManufacturingOrderTable() {
  const {
    data: fullDetailMOPaginatedResponse,
    error: fetchError,
    isLoading: isFetchingList,
  } = useGetFullDetailManufacturingOrdersQuery({ page: 1, limit: 20 });

  const moList = fullDetailMOPaginatedResponse?.data;

  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const [tab, setTab] = useState<string | null>("order");

  const { open, onOpen, onClose } = useDisclosure();

  const [selectedOrder, setSelectedOrder] = useState<
    Serialized<ManufacturingOrder> | null
  >(
    null,
  );

  const handleViewDetailsClick = (order: Serialized<ManufacturingOrder>) => {
    setSelectedOrder(order);
    onOpen();
  };

  if (isFetchingList) {
    return <Text>Loading table</Text>;
  }

  if (fetchError) {
    return <Text>{JSON.stringify(fetchError)}</Text>;
  }

  if (check.undefined(moList)) {
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
                  {/*<Table.ColumnHeader>Tồn kho</Table.ColumnHeader>*/}
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
                  <Table.ColumnHeader>Ghi chú cố định</Table.ColumnHeader>
                  <Table.ColumnHeader>Ghi chú tạm thời</Table.ColumnHeader>
                  <Table.ColumnHeader>Ngày SX</Table.ColumnHeader>
                  <Table.ColumnHeader>Ngày và giờ cần</Table.ColumnHeader>
                  <Table.ColumnHeader>Dàn</Table.ColumnHeader>
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
                  <Table.ColumnHeader>Máy In</Table.ColumnHeader>
                  <Table.ColumnHeader>Màu 1</Table.ColumnHeader>
                  <Table.ColumnHeader>Màu 2</Table.ColumnHeader>
                  <Table.ColumnHeader>Màu 3</Table.ColumnHeader>
                  <Table.ColumnHeader>Màu 4</Table.ColumnHeader>
                  <Table.ColumnHeader>Công đoạn gia công 1</Table.ColumnHeader>
                  <Table.ColumnHeader>Công đoạn gia công 2</Table.ColumnHeader>
                  <Table.ColumnHeader>Công đoạn gia công 3</Table.ColumnHeader>
                  <Table.ColumnHeader>Công đoạn gia công 4</Table.ColumnHeader>
                </>
              )}
              <Table.ColumnHeader w="120px" border="none" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {moList.map((item) => (
              <Table.Row
                key={item.id}
                bg={"gray.50"}
                h="50px"
                onMouseEnter={() => setHoveredRow(item.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <Table.Cell>{item.manufacturingDirective}</Table.Cell>
                <Table.Cell borderEnd={"3px solid #66b5cf"}>
                  {item.code}
                </Table.Cell>
                {tab == "order" && (
                  <>
                    <Table.Cell>{item.customerCode}</Table.Cell>
                    <Table.Cell>{item.wareCode}</Table.Cell>
                    <Table.Cell>{item.fluteCombinationCode}</Table.Cell>
                    <Table.Cell>{item.wareWidth}</Table.Cell>
                    <Table.Cell>{item.wareLength}</Table.Cell>
                    <Table.Cell>{item.wareHeight}</Table.Cell>
                    {/*<Table.Cell>{item.excessInventory}</Table.Cell>*/}
                    <Table.Cell>{item.amount}</Table.Cell>
                  </>
                )}
                {tab == "manufacture" && (
                  <>
                    <Table.Cell>
                      {formatDateToDDMMYYYY(item.orderDate)}
                    </Table.Cell>
                    <Table.Cell>
                      {formatDateToDDMMYYYY(item.deliveryDate)}
                    </Table.Cell>
                    <Table.Cell>{item.purchaseOrderId}</Table.Cell>
                    <Table.Cell>{item.blankWidth}</Table.Cell>
                    <Table.Cell>{item.blankLength}</Table.Cell>
                    <Table.Cell>{item.flapLength}</Table.Cell>
                    <Table.Cell>{item.warePerBlank}</Table.Cell>
                    <Table.Cell>{item.numberOfBlanks}</Table.Cell>
                    <Table.Cell>{item.longitudinalCutCount}</Table.Cell>
                    <Table.Cell>{item.runningLength}</Table.Cell>
                    <Table.Cell>{item.crossCutCount}</Table.Cell>
                    <Table.Cell>{item.paperWidth}</Table.Cell>
                    <Table.Cell>{item.margin}</Table.Cell>
                  </>
                )}

                {tab == "layers" && (
                  <>
                    <Table.Cell>{item.faceLayerPaperType}</Table.Cell>
                    <Table.Cell>{item.EFlutePaperType}</Table.Cell>
                    <Table.Cell>{item.EBLinerLayerPaperType}</Table.Cell>
                    <Table.Cell>{item.BFlutePaperType}</Table.Cell>
                    <Table.Cell>{item.BACLinerLayerPaperType}</Table.Cell>
                    <Table.Cell>{item.ACFlutePaperType}</Table.Cell>
                    <Table.Cell>{item.backLayerPaperType}</Table.Cell>
                  </>
                )}

                {tab == "notes" && (
                  <>
                    <Table.Cell>{item.purchaseOrderItemNote}</Table.Cell>
                    <Table.Cell>{item.note}</Table.Cell>
                    <Table.Cell>
                      {formatDateToDDMMYYYY(item.manufacturingDate)}
                    </Table.Cell>
                    <Table.Cell>
                      {formatDateToDDMMYYYY(item.requestedDatetime)}
                    </Table.Cell>
                    <Table.Cell>{item.corrugatorLine}</Table.Cell>
                  </>
                )}

                {tab == "weigth" && (
                  <>
                    <Table.Cell>{item.faceLayerPaperWeight}</Table.Cell>
                    <Table.Cell>{item.EFlutePaperWeight}</Table.Cell>
                    <Table.Cell>{item.EBLinerLayerPaperWeight}</Table.Cell>
                    <Table.Cell>{item.BFlutePaperWeight}</Table.Cell>
                    <Table.Cell>{item.BACLinerLayerPaperWeight}</Table.Cell>
                    <Table.Cell>{item.ACFlutePaperWeight}</Table.Cell>
                    <Table.Cell>{item.backLayerPaperWeight}</Table.Cell>
                    <Table.Cell>{item.totalVolume}</Table.Cell>
                    <Table.Cell>{item.totalWeight}</Table.Cell>
                  </>
                )}

                {tab == "processes" && (
                  <>
                    <Table.Cell>{item.typeOfPrinter}</Table.Cell>
                    <Table.Cell>{item.printColors.at(0)}</Table.Cell>
                    <Table.Cell>{item.printColors.at(1)}</Table.Cell>
                    <Table.Cell>{item.printColors.at(2)}</Table.Cell>
                    <Table.Cell>{item.printColors.at(3)}</Table.Cell>
                    <Table.Cell>{item.manufacturingProcesses.at(1)}</Table.Cell>
                    <Table.Cell>{item.manufacturingProcesses.at(2)}</Table.Cell>
                    <Table.Cell>{item.manufacturingProcesses.at(3)}</Table.Cell>
                    <Table.Cell>{item.manufacturingProcesses.at(4)}</Table.Cell>
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
                    {
                      /*
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
                  */
                    }
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
