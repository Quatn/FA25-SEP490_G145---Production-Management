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
import CorrugatorProcessStatusBadge from "../common/CorrugatorProcessStatusBadge";
import OrderfinishingprocessProcessStatusBadge from "../common/OrderFinishingProcessStatusBadge";

const { getPopulatedCustomer, getPopulatedPo, getPopulatedWare, getPopulatedSubPo, getOrderStatus, OrderStatusNameMap } = manufacturingOrderComponentUtils

function boundNumber(num?: number, maxNum: number | null = null, minNum: number | null = 0): number {
  if (!check.number(num)) return check.number(minNum) ? minNum : 0
  if (check.number(minNum) && check.less(num, minNum)) return minNum
  if (check.number(maxNum) && check.greater(num, maxNum)) return maxNum
  return num
}

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

  // Corrugator Process Stats
  const cps = {
    // Truthful values that will display what ever the data tells it to display
    amount: props.mo.corrugatorProcess.manufacturedAmount,
    requiredAmount: props.mo.numberOfBlanks,

    // Bounded values for stuffs that shouldn't display illogical data
    boundedAmount: boundNumber(props.mo.corrugatorProcess.manufacturedAmount, props.mo.numberOfBlanks), // range: 0 to boundedRequiredAmount
    boundedRequiredAmount: boundNumber(props.mo.numberOfBlanks), // range: 0 to props.mo.numberOfBlanks
  }

  const processes = (props.mo.finishingProcesses ?? []) as Serialized<OrderFinishingProcess>[]

  //Order (the outside one) Stats
  const os = {
    completedProcesses:
      (check.in(props.mo.corrugatorProcess.status, [CorrugatorProcessStatus.COMPLETED, CorrugatorProcessStatus.OVERCOMPLETED]) ? 1 : 0) +
      processes.map(p => check.in(p.status, [OrderFinishingProcessStatus.FinishedProduction, OrderFinishingProcessStatus.Completed]) ? 1 : 0)
        .reduce((acc, i) => acc + i, 0 as number)
    ,
    requiredProcesses: 1 + processes.length,
  }


  const getProcessTypeNameFromId = (id: string, alt: string = ""): string => {
    // Try to get the type name from the ware in the case that finishingProcesses.wareFinishingProcessType is not populated (legacy)
    try {
      const ware = manufacturingOrderComponentUtils.getPopulatedWare(props.mo)
      const finishingProcess = (ware?.finishingProcesses.find(p => (p as WareFinishingProcessType)._id === id) as WareFinishingProcessType)
      if (finishingProcess && finishingProcess.name) {
        return finishingProcess.name
      }
      return alt
    }
    catch {
      return alt
    }
  }

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
            <Progress.Root value={os.completedProcesses} max={os.requiredProcesses} flexGrow={1} colorPalette={orderStatus ? OrderStatusAlertColorMap[orderStatus] : "gray"}>
              <HStack gap="5">
                <Progress.Label>Công đoạn</Progress.Label>
                <Progress.Track flex="1">
                  <Progress.Range />
                </Progress.Track>
                <Progress.ValueText>{os.completedProcesses}/{os.requiredProcesses}</Progress.ValueText>
              </HStack>
            </Progress.Root>
            <Button colorPalette={"teal"} onClick={() => setOpen(o => !o)}>Mở rộng <LuChevronsDown transform={open ? "rotate(180)" : "rotate(0)"} /></Button>
          </HStack>
          <Collapsible.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
            <Collapsible.Content>
              <Stack padding="4" borderWidth="1px" gapY={4}>
                <Card.Root size="sm">
                  <Card.Header flexDir={"row"} justifyContent={"space-between"}>
                    <Heading size="md">Quy trình sóng</Heading>
                    <CorrugatorProcessStatusBadge process={props.mo.corrugatorProcess} requiredAmount={cps.requiredAmount} />
                  </Card.Header>
                  <Card.Body color="fg.muted">
                    <Progress.Root value={cps.boundedAmount} max={cps.boundedRequiredAmount} flexGrow={1} colorPalette={CorrugatorProcessProgressColorMap[props.mo.corrugatorProcess.status]}>
                      <HStack gap="10" gapX={10}>
                        <Progress.Label>Số lượng phôi</Progress.Label>
                        <Progress.Track flex="1">
                          <Progress.Range />
                        </Progress.Track>
                        <Progress.ValueText w={"15%"}>{cps.amount}/{cps.requiredAmount} tấm phôi </Progress.ValueText>
                      </HStack>
                    </Progress.Root>
                  </Card.Body>
                </Card.Root>


                {processes.map((proc, procIndex) => {
                  //Individual process stats
                  const ps = {
                    amount: proc.completedAmount,
                    requiredAmount: proc.requiredAmount,
                    boundedAmount: boundNumber(proc.completedAmount, proc.requiredAmount),
                    boundedRequiredAmount: boundNumber(proc.requiredAmount),
                  }

                  return (
                    <Card.Root size="sm" key={proc._id}>
                      <Card.Header flexDir={"row"} justifyContent={"space-between"}>
                        <Heading size="md">
                          {
                            check.string(proc.wareFinishingProcessType) ?
                              getProcessTypeNameFromId(proc.wareFinishingProcessType, `Công đoạn ${procIndex + 1}`)
                              :
                              proc.wareFinishingProcessType.name
                          }
                        </Heading>
                        <OrderfinishingprocessProcessStatusBadge process={proc} />
                      </Card.Header>
                      <Card.Body color="fg.muted">
                        <Progress.Root value={ps.boundedAmount} max={ps.boundedRequiredAmount} flexGrow={1} colorPalette={OrderFinishingProcessProcessProgressColorMap[proc.status]}>
                          <HStack gap="10">
                            <Progress.Label>Số lượng đã hoàn thiện</Progress.Label>
                            <Progress.Track flex="1">
                              <Progress.Range />
                            </Progress.Track>
                            <Progress.ValueText w={"15%"}>{ps.amount}/{ps.requiredAmount} thành phẩm</Progress.ValueText>
                          </HStack>
                        </Progress.Root>
                      </Card.Body>
                    </Card.Root>
                  )
                })}
              </Stack>
            </Collapsible.Content>
          </Collapsible.Root>
        </Stack>
      </Card.Body>
    </Card.Root>
  )
}

