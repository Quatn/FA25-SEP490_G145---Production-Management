import SemiFinishedInventoryAuditList from "@/components/semi-finished-storage/SemiFinishedInventoryAuditList";
import { Box, Stack, Text } from "@chakra-ui/react";
export default function SemiFinishedGoodInventoryAuditHome() {
  return (
    <Box
      m={5}
      p={2}
      flexGrow={1}
      boxSizing={"border-box"}
      rounded={"sm"}
    >
      <Stack ms={3} direction={"row"} justifyContent={"space-between"}>
        <Text fontWeight={"bold"} color={"black"}>
          KIỂM KÊ KHO PHÔI
        </Text>
      </Stack>
      <Stack ms={3} mt={5}>
        <SemiFinishedInventoryAuditList />
      </Stack>
    </Box>
  );
}