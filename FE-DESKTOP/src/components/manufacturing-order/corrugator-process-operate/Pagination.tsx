"use client";

import { ManufacturingOrderCorrugatorProcessOperateReducerStore } from "@/context/manufacturing-order/manufacturingOrderCorrugatorProcessOperateContext";
import {
  Button,
  ButtonGroup,
  createListCollection,
  Group,
  HStack,
  IconButton,
  Input,
  Pagination,
  Portal,
  Select,
  SelectValueChangeDetails,
} from "@chakra-ui/react";
import check from "check-types";
import { LuArrowRight, LuChevronLeft, LuChevronRight } from "react-icons/lu";

const pageOptions = createListCollection({
  items: [
    { label: "5 dòng", value: "5" },
    { label: "10 dòng", value: "10" },
    { label: "15 dòng", value: "15" },
    { label: "20 dòng", value: "20" },
  ],
});

export default function ManufacturingOrderCorrugatorOperatePagePagination() {
  const { useDispatch, useSelector } = ManufacturingOrderCorrugatorProcessOperateReducerStore;
  const dispatch = useDispatch();
  const page = useSelector(s => s.page);
  const limit = useSelector(s => s.limit);
  const totalItems = useSelector(s => s.totalItems);

  const pageSizeSelect = (e: SelectValueChangeDetails) => {
    const newPageSize = parseInt(e.value[0]);
    if (check.number(newPageSize)) {
      dispatch({ type: "SET_LIMIT", payload: newPageSize });
    }
  };

  return (
    <HStack>
      <Pagination.Root
        count={totalItems}
        page={page}
        pageSize={limit}
        siblingCount={2}
        onPageChange={(e) => dispatch({ type: "SET_PAGE", payload: e.page })}
      >
        <ButtonGroup variant="ghost" size="sm">
          <Pagination.PrevTrigger asChild>
            <IconButton>
              <LuChevronLeft />
            </IconButton>
          </Pagination.PrevTrigger>

          <Pagination.Items
            render={(page) => (
              <IconButton variant={{ base: "ghost", _selected: "outline" }}>
                {page.value}
              </IconButton>
            )}
          />

          <Pagination.NextTrigger asChild>
            <IconButton>
              <LuChevronRight />
            </IconButton>
          </Pagination.NextTrigger>
        </ButtonGroup>
      </Pagination.Root>

      <Group attached>
        <Input flex="1" bg="bg" placeholder="Nhập trang" w={"100px"} size="sm" />
        <Button colorPalette={"teal"} variant="solid" size="sm">
          <LuArrowRight />
        </Button>
      </Group>

      <Select.Root
        collection={pageOptions}
        size="sm"
        width={"100px"}
        bg={"bg"}
        value={[limit.toString()]}
        onValueChange={pageSizeSelect}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Chọn số lệnh hiển thị mỗi trang" />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content>
              {pageOptions.items.map((o) => (
                <Select.Item bg="bg" item={o} key={o.value}>
                  {o.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </HStack>
  );
}
