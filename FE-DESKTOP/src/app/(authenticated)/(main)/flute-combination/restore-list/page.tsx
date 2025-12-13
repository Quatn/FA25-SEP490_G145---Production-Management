import FluteCombinationRestoreList from "@/components/flute-combination/FluteCombinationRestoreList";
import { Box, Stack, Text } from "@chakra-ui/react";
export default function FluteCombinationRestorationHome() {
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
          KHÔI PHỤC TỔ HỢP SÓNG
        </Text>
      </Stack>
      <Stack ms={3} mt={5}>
        <FluteCombinationRestoreList/>
      </Stack>
    </Box>
  );
}