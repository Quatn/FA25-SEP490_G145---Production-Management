import PrintColorList from "@/components/print-color/PrintColorList";
import { Box, Stack, Text } from "@chakra-ui/react";
export default function PrintColorHome() {
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
          DANH SÁCH MÀU IN
        </Text>
      </Stack>
      <Stack ms={3} mt={5}>
        <PrintColorList/>
      </Stack>
    </Box>
  );
}