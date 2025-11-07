import { Box, Text } from "@chakra-ui/react";

export default function PurchaseOrderCreatePage() {
  return (
    <Box
      m={5}
      p={2}
      flexGrow={1}
      boxSizing={"border-box"}
      rounded={"sm"}
    >
      <Text fontWeight={"semibold"} color={"blackAlpha.800"}>
        Create Manufacturing order
      </Text>
    </Box>
  );
}
