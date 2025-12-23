"use client"
import { ManufacturingOrder } from "@/types/ManufacturingOrder"
import { Alert, Button, Card, createListCollection, DataList, Editable, Heading, HStack, Menu, NumberInput, Portal, Select, Stack, Textarea } from "@chakra-ui/react"
import check from "check-types"
import { useMemo, useState } from "react"
import { manufacturingOrderComponentUtils as utils } from "../utils"
import Link from "next/link"
import { CorrugatorProcessStatus } from "@/types/enums/CorrugatorProcessStatus"
import { LuCircleCheckBig, LuCircleMinus, LuCircleX, LuPause, LuPlay } from "react-icons/lu"
import { ManufacturingOrderDetailsDialogReducerStore } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent"
import { useUpdateManyManufacturingOrdersMutation } from "@/service/api/manufacturingOrderApiSlice"
import { CorrugatorLine } from "@/types/enums/CorrugatorLine"
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError"
import { UpdateManyManufacturingOrdersRequestDto } from "@/types/DTO/manufacturing-order/UpdateManyManufacturingOrdersDto"
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem"
import { toaster } from "@/components/ui/toaster"
import { ManufacturingOrderApprovalStatus } from "@/types/enums/ManufacturingOrderApprovalStatus"
import { ManufacturingOrderOperativeStatus } from "@/types/enums/ManufacturingOrderOperativeStatus"
import { URLMatch } from "@/components/layout/URLMatch"

const corrugatorLines: { label: string, value: string }[] = [
  { label: "Dàn 5", value: CorrugatorLine.L5 },
  { label: "Dàn 7", value: CorrugatorLine.L7 },
]

const corrugatorLinesCol = createListCollection({
  items: corrugatorLines,
})


const CorrugatorProcessProgressNameMap: Record<CorrugatorProcessStatus, string> = {
  NOTSTARTED: "Chưa bắt đầu",
  RUNNING: "Đang chạy",
  PAUSED: "Tạm dừng",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Hủy",
  OVERCOMPLETED: "Thừa",
}

const CorrugatorProcessProgressColorMap: Record<CorrugatorProcessStatus, string> = {
  NOTSTARTED: "gray",
  RUNNING: "blue",
  PAUSED: "yellow",
  COMPLETED: "green",
  CANCELLED: "red",
  OVERCOMPLETED: "teal",
}

const CorrugatorProcessProgressSymbolMap: Record<CorrugatorProcessStatus, React.ReactNode> = {
  NOTSTARTED: <LuCircleMinus />,
  RUNNING: <LuPlay />,
  PAUSED: <LuPause />,
  COMPLETED: <LuCircleCheckBig />,
  CANCELLED: <LuCircleX />,
  OVERCOMPLETED: <LuCircleCheckBig />,
}

export type ManufacturingOrderDetailsDialogCorrugatorProcessDetailsCardProps = {
  order: Serialized<ManufacturingOrder>
}

type FormValue = {
  manufacturedAmount?: number,
  status: CorrugatorProcessStatus,
  corrugatorLineAdjustment: CorrugatorLine | null
  note: string,
}

