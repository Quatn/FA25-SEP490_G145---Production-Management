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
import { ManufacturingOrderMonthlyDepartmentOutputsChartReducerStore } from "@/context/manufacturing-order/dashboard/manufacturingOrderMonthlyDepartmentOutputsChartContext"
import { ManufacturingOrderDashBoardUtils } from "../utils"
import { useGetAllMOProductionOutputByDateRangeQuery } from "@/service/api/manufacturingOrderApiSlice"
import check from "check-types"
import { formatDateToYYYYMMDD } from "@/utils/dateUtils"
import DataLoading from "@/components/common/DataLoading"
import DataFetchError from "@/components/common/DataFetchError"
import DataEmpty from "@/components/common/DataEmpty"

const { getDaysInMonth } = ManufacturingOrderDashBoardUtils

export default function ManufacturingOrderMonthlyDepartmentOutputsBarChart() {
  const { useSelector } = ManufacturingOrderMonthlyDepartmentOutputsChartReducerStore
  const currentDate = new Date()

  const year = currentDate.getFullYear()
  const month = useSelector(s => s.month)
  const numberOfDays = getDaysInMonth(year, month)

  const {
    data: response,
    isLoading,
    isError,
  } = useGetAllMOProductionOutputByDateRangeQuery({ startDate: new Date(year, month, 1).toString(), endDate: new Date(year, month, numberOfDays).toString() })

  const data = [...Array(numberOfDays).keys()].map(day => {
    const date = year + "-" + (month + 1) + "-" + (day + 1)
    const initialValue = {
      "Bộ phận sóng": 0,
      "Bộ phận in": 0,
      "Bộ phận chế biến": 0,
      "Bộ phận ghim dán": 0,
      day: date
    }

    const statsForDate: {
      "Bộ phận sóng": number,
      "Bộ phận in": number,
      "Bộ phận chế biến": number,
      "Bộ phận ghim dán": number,
      day: string
    } = response?.data?.filter(order => formatDateToYYYYMMDD(order.manufacturingDateAdjustment ?? order.manufacturingDate) === date).map((order) => ({
      "Bộ phận sóng": order.corrugatorProcess.manufacturedAmount ?? 0,
      "Bộ phận in": order.finishingProcesses
        .filter(fp => check.in(fp.warefinishingprocesstype.code, ["IN"]))
        .map(fp => fp.completedAmount)
        .reduce((acc, i) => acc + i, 0),
      "Bộ phận chế biến": order.finishingProcesses
        .filter(fp => !check.in(fp.warefinishingprocesstype.code, ["IN", "GHIM", "DAN"]))
        .map(fp => fp.completedAmount)
        .reduce((acc, i) => acc + i, 0),
      "Bộ phận ghim dán": order.finishingProcesses
        .filter(fp => check.in(fp.warefinishingprocesstype.code, ["GHIM", "DAN"]))
        .map(fp => fp.completedAmount)
        .reduce((acc, i) => acc + i, 0),
      day: date,
    })).reduce((acc, i) => ({
      "Bộ phận sóng": acc["Bộ phận sóng"] + i["Bộ phận sóng"],
      "Bộ phận in": acc["Bộ phận in"] + i["Bộ phận in"],
      "Bộ phận chế biến": acc["Bộ phận chế biến"] + i["Bộ phận chế biến"],
      "Bộ phận ghim dán": acc["Bộ phận ghim dán"] + i["Bộ phận ghim dán"],
      day: date
    }), initialValue) ?? initialValue
    return statsForDate
  })

  const chart = useChart({
    data: data,
    series: [
      { name: "Bộ phận sóng", color: "orange", stackId: "total" },
      { name: "Bộ phận in", color: "khaki", stackId: "total" },
      { name: "Bộ phận chế biến", color: "blue.solid", stackId: "total" },
      { name: "Bộ phận ghim dán", color: "teal.solid", stackId: "total" },
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
        <Legend content={<Chart.Legend interaction="hover" />} />
        {chart.series.map((item) => (
          <Bar
            isAnimationActive={false}
            key={item.name}
            dataKey={chart.key(item.name)}
            fill={chart.color(item.color)}
            stackId={item.stackId}
          >
            <LabelList
              position="top"
              style={{ fontWeight: "600", fill: chart.color("fg") }}
            />
          </Bar>
        ))}
      </BarChart>
    </Chart.Root>
  )
}
