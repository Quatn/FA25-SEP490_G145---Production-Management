import SemiFinishedList from "@/components/semi-finished-storage/SemiFinishedList";
import { Box, Stack, Text } from "@chakra-ui/react";
export default function SemiFinishedGoodHome() {
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
          KHO PHÔI
        </Text>
      </Stack>
      <Stack ms={3} mt={5}>
        <SemiFinishedList/>
      </Stack>
    </Box>
  );
}