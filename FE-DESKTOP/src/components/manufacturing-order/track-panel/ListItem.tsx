"use client"
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { Alert, Box, Button, Card, Collapsible, DataList, Heading, HStack, Progress, Stack, Text } from "@chakra-ui/react";
import { manufacturingOrderComponentUtils } from "../utils";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";
import { ManufacturingOrderDirectives } from "@/types/enums/ManufacturingOrderDirectives";
import { CorrugatorProcessStatus } from "@/types/enums/CorrugatorProcessStatus";
import check from "check-types";
import { OrderFinishingProcess } from "@/types/OrderFinishingProcess";
import { OrderFinishingProcessStatus } from "@/types/enums/OrderFinishingProcessStatus";
import { LuChevronsDown, LuChevronsDownUp, LuCircleCheckBig, LuCircleMinus, LuCircleX, LuPause, LuPlay } from "react-icons/lu";
import { useState } from "react";
import { ManufacturingOrderDetailsDialogReducerStore } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";

const { getPopulatedCustomer, getPopulatedPo, getPopulatedWare, getPopulatedSubPo } = manufacturingOrderComponentUtils
enum OrderStatus {
  NOTSTARTED = "NOTSTARTED",
  RUNNING = "RUNNING",
  PAUSED = "PAUSED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

const OrderStatusNameMap: Record<OrderStatus, string> = {
  NOTSTARTED: "Chưa bắt đầu",
  RUNNING: "Đang chạy",
  PAUSED: "Tạm dừng",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Hủy",
}

const OrderStatusAlertColorMap: Record<OrderStatus, string> = {
  NOTSTARTED: "gray",
  RUNNING: "blue",
  PAUSED: "yellow",
  COMPLETED: "green",
  CANCELLED: "red",
}

const OrderStatusStatusSymbolMap: Record<OrderStatus, React.ReactNode> = {
  NOTSTARTED: <LuCircleMinus />,
  RUNNING: <LuPlay />,
  PAUSED: <LuPause />,
  COMPLETED: <LuCircleCheckBig />,
  CANCELLED: <LuCircleX />,
}

const DirectiveNameMap: Record<ManufacturingOrderDirectives, string> = {
  CANCEL: "Hủy",
  COMPENSATE: "Bù lệnh",
  MANDATORY: "Bắt buộc",
  PAUSE: "Tạm dừng",
}

const getListItems = (mo: Serialized<ManufacturingOrder>) => {

  return [
    { label: "Khách hàng", value: getPopulatedCustomer(mo)?.code },
    { label: "Đơn hàng", value: getPopulatedPo(mo)?.code },
    { label: "Mã hàng", value: getPopulatedWare(mo)?.code },
    { label: "Ngày nhận", value: formatDateToDDMMYYYY(getPopulatedPo(mo)?.orderDate) },
    { label: "Ngày giao", value: formatDateToDDMMYYYY(getPopulatedSubPo(mo)?.deliveryDate) },
  ]
}

const getOrderStatus = (mo: Serialized<ManufacturingOrder>, processes: Serialized<OrderFinishingProcess>[]) => {
  if (mo.corrugatorProcess.status === CorrugatorProcessStatus.NOTSTARTED) {
    return OrderStatus.NOTSTARTED;
  }

  // All is either completed or "overcompleted", not sure if overcompleted will be used
  if (
    (mo.corrugatorProcess.status === CorrugatorProcessStatus.COMPLETED || mo.corrugatorProcess.status === CorrugatorProcessStatus.OVERCOMPLETED)
    && processes.every(p => p.status === OrderFinishingProcessStatus.COMPLETED || p.status === OrderFinishingProcessStatus.OVERCOMPLETED)) {
    return OrderStatus.RUNNING;
  }

  if (mo.corrugatorProcess.status === CorrugatorProcessStatus.RUNNING || processes.some(p => p.status === OrderFinishingProcessStatus.RUNNING)) {
    return OrderStatus.RUNNING;
  }

  // Nothing is running, but something is paused or all is paused
  if (mo.corrugatorProcess.status === CorrugatorProcessStatus.PAUSED || processes.some(p => p.status === OrderFinishingProcessStatus.PAUSED)) {
    return OrderStatus.PAUSED;
  }

  if (mo.corrugatorProcess.status === CorrugatorProcessStatus.CANCELLED && processes.every(p => p.status === OrderFinishingProcessStatus.CANCELLED)) {
    return OrderStatus.CANCELLED;
  }

  // Nothing is running, but something (not) all is cancelled, this could mean that some temporary changes are comming, set to paused and await cancellation
  if (mo.corrugatorProcess.status === CorrugatorProcessStatus.CANCELLED || processes.some(p => p.status === OrderFinishingProcessStatus.CANCELLED)) {
    return OrderStatus.PAUSED;
  }
}

export type ManufacturingOrderTrackPanelListItemProps = {
  mo: Serialized<ManufacturingOrder>
  processes: Serialized<OrderFinishingProcess>[]
}

export default function ManufacturingOrderTrackPanelListItem(props: ManufacturingOrderTrackPanelListItemProps) {
  const dialogDispatch = ManufacturingOrderDetailsDialogReducerStore.useDispatch();

  const [open, setOpen] = useState(false)
  const orderStatus = getOrderStatus(props.mo, props.processes)
  const statusDisplayName = orderStatus ? OrderStatusNameMap[orderStatus] : undefined
  const requiredAmount = props.mo.amount
  const completedAmount = (props.processes.length < 1) ? props.mo.corrugatorProcess.manufacturedAmount : props.processes.at(-1)?.completedAmount

  return (
    <Card.Root size="sm">
      <Card.Header>
        <Heading size="md">Mã lệnh: {props.mo.code}</Heading>
      </Card.Header>
      <Card.Body color="fg.muted">
        <Stack>
          <HStack justifyContent={"space-between"}>
            <DataList.Root flexDir={"row"} gapX={20}>
              {getListItems(props.mo).map((item) => (
                <DataList.Item key={item.label}>
                  <DataList.ItemLabel><Heading size="md">{item.label}</Heading></DataList.ItemLabel>
                  <DataList.ItemValue>{item.value}</DataList.ItemValue>
                </DataList.Item>
              ))}
            </DataList.Root>
            <Button colorPalette={"blue"} size="sm" onClick={
              () => dialogDispatch({
                type: "OPEN_DIALOG_WITH_ORDER",
                payload: props.mo,
              })
            }>Chi tiết lệnh</Button>
          </HStack>
          <HStack justifyContent={"space-between"} gapX={20}>
            {orderStatus && <Alert.Root colorPalette={OrderStatusAlertColorMap[orderStatus]} w="10rem">
              <Alert.Indicator>
                {OrderStatusStatusSymbolMap[orderStatus]}
              </Alert.Indicator>
              <Alert.Title>{statusDisplayName}</Alert.Title>
            </Alert.Root>}
            {!check.undefined(completedAmount) && <Progress.Root value={completedAmount} max={requiredAmount} flexGrow={1}>
              <HStack gap="5">
                <Progress.Label>Số lượng đã sản xuất</Progress.Label>
                <Progress.Track flex="1">
                  <Progress.Range />
                </Progress.Track>
                <Progress.ValueText>{completedAmount}/{requiredAmount} Đã hoàn thành</Progress.ValueText>
              </HStack>
            </Progress.Root>}
            <Button colorPalette={"teal"} onClick={() => setOpen(o => !o)}>Mở rộng <LuChevronsDown transform={open ? "rotate(180)" : "rotate(0)"} /></Button>
          </HStack>
          <Collapsible.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
            <Collapsible.Content>
              <Box padding="4" borderWidth="1px">
                <Card.Root size="sm">
                  <Card.Header>
                    <Heading size="md">Quy trình sóng</Heading>
                  </Card.Header>
                  <Card.Body color="fg.muted">
                    <Progress.Root value={props.mo.corrugatorProcess.manufacturedAmount} max={requiredAmount} flexGrow={1}>
                      <HStack gap="5" gapX={10}>
                        <Progress.Label>Số lượng phôi</Progress.Label>
                        <Progress.Track flex="1">
                          <Progress.Range />
                        </Progress.Track>
                        <Progress.ValueText>{props.mo.corrugatorProcess.manufacturedAmount}/{requiredAmount} Đã hoàn thành</Progress.ValueText>
                      </HStack>
                    </Progress.Root>
                  </Card.Body>
                </Card.Root>


                {props.processes.map(proc => (
                  <Card.Root size="sm" key={proc._id}>
                    <Card.Header>
                      <Heading size="md">{check.string(proc.wareFinishingProcessType) ? proc.wareFinishingProcessType : proc.wareFinishingProcessType.name}</Heading>
                    </Card.Header>
                    <Card.Body color="fg.muted">
                      <Progress.Root value={proc.completedAmount} max={proc.requiredAmount} flexGrow={1}>
                        <HStack gap="5">
                          <Progress.Label>Số lượng đã hoàn thiện</Progress.Label>
                          <Progress.Track flex="1">
                            <Progress.Range />
                          </Progress.Track>
                          <Progress.ValueText>{proc.completedAmount}/{proc.requiredAmount} Đã hoàn thành</Progress.ValueText>
                        </HStack>
                      </Progress.Root>
                    </Card.Body>
                  </Card.Root>
                ))}
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
        </Stack>
      </Card.Body>
    </Card.Root>
  )
}

