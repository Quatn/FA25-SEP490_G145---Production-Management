import WareFinishingProcessTypeRestoreList from "@/components/ware/ware-finishing-process-type/WareFinishingProcessTypeRestoreList";
import { Box, Stack, Text } from "@chakra-ui/react";
export default function WareFinishingProcessTypeRestoreHome() {
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
          KHÔI PHỤC LOẠI HOÀN THIỆN MÃ HÀNG
        </Text>
      </Stack>
      <Stack ms={3} mt={5}>
        <WareFinishingProcessTypeRestoreList />
      </Stack>
    </Box>
  );
}