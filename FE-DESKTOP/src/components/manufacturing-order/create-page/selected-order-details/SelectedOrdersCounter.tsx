"use client";

import { ManufacturingOrderCreatePageReducerStore } from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { Box, Text } from "@chakra-ui/react";

export default function ManufacturingOrderCreatePageSelectedOrdersCounter() {
  const { useSelector } = ManufacturingOrderCreatePageReducerStore;
  const selectedPOIsIds = useSelector(s => s.selectedPOIsIds);

  return (
    <Box>
      <Text>Đã chọn {selectedPOIsIds.length} PO Item để làm thành lệnh</Text>
    </Box>
  );
}