export default function ManufacturingOrderDetailsDialogCorrugatorProcessDetailsCard(props: ManufacturingOrderDetailsDialogCorrugatorProcessDetailsCardProps) {
  const po = utils.getPopulatedPo(props.order)
  const disabled = props.order.approvalStatus !== ManufacturingOrderApprovalStatus.Draft
  const finished = (props.order.operativeStatus === ManufacturingOrderOperativeStatus.COMPLETED) || (props.order.operativeStatus === ManufacturingOrderOperativeStatus.CANCELLED)

  const stats: { label: string, value: string }[] = useMemo(() => {
    if (check.null(props.order)) return []

    return [
      { label: "Số lượng cần sản xuất", value: (props.order.numberOfBlanks ?? 0) + "" },
      { label: "Số lượng đã sản xuất", value: (props.order.corrugatorProcess.manufacturedAmount ?? 0) + "" },
      { label: "Khổ giấy thực", value: (props.order.corrugatorProcess.actualPaperWidth ?? 0) + "" },
      { label: "Mét dài thực", value: (props.order.corrugatorProcess.actualRunningLength ?? 0) + "" },
    ]
  }, [props.order])


  const { useDispatch } = ManufacturingOrderDetailsDialogReducerStore;
  const dispatch = useDispatch();
  const [updateOrders, { isLoading: updating, error: updateError }] = useUpdateManyManufacturingOrdersMutation();

  const initialFormVal: FormValue & { isEdited: boolean } = {
    manufacturedAmount: props.order.corrugatorProcess.manufacturedAmount,
    status: props.order.corrugatorProcess.status,
    corrugatorLineAdjustment: props.order.corrugatorLineAdjustment ?? props.order.corrugatorLine,
    note: props.order.corrugatorProcess.note,
    isEdited: false,
  }

  const [formValue, setFormValue] = useState<FormValue & { isEdited: boolean }>(initialFormVal)
  const setFormValueWrapped = (setFunc: (val: FormValue) => FormValue) => setFormValue(prev => ({ ...(setFunc(prev)), isEdited: true }))

  const setStatus = (value?: string) => {
    setFormValueWrapped(prev => ({
      ...prev,
      status: (check.undefined(value) || !check.in(value, Object.values(CorrugatorProcessStatus))) ? prev.status : (value as CorrugatorProcessStatus)
    }))
  }

  const setCorrugatorLine = (value?: string) => {
    setFormValueWrapped(prev => ({
      ...prev,
      corrugatorLineAdjustment: (check.undefined(value) || !check.in(value, Object.values(CorrugatorLine))) ? null : (value as CorrugatorLine)
    }))
  }

  const setManufacturedAmount = (value: string) => {
    if (value.length < 1) setFormValueWrapped(prev => ({ ...prev, manufacturedAmount: undefined }))
    const val = parseInt(value)
    if (check.number(val)) setFormValueWrapped(prev => ({ ...prev, manufacturedAmount: val }))
  }

  const setNote = (value: string) => {
    setFormValueWrapped(prev => ({ ...prev, note: value }))
  }

  const handleSubmit = () => {
    if (!formValue.isEdited) return false

    if (check.string(props.order.purchaseOrderItem)) {
      throw new UnpopulatedFieldError("props.order.purchaseOrderItem should have been populated before it reaches here")
    }

    const dto: UpdateManyManufacturingOrdersRequestDto = {
      orders: [{
        id: props.order._id,
        corrugatorLineAdjustment: formValue.corrugatorLineAdjustment,
        corrugatorProcess: {
          manufacturedAmount: formValue.manufacturedAmount,
          status: formValue.status,
          note: formValue.note,
        },
        purchaseOrderItemId: (props.order.purchaseOrderItem as Serialized<PurchaseOrderItem>)._id,
      }]
    }

    const warnStatusChange = !check.undefined(dto.orders.at(0)?.corrugatorProcess?.status)
      && check.equal(dto.orders.at(0)?.corrugatorProcess?.status, props.order.corrugatorProcess.status)
      && check.number(dto.orders.at(0)?.corrugatorProcess?.manufacturedAmount)
      && check.greater(dto.orders.at(0)?.corrugatorProcess?.manufacturedAmount as number, props.order.corrugatorProcess.manufacturedAmount)

    dispatch({
      type: "SET_PREPARED_SUBMIT_ASK_TEXT",
      payload: `Lưu Quy trình sóng cho lệnh ${props.order.code}?${warnStatusChange ? " Tăng số phôi đã sản xuất lên sẽ khiến lệnh tự cập nhật trạng thái sang đang chạy." : ""}`
    });
    dispatch({
      type: "SET_PREPARED_SUBMIT_FUNCTION", payload: () => {
        updateOrders(dto).unwrap().then((res) => {
          if (check.greaterOrEqual(res.data?.patchedAmount as number, 1)) {
            toaster.success({
              title: "Cập nhật quy trình sóng thành công",
            })
            setFormValue(prev => ({ ...prev, isEdited: false }))
          }
          else {
            toaster.warning({
              title: "Không cập nhật được quy trình sóng",
            })
          }
        }).catch(() => {
          toaster.error({
            title: "Có lỗi xảy ra trong quá trình cập nhật quy trình sóng",
            // description: (error as Error).message,
          })
        })
      }
    })
  }


  return (
    <Card.Root size="md" h="full">
      <Card.Header>
        <HStack justifyContent={"space-between"}>
          <Heading size="md">Quy trình sóng</Heading>
          <URLMatch path="/manufacturing-order/corrugator-process-operate" notMatched={
            <Link href={`/manufacturing-order/corrugator-process-operate${check.string(props.order?._id) ? "?id=" + props.order._id : ""}`}>
              <Button colorPalette={"blue"} size="xs">Thao tác</Button>
            </Link>
          } />
        </HStack>
      </Card.Header>

      <Card.Body justifyContent={"space-between"} gap={8}>
        <HStack gap={20}>
          {/*
          <Menu.Root>
            <Menu.Trigger asChild>
              <Alert.Root cursor={"pointer"} colorPalette={CorrugatorProcessProgressColorMap[props.order.corrugatorProcess.status]} w="10rem">
                <Alert.Indicator>
                  {CorrugatorProcessProgressSymbolMap[props.order.corrugatorProcess.status]}
                </Alert.Indicator>
                <Alert.Title>{CorrugatorProcessProgressNameMap[props.order.corrugatorProcess.status]}</Alert.Title>
              </Alert.Root>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content zIndex={9999}>
                  <Menu.Item value="new-txt">New Text File</Menu.Item>
                  <Menu.Item value="new-file">New File...</Menu.Item>
                  <Menu.Item value="new-win">New Window</Menu.Item>
                  <Menu.Item value="open-file">Open File...</Menu.Item>
                  <Menu.Item value="export">Export</Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
          */}
          <Alert.Root colorPalette={CorrugatorProcessProgressColorMap[props.order.corrugatorProcess.status]} w="10rem">
            <Alert.Indicator>
              {CorrugatorProcessProgressSymbolMap[props.order.corrugatorProcess.status]}
            </Alert.Indicator>
            <Alert.Title>{CorrugatorProcessProgressNameMap[props.order.corrugatorProcess.status]}</Alert.Title>
          </Alert.Root>

          <Stack>
            <Heading size={"xs"}>Dàn sóng</Heading>
            <Select.Root
              collection={corrugatorLinesCol}
              size="sm"
              width="320px"
              value={check.null(formValue.corrugatorLineAdjustment) ? undefined : [formValue.corrugatorLineAdjustment]}
              onValueChange={(v) => setCorrugatorLine(v.value.at(0))}
              disabled={finished || disabled}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Chọn dàn sóng" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content zIndex={9999}>
                    {corrugatorLinesCol.items.map((line) => (
                      <Select.Item item={line} key={line.value}>
                        {line.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Stack>


          {/*<Stack>
            <Heading size={"xs"}>Số tấm đã sản xuất {formValue.manufacturedAmount}</Heading>
            <NumberInput.Root
              bg={"bg"}
              value={formValue.manufacturedAmount + ""}
              onValueChange={(ev) => setManufacturedAmount(ev.value)}
            >
              <NumberInput.Control />
              <NumberInput.Input />
            </NumberInput.Root>
          </Stack>
            */}
        </HStack>

        <DataList.Root orientation="horizontal">
          {stats.map((item) => (
            <DataList.Item key={item.label}>
              <DataList.ItemLabel color="fg" minW={"30%"} maxW={"50%"}><Heading size={"md"}>{item.label}</Heading></DataList.ItemLabel>
              <DataList.ItemValue color="fg.muted" flexGrow={1}>{item.value}</DataList.ItemValue>
            </DataList.Item>
          ))}
        </DataList.Root>
        <Stack mt={5}>
          <Heading size="lg">Ghi chú</Heading>
          <Textarea
            variant="subtle"
            value={formValue.note}
            placeholder={finished ? "" : "Nhấn để nhập"}
            onChange={(v) => setNote(v.target.value)}
            readOnly={finished}
          />
        </Stack>

        {formValue.isEdited && <HStack>
          <Button variant="outline" onClick={() => setFormValue(initialFormVal)}>Hủy</Button>
          <Button
            colorPalette={"blue"}
            variant="solid"
            onClick={handleSubmit}
            loading={!!updating}
            disabled={!!updateError}
          >
            Cập nhật
          </Button>
        </HStack>}

      </Card.Body>
    </Card.Root>
  )
}
