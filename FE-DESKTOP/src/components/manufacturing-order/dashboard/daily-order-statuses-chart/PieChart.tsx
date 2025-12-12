"use client"

import { Chart, useChart } from "@chakra-ui/charts"
import { Cell, LabelList, Pie, PieChart, Tooltip } from "recharts"
import { manufacturingOrderComponentUtils } from "../../utils"

const { OrderStatusNameMap } = manufacturingOrderComponentUtils

export const ManufacturingOrderDailyStatusesPieChart = () => {
  const chart = useChart({
    data: [
      { name: OrderStatusNameMap.PAUSED, value: 3, color: "yellow.solid" },
      { name: OrderStatusNameMap.RUNNING, value: 2, color: "blue.solid" },
      { name: OrderStatusNameMap.CANCELLED, value: 1, color: "red.solid" },
      { name: OrderStatusNameMap.COMPLETED, value: 12, color: "green.solid" },
    ],
  })

  return (
    <Chart.Root boxSize="sm" mx="auto" chart={chart}>
      <PieChart>
        <Tooltip
          cursor={false}
          animationDuration={100}
          content={<Chart.Tooltip hideLabel />}
        />
        <Pie
          isAnimationActive={false}
          data={chart.data}
          dataKey={chart.key("value")}
        >
          <LabelList position="inside" fill="black" stroke="none" />
          {chart.data.map((item) => (
            <Cell key={item.name} fill={chart.color(item.color)} />
          ))}
        </Pie>
      </PieChart>
    </Chart.Root>
  )
}
