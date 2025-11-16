import ManufacturingOrderPagination from "@/components/manufacturing-order/full-detail-table/Pagination";
import ManufacturingOrderPaginationControl from "@/components/manufacturing-order/full-detail-table/PaginationControl";
import ManufacturingOrderSearchBar from "@/components/manufacturing-order/full-detail-table/SearchBar";
import ManufacturingOrderSearchFilterControl from "@/components/manufacturing-order/full-detail-table/SearchFilterControl";
import ManufacturingOrderTable from "@/components/manufacturing-order/full-detail-table/Table";
import ManufacturingOrderTableControl from "@/components/manufacturing-order/full-detail-table/TableControl";
import ManufacturingOrderDetailsDialog from "@/components/manufacturing-order/order-details-dialog/Dialog";
import { ManufacturingOrderDialogProvider } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import { ManufacturingOrderTableProvider } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { Box, Button, HStack, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function ManufacturingOrderHome() {
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
            colorPalette={"gray"}
            backgroundColor={"colorPalette.subtle"}
          >
            <Stack
              gapY={2}
              minHeight={"80vh"}
            >
              <Text fontWeight={"semibold"} color={"blackAlpha.800"}>
                Danh sách lệnh
              </Text>
              <HStack justifyContent={"space-between"}>
                <ManufacturingOrderSearchBar />

                <ManufacturingOrderSearchFilterControl />

                <Link href="/manufacturing-order/create">
                  <Button colorPalette={"cyan"}>Tạo mới</Button>
                </Link>
              </HStack>

              <ManufacturingOrderTableControl />

              <Box flexGrow={1}>
                <ManufacturingOrderTable rootProps={{ flexGrow: 1 }} />
              </Box>

              <ManufacturingOrderPaginationControl />

              <ManufacturingOrderPagination />
            </Stack>
          </Box>
        </Box>

        <ManufacturingOrderDetailsDialog />
      </ManufacturingOrderDialogProvider>
    </ManufacturingOrderTableProvider>
  );
}
