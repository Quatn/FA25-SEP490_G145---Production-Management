import { ManufacturingOrderTableReducerStore } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { QueryListFullDetailsManufacturingOrderRequestSortOptions } from "@/types/enums/QueryListFullDetailsManufacturingOrderRequestSortOptions";
import { Button, Group, HStack, Menu, Portal, Text } from "@chakra-ui/react"
import check from "check-types";
import { LuArrowDownNarrowWide, LuArrowDownWideNarrow, LuArrowUpNarrowWide, LuArrowUpWideNarrow, LuChevronsDown, LuChevronsUp, LuX } from "react-icons/lu";

const SortOptionNameMap: Record<QueryListFullDetailsManufacturingOrderRequestSortOptions, string> = {
  code: "Mã lệnh",
  directive: "Kế hoạch giao",
  approval_status: "Trạng thái duyệt",
  delivery_date: "Ngày giao",
  inventory: "Tồn kho",
  manufacturing_date: "Ngày sản xuất",
  operative_status: "Trạng thái chạy",
  order_date: "Ngày nhận đơn",
  amount: "Số lượng",
}

export default function ManufacturingOrderFullDetailTableSortMenu() {
  const { useDispatch, useSelector } = ManufacturingOrderTableReducerStore;
  const dispatch = useDispatch();
  const sorts = useSelector(s => s.sorts);

  const selectedSortOptions = sorts.map(s => {
    if (s.endsWith("_asc")) {
      return s.slice(0, -"_asc".length)
    }
    if (s.endsWith("_desc")) {
      return s.slice(0, -"_desc".length)
    }
    return undefined;
  }).filter(s => !check.undefined(s))

  const merge = [selectedSortOptions, Object.values(QueryListFullDetailsManufacturingOrderRequestSortOptions)]

  const set = new Set(merge.flat())
  const items = [...set] as QueryListFullDetailsManufacturingOrderRequestSortOptions[]

  const handleAddSortOption = (o: string) => {
    dispatch({ type: "ADD_SORT", payload: o })
  }

  const removeSortOption = (o: string) => {
    dispatch({ type: "REMOVE_SORT", payload: o })
  }

  return (
    <Menu.Root closeOnSelect={false}>
      <Menu.Trigger asChild>
        <Button variant="outline" bg={"bg"} size="sm">
          Sắp xếp
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {items.map((item, index) => {
              const isAsc = sorts.find(s => s.startsWith(item))?.endsWith("_asc")
              const isDesc = sorts.find(s => s.startsWith(item))?.endsWith("_desc")

              return (
                <Menu.Item key={index} value={index + ""} justifyContent={"space-between"} >
                  {
                    selectedSortOptions.includes(item) &&
                    <Button size={"sm"} variant="ghost" colorPalette={"red"} onClick={() => removeSortOption(item + (isAsc ? "_asc" : "_desc"))}><LuX /></Button>
                  }
                  <Text>
                    {SortOptionNameMap[item]}
                  </Text>
                  <Group>
                    <Button size={"sm"} variant="outline" bg={{ base: isDesc ? "blue.subtle" : "bg" }} onClick={() => {
                      if (isAsc) dispatch({ type: "CHANGE_SORT", payload: item + "_asc" })
                      else if (!isDesc) {
                        handleAddSortOption(item + "_desc")
                      }
                    }}><LuArrowUpWideNarrow /></Button>
                    <Button size={"sm"} variant="outline" bg={{ base: isAsc ? "red.subtle" : "bg" }} onClick={() => {
                      if (isDesc) dispatch({ type: "CHANGE_SORT", payload: item + "_desc" })
                      else if (!isAsc) {
                        handleAddSortOption(item + "_asc")
                      }
                    }}><LuArrowDownNarrowWide /></Button>
                  </Group>
                </Menu.Item>
              )
            })}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
