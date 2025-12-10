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

export default function ManufacturingOrderFullDetailTableFilterMenu() {
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

  const items = Object.values(QueryListFullDetailsManufacturingOrderRequestSortOptions).sort(s => selectedSortOptions.includes(s) ? -1 : 1)

  return (
    <Menu.Root closeOnSelect={false}>
      <Menu.Trigger asChild>
        <Button variant="outline" bg={"bg"} size="sm">
          Điều chỉnh bộ lọc
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {items.map(item => {
              const isAsc = sorts.find(s => s.startsWith(item))?.endsWith("_asc")
              const isDesc = sorts.find(s => s.startsWith(item))?.endsWith("_desc")

              return (
                <Menu.Item key={item} value={item} justifyContent={"space-between"} >
                  {
                    selectedSortOptions.includes(item) &&
                    <Button size={"sm"} variant="ghost" colorPalette={"red"}><LuX /></Button>
                  }
                  <Text>
                    {SortOptionNameMap[item]}
                  </Text>
                  <Group>
                    <Button size={"sm"} variant="outline" bg={{ base: isAsc ? "blue.subtle" : "bg" }}><LuArrowUpWideNarrow /></Button>
                    <Button size={"sm"} variant="outline" bg={{ base: isDesc ? "red.subtle" : "bg" }}><LuArrowDownNarrowWide /></Button>
                  </Group>
                </Menu.Item>)
            })}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
