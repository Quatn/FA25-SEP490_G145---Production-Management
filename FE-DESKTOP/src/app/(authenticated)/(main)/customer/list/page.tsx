import CustomerList from "@/components/customer/CustomerList";
import { Box, Stack, Text } from "@chakra-ui/react";
export default function CustomerHome() {
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
          DANH SÁCH KHÁCH HÀNG
        </Text>
      </Stack>
      <Stack ms={3} mt={5}>
        <CustomerList />
      </Stack>
    </Box>
  );
}