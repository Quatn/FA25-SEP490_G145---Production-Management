"use client"
import { ManufacturingOrder } from "@/types/ManufacturingOrder"
import { Button, Card, DataList, Heading, HStack } from "@chakra-ui/react"
import check from "check-types"
import { useMemo } from "react"
import { manufacturingOrderDetailsDialogUtils as utils } from "./utils"
import { WareFinishingProcessType } from "@/types/WareFinishingProcessType"
import { FluteCombination } from "@/types/FluteCombination"
import { WareManufacturingProcessType } from "@/types/WareManufacturingProcessType"
import Link from "next/link"

export type ManufacturingOrderDetailsDialogWareDetailsCardProps = {
  order: Serialized<ManufacturingOrder>
}

export default function ManufacturingOrderDetailsDialogWareDetailsCard(props: ManufacturingOrderDetailsDialogWareDetailsCardProps) {
  const ware = utils.getPopulatedWare(props.order)
  const stats: { label: string, value: string }[] = useMemo(() => {
    if (check.null(props.order)) return []
    const poi = utils.getPopulatedPoi(props.order)

    return [
      { label: "Mã hàng", value: ware?.code ?? "" },
      { label: "Số lượng cần", value: poi.amount + "" },
      { label: "Kiểu gia công", value: (ware?.wareManufacturingProcessType as Serialized<WareManufacturingProcessType>).name ?? "" },
      { label: "Rộng / Khổ", value: ware?.wareWidth + "" },
      { label: "Dài", value: ware?.wareLength + "" },
      { label: "Cao", value: check.greater(ware?.wareHeight as number, 0) ? ware?.wareHeight + "" : "" },
      { label: "Sóng", value: (ware?.fluteCombination as Serialized<FluteCombination>).code ?? "" },
      { label: "Công đoạn gia công", value: ware?.finishingProcesses.map(p => (p as Serialized<WareFinishingProcessType>).name).join(", ") ?? "" },
      ...(ware?.finishingProcesses.find(p => check.string(p) ? p === "IN" : p.code === "IN") ? [
        { label: "Máy In", value: ware?.typeOfPrinter ?? "" },
        { label: "Màu In", value: ware?.printColors.map(pc => check.string(pc) ? pc : pc.code).join(", ") ?? "" },
      ] : []),
      { label: "Ghi chú", value: ware?.note ?? "" },
    ]
  }, [props.order, ware])

  return (
    <Card.Root size="md" h="full">
      <Card.Header>
        <HStack justifyContent={"space-between"}>
          <Heading size="md">Thông tin mã hàng</Heading>
          <Link href={`ware${check.string(ware?._id) ? "?id=" + ware._id : ""}`}>
            <Button colorPalette={"blue"} size="xs">Xem chi tiết</Button>
          </Link>
        </HStack>
      </Card.Header>
      <Card.Body color="fg.muted">
        <DataList.Root orientation="horizontal">
          {stats.map((item) => (
            <DataList.Item key={item.label}>
              <DataList.ItemLabel>{item.label}</DataList.ItemLabel>
              <DataList.ItemValue>{item.value}</DataList.ItemValue>
            </DataList.Item>
          ))}
        </DataList.Root>
      </Card.Body>
    </Card.Root>
  )
}
