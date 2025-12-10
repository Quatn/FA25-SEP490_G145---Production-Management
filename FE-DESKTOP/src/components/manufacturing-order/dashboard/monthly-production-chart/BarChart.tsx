"use client"

import { ManufacturingOrderMonthlyProductionChartReducerStore } from "@/context/manufacturing-order/dashboard/manufacturingOrderMonthlyProductionChartContext"
import { Chart, useChart } from "@chakra-ui/charts"
import { useState } from "react"
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

const { getDaysInMonth } = ManufacturingOrderMonthlyProductionBarChartCommons

const randomList = Array.from({ length: 50 }, () => Math.floor(Math.random() * (100 - 30 + 1)) + 30);

export const ManufacturingOrderMonthlyProductionBarChart = () => {
  const { useSelector } = ManufacturingOrderMonthlyProductionChartReducerStore
  const month = useSelector(s => s.month)
  // Maybe there will also be a year selector, idk
  const year = new Date().getFullYear()

  const numberOfDays = getDaysInMonth(year, month)

  const mockData = [...Array(numberOfDays).keys()].map(day =>
    ({ "Tổng": randomList.at(day) ?? 0, day: day + 1 + "" })
  )

  const chart = useChart({
    data: mockData,
    series: [
      { name: "Tổng", color: "teal.solid" },
    ],
  })

  return (
    <Chart.Root maxH="md" chart={chart}>
      <BarChart data={chart.data}>
        <CartesianGrid stroke={chart.color("border.muted")} vertical={false} />
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey={chart.key("day")}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <Tooltip
          cursor={{ fill: chart.color("bg.muted") }}
          animationDuration={100}
          content={<Chart.Tooltip />}
        />
        <Legend content={<Chart.Legend />} />
        {chart.series.map((item) => (
          <Bar
            isAnimationActive={false}
            key={item.name}
            dataKey={chart.key(item.name)}
            fill={chart.color(item.color)}
            stroke={chart.color(item.color)}
            stackId={item.stackId}
          >
            <LabelList
              dataKey={chart.key(item.name)}
              position="top"
              style={{ fontWeight: "600", fill: chart.color("fg") }}
            />
          </Bar>
        ))}
      </BarChart>
    </Chart.Root>
  )
}
