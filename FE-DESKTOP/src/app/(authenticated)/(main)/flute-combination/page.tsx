import FluteCombinationList from "@/components/flute-combination/FluteCombinationList";
import { Box, Stack, Text } from "@chakra-ui/react";
export default function FluteCombinationHome() {
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
          DANH SÁCH LOẠI SÓNG
        </Text>
      </Stack>
      <Stack ms={3} mt={5}>
        <FluteCombinationList />
      </Stack>
    </Box>
  );
}