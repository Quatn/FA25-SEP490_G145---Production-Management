"use client"
import { ManufacturingOrder, OrderStatus } from "@/types/ManufacturingOrder"
import { Box, Card, DataList, Heading, HStack, Stack, Table, TableHeader } from "@chakra-ui/react"
import check from "check-types"
import { useMemo } from "react"
import { manufacturingOrderDetailsDialogUtils as utils } from "./utils"
import { WareFinishingProcessType } from "@/types/WareFinishingProcessType"
import { FluteCombination } from "@/types/FluteCombination"
import { WareManufacturingProcessType } from "@/types/WareManufacturingProcessType"
import { ManufacturingOrderDirectives } from "@/types/enums/ManufacturingOrderDirectives"
import { formatDateToDDMMYYYY } from "@/utils/dateUtils"

const orderStatusNameMap: Record<OrderStatus | "default", string> = {
  NOTSTARTED: "Chưa bắt đầu",
  RUNNING: "Đang chạy",
  COMPLETED: "Đã hoàn thành",
  OVERCOMPLETED: "Đã hoàn thành",
  PAUSED: "Tạm dừng",
  CANCELLED: "Đã hủy",
  default: "",
}


const manufacturingDirectives: Record<ManufacturingOrderDirectives | "default", string> = {
  CANCEL: "Hủy",
  PAUSE: "Tạm dừng",
  MANDATORY: "Bắt buộc",
  COMPENSATE: "Bù lệnh",
  default: "",
}

export type ManufacturingOrderDetailsDialogManufacturingDetailsCardProps = {
  order: Serialized<ManufacturingOrder>
}

export default function ManufacturingOrderDetailsDialogManufacturingDetailsCard(props: ManufacturingOrderDetailsDialogManufacturingDetailsCardProps) {
  const ware = utils.getPopulatedWare(props.order)
  const stats: { label: string, value: string }[] = useMemo(() => {
    if (check.null(props.order)) return []

    return [
      { label: "Mã lệnh", value: props.order.code ?? "" },
      { label: "Kế hoạch giao", value: manufacturingDirectives[props.order.manufacturingDirective ?? "default"] ?? "" },
      { label: "Ngày sản xuất", value: formatDateToDDMMYYYY(props.order.manufacturingDate) },
      { label: "Trạng thái chạy", value: orderStatusNameMap[props.order.overallStatus] },
      { label: "Số lượng sản xuất", value: props.order.amount + "" },
      { label: "Ghi chú", value: props.order.note },
    ]
  }, [props.order])

  return (
    <Card.Root size="md">
      <Card.Header>
        <Heading size="md">Chi tiết lệnh</Heading>
      </Card.Header>
      <Card.Body color="fg.muted">
        <HStack alignItems={"stretch"} wrap={"wrap"}>
          <DataList.Root orientation="horizontal" flexGrow={1}>
            {stats.map((item) => (
              <DataList.Item key={item.label}>
                <DataList.ItemLabel>{item.label}</DataList.ItemLabel>
                <DataList.ItemValue>{item.value}</DataList.ItemValue>
              </DataList.Item>
            ))}
          </DataList.Root>
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
