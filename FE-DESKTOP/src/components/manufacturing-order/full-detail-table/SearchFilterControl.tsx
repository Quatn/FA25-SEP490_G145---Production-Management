"use client";

import { ManufacturingOrderTableReducerStore } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { Button, Group } from "@chakra-ui/react";

export default function ManufacturingOrderSearchFilterControl() {
  const { useDispatch, useSelector } = ManufacturingOrderTableReducerStore;
  const dispatch = useDispatch();
  const searchFilterType = useSelector(s => s.searchFilterType);

  return (
    <Group attached>
      <Button
        colorPalette={"teal"}
        bg={searchFilterType !== "searchAndFilter" ? "bg" : "colorPalette.solid"}
        variant={"outline"}
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
        bg={searchFilterType !== "search" ? "bg" : "colorPalette.solid"}
        variant={"outline"}
        onClick={() =>
          dispatch({ type: "SET_SEARCH_FILTER_TYPE", payload: "search" })}
      >
        Chỉ tìm
      </Button>
      <Button
        colorPalette={"teal"}
        bg={searchFilterType !== "filter" ? "bg" : "colorPalette.solid"}
        variant={"outline"}
        onClick={() =>
          dispatch({ type: "SET_SEARCH_FILTER_TYPE", payload: "filter" })}
      >
        Chỉ lọc
      </Button>
    </Group>
  );
}
