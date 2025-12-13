"use client"

import { Input } from "@chakra-ui/react"
import check from "check-types"
import { ManufacturingOrderDailyOrderStatusesChartReducerStore } from "@/context/manufacturing-order/dashboard/manufacturingOrderDailyStatusesPieChartContext"
import { formatDateToYYYYMMDD } from "@/utils/dateUtils"

export default function ManufacturingOrderDailyStatusesPieChartDateSelector() {
  const { useSelector, useDispatch } = ManufacturingOrderDailyOrderStatusesChartReducerStore
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
