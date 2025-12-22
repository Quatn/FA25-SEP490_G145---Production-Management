"use client"

import { Chart, useChart } from "@chakra-ui/charts"
import { Cell, LabelList, Pie, PieChart, Tooltip } from "recharts"
import { manufacturingOrderComponentUtils } from "../../utils"
import { ManufacturingOrderDailyOrderStatusesChartReducerStore } from "@/context/manufacturing-order/dashboard/manufacturingOrderDailyStatusesPieChartContext"
import { useGetAllMOStatusesByDateRangeQuery } from "@/service/api/manufacturingOrderApiSlice"
import { ManufacturingOrderOperativeStatus } from "@/types/enums/ManufacturingOrderOperativeStatus"
import DataLoading from "@/components/common/DataLoading"
import DataFetchError from "@/components/common/DataFetchError"
import DataEmpty from "@/components/common/DataEmpty"

const { OrderStatusNameMap } = manufacturingOrderComponentUtils

export const ManufacturingOrderDailyStatusesPieChart = () => {
  const { useSelector } = ManufacturingOrderDailyOrderStatusesChartReducerStore
  const date = useSelector(s => s.date)

  const {
    data: response,
    isLoading,
    isError,
  } = useGetAllMOStatusesByDateRangeQuery({ startDate: date.toString(), endDate: date.toString() })

  const data = response?.data

  const pausedOrderAmount = data?.filter(order => order.operativeStatus === ManufacturingOrderOperativeStatus.PAUSED).length ?? 0
  const runningOrderAmount = data?.filter(order => order.operativeStatus === ManufacturingOrderOperativeStatus.RUNNING).length ?? 0
  const cancelledOrderAmount = data?.filter(order => order.operativeStatus === ManufacturingOrderOperativeStatus.CANCELLED).length ?? 0
  const completedOrderAmount = data?.filter(order => order.operativeStatus === ManufacturingOrderOperativeStatus.COMPLETED).length ?? 0
  const notStartedOrderAmount = data?.filter(order => order.operativeStatus === ManufacturingOrderOperativeStatus.NOTSTARTED).length ?? 0

  const chart = useChart({
    data: [
      { name: OrderStatusNameMap.PAUSED, value: pausedOrderAmount, color: "yellow.solid" },
      { name: OrderStatusNameMap.RUNNING, value: runningOrderAmount, color: "blue.solid" },
      { name: OrderStatusNameMap.CANCELLED, value: cancelledOrderAmount, color: "red.solid" },
      { name: OrderStatusNameMap.COMPLETED, value: completedOrderAmount, color: "green.solid" },
      { name: OrderStatusNameMap.NOTSTARTED, value: notStartedOrderAmount, color: "teal.solid" },
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
