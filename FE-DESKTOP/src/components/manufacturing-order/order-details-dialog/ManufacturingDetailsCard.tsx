"use client"
import { ManufacturingOrder } from "@/types/ManufacturingOrder"
import { Alert, Button, Card, createListCollection, DataList, Heading, HStack, Input, NumberInput, Portal, Select, Stack, Table, Textarea } from "@chakra-ui/react"
import check from "check-types"
import { useMemo, useState } from "react"
import { manufacturingOrderComponentUtils as utils } from "../utils"
import { ManufacturingOrderDirectives } from "@/types/enums/ManufacturingOrderDirectives"
import { formatDateToDDMMYYYY, formatDateTohhmm, formatDateToYYYYMMDD } from "@/utils/dateUtils"
import { CorrugatorLine } from "@/types/enums/CorrugatorLine"
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError"
import { UpdateManyManufacturingOrdersRequestDto } from "@/types/DTO/manufacturing-order/UpdateManyManufacturingOrdersDto"
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem"
import { useUpdateManyManufacturingOrdersMutation } from "@/service/api/manufacturingOrderApiSlice"
import { toaster } from "@/components/ui/toaster"
import { defaultAltHandler, tryGetApiErrorMsg } from "@/utils/tryGetApiErrorMsg"
import { ManufacturingOrderDetailsDialogReducerStore } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent"
import { ManufacturingOrderApprovalStatus } from "@/types/enums/ManufacturingOrderApprovalStatus"
import { ManufacturingOrderOperativeStatus } from "@/types/enums/ManufacturingOrderOperativeStatus"
import { LuCircleCheckBig, LuCircleMinus, LuCircleX, LuPause, LuPlay } from "react-icons/lu"
import ManufacturingOrderDetailsDialogManufacturingDetailsAdditionalDetails from "./ManufacturingDetailsAdditionalDetails"
import { numToFixedBounded } from "@/utils/numToFixedBounded"
import { dateDMYCompare } from "@/utils/dateDMYCompare"
import { Field } from "@/components/ui/field"
import { TIME_INPUT_REGEX } from "@/constants/time-input-regex"

const OrderStatusAlertColorMap: Record<ManufacturingOrderOperativeStatus, string> = {
  NOTSTARTED: "gray",
  RUNNING: "blue",
  PAUSED: "yellow",
  COMPLETED: "green",
  CANCELLED: "red",
}

