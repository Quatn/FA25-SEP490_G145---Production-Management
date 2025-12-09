"use client"
import { ManufacturingOrder } from "@/types/ManufacturingOrder"
import { manufacturingOrderComponentUtils as utils } from "../utils"
import { useMemo } from "react"
import check from "check-types"
import { Heading, HStack, SimpleGrid, Stack, Text } from "@chakra-ui/react"

export type ManufacturingOrderDetailsDialogManufacturingDetailsAdditionalDetailsProps = {
  order: Serialized<ManufacturingOrder>
  // processes: Serialized<OrderFinishingProcess>[]
}

export default function ManufacturingOrderDetailsDialogManufacturingDetailsAdditionalDetails(props: ManufacturingOrderDetailsDialogManufacturingDetailsAdditionalDetailsProps) {
  const stats: { label: string, value: string }[][] = useMemo(() => {
    if (check.null(props.order)) return []
    const ware = utils.getPopulatedWare(props.order)

    return [
      [
        { label: "Số sản phẩm trên phôi", value: (check.greater(ware?.warePerBlankAdjustment as number, 0) ? ware?.warePerBlankAdjustment : ware?.warePerBlank ?? "?") + "" },
        { label: "Số phôi", value: (props.order.numberOfBlanks ?? 0) + "" },
        { label: "Khổ giấy", value: (ware?.paperWidth ?? "?") + "" },
        { label: "Khổ phôi", value: (ware?.blankWidth ?? "?") + "" },
        { label: "Chia khổ", value: (check.greater(ware?.crossCutCountAdjustment as number, 0) ? ware?.crossCutCountAdjustment : ware?.crossCutCount ?? "?") + "" },
        { label: "Số tấm chặt", value: (props.order.longitudinalCutCount ?? 0) + "" },
        { label: "Độ dài phôi", value: (ware?.blankWidth ?? "?") + "" },
        { label: "Mét dài", value: (props.order.runningLength ?? 0) + "" },
      ],
      [
        { label: "Khối", value: (props.order.totalVolume ?? 0) + "" },
        { label: "Tổng lượng", value: (props.order.totalWeight ?? 0) + "" },
      ],
    ]
  }, [props.order])

  return (
    <Stack gapY={"20px"}>
      {stats.map((row, index) => (
        <HStack key={index} columns={row.length} gapX={"20px"} wrap={"wrap"}>
          {row.map((item, index) => (
            <Stack key={index}>
              <Heading size={"md"}>{item.label}</Heading>
              <Text color={"fg.muted"}>{item.value}</Text>
            </Stack>
          ))}
        </HStack>
      ))}
    </Stack>
  )
}
