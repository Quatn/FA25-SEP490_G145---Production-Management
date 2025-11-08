import PaperSupplierTable from "@/components/paper-storage/paper-supplier/PaperSupplierTable";
import { Box, Button, Stack, Text } from "@chakra-ui/react";
export default function PurchaseOrderHome() {
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
          DANH SÁCH NHÀ GIẤY
        </Text>
      </Stack>
      <Stack ms={3} mt={5}>
        <PaperSupplierTable/>
      </Stack>
    </Box>
  );
}