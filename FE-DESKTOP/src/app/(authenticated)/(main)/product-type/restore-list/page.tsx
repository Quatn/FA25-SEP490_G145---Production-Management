import ProductTypeRestoreList from "@/components/product/product-type/ProductTypeRestoreList";
import { Box, Stack, Text } from "@chakra-ui/react";
export default function ProductTypeRestoreHome() {
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
          KHÔI PHỤC LOẠI SẢN PHẨM
        </Text>
      </Stack>
      <Stack ms={3} mt={5}>
        <ProductTypeRestoreList />
      </Stack>
    </Box>
  );
}