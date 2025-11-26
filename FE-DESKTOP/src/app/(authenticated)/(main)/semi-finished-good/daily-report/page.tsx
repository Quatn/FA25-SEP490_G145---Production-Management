import { SemiFinishedReportDaily } from "@/components/semi-finished-storage/SemiFinishedReportDaily";
import { Box, Stack, Text } from "@chakra-ui/react";
export default function SFGDailyReportHome() {
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
          Báo cáo ngày nhập xuất kho bán thành phẩm
        </Text>
      </Stack>
      <Stack ms={3} mt={5}>
        <SemiFinishedReportDaily/>
      </Stack>
    </Box>
  );
}