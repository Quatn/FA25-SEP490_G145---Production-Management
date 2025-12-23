import { Box, Button, Flex, IconButton } from "@chakra-ui/react";
import Link from "next/link";
import { OptionsMenu } from "./OptionsMenu";
import { RiEqualizerLine } from "react-icons/ri";
import AuthenticatedContent from "./AuthenticatedContent";
import UserAvatar from "./UserAvatar";
import HeaderHomeButton from "./HeaderHomeButton";

export default function Header() {
  return (
    <header>
      <Flex bg={{ base: "gray.200", _dark: "gray.900" }} color={{ base: "gray.700", _dark: "gray.300" }}p={1} gap={2} pt={2}>
        <HeaderHomeButton />
        <Box flexGrow={1} />
        <AuthenticatedContent
          unauthenticatedContent={
            <Link href={"/login"}>
              <Button colorPalette={"blue"}>Log in</Button>
            </Link>
          }
        />
        <UserAvatar />
        <Flex alignItems={"center"}>
          <OptionsMenu
            trigger={
              <IconButton variant="outline" aria-label="Open options">
                <RiEqualizerLine />
              </IconButton>
            }
          />
        </Flex>
      </Flex>
    </header>
  );
}
