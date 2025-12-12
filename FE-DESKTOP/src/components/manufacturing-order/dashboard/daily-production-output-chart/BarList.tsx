"use client"

import { BarList, BarListData, useChart } from "@chakra-ui/charts"
import { Heading, Stack } from "@chakra-ui/react"

export const ManufacturingOrderDailyProductionOutputChartBarList = () => {
  const data = [
    { name: "Sóng", value: 1200 },
    { name: "In", value: 300 },
    { name: "Chế biến", value: 500 },
    { name: "Ghim dán", value: 400 },
  ]

  const chart = useChart<BarListData>({
    sort: { by: "value", direction: "desc" },
    data,
    series: [{ name: "name", color: "teal.subtle" }],
  })

  return (
    <Stack gap={8} justifyContent={"space-between"}>
      <BarList.Root chart={chart}>
        <BarList.Content>
          <BarList.Bar />
          <BarList.Value />
        </BarList.Content>
      </BarList.Root>
      {/*<Heading size={"md"}>Tổng sản lượng: {data.reduce((acc, i) => acc + i.value, 0)}</Heading>*/}
    </Stack>
  )
}
