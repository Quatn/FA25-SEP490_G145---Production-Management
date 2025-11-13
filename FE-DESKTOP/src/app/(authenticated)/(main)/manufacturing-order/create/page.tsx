import { ManufacturingOrderCreatePageComponents as CreatePage } from "@/components/manufacturing-order/create-page/components";
import { ManufacturingOrderCreatePageProvider } from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { Box, Stack, Text } from "@chakra-ui/react";

export default function PurchaseOrderCreatePage() {
  return (
    <ManufacturingOrderCreatePageProvider>
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
          >
            <Stack
              height={"full"}
              overflowY={"hidden"}
              minH={"50vh"}
              maxH={"95vh"}
            >
              <Text fontWeight={"semibold"} color={"blackAlpha.800"} mb={2}>
                PO Picker
              </Text>
              <Box mb={2}>
                <CreatePage.SearchBar />
              </Box>
              <CreatePage.GroupTypeControl />
              <Box flexGrow={1} overflowY={"auto"}>
                <CreatePage.ItemSelector />
              </Box>
            </Stack>
          </Box>

          <Box
            p={3}
            mt={5}
          >
            <CreatePage.SelectedOrderDetailsContainer />
          </Box>
        </Box>
      </Box>
    </ManufacturingOrderCreatePageProvider>
  );
}
