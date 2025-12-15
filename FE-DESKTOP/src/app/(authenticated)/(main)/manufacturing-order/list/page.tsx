import PrivilegedContent from "@/components/layout/PrivilegedContent";
import { ManufacturingOrderTableComponents } from "@/components/manufacturing-order/full-detail-table/components";
import ManufacturingOrderOrderDetailsConfirmDialog from "@/components/manufacturing-order/order-details-dialog/ConfirmDialog";
import { DataTableProvider } from "@/components/ui/data-table/Provider";
import { ManufacturingOrderDialogProvider } from "@/context/manufacturing-order/manufacturingOrderDetailsDialogContent";
import { ManufacturingOrderTableProvider } from "@/context/manufacturing-order/manufacturingOrderTableContext";
import { Box, Button, HStack, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function ManufacturingOrderList() {
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
                <Text fontWeight={"semibold"} color={"fg"}>
                  Danh sách lệnh
                </Text>
                <HStack justifyContent={"space-between"}>
                  <ManufacturingOrderTableComponents.SearchBar />

                  {/*<ManufacturingOrderTableComponents.SearchFilterControl />*/}

                  {/* If the user has any of the access privileges in the requiredPrivileges, the content inside of this component will be rendered */}
                  <PrivilegedContent requiredPrivileges={["system-admin", "system-readWrite", "production-admin", "production-readWrite"]}
                    unauthenticatedContent={<div>{"Temporary (optional) example element for showcase purpose: This is rendered instead if the user does not have the required privileges"}</div>}
                    loading={<div>{"Temporary (optional) example element for showcase purpose: This is rendered while the system is still checking user's privileges from localstorage"}</div>}
                  >
                    <Link href="/manufacturing-order/create">
                      <Button size={"sm"} colorPalette={"cyan"}>Tạo mới</Button>
                    </Link>
                  </PrivilegedContent>

                </HStack>

                <ManufacturingOrderTableComponents.TableControl />

                <Stack flexGrow={1}>
                  <ManufacturingOrderTableComponents.Table rootProps={{ flexGrow: 1 }} />
                </Stack>

                {/*<ManufacturingOrderTableComponents.PaginationControl />*/}

                <ManufacturingOrderTableComponents.Pagination />
              </Stack>
            </Box>
          </Box>

          <ManufacturingOrderTableComponents.DetailsDialog />
          <ManufacturingOrderOrderDetailsConfirmDialog />
        </ManufacturingOrderDialogProvider>
        <ManufacturingOrderTableComponents.ConfirmDialog />
      </DataTableProvider>
    </ManufacturingOrderTableProvider>
  );
}
