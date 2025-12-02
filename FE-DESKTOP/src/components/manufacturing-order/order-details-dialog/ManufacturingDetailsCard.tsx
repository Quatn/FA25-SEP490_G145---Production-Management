"use client"
import { ManufacturingOrder } from "@/types/ManufacturingOrder"
import { Alert, Box, Button, Card, createListCollection, DataList, Editable, Heading, HStack, Input, NumberInput, Portal, Select, Stack, Table, TableHeader, Text } from "@chakra-ui/react"
import check from "check-types"
import { useMemo, useState } from "react"
import { manufacturingOrderDetailsDialogUtils as utils } from "./utils"
import { WareFinishingProcessType } from "@/types/WareFinishingProcessType"
import { FluteCombination } from "@/types/FluteCombination"
import { WareManufacturingProcessType } from "@/types/WareManufacturingProcessType"
import { ManufacturingOrderDirectives } from "@/types/enums/ManufacturingOrderDirectives"
import { formatDateToDDMMYYYY, formatDateToYYYYMMDD } from "@/utils/dateUtils"
import { LEGACY_OrderStatus } from "@/types/enums/LEGACY_OrderStatus"
import { CorrugatorLine } from "@/types/enums/CorrugatorLine"
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError"
import { UpdateManyManufacturingOrdersRequestDto } from "@/types/DTO/manufacturing-order/UpdateManyManufacturingOrdersDto"
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem"
import { ManufacturingOrderTableReducerStore } from "@/context/manufacturing-order/manufacturingOrderTableContext"
import { useUpdateManyManufacturingOrdersMutation } from "@/service/api/manufacturingOrderApiSlice"
import { toaster } from "@/components/ui/toaster"
import { tryGetApiErrorMsg } from "@/utils/tryGetApiErrorMsg"

const orderStatusNameMap: Record<LEGACY_OrderStatus, string> = {
  NOTSTARTED: "Chưa bắt đầu",
  RUNNING: "Đang chạy",
  COMPLETED: "Đã hoàn thành",
  OVERCOMPLETED: "Đã hoàn thành",
  PAUSED: "Tạm dừng",
  CANCELLED: "Đã hủy",
}

const manufacturingDirectives: { label: string, value: string }[] = [
  { label: "Hủy", value: ManufacturingOrderDirectives.Cancel },
  { label: "Tạm dừng", value: ManufacturingOrderDirectives.Pause },
  { label: "Bắt buộc", value: ManufacturingOrderDirectives.Mandatory },
  { label: "Bù lệnh", value: ManufacturingOrderDirectives.Compensate },
]

const manufacturingDirectivesCol = createListCollection({
  items: manufacturingDirectives,
})

const corrugatorLines: { label: string, value: string }[] = [
  { label: "Dàn 5", value: CorrugatorLine.L5 },
  { label: "Dàn 7", value: CorrugatorLine.L7 },
]

const corrugatorLinesCol = createListCollection({
  items: corrugatorLines,
})

export type ManufacturingOrderDetailsDialogManufacturingDetailsCardProps = {
  order: Serialized<ManufacturingOrder>
}

type FormValue = {
  manufacturingDirective: ManufacturingOrderDirectives | null,
  amount?: number,
  manufacturingDateAdjustment: string | null,
  requestedDatetime: string | null,
  note: string,
}

