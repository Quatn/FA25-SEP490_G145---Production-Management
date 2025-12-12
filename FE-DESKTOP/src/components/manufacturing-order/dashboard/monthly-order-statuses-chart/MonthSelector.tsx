"use client"

import { Portal, Select } from "@chakra-ui/react"
import check from "check-types"
import { ManufacturingOrderMonthlyOrderStatusesChartReducerStore } from "@/context/manufacturing-order/dashboard/manufacturingOrderMonthlyStatusesPieChartContext"
import { ManufacturingOrderDashBoardUtils } from "../utils"

const { monthValueArray, monthCollection } = ManufacturingOrderDashBoardUtils


export default function ManufacturingOrderMonthlyStatusesPieChartMonthSelector() {
  const { useSelector, useDispatch } = ManufacturingOrderMonthlyOrderStatusesChartReducerStore
  const dispatch = useDispatch()
  const month = useSelector(s => s.month)

  const handleSelectMonth = (value: string | undefined) => {
    const intVal = parseInt(value + "")
    if (check.in(intVal, monthValueArray)) dispatch({ type: "SET_MONTH", payload: intVal })
  }

  return (
    <Select.Root collection={monthCollection} size="sm" width={"10rem"} value={[month + ""]} onValueChange={(v) => handleSelectMonth(v.value.at(0))}>
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Chọn tháng" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {monthCollection.items.map((month) => (
              <Select.Item item={month} key={month.value}>
                {month.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  )
}
