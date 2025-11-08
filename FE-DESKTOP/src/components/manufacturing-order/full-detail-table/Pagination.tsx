"use client";

import {
  useManufacturingTableDispatch,
  useManufacturingTableState,
} from "@/context/manufacturing-order/manufacturingOrderTableContext";
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
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

const pageOptions = createListCollection({
  items: [
    { label: "10 dòng", value: "10" },
    { label: "20 dòng", value: "20" },
    { label: "30 dòng", value: "30" },
    { label: "40 dòng", value: "40" },
    { label: "50 dòng", value: "50" },
  ],
});

export default function ManufacturingOrderPagination() {
  const { limit } = useManufacturingTableState();
  const dispatch = useManufacturingTableDispatch();

  const pageSizeSelect = (e: SelectValueChangeDetails) => {
    const newPageSize = parseInt(e.value[0]);
    if (check.number(newPageSize)) {
      dispatch({ type: "SET_LIMIT", payload: newPageSize });
    }
  };

  return (
    <HStack>
      <Pagination.Root
        count={200}
        pageSize={10}
        defaultPage={1}
        siblingCount={2}
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
        <Input flex="1" placeholder="Nhập trang" />
        <Button bg="bg.subtle" variant="outline">
          Submit
        </Button>
      </Group>

      <Select.Root
        collection={pageOptions}
        size="sm"
        width="320px"
        value={[limit.toString()]}
        onValueChange={pageSizeSelect}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Select framework" />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content>
              {pageOptions.items.map((framework) => (
                <Select.Item item={framework} key={framework.value}>
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