export default function ManufacturingOrderDetailsDialogManufacturingDetailsCard(props: ManufacturingOrderDetailsDialogManufacturingDetailsCardProps) {
  const { useDispatch } = ManufacturingOrderTableReducerStore;
  const dispatch = useDispatch();
  const [updateOrders, { isLoading: updating, error: updateError }] = useUpdateManyManufacturingOrdersMutation();

  const ware = utils.getPopulatedWare(props.order)

  const initialFormVal = {
    manufacturingDirective: props.order.manufacturingDirective ?? null,
    amount: props.order.amount,
    manufacturingDateAdjustment: props.order.manufacturingDateAdjustment,
    requestedDatetime: props.order.requestedDatetime,
    note: props.order.note,
    isEdited: false,
  }

  const [formValue, setFormValue] = useState<FormValue & { isEdited: boolean }>(initialFormVal)
  const setFormValueWrapped = (setFunc: (val: FormValue) => FormValue) => setFormValue(prev => ({ ...(setFunc(prev)), isEdited: true }))

  const setManufacturingDirective = (value?: string) => {
    setFormValueWrapped(prev => ({
      ...prev,
      manufacturingDirective: (check.undefined(value) || !check.in(value, Object.values(ManufacturingOrderDirectives))) ? null : (value as ManufacturingOrderDirectives)
    }))
  }

  const setAmount = (value: string) => {
    if (value.length < 1) setFormValueWrapped(prev => ({ ...prev, amount: undefined }))
    const val = parseInt(value)
    if (check.number(val)) setFormValueWrapped(prev => ({ ...prev, amount: val }))
  }

  const setManufacturingDateAdjustment = (value: string | null) => {
    setFormValueWrapped(prev => ({ ...prev, manufacturingDateAdjustment: (check.greater(value?.length as number, 0)) ? value : null }))
  }

  const setRequestedDatetime = (value: string | null) => {
    setFormValueWrapped(prev => ({ ...prev, requestedDatetime: (check.greater(value?.length as number, 0)) ? value : null }))
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
        corrugatorLineAdjustment: props.order.corrugatorLineAdjustment,
        manufacturingDirective: formValue.manufacturingDirective,
        amount: formValue.amount,
        note: formValue.note,
        manufacturingDateAdjustment: formValue.manufacturingDateAdjustment,
        requestedDatetime: formValue.requestedDatetime,
        purchaseOrderItemId: (props.order.purchaseOrderItem as Serialized<PurchaseOrderItem>)._id,
      }]
    }

    dispatch({ type: "SET_PREPARED_SUBMIT_ASK_TEXT", payload: `Lưu lệnh ${props.order.code}?` })
    dispatch({
      type: "SET_PREPARED_SUBMIT_FUNCTION", payload: () => {
        updateOrders(dto).unwrap().then((res) => {
          if (check.greaterOrEqual(res.data?.patchedAmount as number, 1)) {
            toaster.success({
              title: "Success",
              description: "Updated order successfully",
            })
            setFormValue(prev => ({ ...prev, isEdited: false }))
          }
          else {
            toaster.warning({
              title: "Order not updated",
            })
          }
        }).catch(error => {
          toaster.warning({
            title: "Error updating order",
            description: (error as Error).message,
          })
        })
      }
    })
  }

  return (
    <Card.Root size="md">
      <Card.Header>
        <Heading size="md">Chi tiết lệnh</Heading>
      </Card.Header>
      <Card.Body color="fg.muted">
        <HStack alignItems={"stretch"} justifyContent={"space-between"} wrap={"wrap"} gapX={"40px"}>
          <Stack minW={"400px"}>
            <DataList.Root orientation="horizontal" flexGrow={1}>
              <DataList.Item>
                <DataList.ItemLabel color="fg" minW={"30%"} maxW={"50%"}><Heading size={"md"}>Mã lệnh</Heading></DataList.ItemLabel>
                <DataList.ItemValue color="fg.muted" flexGrow={1}>{props.order.code ?? ""}</DataList.ItemValue>
              </DataList.Item>

              <DataList.Item>
                <DataList.ItemLabel color="fg" minW={"30%"} maxW={"50%"}><Heading size={"md"}>Kế hoạch giao</Heading></DataList.ItemLabel>
                <DataList.ItemValue color="fg.muted" flexGrow={1}>
                  <Select.Root
                    collection={manufacturingDirectivesCol}
                    size="sm"
                    width="320px"
                    value={check.null(formValue.manufacturingDirective) ? undefined : [formValue.manufacturingDirective]}
                    onValueChange={(v) => setManufacturingDirective(v.value.at(0))}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Chọn kế hoạch giao" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.ClearTrigger />
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content zIndex={9999}>
                          {manufacturingDirectivesCol.items.map((directive) => (
                            <Select.Item item={directive} key={directive.value}>
                              {directive.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </DataList.ItemValue>
              </DataList.Item>

              <DataList.Item>
                <DataList.ItemLabel color="fg" minW={"30%"} maxW={"50%"}><Heading size={"md"}>Số lượng sản xuất</Heading></DataList.ItemLabel>
                <DataList.ItemValue color="fg.muted" flexGrow={1}>
                  <NumberInput.Root
                    bg={"bg"}
                    value={formValue.amount + ""}
                    onValueChange={(ev) => setAmount(ev.value)}
                    w="full"
                  >
                    <NumberInput.Control />
                    <NumberInput.Input />
                  </NumberInput.Root>

                </DataList.ItemValue>
              </DataList.Item>

              <DataList.Item>
                <DataList.ItemLabel color="fg" minW={"30%"} maxW={"50%"}><Heading size={"md"}>Ngày sản xuất</Heading></DataList.ItemLabel>
                <DataList.ItemValue color="fg.muted" flexGrow={1}>
                  <Input
                    bg={"bg"}
                    type="date"
                    value={check.null(formValue.manufacturingDateAdjustment) ?
                      formatDateToYYYYMMDD(props.order.manufacturingDate)
                      : formatDateToYYYYMMDD(formValue.manufacturingDateAdjustment)}
                    onChange={(ev) => {
                      return setManufacturingDateAdjustment(ev.target.value)
                    }}
                  />
                </DataList.ItemValue>
              </DataList.Item>

              <DataList.Item>
                <DataList.ItemLabel color="fg" minW={"30%"} maxW={"50%"}><Heading size={"md"}>Ngày cần</Heading></DataList.ItemLabel>
                <DataList.ItemValue color="fg.muted" flexGrow={1}>
                  <Input
                    bg={"bg"}
                    type="date"
                    value={check.null(formValue.requestedDatetime) ?
                      formatDateToYYYYMMDD(props.order.requestedDatetime)
                      : formatDateToYYYYMMDD(formValue.requestedDatetime)}
                    onChange={(ev) => {
                      return setRequestedDatetime(ev.target.value)
                    }}
                  />
                </DataList.ItemValue>

              </DataList.Item>

              <DataList.Item>
                <DataList.ItemLabel color="fg" minW={"30%"} maxW={"50%"}><Heading size={"md"}>Trạng thái chạy</Heading></DataList.ItemLabel>
                <DataList.ItemValue color="fg.muted" flexGrow={1}>{orderStatusNameMap[props.order.overallStatus]}</DataList.ItemValue>
              </DataList.Item>
            </DataList.Root>
            <Stack mt={2}>
              <Heading size="lg">Ghi chú</Heading>
              <Editable.Root bg={"bg.muted"} value={formValue.note} placeholder={"Nhấn để nhập"} onValueChange={(v) => setNote(v.value)}>
                <Editable.Preview />
                <Editable.Input />
              </Editable.Root>
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
                Confirm
              </Button>
            </HStack>}

            {updateError && (
              <Alert.Root status={"error"}>
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Failed to login</Alert.Title>
                  <Alert.Description>
                    {tryGetApiErrorMsg(updateError)}
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}

          </Stack>
          <Stack overflowX={"hidden"} flexGrow={1}>
            <Table.ScrollArea overflowX={"auto"}>
              <Table.Root showColumnBorder>
                <Table.Header>
                  <Table.Row >
                    <Table.ColumnHeader colSpan={8} colorPalette={"blue"} bg={"colorPalette.solid"} color={"colorPalette.contrast"} textAlign={"center"}>
                      Định lượng
                    </Table.ColumnHeader>
                  </Table.Row>
                  <Table.Row colorPalette={"blue"}>
                    <Table.ColumnHeader colorPalette={"green"} bg={"colorPalette.emphasized"}>
                      Lớp
                    </Table.ColumnHeader>
                    {ware?.faceLayerPaperType && <Table.ColumnHeader bg={"colorPalette.emphasized"}>
                      Mặt
                    </Table.ColumnHeader>}
                    {ware?.EFlutePaperType && <Table.ColumnHeader bg={"colorPalette.emphasized"}>
                      Sóng E
                    </Table.ColumnHeader>}
                    {ware?.EBLinerLayerPaperType && <Table.ColumnHeader bg={"colorPalette.emphasized"}>
                      Lớp giữa
                    </Table.ColumnHeader>}
                    {ware?.BFlutePaperType && <Table.ColumnHeader bg={"colorPalette.emphasized"}>
                      Sóng B
                    </Table.ColumnHeader>}
                    {ware?.BACLinerLayerPaperType && <Table.ColumnHeader bg={"colorPalette.emphasized"}>
                      Lớp giữa
                    </Table.ColumnHeader>}
                    {ware?.ACFlutePaperType && <Table.ColumnHeader bg={"colorPalette.emphasized"}>
                      Sóng A
                    </Table.ColumnHeader>}
                    {ware?.backLayerPaperType && <Table.ColumnHeader bg={"colorPalette.emphasized"}>
                      Đáy
                    </Table.ColumnHeader>}
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  <Table.Row>
                    <Table.Cell colorPalette={"green"} bg={"colorPalette.muted"}>
                      Loại giấy
                    </Table.Cell>
                    {ware?.faceLayerPaperType && <Table.Cell>
                      {ware?.faceLayerPaperType}
                    </Table.Cell>}
                    {ware?.EFlutePaperType && <Table.Cell>
                      {ware?.EFlutePaperType}
                    </Table.Cell>}
                    {ware?.EBLinerLayerPaperType && <Table.Cell>
                      {ware?.EBLinerLayerPaperType}
                    </Table.Cell>}
                    {ware?.BFlutePaperType && <Table.Cell>
                      {ware?.BFlutePaperType}
                    </Table.Cell>}
                    {ware?.BACLinerLayerPaperType && <Table.Cell>
                      {ware?.BACLinerLayerPaperType}
                    </Table.Cell>}
                    {ware?.ACFlutePaperType && <Table.Cell>
                      {ware?.ACFlutePaperType}
                    </Table.Cell>}
                    {ware?.backLayerPaperType && <Table.Cell>
                      {ware?.backLayerPaperType}
                    </Table.Cell>}
                  </Table.Row>

                  <Table.Row>
                    <Table.Cell colorPalette={"green"} bg={"colorPalette.muted"}>
                      Khối lượng
                    </Table.Cell>
                    {ware?.faceLayerPaperType && <Table.Cell>
                      {props.order.faceLayerPaperWeight}
                    </Table.Cell>}
                    {ware?.EFlutePaperType && <Table.Cell>
                      {props.order.EFlutePaperWeight}
                    </Table.Cell>}
                    {ware?.EBLinerLayerPaperType && <Table.Cell>
                      {props.order.EBLinerLayerPaperWeight}
                    </Table.Cell>}
                    {ware?.BFlutePaperType && <Table.Cell>
                      {props.order.BFlutePaperWeight}
                    </Table.Cell>}
                    {ware?.BACLinerLayerPaperType && <Table.Cell>
                      {props.order.BACLinerLayerPaperWeight}
                    </Table.Cell>}
                    {ware?.ACFlutePaperType && <Table.Cell>
                      {props.order.ACFlutePaperWeight}
                    </Table.Cell>}
                    {ware?.backLayerPaperType && <Table.Cell>
                      {props.order.backLayerPaperWeight}
                    </Table.Cell>}
                  </Table.Row>
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>

          </Stack>
        </HStack>
        <HStack>
          {props.order.corrugatorProcess.note}
        </HStack>
      </Card.Body>
    </Card.Root>
  )
}