const OrderStatusStatusSymbolMap: Record<ManufacturingOrderOperativeStatus, React.ReactNode> = {
  NOTSTARTED: <LuCircleMinus />,
  RUNNING: <LuPlay />,
  PAUSED: <LuPause />,
  COMPLETED: <LuCircleCheckBig />,
  CANCELLED: <LuCircleX />,
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

const approvalStatuses: { label: string, value: string }[] = [
  { label: utils.OrderApprovalStatusNameMap[ManufacturingOrderApprovalStatus.Draft], value: ManufacturingOrderApprovalStatus.Draft },
  { label: utils.OrderApprovalStatusNameMap[ManufacturingOrderApprovalStatus.PendingApproval], value: ManufacturingOrderApprovalStatus.PendingApproval },
  { label: utils.OrderApprovalStatusNameMap[ManufacturingOrderApprovalStatus.Approved], value: ManufacturingOrderApprovalStatus.Approved },
]

const approvalStatusCol = createListCollection({
  items: approvalStatuses,
})

export type ManufacturingOrderDetailsDialogManufacturingDetailsCardProps = {
  order: Serialized<ManufacturingOrder>
}

type FormValue = {
  manufacturingDirective: ManufacturingOrderDirectives | null,
  amount?: number,
  manufacturingDateAdjustment: string | null,
  requestedDatetime: string | null,
  approvalStatus: ManufacturingOrderApprovalStatus,
  corrugatorLineAdjustment: CorrugatorLine | null
  note: string,
}

export default function ManufacturingOrderDetailsDialogManufacturingDetailsCard(props: ManufacturingOrderDetailsDialogManufacturingDetailsCardProps) {
  const { useDispatch, useSelector } = ManufacturingOrderDetailsDialogReducerStore;
  const dispatch = useDispatch();
  const allowValueEdit = useSelector(s => s.allowValueEdit)

  const disabled = props.order.approvalStatus !== ManufacturingOrderApprovalStatus.Draft || !allowValueEdit
  const finished = (props.order.operativeStatus === ManufacturingOrderOperativeStatus.COMPLETED) || (props.order.operativeStatus === ManufacturingOrderOperativeStatus.CANCELLED)

  const [updateOrders, { isLoading: updating, error: updateError }] = useUpdateManyManufacturingOrdersMutation();

  const ware = utils.getPopulatedWare(props.order)
  const orderStatus = props.order.operativeStatus

  const initialFormVal = {
    manufacturingDirective: props.order.manufacturingDirective ?? null,
    amount: props.order.amount,
    manufacturingDateAdjustment: props.order.manufacturingDateAdjustment ?? props.order.manufacturingDate,
    requestedDatetime: props.order.requestedDatetime,
    approvalStatus: props.order.approvalStatus,
    corrugatorLineAdjustment: props.order.corrugatorLineAdjustment ?? props.order.corrugatorLine,
    note: props.order.note,
    isEdited: false,
  }

  const [interactFlag, setInteractFlag] = useState(false)
  const [formValue, setFormValue] = useState<FormValue & { isEdited: boolean }>(initialFormVal)
  const setFormValueWrapped = (setFunc: (val: FormValue) => FormValue) => {
    setInteractFlag(true)
    setFormValue(prev => ({ ...(setFunc(prev)), isEdited: true }))
  }

  const setApprovalStatus = (value?: string) => {
    setFormValueWrapped(prev => ({
      ...prev,
      approvalStatus: (check.undefined(value) || !check.in(value, Object.values(ManufacturingOrderApprovalStatus))) ? prev.approvalStatus : (value as ManufacturingOrderApprovalStatus)
    }))
  }

  const setManufacturingDirective = (value?: string) => {
    setFormValueWrapped(prev => ({
      ...prev,
      manufacturingDirective: (check.undefined(value) || !check.in(value, Object.values(ManufacturingOrderDirectives))) ? null : (value as ManufacturingOrderDirectives)
    }))
  }

  const setCorrugatorLine = (value?: string) => {
    setFormValueWrapped(prev => ({
      ...prev,
      corrugatorLineAdjustment: (check.undefined(value) || !check.in(value, Object.values(CorrugatorLine))) ? null : (value as CorrugatorLine)
    }))
  }

  const setAmount = (value: string) => {
    if (value.length < 1) setFormValueWrapped(prev => ({ ...prev, amount: undefined }))
    const val = parseInt(value)
    if (check.number(val) && val > 0) setFormValueWrapped(prev => ({ ...prev, amount: val }))
  }

  const setManufacturingDateAdjustment = (value: string | null) => {
    setFormValueWrapped(prev => ({ ...prev, manufacturingDateAdjustment: (check.greater(value?.length as number, 0)) ? value : null }))
  }

  const setRequestedDatetime = (value: string | null) => {
    setFormValueWrapped(prev => {
      if (value?.match(TIME_INPUT_REGEX)) {
        const rd = new Date(prev.requestedDatetime ?? "-----")
        const mda = new Date(prev.manufacturingDateAdjustment ?? "-----")
        const md = new Date(props.order.manufacturingDate)

        const date =
          (check.string(prev.requestedDatetime) && check.date(rd)) ? rd :
            (check.string(prev.manufacturingDateAdjustment) && check.date(mda)) ? mda :
              (check.string(props.order.manufacturingDate) && check.date(md)) ? md
                : new Date()
        const [hours, minutes, seconds = 0] = value
          .split(":")
          .map(Number);
        date.setHours(hours, minutes, seconds, 0);

        return { ...prev, requestedDatetime: date.toString() }
      }

      return { ...prev, requestedDatetime: (check.greater(value?.length as number, 0)) ? value : null }
    })
  }

  const setNote = (value: string) => {
    setFormValueWrapped(prev => ({ ...prev, note: value }))
  }

  const [showAlert, setAlert] = useState<string | null>(null);

  const amountErr: string | undefined = useMemo(() => {
    if (!interactFlag) return undefined

    if (check.undefined(formValue.amount)) {
      return "Số lượng sản xuất là trường bắt buộc";
    }

    const poiAmount = utils.getPopulatedPoi(props.order).amount
    if (formValue.amount < poiAmount) {
      return `Số lượng sản xuất không được ít hơn số lượng cần sản xuất của đơn hàng (${poiAmount})`;
    }

    return undefined
  }, [interactFlag, formValue.amount, props.order])

  const manufacturingDateErr: string | undefined = useMemo(() => {
    if (!interactFlag) return undefined
    if (check.null(formValue.manufacturingDateAdjustment)) return undefined

    const manufacturingDate = new Date(formValue.manufacturingDateAdjustment)

    if (!check.date(manufacturingDate)) {
      return "Ngày sản xuất không hợp lệ"
    }

    const subPO = utils.getPopulatedSubPo(props.order)
    const compare = dateDMYCompare(manufacturingDate, subPO.deliveryDate)

    if (check.undefined(compare)) {
      return "Không thể so sánh ngày sản xuất với ngày giao đơn hàng, hãy kiểm tra lại dữ liệu"
    }

    if (compare < 0) {
      return `Ngày sản xuất phải trước ngày giao của đơn hàng (${formatDateToDDMMYYYY(subPO.deliveryDate)})`
    }

    return undefined
  }, [interactFlag, formValue.manufacturingDateAdjustment, props.order])

  const requestedDatetimeErr: string | undefined = useMemo(() => {
    if (!interactFlag) return undefined
    if (check.null(formValue.requestedDatetime)) return undefined

    const requestedDatetime = new Date(formValue.requestedDatetime)

    if (!check.date(requestedDatetime)) {
      return "Ngày cần không hợp lệ"
    }

    const subPO = utils.getPopulatedSubPo(props.order)
    const compare = dateDMYCompare(requestedDatetime, subPO.deliveryDate)

    if (check.undefined(compare)) {
      return "Không thể so sánh ngày cần với ngày giao đơn hàng, hãy kiểm tra lại dữ liệu"
    }

    if (compare < 0) {
      return `Ngày cần phải trước ngày giao của đơn hàng (${formatDateToDDMMYYYY(subPO.deliveryDate)})`
    }

    return undefined
  }, [interactFlag, formValue.requestedDatetime, props.order])

  const formErr = !!amountErr || !!manufacturingDateErr || !!requestedDatetimeErr

  const handleSubmit = () => {
    if (!formValue.isEdited) return false

    if (!interactFlag || formErr) {
      setAlert(interactFlag ? "Dữ liệu không hợp lệ" : "Hãy điều chỉnh dữ liệu trước khi lưu")
      setInteractFlag(true)
      return false
    }

    if (check.string(props.order.purchaseOrderItem)) {
      throw new UnpopulatedFieldError("props.order.purchaseOrderItem should have been populated before it reaches here")
    }

    const dto: UpdateManyManufacturingOrdersRequestDto = {
      orders: [{
        id: props.order._id,
        corrugatorLineAdjustment: formValue.corrugatorLineAdjustment,
        manufacturingDirective: formValue.manufacturingDirective,
        amount: formValue.amount,
        note: formValue.note,
        manufacturingDateAdjustment: formValue.manufacturingDateAdjustment,
        requestedDatetime: formValue.requestedDatetime,
        approvalStatus: formValue.approvalStatus,
        purchaseOrderItemId: (props.order.purchaseOrderItem as Serialized<PurchaseOrderItem>)._id,
      }]
    }

    dispatch({ type: "SET_PREPARED_SUBMIT_ASK_TEXT", payload: `Lưu lệnh ${props.order.code}?` })
    dispatch({
      type: "SET_PREPARED_SUBMIT_FUNCTION", payload: () => {
        updateOrders(dto).unwrap().then((res) => {
          if (check.greaterOrEqual(res.data?.patchedAmount as number, 1)) {
            toaster.success({
              description: "Cập nhật lệnh thành công",
            })
            setFormValue(prev => ({ ...prev, isEdited: false }))
            setAlert(null)
          }
          else {
            toaster.warning({
              title: "Cập nhật lệnh không thành công",
            })
          }
        }).catch(error => {
          toaster.error({
            title: "Có lỗi xảy ra trong quá trình cập nhật lệnh",
            description: (error as Error).message,
          })
        })
      }
    })
  }

  const handleReset = () => {
    setFormValue(initialFormVal)
    setInteractFlag(false);
    setAlert(null)
  }

  const parsedFaceLayerPaperWeight = parseFloat(props.order.faceLayerPaperWeight + "")
  const parsedEFlutePaperWeight = parseFloat(props.order.EFlutePaperWeight + "")
  const parsedEBLinerLayerPaperWeight = parseFloat(props.order.EBLinerLayerPaperWeight + "")
  const parsedBFlutePaperWeight = parseFloat(props.order.BFlutePaperWeight + "")
  const parsedBACLinerLayerPaperWeight = parseFloat(props.order.BACLinerLayerPaperWeight + "")
  const parsedACFlutePaperWeight = parseFloat(props.order.ACFlutePaperWeight + "")
  const parsedBackLayerPaperWeight = parseFloat(props.order.backLayerPaperWeight + "")

  const shouldEnableTimeSelector = useMemo(() => {
    // return ((check.string(formValue.requestedDatetime) && check.date(new Date(formValue.requestedDatetime))) ||
    //   (check.string(props.order.requestedDatetime) && check.date(new Date(props.order.requestedDatetime))))
    return check.string(formValue.requestedDatetime) && check.date(new Date(formValue.requestedDatetime))
  }, [formValue.requestedDatetime])

  return (
    <Card.Root size="md">
      <Card.Header>
        <Heading size="md">Chi tiết lệnh</Heading>
      </Card.Header>
      <Card.Body color="fg.muted">
        <HStack alignItems={"stretch"} justifyContent={"space-between"} wrap={"wrap"} gapX={"40px"}>
          <Stack w={"30rem"}>
            <DataList.Root orientation="horizontal" flexGrow={1}>
              <DataList.Item>
                <DataList.ItemLabel color="fg" minW={"30%"} maxW={"50%"}><Heading size={"md"}>Mã lệnh</Heading></DataList.ItemLabel>
                <DataList.ItemValue color="fg.muted" flexGrow={1}>{props.order.code ?? ""}</DataList.ItemValue>
              </DataList.Item>

              <DataList.Item>
                <DataList.ItemLabel color="fg" minW={"30%"} maxW={"50%"}><Heading size={"md"}>Trạng thái chạy</Heading></DataList.ItemLabel>
                <DataList.ItemValue color="fg.muted" flexGrow={1}>
                  {orderStatus && <Alert.Root colorPalette={OrderStatusAlertColorMap[orderStatus]} w="10rem">
                    <Alert.Indicator>
                      {OrderStatusStatusSymbolMap[orderStatus]}
                    </Alert.Indicator>
                    <Alert.Title>{utils.OrderStatusNameMap[orderStatus]}</Alert.Title>
                  </Alert.Root>}
                </DataList.ItemValue>
              </DataList.Item>

              <DataList.Item>
                <DataList.ItemLabel color="fg" minW={"30%"} maxW={"50%"}><Heading size={"md"}>Trạng thái duyệt</Heading></DataList.ItemLabel>
                <DataList.ItemValue color="fg.muted" flexGrow={1}>
                  <Select.Root
                    collection={approvalStatusCol}
                    size="sm"
                    width="320px"
                    value={check.null(formValue.approvalStatus) ? undefined : [formValue.approvalStatus]}
                    onValueChange={(v) => setApprovalStatus(v.value.at(0))}
                    disabled={finished || disabled && props.order.approvalStatus !== ManufacturingOrderApprovalStatus.PendingApproval}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Chọn trạng thái duyệt" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content zIndex={9999}>
                          {approvalStatusCol.items.map((approvalStatus) => (
                            <Select.Item item={approvalStatus} key={approvalStatus.value}>
                              {approvalStatus.label}
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
                <DataList.ItemLabel color="fg" minW={"30%"} maxW={"50%"}><Heading size={"md"}>Kế hoạch giao</Heading></DataList.ItemLabel>
                <DataList.ItemValue color="fg.muted" flexGrow={1}>
                  <Select.Root
                    collection={manufacturingDirectivesCol}
                    size="sm"
                    width="320px"
                    value={check.null(formValue.manufacturingDirective) ? undefined : [formValue.manufacturingDirective]}
                    onValueChange={(v) => setManufacturingDirective(v.value.at(0))}
                    disabled={finished}
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
                <DataList.ItemLabel color="fg" minW={"30%"} maxW={"50%"}><Heading size={"md"}>Dàn sóng</Heading></DataList.ItemLabel>
                <DataList.ItemValue color="fg.muted" flexGrow={1}>
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
                </DataList.ItemValue>
              </DataList.Item>

              <DataList.Item>
                <DataList.ItemLabel color="fg" minW={"30%"} maxW={"50%"}><Heading size={"md"}>Số lượng sản xuất</Heading></DataList.ItemLabel>
                <DataList.ItemValue color="fg.muted" flexGrow={1}>
                  <Field w={"full"} invalid={!!amountErr} errorText={amountErr}>
                    <NumberInput.Root
                      bg={"bg"}
                      value={(formValue.amount ?? "") + ""}
                      onValueChange={(ev) => setAmount(ev.value)}
                      w="full"
                      disabled={finished || disabled}
                    >
                      <NumberInput.Control />
                      <NumberInput.Input />
                    </NumberInput.Root>
                  </Field>

                </DataList.ItemValue>
              </DataList.Item>

              <DataList.Item>
                <DataList.ItemLabel color="fg" minW={"30%"} maxW={"50%"}><Heading size={"md"}>Ngày sản xuất</Heading></DataList.ItemLabel>
                <DataList.ItemValue color="fg.muted" flexGrow={1}>
                  <Field invalid={!!manufacturingDateErr} errorText={manufacturingDateErr}>
                    <Input
                      bg={"bg"}
                      type="date"
                      value={check.null(formValue.manufacturingDateAdjustment) ?
                        formatDateToYYYYMMDD(props.order.manufacturingDate)
                        : formatDateToYYYYMMDD(formValue.manufacturingDateAdjustment)}
                      onChange={(ev) => {
                        return setManufacturingDateAdjustment(ev.target.value)
                      }}
                      disabled={finished || disabled}
                    />
                  </Field>

                </DataList.ItemValue>
              </DataList.Item>

              <DataList.Item>
                <DataList.ItemLabel color="fg" minW={"30%"} maxW={"50%"}><Heading size={"md"}>Ngày cần</Heading></DataList.ItemLabel>
                <DataList.ItemValue color="fg.muted" flexGrow={1}>
                  <Field invalid={!!requestedDatetimeErr} errorText={requestedDatetimeErr}>
                    <HStack w={"full"}>
                      <Input
                        flexGrow={1}
                        bg={"bg"}
                        type="time"
                        value={check.null(formValue.requestedDatetime) ?
                          ""
                          : formatDateTohhmm(formValue.requestedDatetime)}
                        onChange={(ev) => {
                          return setRequestedDatetime(ev.target.value)
                        }}
                        disabled={finished || !shouldEnableTimeSelector}
                      />

                      <Input
                        flexGrow={1}
                        bg={"bg"}
                        type="date"
                        value={check.null(formValue.requestedDatetime) ?
                          ""
                          : formatDateToYYYYMMDD(formValue.requestedDatetime)}
                        onChange={(ev) => {
                          return setRequestedDatetime(ev.target.value)
                        }}
                        disabled={finished}
                      />
                    </HStack>
                  </Field>
                </DataList.ItemValue>
              </DataList.Item>

            </DataList.Root>
            <Stack mt={2}>
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
              <Button variant="outline" onClick={handleReset}>Hủy</Button>
              <Button
                colorPalette={"blue"}
                variant="solid"
                onClick={handleSubmit}
                loading={!!updating}
                disabled={finished || formErr}
              >
                Cập nhật
              </Button>
            </HStack>}

            {(check.string(showAlert) || !!updateError) && (
              <Alert.Root status={"error"}>
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>
                    {showAlert ? showAlert : tryGetApiErrorMsg(updateError, defaultAltHandler)}
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
                      Khối lượng (kg)
                    </Table.Cell>
                    {ware?.faceLayerPaperType && <Table.Cell>
                      {numToFixedBounded(parsedFaceLayerPaperWeight)}
                    </Table.Cell>}
                    {ware?.EFlutePaperType && <Table.Cell>
                      {numToFixedBounded(parsedEFlutePaperWeight)}
                    </Table.Cell>}
                    {ware?.EBLinerLayerPaperType && <Table.Cell>
                      {numToFixedBounded(parsedEBLinerLayerPaperWeight)}
                    </Table.Cell>}
                    {ware?.BFlutePaperType && <Table.Cell>
                      {numToFixedBounded(parsedBFlutePaperWeight)}
                    </Table.Cell>}
                    {ware?.BACLinerLayerPaperType && <Table.Cell>
                      {numToFixedBounded(parsedBACLinerLayerPaperWeight)}
                    </Table.Cell>}
                    {ware?.ACFlutePaperType && <Table.Cell>
                      {numToFixedBounded(parsedACFlutePaperWeight)}
                    </Table.Cell>}
                    {ware?.backLayerPaperType && <Table.Cell>
                      {numToFixedBounded(parsedBackLayerPaperWeight)}
                    </Table.Cell>}
                  </Table.Row>
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>

            <ManufacturingOrderDetailsDialogManufacturingDetailsAdditionalDetails order={props.order} />

          </Stack>
        </HStack>
      </Card.Body>
    </Card.Root>
  )
}
