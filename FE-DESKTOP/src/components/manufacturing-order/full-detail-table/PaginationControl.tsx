"use client";

import {
  useManufacturingTableDispatch,
  useManufacturingTableState,
} from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { Button, Group, HStack } from "@chakra-ui/react";

export default function ManufacturingOrderPaginationControl() {
  const { paginationType } = useManufacturingTableState();
  const dispatch = useManufacturingTableDispatch();

  return (
    <HStack>
      <Group attached>
        <Button
          colorPalette={"teal"}
          variant={paginationType === "paged" ? "solid" : "outline"}
          onClick={() =>
            dispatch({
              type: "SET_PAGINATION_TYPE",
              payload: "paged",
            })}
        >
          Theo trang
        </Button>
        <Button
          colorPalette={"teal"}
          variant={paginationType === "pageless" ? "solid" : "outline"}
          onClick={() =>
            dispatch({ type: "SET_PAGINATION_TYPE", payload: "pageless" })}
        >
          Không phân trang
        </Button>
      </Group>
    </HStack>
  );
}
