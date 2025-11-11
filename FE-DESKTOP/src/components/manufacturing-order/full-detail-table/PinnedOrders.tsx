"use client";

import {
  useManufacturingTableDispatch,
  useManufacturingTableState,
} from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { Text } from "@chakra-ui/react";

export default function ManufacturingOrderPinnedOrders() {
  const { pinnedOrderIds } = useManufacturingTableState();
  const dispatch = useManufacturingTableDispatch();

  return (
    <Text>No pinned orders yet. Pick orders from the table above.</Text>
  );
}
