"use client"

import { ManufacturingOrderMonthlyProductionChartReducerStore } from "@/context/manufacturing-order/dashboard/manufacturingOrderMonthlyProductionChartContext"
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
import { ManufacturingOrderDashBoardUtils } from "../utils"
import { useGetAllMOStatusesByDateRangeQuery } from "@/service/api/manufacturingOrderApiSlice"
import { formatDateToYYYYMMDD } from "@/utils/dateUtils"
import DataLoading from "@/components/common/DataLoading"
import DataFetchError from "@/components/common/DataFetchError"
import DataEmpty from "@/components/common/DataEmpty"

const { getDaysInMonth } = ManufacturingOrderDashBoardUtils

export default function ManufacturingOrderMonthlyProductionBarChart() {
  const { useSelector } = ManufacturingOrderMonthlyProductionChartReducerStore
  const currentDate = new Date()
  const month = useSelector(s => s.month)
  const year = currentDate.getFullYear()
  const numberOfDays = getDaysInMonth(year, month)
  const {
    data: response,
    isLoading,
    isError,
  } = useGetAllMOStatusesByDateRangeQuery({ startDate: new Date(year, month, 1).toString(), endDate: new Date(year, month, numberOfDays).toString() })

  const data = [...Array(numberOfDays).keys()].map(day => {
    const date = year + "-" + (month < 9 ? "0" : "") + (month + 1) + "-" + (day < 9 ? "0" : "") + (day + 1)
    const statsForDate = response?.data?.filter(order => formatDateToYYYYMMDD(order.manufacturingDateAdjustment ?? order.manufacturingDate) === date).length ?? 0
    return {
      "Số lượng lệnh": statsForDate,
      day: (day < 9 ? "0" : "") + (day + 1),
    }
  })

  const chart = useChart({
    data: data,
    series: [
      { name: "Số lượng lệnh", color: "teal.solid" },
    ],
  })

  if (isLoading) {
    return <DataLoading h="full" />
  }

  if (isError) {
    return <DataFetchError h="full" />
  }

  if (chart.data.length < 1) {
    return <DataEmpty h="full" text="Không có lệnh nào sản xuất trong khoảng thời gian đã chọn" />
  }

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
