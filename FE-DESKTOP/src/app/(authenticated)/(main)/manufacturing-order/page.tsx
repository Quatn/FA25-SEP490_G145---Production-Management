import { ManufacturingOrderTableComponents } from "@/components/manufacturing-order/full-detail-table/components";
import { DataTableProvider } from "@/components/ui/data-table/Provider";
import { ManufacturingOrderDialogProvider } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import { ManufacturingOrderTableProvider } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { Box, Button, HStack, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function ManufacturingOrderHome() {
  return (
    <ManufacturingOrderTableProvider>
      <DataTableProvider>
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
                  <ManufacturingOrderTableComponents.SearchBar />

                  <ManufacturingOrderTableComponents.SearchFilterControl />

                  <Link href="/manufacturing-order/create">
                    <Button colorPalette={"cyan"}>Tạo mới</Button>
                  </Link>
                </HStack>

                <ManufacturingOrderTableComponents.TableControl />

                <Stack flexGrow={1}>
                  <ManufacturingOrderTableComponents.Table rootProps={{ flexGrow: 1 }} />
                </Stack>

                <ManufacturingOrderTableComponents.PaginationControl />

                <ManufacturingOrderTableComponents.Pagination />
              </Stack>
            </Box>
          </Box>

          <ManufacturingOrderTableComponents.DetailsDialog />
        </ManufacturingOrderDialogProvider>
        <ManufacturingOrderTableComponents.ConfirmDialog />
      </DataTableProvider>
    </ManufacturingOrderTableProvider>
  );
}
