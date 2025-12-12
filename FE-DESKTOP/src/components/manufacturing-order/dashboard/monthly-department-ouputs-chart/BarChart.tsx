"use client"

import { Chart, useChart } from "@chakra-ui/charts"
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Tooltip,
  XAxis,
} from "recharts"
import { ManufacturingOrderMonthlyProductionBarChartCommons } from "./common"
import { ManufacturingOrderMonthlyDepartmentOutputsChartReducerStore } from "@/context/manufacturing-order/dashboard/manufacturingOrderMonthlyDepartmentOutputsChartContext"

const { getDaysInMonth } = ManufacturingOrderMonthlyProductionBarChartCommons

const randomList = Array.from({ length: 50 }, () => Math.floor(Math.random() * (1000 - 200 + 1)) + 200);
const randomList2 = Array.from({ length: 50 }, () => Math.floor(Math.random() * (1000 - 200 + 1)) + 200);
const randomList3 = Array.from({ length: 50 }, () => Math.floor(Math.random() * (1000 - 200 + 1)) + 200);
const randomList4 = Array.from({ length: 50 }, () => Math.floor(Math.random() * (1000 - 200 + 1)) + 200);

export default function ManufacturingOrderMonthlyDepartmentOutputsBarChart() {
  const { useSelector } = ManufacturingOrderMonthlyDepartmentOutputsChartReducerStore
  const month = useSelector(s => s.month)
  // Maybe there will also be a year selector, idk
  const year = new Date().getFullYear()

  const numberOfDays = getDaysInMonth(year, month)

  const mockData = [...Array(numberOfDays).keys()].map(day =>
  ({
    "Bộ phận sóng": randomList.at(day) ?? 0,
    "Bộ phận in": randomList2.at(day) ?? 0,
    "Bộ phận chế biến": randomList3.at(day) ?? 0,
    "Bộ phận ghim dán": randomList4.at(day) ?? 0,
    day: (day + 1) + "/" + (month + 1) + "/" + year
  }))

  const chart = useChart({
    data: mockData,
    series: [
      { name: "Bộ phận sóng", color: "orange", stackId: "total" },
      { name: "Bộ phận in", color: "khaki", stackId: "total" },
      { name: "Bộ phận chế biến", color: "blue.solid", stackId: "total" },
      { name: "Bộ phận ghim dán", color: "teal.solid", stackId: "total" },
    ],
  })

  return (
    <Chart.Root maxH="sm" chart={chart}>
      <BarChart data={chart.data}>
        <CartesianGrid stroke={chart.color("border.muted")} vertical={false} />
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey={chart.key("day")}
          tickFormatter={(value) => (value + "").split("/").filter((_v, index) => index < 2).join("/")}
        />
        <Tooltip
          cursor={false}
          animationDuration={100}
          content={<Chart.Tooltip />}
        />
        <Legend content={<Chart.Legend interaction="hover"/>} />
        {chart.series.map((item) => (
          <Bar
            isAnimationActive={false}
            key={item.name}
            dataKey={chart.key(item.name)}
            fill={chart.color(item.color)}
            stackId={item.stackId}
          />
        ))}
      </BarChart>
    </Chart.Root>
  )
}
