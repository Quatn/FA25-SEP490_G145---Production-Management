import PurchaseOrderDetailedList from "@/components/purchase-order/PurchaseOrderDetailedList";
import { Box, Button, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function PurchaseOrderHome() {
  return (
    <Box m={5} p={2} rounded={"sm"} bg={"gray.200"}>
      <Text fontWeight={"semibold"} color={"blackAlpha.800"}>
        Purchase Orders
      </Text>
      <Stack ms={3}>
        <PurchaseOrderDetailedList key={1}/>
        <Link href={"/purchase-order/create"} ><Button key={2} colorPalette={"cyan"} w="full">Create New</Button></Link>
      </Stack>
    </Box>
  );
}
