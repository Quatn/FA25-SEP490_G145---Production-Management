"use client";

import { ManufacturingOrderTrackPanelListReducerStore } from "@/context/manufacturing-order/manufacturingOrderTrackPanelContext";
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
import { useState } from "react";
import { LuArrowRight, LuChevronLeft, LuChevronRight } from "react-icons/lu";

const pageOptions = createListCollection({
  items: [
    { label: "5 dòng", value: "5" },
    { label: "10 dòng", value: "10" },
    { label: "20 dòng", value: "20" },
    { label: "30 dòng", value: "30" },
    { label: "40 dòng", value: "40" },
  ],
});

export default function ManufacturingOrderTrackPanelPagination() {
  const { useDispatch, useSelector } = ManufacturingOrderTrackPanelListReducerStore;
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

  const [_page, _setPage] = useState<number | undefined>(undefined)
  const handleSetPageInput = (value: string | undefined) => {
    if (!value) _setPage(undefined)
    const p = parseInt(value + "")
    if (check.number(p)) _setPage(p)
  }

  const handleJumpToPage = () => {
    if (_page) dispatch({ type: "SET_PAGE", payload: _page })
  }

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
              <IconButton bg={{ base: "none", _selected: "colorPalette.solid" }} colorPalette={{ base: "current", _selected: "blue" }} variant={{ base: "ghost", _selected: "solid" }}>
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
        <Input flex="1" bg="bg" placeholder="Nhập trang" w={"100px"} size="sm" value={_page ?? ""} onChange={(e) => handleSetPageInput(e.target.value)} />
        <Button colorPalette={"blue"} variant="solid" size="sm" onClick={handleJumpToPage}>
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
              {pageOptions.items.map((framework) => (
                <Select.Item bg="bg" item={framework} key={framework.value}>
                  {framework.label}
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
