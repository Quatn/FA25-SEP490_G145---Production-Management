import WareManufacturingProcessTypeList from "@/components/ware/ware-manufacturing-process-type/WareManufacturingProcessTypeList";
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
          DANH SÁCH LOẠI GIA CÔNG MÃ HÀNG
        </Text>
      </Stack>
      <Stack ms={3} mt={5}>
        <WareManufacturingProcessTypeList/>
      </Stack>
    </Box>
  );
}