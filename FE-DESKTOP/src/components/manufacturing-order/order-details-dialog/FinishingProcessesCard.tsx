import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError"
import { ManufacturingOrder } from "@/types/ManufacturingOrder"
import { Button, Card, Editable, Heading, HStack, Table } from "@chakra-ui/react"
import check from "check-types"
import Link from "next/link"
import { useMemo, useState } from "react"
import { manufacturingOrderComponentUtils } from "../utils"
import { WareFinishingProcessType } from "@/types/WareFinishingProcessType"
import { formatDateToDDMMYYYY, formatDateTommhhDDMMYYYY } from "@/utils/dateUtils"

export type ManufacturingOrderDetailsDialogFinishingProcessDetailsCardProps = {
  order: Serialized<ManufacturingOrder>
}

export default function ManufacturingOrderDetailsDialogFinishingProcessDetailsCard(props: ManufacturingOrderDetailsDialogFinishingProcessDetailsCardProps) {
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

  return (
    <Card.Root size="md" h="full">
      <Card.Header>
        <HStack justifyContent={"space-between"}>
          <Heading size="md">Quy trình sóng</Heading>
          <Link href={`/order-finishing-process${check.string(props.order?._id) ? "?id=" + props.order._id : ""}`}>
            <Button colorPalette={"blue"} size="xs">Thao tác</Button>
          </Link>
        </HStack>
      </Card.Header>

      <Card.Body justifyContent={"space-between"} gap={8}>
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
              {processes?.map((process, index) => (
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
                    {process.status}
                  </Table.Cell>
                  <Table.Cell>
                    {formatDateTommhhDDMMYYYY(process.startedAt)}
                  </Table.Cell>
                  <Table.Cell>
                    {formatDateTommhhDDMMYYYY(process.completedAt)}
                  </Table.Cell>
                  <Table.Cell>
                    <Editable.Root bg={"bg.muted"} value={process.note} placeholder={"Nhấn để nhập"} onValueChange={(v) => setNote(v.value, index)}>
                      <Editable.Preview w={"full"} />
                      <Editable.Input />
                    </Editable.Root>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>

        {isEdited && <HStack>
          <Button variant="outline" onClick={() => setProcesses(initialFormVal)}>Hủy</Button>
          <Button
            colorPalette={"blue"}
            variant="solid"
          // onClick={handleSubmit}
          // loading={!!updating}
          // disabled={!!updateError}
          >
            Confirm
          </Button>
        </HStack>}

      </Card.Body>
    </Card.Root>

  )
}
