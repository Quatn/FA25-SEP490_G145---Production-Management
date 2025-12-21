import { Center, HStack, Stack, Text, Link as ChakraLink, Box, BoxProps } from "@chakra-ui/react";
import Link from "next/link";
import { LuImageOff } from "react-icons/lu";

type ClientSideErrorWarningProps = BoxProps & {
  reset?: () => void
}

export default function ClientSideErrorWarning(props: ClientSideErrorWarningProps) {
  return (
    <Box {...props}>
      <Center h="full">
        <Stack alignItems={"center"} gap={8}>
          <LuImageOff size={"10rem"} color="#ee6666" strokeWidth={1} />
          <Text colorPalette={"red"} color={"colorPalette.solid"}>Lỗi hiển thị</Text>
          <HStack gap={2} colorPalette={"cyan"}>
            <Link href={"/"}>
              <ChakraLink as="p">Về trang chủ</ChakraLink>
            </Link>
            {props.reset && <>
              <p>-</p>
              <ChakraLink as="p" onClick={props.reset}>Tải lại</ChakraLink>
            </>}
          </HStack>
        </Stack>
      </Center>
    </Box>
  )
}
