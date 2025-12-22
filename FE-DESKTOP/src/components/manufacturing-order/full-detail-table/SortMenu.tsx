"use client"

import { ManufacturingOrderTableReducerStore } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { QueryListFullDetailsManufacturingOrderRequestSortOptions } from "@/types/enums/QueryListFullDetailsManufacturingOrderRequestSortOptions";
import { Button, Group, HStack, Menu, Portal, Text } from "@chakra-ui/react"
import check from "check-types";
import { useEffect, useState } from "react";
import { LuArrowDownNarrowWide, LuArrowUpWideNarrow, LuX } from "react-icons/lu";

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

const ascPostFix = "_asc"
const descPostFix = "_desc"

export default function ManufacturingOrderFullDetailTableSortMenu() {
  const { useDispatch, useSelector } = ManufacturingOrderTableReducerStore;
  const dispatch = useDispatch();
  const sorts = useSelector(s => s.sorts);

  const [localSorts, setLocalSorts] = useState<string[]>([]);

  useEffect(() => {
    setLocalSorts(sorts);
  }, [sorts]);

  const selectedSortOptions = localSorts.map(s => {
    if (s.endsWith(ascPostFix)) {
      return s.slice(0, -ascPostFix.length)
    }
    if (s.endsWith(descPostFix)) {
      return s.slice(0, -descPostFix.length)
    }
    return undefined;
  }).filter(s => !check.undefined(s))

  const items = Array.from(
    new Set([
      ...selectedSortOptions as QueryListFullDetailsManufacturingOrderRequestSortOptions[],
      ...Object.values(QueryListFullDetailsManufacturingOrderRequestSortOptions),
    ])
  );

  const removeLocalSort = (item: string) => {
    setLocalSorts((prev) => prev.filter((s) => !s.startsWith(item)));
  };

  const setLocalSort = (value: string) => {
    setLocalSorts((prev) => {
      const base = value.replace(/_(asc|desc)$/, "");
      const filtered = prev.filter((s) => !s.startsWith(base));
      return [...filtered, value];
    });
  };

  const handleApply = () => {
    dispatch({ type: "SET_SORTS", payload: localSorts });
  };

  const handleClear = () => {
    setLocalSorts([]);
    dispatch({ type: "SET_SORTS", payload: [] });
  };

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
            <Menu.ItemGroup>
              <HStack justifyContent={"space-between"}>
                <Button colorPalette={"blue"} onClick={handleApply} size={"sm"}>
                  Áp dụng
                </Button>

                <Button colorPalette={"red"} onClick={handleClear} size={"sm"}>
                  Xóa tất cả
                </Button>
              </HStack>
            </Menu.ItemGroup>
            <Menu.Separator />
            <Menu.ItemGroup>
              {items.map((item, index) => {
                const isAsc = localSorts.find(s => s.startsWith(item))?.endsWith(ascPostFix)
                const isDesc = localSorts.find(s => s.startsWith(item))?.endsWith(descPostFix)

                return (
                  <Menu.Item key={index} value={index + ""} justifyContent={"space-between"} >
                    {
                      selectedSortOptions.includes(item) &&
                      <Button size={"sm"} variant="ghost" colorPalette={"red"} onClick={() => removeLocalSort(item)}><LuX /></Button>
                    }
                    <Text>
                      {SortOptionNameMap[item]}
                    </Text>
                    <Group>
                      <Button size={"sm"} variant="outline" bg={{ base: isDesc ? "blue.subtle" : "bg" }} onClick={() => {
                        setLocalSort(item + descPostFix)
                      }}><LuArrowUpWideNarrow /></Button>
                      <Button size={"sm"} variant="outline" bg={{ base: isAsc ? "red.subtle" : "bg" }} onClick={() => {
                        setLocalSort(item + ascPostFix)
                      }}><LuArrowDownNarrowWide /></Button>
                    </Group>
                  </Menu.Item>
                )
              })}
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
