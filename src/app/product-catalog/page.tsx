import PurchaseOrderDetailedList from "@/components/purchase-order/PurchaseOrderDetailedList";
import { Box, Stack, Text } from "@chakra-ui/react";

export default function PurchaseOrderHome() {
  return (
    <Box m={5} p={2} rounded={"sm"} bg={"gray.200"}>
      <Text fontWeight={"semibold"} color={"blackAlpha.800"}>
        Purchase Orders
      </Text>
      <Stack ms={3}>
        <PurchaseOrderDetailedList />
      </Stack>
    </Box>
  );
}
