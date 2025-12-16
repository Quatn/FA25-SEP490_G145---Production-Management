import { createListCollection } from "@chakra-ui/react"

function getDaysInMonth(year: number, month: number): number {
  if (month < 0 || month > 11) {
    throw new Error('Month must be in range 0 (January) to 11 (December)');
  }
  return new Date(year, month + 1, 0).getDate();
}


const monthValueArray = [...Array(12).keys()]
const monthItemsArray = monthValueArray.map(m => ({ value: m + "", label: `Tháng ${m + 1}` }))

const monthCollection = createListCollection({
  items: monthItemsArray
})

export const ManufacturingOrderDashBoardUtils = {
  monthValueArray,
  monthItemsArray,
  monthCollection,
  getDaysInMonth,
}
