"use client";

import { ManufacturingOrderTrackPanelListReducerStore } from "@/context/manufacturing-order/manufacturingOrderTrackPanelContext";
import { Input, InputGroup } from "@chakra-ui/react";
import { ChangeEvent, useEffect, useState } from "react";
import { LuSearch } from "react-icons/lu";

export default function ManufacturingOrderTrackPanelSearchBar() {
  const { useDispatch, useSelector } = ManufacturingOrderTrackPanelListReducerStore;
  const dispatch = useDispatch();
  const search = useSelector(s => s.search);

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
    <InputGroup endElement={<LuSearch />}>
      <Input
        placeholder="Search"
        value={localSearch}
        onChange={changeQuery}
        bg={"bg"}
      />
    </InputGroup>
  );
}
