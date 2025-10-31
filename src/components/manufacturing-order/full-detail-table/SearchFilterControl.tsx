"use client";

import {
  useManufacturingTableDispatch,
  useManufacturingTableState,
} from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { Button, Group } from "@chakra-ui/react";

export default function ManufacturingOrderSearchFilterControl() {
  const { } = useManufacturingTableState();
  const dispatch = useManufacturingTableDispatch();

  return (
    <Group attached>
      <Button variant="outline">Item 1</Button>
      <Button variant="outline">Item 2</Button>
      <Button variant="outline">Item 3</Button>
    </Group>
  );
}
