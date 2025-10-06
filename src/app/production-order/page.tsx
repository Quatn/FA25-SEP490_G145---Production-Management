import Header from "@/components/Header";
import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function ProudctionOrderHome() {
  return (
    <Flex h={"full"} direction={"column"} grow={1}>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Text fontWeight={"semibold"}>Will you answer the call of god?</Text>
      </main>
      <footer>
      </footer>
    </Flex>
  );
}
