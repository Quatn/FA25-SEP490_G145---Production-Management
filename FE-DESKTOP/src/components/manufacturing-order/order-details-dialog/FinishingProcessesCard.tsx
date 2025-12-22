import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError"
import { ManufacturingOrder } from "@/types/ManufacturingOrder"
import { Alert, Button, Card, Editable, Heading, HStack, Table } from "@chakra-ui/react"
import check from "check-types"
import Link from "next/link"
import { useMemo, useState } from "react"
import { manufacturingOrderComponentUtils } from "../utils"
import { WareFinishingProcessType } from "@/types/WareFinishingProcessType"
import { formatDateTohhmmDDMMYYYY } from "@/utils/dateUtils"
import OrderfinishingprocessProcessStatusBadge from "../common/OrderFinishingProcessStatusBadge"
import { useUpdateOrderFinishingProcessMutation } from "@/service/api/orderFinishingProcessApiSlice"
import { defaultAltHandler, tryGetApiErrorMsg } from "@/utils/tryGetApiErrorMsg"
import { ManufacturingOrderDetailsDialogReducerStore } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent"
import { toaster } from "@/components/ui/toaster"
import { URLMatch } from "@/components/layout/URLMatch"
import DataEmpty from "@/components/common/DataEmpty"
import { ManufacturingOrderApprovalStatus } from "@/types/enums/ManufacturingOrderApprovalStatus"
import { ManufacturingOrderOperativeStatus } from "@/types/enums/ManufacturingOrderOperativeStatus"

export type ManufacturingOrderDetailsDialogFinishingProcessDetailsCardProps = {
  order: Serialized<ManufacturingOrder>
}

