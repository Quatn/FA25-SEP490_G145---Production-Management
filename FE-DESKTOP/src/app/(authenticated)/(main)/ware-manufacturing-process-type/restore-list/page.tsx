import WareManufacturingProcessTypeRestoreList from "@/components/ware/ware-manufacturing-process-type/WareManufacturingProcessTypeRestoreList";
import { Box, Stack, Text } from "@chakra-ui/react";
export default function WareManufacturingProcessTypeHome() {
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
          KHÔI PHỤC LOẠI GIA CÔNG MÃ HÀNG
        </Text>
      </Stack>
      <Stack ms={3} mt={5}>
        <WareManufacturingProcessTypeRestoreList />
      </Stack>
    </Box>
  );
}