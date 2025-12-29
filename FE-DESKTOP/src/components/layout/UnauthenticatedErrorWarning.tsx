import { Center, HStack, Stack, Text, Link as ChakraLink, Box, BoxProps } from "@chakra-ui/react";
import Link from "next/link";
import { LuCircleMinus } from "react-icons/lu";

export default function UnauthenticatedErrorWarning(props: BoxProps) {
  return (
    <Box {...props}>
      <Center h="full">
        <Stack alignItems={"center"} gap={8}>
          <LuCircleMinus size={"10rem"} color="#ee6666" strokeWidth={1} />
          <Text colorPalette={"red"} color={"colorPalette.solid"}>Trang này chỉ dành cho người dùng đã đăng nhập</Text>
          <HStack gap={2} colorPalette={"cyan"}>
            <Link href={"/"}>
              <ChakraLink as="p">Về trang chủ</ChakraLink>
            </Link>
            <p>-</p>
            <Link href={"/login"}>
              <ChakraLink as="p">Đăng nhập</ChakraLink>
            </Link>
          </HStack>
        </Stack>
      </Center>
    </Box>
  )
}
