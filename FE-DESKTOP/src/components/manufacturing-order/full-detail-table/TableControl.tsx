"use client";

import {
  useManufacturingTableDispatch,
  useManufacturingTableState,
} from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { Checkbox } from "@chakra-ui/react";

export default function ManufacturingOrderTableControl() {
  const { } = useManufacturingTableState();
  const dispatch = useManufacturingTableDispatch();

  return (
    <Checkbox.Root>
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label>Allow editing on the table</Checkbox.Label>
    </Checkbox.Root>
  );
}
