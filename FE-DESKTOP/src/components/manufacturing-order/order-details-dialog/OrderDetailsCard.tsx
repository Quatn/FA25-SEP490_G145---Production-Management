"use client"
import { ManufacturingOrder } from "@/types/ManufacturingOrder"
import { Button, Card, DataList, Editable, Heading, HStack, Stack } from "@chakra-ui/react"
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
            <Button colorPalette={"blue"} size="xs">Chỉnh sửa</Button>
          </Link>
        </HStack>
      </Card.Header>

      <Card.Body justifyContent={"space-between"}>
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
          <Editable.Root value={po?.note} readOnly >
            <Editable.Preview />
          </Editable.Root>
        </Stack>

      </Card.Body>
    </Card.Root>
  )
}
