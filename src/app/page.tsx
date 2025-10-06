import Header from "@/components/Header";
import { Box, Flex, Link, Stack, Text } from "@chakra-ui/react";

export default function Home() {
  return (
    <Flex minH={"100vh"} direction={"column"} grow={1}>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Box m={5} p={2} rounded={"sm"} bg={"gray.200"}>
          <Text fontWeight={"semibold"} color={"blackAlpha.800"}>Catalog</Text>
          <Stack ms={3}>
            <Link href={"/production-order"} color={"blue.500"}>
              Production Order
            </Link>
          </Stack>
        </Box>
      </main>
      <footer>
      </footer>
    </Flex>
  );
}
