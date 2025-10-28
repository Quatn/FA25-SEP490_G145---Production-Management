import { Box, Text } from "@chakra-ui/react";

export default function PurchaseOrderCreatePage() {
  return (
    <Box m={5} p={2} rounded={"sm"} bg={"gray.200"}>
      <Text fontWeight={"semibold"} color={"blackAlpha.800"}>
        Create Manufacturing order
      </Text>
    </Box>
  );
}
