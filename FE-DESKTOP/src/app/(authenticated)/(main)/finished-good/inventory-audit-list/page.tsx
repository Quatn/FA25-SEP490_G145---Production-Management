import FinishedInventoryAuditList from "@/components/finished-storage/FinishedInventoryAuditList";
import { Box, Button, Stack, Text } from "@chakra-ui/react";
export default function FinishedGoodInventoryHome() {
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
          KIỂM KÊ KHO THÀNH PHẨM
        </Text>
      </Stack>
      <Stack ms={3} mt={5}>
        <FinishedInventoryAuditList />
      </Stack>
    </Box>
  );
}