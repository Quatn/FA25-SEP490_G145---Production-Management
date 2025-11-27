"use client";

import { Box, Button, Flex, IconButton } from "@chakra-ui/react";
import Link from "next/link";
import { OptionsMenu } from "./OptionsMenu";
import { RiEqualizerLine } from "react-icons/ri";
import { useColorModeValue } from "../ui/color-mode";
import AuthenticatedContent from "./AuthenticatedContent";
import UserAvatar from "./UserAvatar";
import PrivilegedContent from "./PrivilegedContent";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";

const systemPrivs: AnyAccessPrivileges[] = ["system-admin", "system-read", "system-readWrite"]
const usersPrivs: AnyAccessPrivileges[] = ["user-admin", "user-read", "user-readWrite"]

export default function Header() {
  const bg = useColorModeValue("gray.200", "gray.900");
  const color = useColorModeValue("gray.700", "gray.300");

  return (
    <header>
      <Flex bg={bg} color={color} p={1} gap={2} pt={2}>
        <UserAvatar />
        <Box flexGrow={1} />
        <PrivilegedContent
          requiredPrivileges={[...systemPrivs, ...usersPrivs]}
        >
          <Link href={"/admin-dashboard"}>
            <Button colorPalette={"blue"} variant="solid">Admin Dashboard</Button>
          </Link>
        </PrivilegedContent>
        <AuthenticatedContent
          unauthenticatedContent={
            <Link href={"/auth/login"}>
              <Button>Log in</Button>
            </Link>
          }
        />
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
