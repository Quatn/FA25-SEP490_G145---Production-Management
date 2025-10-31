"use client";

import {
  useManufacturingTableDispatch,
  useManufacturingTableState,
} from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { Input, InputGroup } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";

export default function ManufacturingOrderSearchBar() {
  const { } = useManufacturingTableState();
  const dispatch = useManufacturingTableDispatch();

  return (
    <InputGroup flex={1} endElement={<LuSearch>⌘K</LuSearch>}>
      <Input placeholder="Smart search" />
    </InputGroup>
  );
}
