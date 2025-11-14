"use client";

import {
  useManufacturingOrderCreatePageState,
} from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { Box, Text } from "@chakra-ui/react";

export default function ManufacturingOrderCreatePageSelectedOrdersCounter() {
  const { selectedPOIsIds } = useManufacturingOrderCreatePageState();

  return (
    <Box>
      <Text>Đã chọn {selectedPOIsIds.length} PO Item để làm thành lệnh</Text>
    </Box>
  );
}
