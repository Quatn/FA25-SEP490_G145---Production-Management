import { Box, BoxProps, Center, HStack, Stack, Text, Link as ChakraLink } from "@chakra-ui/react";
import Link from "next/link";
import { LuLockKeyhole } from "react-icons/lu";
import { BackLink } from "./BackLink";

type InsufficientPrivilegeErrorWarningProps = BoxProps & {
  path?: string
}

export default function InsufficientPrivilegeErrorWarning(props: InsufficientPrivilegeErrorWarningProps) {
  return (
    <Box {...props}>
      <Center h="full">
        <Stack alignItems={"center"} gap={8}>
          <LuLockKeyhole size={"10rem"} color="#ee6666" strokeWidth={1} />
          <Text colorPalette={"red"} color={"colorPalette.solid"}>You do not have permission to view {props.path ? ` page "${props.path}"` : " this page"}</Text>
          <HStack gap={2} colorPalette={"cyan"}>
            <Link href={"/"}>
              <ChakraLink as="p">Home</ChakraLink>
            </Link>
            <p>-</p>
            <BackLink>
              <ChakraLink as="p">Return to previous page</ChakraLink>
            </BackLink>
          </HStack>
        </Stack>
      </Center>
    </Box>
  )
}
