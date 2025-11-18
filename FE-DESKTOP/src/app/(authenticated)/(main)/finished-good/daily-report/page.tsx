import FinishedDailyReport from "@/components/finished-storage/FinishedDailyReport";
import { Box, Stack, Text } from "@chakra-ui/react";
export default function FGDailyReportHome() {
  return (
    <Box
      m={5}
      p={2}
      flexGrow={1}
      boxSizing={"border-box"}
      rounded={"sm"}
    >
      <Stack ms={3} direction={"row"} justifyContent={"space-between"}>
        <Text fontWeight={"bold"} color={"black"} fontSize={"lg"}>
          Báo cáo ngày nhập xuất kho thành phẩm
        </Text>
      </Stack>
      <Stack ms={3} mt={5}>
        <FinishedDailyReport />
      </Stack>
    </Box>
  );
}