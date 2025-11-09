"use client";

import { Button, Flex, IconButton } from "@chakra-ui/react";
import UserDetailsStack from "./debug-components/UserDetailStack";
import AuthenticatedContent from "./layout/AuthenticatedContent";
import Link from "next/link";
import { OptionsMenu } from "./OptionsMenu";
import { RiEqualizerLine } from "react-icons/ri";
import { useColorModeValue } from "./ui/color-mode";

export default function Header() {
  const bg = useColorModeValue("gray.200", "gray.900");
  const color = useColorModeValue("gray.700", "gray.300");

  return (
    <header>
      <Flex bg={bg} color={color} p={1} gap={2}>
        <UserDetailsStack />
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
