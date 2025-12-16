"use client"

import { ManufacturingOrderCreatePageComponents as CreatePage } from "@/components/manufacturing-order/create-page/components";
import { DataTableProvider } from "@/components/ui/data-table/Provider";
import { ManufacturingOrderCreatePageProvider } from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { Box, Stack, Text } from "@chakra-ui/react";

export default function PurchaseOrderCreatePage() {
  return (
    <ManufacturingOrderCreatePageProvider>
      <DataTableProvider>
        <Box
          m={5}
          p={2}
          flexGrow={1}
          boxSizing={"border-box"}
          rounded={"sm"}
        >
          <Text fontWeight={"semibold"} color={"blackAlpha.800"}>
            Tạo lệnh
          </Text>

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
                height={"full"}
                overflowY={"hidden"}
                minH={"50vh"}
                maxH={"95vh"}
              >
                <Text fontWeight={"semibold"} color={"fg"} mb={2}>
                  Chọn lệnh
                </Text>
                <Box mb={2}>
                  <CreatePage.SearchBar />
                </Box>
                {/*<CreatePage.GroupTypeControl />*/}
                <Box flexGrow={1} overflowY={"auto"}>
                  <CreatePage.ItemSelector />
                </Box>

                <CreatePage.OrderPickerPagination />
              </Stack>
            </Box>

            <Box
              p={3}
              mt={5}
            >
              <CreatePage.SelectedOrdersCounter />
              <CreatePage.SelectedOrderDetailsContainer />
            </Box>
          </Box>
        </Box>
        <CreatePage.ConfirmDialog />
      </DataTableProvider>
    </ManufacturingOrderCreatePageProvider>
  );
}
