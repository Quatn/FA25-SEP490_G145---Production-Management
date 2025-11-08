import LoginBox from "@/components/LoginBox";
import { Flex } from "@chakra-ui/react";

export default function Page() {
  return (
    <Flex w="100vw" h="100vh" justifyContent={"center"} alignItems={"center"}>
      <LoginBox />
    </Flex>
  );
}
