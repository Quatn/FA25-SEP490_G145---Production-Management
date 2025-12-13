import OrderFinishingProcessList from "@/components/manufacturing-order/order-finishing-process/OrderFinishingProcessList";
import { Box, Stack, Text } from "@chakra-ui/react";
export default function PaperColorHome() {
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
          THEO DÕI TIẾN ĐỘ LỆNH KHÂU HOÀN THIỆN
        </Text>
      </Stack>
      <Stack ms={3} mt={5}>
        <OrderFinishingProcessList />
      </Stack>
    </Box>
  );
}