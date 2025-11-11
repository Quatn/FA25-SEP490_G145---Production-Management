import { Box, Stack, Text } from "@chakra-ui/react";

export default function PurchaseOrderCreatePage() {
  return (
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
            height={"80vh"}
          >
            <Stack height={"full"} gapY={2}>
              <Text fontWeight={"semibold"} color={"blackAlpha.800"}>
                PO Picker
              </Text>
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
  );
}
