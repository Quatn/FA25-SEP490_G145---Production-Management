"use client"
import { ManufacturingOrder } from "@/types/ManufacturingOrder"
import { manufacturingOrderComponentUtils as utils } from "../utils"
import { useMemo } from "react"
import check from "check-types"
import { Heading, HStack, Stack, Text } from "@chakra-ui/react"
import { numToFixedBounded } from "@/utils/numToFixedBounded"

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
        { label: "Số sản phẩm/phôi", value: (check.greater(ware?.warePerBlankAdjustment as number, 0) ? ware?.warePerBlankAdjustment : ware?.warePerBlank ?? "?") + " sp" },
        { label: "Số phôi", value: (props.order.numberOfBlanks ?? 0) + " tấm" },
        { label: "Khổ giấy", value: (ware?.paperWidth ?? "?") + " mm" },
        { label: "Khổ phôi", value: (ware?.blankWidth ?? "?") + " mm" },
        { label: "Số phần cắt ngang", value: (check.greater(ware?.crossCutCountAdjustment as number, 0) ? ware?.crossCutCountAdjustment : ware?.crossCutCount ?? "?") + "" },
        { label: "Số phần cắt dọc", value: (props.order.longitudinalCutCount ?? 0) + "" },
        { label: "Chiều dài phôi", value: (ware?.blankWidth ?? "?") + " mm" },
        {
          label: "Mét dài", value: numToFixedBounded(props.order.runningLength) + (check.number(props.order.runningLength) ? " m" : "")
        },
      ],
      [
        {
          label: "Khối", value: numToFixedBounded(props.order.totalVolume) + (check.number(props.order.totalVolume) ? " m3" : "")
        },
        {
          label: "Tổng lượng", value: numToFixedBounded(props.order.totalWeight) + (check.number(props.order.totalWeight) ? " kg" : "")
        },
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
