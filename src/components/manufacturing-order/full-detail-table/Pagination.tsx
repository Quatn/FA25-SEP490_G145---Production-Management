"use client";

import {
  useManufacturingTableDispatch,
  useManufacturingTableState,
} from "@/context/manufacturing-order/manufacturingOrderTableContext";
import {
  Button,
  ButtonGroup,
  Group,
  HStack,
  IconButton,
  Input,
  Pagination,
} from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export default function ManufacturingOrderPagination() {
  const { } = useManufacturingTableState();
  const dispatch = useManufacturingTableDispatch();

  return (
    <HStack>
      <Pagination.Root
        count={200}
        pageSize={10}
        defaultPage={10}
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
        <Input flex="1" placeholder="Enter your email" />
        <Button bg="bg.subtle" variant="outline">
          Submit
        </Button>
      </Group>
    </HStack>
  );
}
