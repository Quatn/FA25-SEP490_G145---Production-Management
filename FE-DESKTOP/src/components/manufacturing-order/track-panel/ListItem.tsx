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
import { ManufacturingOrderOperativeStatus } from "@/types/enums/ManufacturingOrderOperativeStatus";
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import { WareFinishingProcessType } from "@/types/WareFinishingProcessType";

const { getPopulatedCustomer, getPopulatedPo, getPopulatedWare, getPopulatedSubPo, getOrderStatus, OrderStatusNameMap } = manufacturingOrderComponentUtils

const OrderStatusAlertColorMap: Record<ManufacturingOrderOperativeStatus, string> = {
  NOTSTARTED: "gray",
  RUNNING: "blue",
  PAUSED: "yellow",
  COMPLETED: "green",
  CANCELLED: "red",
}

const CorrugatorProcessProgressColorMap: Record<CorrugatorProcessStatus, string> = {
  NOTSTARTED: "gray",
  RUNNING: "blue",
  PAUSED: "yellow",
  COMPLETED: "green",
  CANCELLED: "red",
  OVERCOMPLETED: "teal",
}

const OrderFinishingProcessProcessProgressColorMap: Record<OrderFinishingProcessStatus, string> = {
  PENDINGAPPROVAL: "gray",
  APPROVED: "cyan",
  SCHEDULED: "cyan",
  INPRODUCTION: "blue",
  ONHOLD: "blue",
  PAUSED: "yellow",
  FINISHEDPRODUCTION: "green",
  CANCELLED: "green",
  QUALITYCHECK: "teal",
  COMPLETED: "green",
}

const OrderStatusStatusSymbolMap: Record<ManufacturingOrderOperativeStatus, React.ReactNode> = {
  NOTSTARTED: <LuCircleMinus />,
  RUNNING: <LuPlay />,
  PAUSED: <LuPause />,
  COMPLETED: <LuCircleCheckBig />,
  CANCELLED: <LuCircleX />,
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

export type ManufacturingOrderTrackPanelListItemProps = {
  mo: Serialized<ManufacturingOrder>
}

export default function ManufacturingOrderTrackPanelListItem(props: ManufacturingOrderTrackPanelListItemProps) {
  const dialogDispatch = ManufacturingOrderDetailsDialogReducerStore.useDispatch();

  const [open, setOpen] = useState(false)
  const statusDisplayName = props.mo.operativeStatus ? OrderStatusNameMap[props.mo.operativeStatus] : undefined
  const requiredAmount = props.mo.amount
  const orderStatus = props.mo.operativeStatus
  if (check.array.of.string(props.mo.finishingProcesses)) {
    throw new UnpopulatedFieldError("mo.finishingProcesses should have been populated before reaching here ManufacturingOrderTrackPanelListItem")
  }
  const processes = (props.mo.finishingProcesses ?? []) as Serialized<OrderFinishingProcess>[]
  const completedAmount = (processes.length < 1) ? props.mo.corrugatorProcess.manufacturedAmount : processes.at(-1)?.completedAmount

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
                payload: { order: props.mo },
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
            {!check.undefined(completedAmount) && <Progress.Root value={completedAmount} max={requiredAmount} flexGrow={1} colorPalette={orderStatus ? OrderStatusAlertColorMap[orderStatus] : "gray"}>
              <HStack gap="5">
                <Progress.Label>Sản lượng</Progress.Label>
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
              <Stack padding="4" borderWidth="1px" gapY={4}>
                <Card.Root size="sm">
                  <Card.Header>
                    <Heading size="md">Quy trình sóng</Heading>
                  </Card.Header>
                  <Card.Body color="fg.muted">
                    <Progress.Root value={props.mo.corrugatorProcess.manufacturedAmount} max={requiredAmount} flexGrow={1} colorPalette={CorrugatorProcessProgressColorMap[props.mo.corrugatorProcess.status]}>
                      <HStack gap="10" gapX={10}>
                        <Progress.Label>Số lượng phôi</Progress.Label>
                        <Progress.Track flex="1">
                          <Progress.Range />
                        </Progress.Track>
                        <Progress.ValueText w={"15%"}>{props.mo.corrugatorProcess.manufacturedAmount}/{props.mo.numberOfBlanks} tấm phôi </Progress.ValueText>
                      </HStack>
                    </Progress.Root>
                  </Card.Body>
                </Card.Root>


                {processes.map(proc => (
                  <Card.Root size="sm" key={proc._id}>
                    <Card.Header>
                      <Heading size="md">
                        {
                          check.string(proc.wareFinishingProcessType) ?
                            ((manufacturingOrderComponentUtils.getPopulatedWare(props.mo)?.finishingProcesses.find(p => (p as WareFinishingProcessType)._id === (proc.wareFinishingProcessType as unknown as string))) as WareFinishingProcessType).name
                            :
                            proc.wareFinishingProcessType.name
                        }
                      </Heading>
                    </Card.Header>
                    <Card.Body color="fg.muted">
                      <Progress.Root value={proc.completedAmount} max={proc.requiredAmount} flexGrow={1} colorPalette={OrderFinishingProcessProcessProgressColorMap[proc.status]}>
                        <HStack gap="10">
                          <Progress.Label>Số lượng đã hoàn thiện</Progress.Label>
                          <Progress.Track flex="1">
                            <Progress.Range />
                          </Progress.Track>
                          <Progress.ValueText w={"15%"}>{proc.completedAmount}/{proc.requiredAmount} thành phẩm</Progress.ValueText>
                        </HStack>
                      </Progress.Root>
                    </Card.Body>
                  </Card.Root>
                ))}
              </Stack>
            </Collapsible.Content>
          </Collapsible.Root>
        </Stack>
      </Card.Body>
    </Card.Root>
  )
}

