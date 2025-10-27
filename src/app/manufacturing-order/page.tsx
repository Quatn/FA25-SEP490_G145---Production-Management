import ManufacturingOrderTable from "@/components/manufacturing-order/ManufacturingOrderDetailedTable";
import { Box, Button, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function PurchaseOrderHome() {
  return (
    <Box m={5} p={2} rounded={"sm"} bg={"gray.200"}>
      <Stack ms={3} direction={"row"} justifyContent={"space-between"}>
        <Text fontWeight={"semibold"} color={"blackAlpha.800"}>
          Manufacturing Orders
        </Text>
        <Link href="/manufacturing-order/create">
          <Button colorPalette={"cyan"}>Tạo mới</Button>
        </Link>
      </Stack>
      <Stack ms={3}>
        <ManufacturingOrderTable />
      </Stack>
    </Box>
  );
}
