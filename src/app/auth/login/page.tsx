import { Flex } from "@chakra-ui/react";
import LoginBox from "./LoginBox";

export default function Page() {
  return (
    <Flex w="100vw" h="100vh" justifyContent={"center"} alignItems={"center"}>
      <LoginBox />
    </Flex>
  );
}
