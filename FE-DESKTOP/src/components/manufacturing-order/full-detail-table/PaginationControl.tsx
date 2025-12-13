"use client";

import { ManufacturingOrderTableReducerStore } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { Button, Group, HStack } from "@chakra-ui/react";

export default function ManufacturingOrderPaginationControl() {
  const { useDispatch, useSelector } = ManufacturingOrderTableReducerStore;
  const dispatch = useDispatch();
  const paginationType = useSelector(s => s.paginationType);

  return (
    <HStack>
      <Group attached>
        <Button
          colorPalette={"teal"}
          bg={paginationType !== "paged" ? "bg" : "colorPalette.solid"}
          variant={"outline"}
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
          bg={paginationType !== "pageless" ? "bg" : "colorPalette.solid"}
          variant={"outline"}
          onClick={() =>
            dispatch({ type: "SET_PAGINATION_TYPE", payload: "pageless" })}
        >
          Không phân trang
        </Button>
      </Group>
    </HStack>
  );
}
