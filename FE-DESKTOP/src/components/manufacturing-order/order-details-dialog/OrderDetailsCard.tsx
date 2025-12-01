"use client"
import { ManufacturingOrder } from "@/types/ManufacturingOrder"
import { Button, Card, DataList, Heading, HStack } from "@chakra-ui/react"
import check from "check-types"
import { useMemo } from "react"
import { manufacturingOrderDetailsDialogUtils as utils } from "./utils"
import { formatDateToDDMMYYYY } from "@/utils/dateUtils"
import Link from "next/link"

export type ManufacturingOrderDetailsDialogOrderDetailsCardProps = {
  order: Serialized<ManufacturingOrder>
}

export default function ManufacturingOrderDetailsDialogOrderDetailsCard(props: ManufacturingOrderDetailsDialogOrderDetailsCardProps) {
  const po = utils.getPopulatedPo(props.order)
  const stats: { label: string, value: string }[] = useMemo(() => {
    if (check.null(props.order)) return []
    const subPo = utils.getPopulatedSubPo(props.order)

    return [
      { label: "Đơn hàng", value: po?.code ?? "" },
      { label: "Khách hàng", value: po?.customer?.name ?? "" },
      { label: "Ngày nhận đơn", value: formatDateToDDMMYYYY(po?.orderDate) },
      { label: "Ngày giao", value: formatDateToDDMMYYYY(subPo?.deliveryDate) },
    ]
  }, [props.order, po])

  return (
    <Card.Root size="md" h="full">
      <Card.Header>
        <HStack justifyContent={"space-between"}>
          <Heading size="md">Thông tin đơn hàng</Heading>
          <Link href={`purchase-order${check.string(po?._id) ? "?id=" + po._id : ""}`}>
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
