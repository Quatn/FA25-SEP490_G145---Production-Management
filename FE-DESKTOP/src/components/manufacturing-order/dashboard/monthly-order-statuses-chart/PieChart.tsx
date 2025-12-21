"use client"

import { Chart, useChart } from "@chakra-ui/charts"
import { Cell, LabelList, Pie, PieChart, Tooltip } from "recharts"
import { manufacturingOrderComponentUtils } from "../../utils"
import { useGetAllMOStatusesByDateRangeQuery } from "@/service/api/manufacturingOrderApiSlice"
import { ManufacturingOrderMonthlyOrderStatusesChartReducerStore } from "@/context/manufacturing-order/dashboard/manufacturingOrderMonthlyStatusesPieChartContext"
import { ManufacturingOrderDashBoardUtils } from "../utils"
import DataLoading from "@/components/common/DataLoading"
import DataFetchError from "@/components/common/DataFetchError"
import { ManufacturingOrderOperativeStatus } from "@/types/enums/ManufacturingOrderOperativeStatus"
import DataEmpty from "@/components/common/DataEmpty"

const { OrderStatusNameMap } = manufacturingOrderComponentUtils
const { getDaysInMonth } = ManufacturingOrderDashBoardUtils

export const ManufacturingOrderMonthlyStatusesPieChart = () => {
  const { useSelector } = ManufacturingOrderMonthlyOrderStatusesChartReducerStore

  const currentDate = new Date()
  const month = useSelector(s => s.month)
  const year = currentDate.getFullYear()
  const numberOfDays = getDaysInMonth(year, month)
  const {
    data: response,
    isLoading,
    isError,
  } = useGetAllMOStatusesByDateRangeQuery({ startDate: new Date(year, month, 1).toString(), endDate: new Date(year, month, numberOfDays).toString() })

  const data = response?.data

  const pausedOrderAmount = data?.filter(order => order.operativeStatus === ManufacturingOrderOperativeStatus.PAUSED).length ?? 0
  const runningOrderAmount = data?.filter(order => order.operativeStatus === ManufacturingOrderOperativeStatus.RUNNING).length ?? 0
  const cancelledOrderAmount = data?.filter(order => order.operativeStatus === ManufacturingOrderOperativeStatus.CANCELLED).length ?? 0
  const completedOrderAmount = data?.filter(order => order.operativeStatus === ManufacturingOrderOperativeStatus.COMPLETED).length ?? 0

  const chart = useChart({
    data: [
      { name: OrderStatusNameMap.PAUSED, value: pausedOrderAmount, color: "yellow.solid" },
      { name: OrderStatusNameMap.RUNNING, value: runningOrderAmount, color: "blue.solid" },
      { name: OrderStatusNameMap.CANCELLED, value: cancelledOrderAmount, color: "red.solid" },
      { name: OrderStatusNameMap.COMPLETED, value: completedOrderAmount, color: "green.solid" },
    ].filter(d => d.value > 0),
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
