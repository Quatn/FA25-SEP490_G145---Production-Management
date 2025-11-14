"use client";

import {
  useManufacturingTableDispatch,
  useManufacturingTableState,
} from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { Button, Group } from "@chakra-ui/react";

export default function ManufacturingOrderSearchFilterControl() {
  const { searchFilterType } = useManufacturingTableState();
  const dispatch = useManufacturingTableDispatch();

  return (
    <Group attached>
      <Button
        colorPalette={"teal"}
        variant={searchFilterType === "searchAndFilter" ? "solid" : "outline"}
        onClick={() =>
          dispatch({
            type: "SET_SEARCH_FILTER_TYPE",
            payload: "searchAndFilter",
          })}
      >
        Tìm và lọc
      </Button>
      <Button
        colorPalette={"teal"}
        variant={searchFilterType === "search" ? "solid" : "outline"}
        onClick={() =>
          dispatch({ type: "SET_SEARCH_FILTER_TYPE", payload: "search" })}
      >
        Chỉ tìm
      </Button>
      <Button
        colorPalette={"teal"}
        variant={searchFilterType === "filter" ? "solid" : "outline"}
        onClick={() =>
          dispatch({ type: "SET_SEARCH_FILTER_TYPE", payload: "filter" })}
      >
        Chỉ lọc
      </Button>
    </Group>
  );
}
