"use client"

import { Input } from "@chakra-ui/react"
import check from "check-types"
import { formatDateToYYYYMMDD } from "@/utils/dateUtils"
import { ManufacturingOrderDailyProductionOutputChartReducerStore } from "@/context/manufacturing-order/dashboard/manufacturingOrderDailyProductionOutputChartContext"

export default function ManufacturingOrderDailyProductionOutputChartDateSelector() {
  const { useSelector, useDispatch } = ManufacturingOrderDailyProductionOutputChartReducerStore
  const dispatch = useDispatch()
  const date = useSelector(s => s.date)

  const handleSelectDate = (value: string) => {
    if (!check.nonEmptyString(value)) return
    const dateVal = new Date(value)
    if (check.date(dateVal)) dispatch({ type: "SET_DATE", payload: dateVal })
  }

  return (
    <Input
      bg={"bg"}
      type="date"
      w={"10rem"}
      value={[formatDateToYYYYMMDD(date)]}
      onChange={(ev) => {
        handleSelectDate(ev.target.value)
      }}
    />
  )
}
