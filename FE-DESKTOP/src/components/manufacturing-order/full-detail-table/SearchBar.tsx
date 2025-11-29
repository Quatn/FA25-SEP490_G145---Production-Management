"use client";

import { ManufacturingOrderTableReducerStore } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { Input, InputGroup } from "@chakra-ui/react";
import { ChangeEvent, useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";

export default function ManufacturingOrderSearchBar() {
  const { useDispatch, useSelector } = ManufacturingOrderTableReducerStore;
  const dispatch = useDispatch();
  const search = useSelector(s => s.search);

  console.log("search bar re-render")

  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch({ type: "SET_SEARCH", payload: localSearch });
    }, 300); // 300ms debounce

    return () => clearTimeout(timeout);
  }, [localSearch, dispatch]);

  const changeQuery = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.currentTarget.value);
  };

  return (
    <InputGroup flex={1} endElement={<LuSearch />} bg={"bg"}>
      <Input placeholder="Smart search" value={localSearch} onChange={changeQuery} />
    </InputGroup>
  );
}