export default function ManufacturingOrderDetailsDialogFinishingProcessDetailsCard(props: ManufacturingOrderDetailsDialogFinishingProcessDetailsCardProps) {
  // const disabled = props.order.approvalStatus !== ManufacturingOrderApprovalStatus.Draft
  const finished = (props.order.operativeStatus === ManufacturingOrderOperativeStatus.COMPLETED) || (props.order.operativeStatus === ManufacturingOrderOperativeStatus.CANCELLED)

  const [interactFlag, setInteractFlag] = useState(false)
  const [showAlert, setAlert] = useState<string | null>(null);
  const { useDispatch } = ManufacturingOrderDetailsDialogReducerStore;
  const dispatch = useDispatch();

  const initialFormVal = useMemo(() => props.order.finishingProcesses?.map(process => {
    if (check.string(process)) {
      throw new UnpopulatedFieldError("props.order.finishingProcesses should have been populated before it reaches here")
    }

    return {
      ...process,
      isEdited: false,
    }
  })
    , [props])

  const [processes, setProcesses] = useState(initialFormVal)

  const setNote = (value: string, index: number) => {
    setInteractFlag(true)
    setProcesses(
      prev => {
        if (check.undefined(prev)) return undefined
        return [...(prev.map((p, i) => {
          if (index == i) return { ...p, note: value, isEdited: true }
          return p
        }))]
      }
    )
  }

  const isEdited = processes?.some(p => p.isEdited) ?? false

  const [updateOne, { isLoading: updating, error: updateError }] = useUpdateOrderFinishingProcessMutation();

  const handleSubmit = () => {
    if (!processes?.some(fp => fp.isEdited)) return false

    if (!interactFlag) {
      setAlert(interactFlag ? "Dữ liệu không hợp lệ" : "Hãy điều chỉnh dữ liệu trước khi lưu")
      setInteractFlag(true)
      return false
    }

    const edited = processes.filter(fp => fp.isEdited)

    const dtos = edited.map((fp) => {
      return {
        id: fp._id,
        data: {
          note: fp.note
        },
        code: fp.code
      }
    })

    dispatch({ type: "SET_PREPARED_SUBMIT_ASK_TEXT", payload: `Lưu ${dtos.length} quy trình lệnh?` })
    dispatch({
      type: "SET_PREPARED_SUBMIT_FUNCTION", payload: () => {
        let updateAcc = 0
        dtos.forEach((dto) => {
          updateOne(dto).then(() => {
            updateAcc += 1
          }).catch(() => {
            toaster.success({
              description: `Không thể cập nhật quy trình lệnh ${dto.code}`,
            })
          })
        })

        if (updateAcc >= dtos.length) {
          toaster.success({
            description: "Cập nhật tất cả quy trình lệnh thành công",
          })
        }

        setProcesses(prev => prev?.map(p => ({ ...p, isEdited: false })))
        setAlert(null)
      }
    })
  }

  const handleReset = () => {
    setProcesses(initialFormVal)
    setInteractFlag(false);
    setAlert(null)
  }

  return (
    <Card.Root size="md" h="full">
      <Card.Header>
        <HStack justifyContent={"space-between"}>
          <Heading size="md">Quy trình sóng</Heading>
          <URLMatch path="/order-finishing-process" notMatched={
            <Link href={`/order-finishing-process${check.string(props.order?._id) ? "?id=" + props.order._id : ""}`}>
              <Button colorPalette={"blue"} size="xs">Thao tác</Button>
            </Link>
          } />

        </HStack>
      </Card.Header>

      <Card.Body justifyContent={"space-between"} gap={8}>
        {(!processes || (processes?.length <= 0)) &&
          <DataEmpty h={"full"} flexGrow={1} text={props.order.approvalStatus !== ManufacturingOrderApprovalStatus.Approved ? "Lệnh chưa được duyệt" : "Lệnh không có quy trình sóng"} />
        }

        {(!!processes && (processes?.length > 0)) &&
          <Table.ScrollArea overflowX={"auto"}>
            <Table.Root showColumnBorder>
              <Table.Header>
                <Table.Row colorPalette={"blue"}>
                  <Table.ColumnHeader bg={"colorPalette.emphasized"}>
                    Số thứ tự
                  </Table.ColumnHeader>
                  <Table.ColumnHeader bg={"colorPalette.emphasized"}>
                    Loại gia công
                  </Table.ColumnHeader>
                  <Table.ColumnHeader bg={"colorPalette.emphasized"}>
                    Số lượng cần làm
                  </Table.ColumnHeader>
                  <Table.ColumnHeader bg={"colorPalette.emphasized"}>
                    Số lượng đã hoàn thành
                  </Table.ColumnHeader>
                  <Table.ColumnHeader bg={"colorPalette.emphasized"}>
                    Trạng thái
                  </Table.ColumnHeader>
                  <Table.ColumnHeader bg={"colorPalette.emphasized"}>
                    Thời gian bắt đầu
                  </Table.ColumnHeader>
                  <Table.ColumnHeader bg={"colorPalette.emphasized"}>
                    Thời gian hoàn thành
                  </Table.ColumnHeader>
                  <Table.ColumnHeader bg={"colorPalette.emphasized"}>
                    Ghi chú
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {processes.map((process, index) => (
                  <Table.Row key={process._id}>
                    <Table.Cell>
                      {process.sequenceNumber}
                    </Table.Cell>
                    <Table.Cell>
                      {
                        check.string(process.wareFinishingProcessType) ?
                          ((manufacturingOrderComponentUtils.getPopulatedWare(props.order)?.finishingProcesses.find(p => (p as WareFinishingProcessType)._id === (process.wareFinishingProcessType as unknown as string))) as WareFinishingProcessType).name
                          :
                          process.wareFinishingProcessType.name
                      }
                    </Table.Cell>
                    <Table.Cell>
                      {process.requiredAmount}
                    </Table.Cell>
                    <Table.Cell>
                      {process.completedAmount}
                    </Table.Cell>
                    <Table.Cell>
                      <OrderfinishingprocessProcessStatusBadge process={process} />
                    </Table.Cell>
                    <Table.Cell>
                      {formatDateTohhmmDDMMYYYY(process.startedAt)}
                    </Table.Cell>
                    <Table.Cell>
                      {formatDateTohhmmDDMMYYYY(process.completedAt)}
                    </Table.Cell>
                    <Table.Cell>
                      <Editable.Root readOnly={finished} bg={"bg.muted"} value={process.note} placeholder={finished? "" : "Nhấn để nhập"} onValueChange={(v) => setNote(v.value, index)} overflowX={"hidden"}>
                        <Editable.Preview w={"full"} maxW={"10rem"} />
                        <Editable.Input />
                      </Editable.Root>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        }


        {isEdited && <HStack>
          <Button variant="outline" onClick={handleReset}>Hủy</Button>
          <Button
            colorPalette={"blue"}
            variant="solid"
            onClick={handleSubmit}
            loading={!!updating}
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

      </Card.Body>
    </Card.Root>

  )
}
