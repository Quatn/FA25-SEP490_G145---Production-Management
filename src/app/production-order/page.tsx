import Header from "@/components/Header";
import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function ProudctionOrderHome() {
  return (
    <Box m={5} p={2} rounded={"sm"} bg={"gray.200"}>
      <Text fontWeight={"semibold"} color={"blackAlpha.800"}>Production Order</Text>
      <Stack ms={3}>
        <Link href={"/production-order/view"} color={"blue.500"}>
          Table View
        </Link>
      </Stack>
    </Box>
  );
}
