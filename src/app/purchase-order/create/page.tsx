import ProductSelectionBox from "@/components/purchase-order/ProductSelectionBox";
import PurchaseOrderCreateFields from "@/components/purchase-order/PurchaseOrderCreateFields";
import { Box, Field, Input, SimpleGrid, Stack, Text } from "@chakra-ui/react";

export default function PurchaseOrderCreatePage() {
  return (
    <Box m={5} p={2} rounded={"sm"} bg={"gray.200"}>
      <Text fontWeight={"semibold"} color={"blackAlpha.800"}>
        Create Purchase Order
      </Text>
      <SimpleGrid columns={2} minChildWidth="sm" gap="10px">
        <Box p={4} rounded={"sm"} bg={"gray.50"}>
          <PurchaseOrderCreateFields />
        </Box>
        <Box p={4} rounded={"sm"} bg={"gray.50"}>
          <ProductSelectionBox />
        </Box>
      </SimpleGrid>
    </Box>
  );
}
