"use client"

import DataEmpty from "@/components/common/DataEmpty"
import DataFetchError from "@/components/common/DataFetchError"
import DataLoading from "@/components/common/DataLoading"
import { ManufacturingOrderDailyProductionOutputChartReducerStore } from "@/context/manufacturing-order/dashboard/manufacturingOrderDailyProductionOutputChartContext"
import { useGetAllMOProductionOutputByDateRangeQuery } from "@/service/api/manufacturingOrderApiSlice"
import { BarList, BarListData, useChart } from "@chakra-ui/charts"
import { Stack } from "@chakra-ui/react"
import check from "check-types"

export const ManufacturingOrderDailyProductionOutputChartBarList = () => {
  const { useSelector } = ManufacturingOrderDailyProductionOutputChartReducerStore
  const date = useSelector(s => s.date)

  const {
    data: response,
    isLoading,
    isError,
  } = useGetAllMOProductionOutputByDateRangeQuery({ startDate: date.toString(), endDate: date.toString() })

  const accValue = {
    "Bộ phận sóng": 0,
    "Bộ phận in": 0,
    "Bộ phận chế biến": 0,
    "Bộ phận ghim dán": 0,
  }

  response?.data?.forEach((order) => {
    accValue["Bộ phận sóng"] += order.corrugatorProcess.manufacturedAmount
    order.finishingProcesses.forEach((fp) => {
      if (check.in(fp.wareFinishingProcessType.code, ["IN"])) accValue["Bộ phận in"] += fp.completedAmount
      else if (!check.in(fp.wareFinishingProcessType.code, ["IN", "GHIM", "DAN"])) accValue["Bộ phận chế biến"] += fp.completedAmount
      else if (check.in(fp.wareFinishingProcessType.code, ["GHIM", "DAN"])) accValue["Bộ phận ghim dán"] += fp.completedAmount
    })
  })

  console.log(response?.data)
  console.log(accValue)

  const data = Object.keys(accValue).map(key => ({
    name: key,
    value: accValue[key as "Bộ phận sóng" | "Bộ phận in" | "Bộ phận chế biến" | "Bộ phận ghim dán"],
  }))

  const chart = useChart<BarListData>({
    sort: { by: "value", direction: "desc" },
    data,
    series: [{ name: "name", color: "teal.subtle" }],
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
