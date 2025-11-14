import ManufacturingOrderPagination from "@/components/manufacturing-order/full-detail-table/Pagination";
import ManufacturingOrderPaginationControl from "@/components/manufacturing-order/full-detail-table/PaginationControl";
import ManufacturingOrderPinnedOrders from "@/components/manufacturing-order/full-detail-table/PinnedOrders";
import ManufacturingOrderSearchBar from "@/components/manufacturing-order/full-detail-table/SearchBar";
import ManufacturingOrderSearchFilterControl from "@/components/manufacturing-order/full-detail-table/SearchFilterControl";
import ManufacturingOrderTable from "@/components/manufacturing-order/full-detail-table/Table";
import ManufacturingOrderTableControl from "@/components/manufacturing-order/full-detail-table/TableControl";
import ManufacturingOrderDetailsDialog from "@/components/manufacturing-order/order-details-dialog/Dialog";
import { ManufacturingOrderDialogProvider } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import { ManufacturingOrderTableProvider } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { Box, Button, Group, HStack, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function PurchaseOrderHome() {
  return (
    <ManufacturingOrderTableProvider>
      <ManufacturingOrderDialogProvider>
        <Box
          m={5}
          p={2}
          flexGrow={1}
        >
          <Box
            px={3}
            py={5}
            rounded={"md"}
            backgroundColor={"gray.100"}
            height={"80vh"}
          >
            <Stack height={"full"} gapY={2}>
              <Text fontWeight={"semibold"} color={"blackAlpha.800"}>
                Manufacturing Orders
              </Text>
              <HStack justifyContent={"space-between"}>
                <ManufacturingOrderSearchBar />

                <ManufacturingOrderSearchFilterControl />

                <Link href="/manufacturing-order/create">
                  <Button colorPalette={"cyan"}>Tạo mới</Button>
                </Link>
              </HStack>

              <ManufacturingOrderTableControl />

              <ManufacturingOrderTable rootProps={{ flexGrow: 1 }} />

              <ManufacturingOrderPaginationControl />

              <ManufacturingOrderPagination />
            </Stack>
          </Box>

          <Box
            p={3}
            mt={5}
            rounded={"md"}
            backgroundColor={"gray.100"}
          >
            <ManufacturingOrderPinnedOrders />
          </Box>
        </Box>

        <ManufacturingOrderDetailsDialog />
      </ManufacturingOrderDialogProvider>
    </ManufacturingOrderTableProvider>
  );
}
