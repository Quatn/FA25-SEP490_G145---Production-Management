import Header from "@/components/Header";
import { Box, Flex, Link, Text } from "@chakra-ui/react";

export default function Home() {
  return (
    <Flex minH={"100vh"} direction={"column"} grow={1}>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Box m={5} p={2} rounded={"sm"} bg={"gray.200"}>
          <Text fontWeight={"semibold"} color={"blackAlpha.800"}>
            Managment system
          </Text>
          <Link href={"/dashboard"} color={"blue.500"}>
            Go to dashboard
          </Link>
        </Box>
      </main>
      <footer>
      </footer>
    </Flex>
  );
}
