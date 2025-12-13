import WelcomeBox from "@/components/home/WelcomeBox";
import Header from "@/components/layout/Header";
import { Box, Flex, Link, Text } from "@chakra-ui/react";

export default function Home() {
  return (
    <Flex minH={"100vh"} direction={"column"} grow={1}>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Box m={5} p={2} rounded={"sm"}>
          <Text fontWeight={"semibold"} colorPalette={"black"} fontSize={"2rem"}>
            XC Managment system
          </Text>
          <Text>
            Welcome to XC managment system
          </Text>
          <WelcomeBox />
        </Box>
      </main>
      <footer></footer>
    </Flex>
  );
}
