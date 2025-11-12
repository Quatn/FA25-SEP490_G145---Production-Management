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
            minH={"80vh"}
          >
            <Stack height={"full"} gapY={2}>
              <Text fontWeight={"semibold"} color={"blackAlpha.800"}>
                PO Picker
              </Text>
              <Box>
                <CreatePage.SearchBar />
              </Box>
              <CreatePage.GroupTypeControl />
              <CreatePage.ItemSelector />
            </Stack>
          </Box>

          <Box
            p={3}
            mt={5}
            rounded={"md"}
          >
          </Box>
        </Box>
      </Box>
    </ManufacturingOrderCreatePageProvider>
  );
}
