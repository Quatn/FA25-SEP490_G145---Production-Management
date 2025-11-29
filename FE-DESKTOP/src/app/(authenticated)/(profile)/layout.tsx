"use client";

import "./profile.css";
import Header from "@/components/layout/Header";
import {
  Flex,
  For,
  HStack,
  Link as ChakraLink
} from "@chakra-ui/react";
import Link from "next/link";
import React from "react";

const links = [
  { label: "Profile", href: "/profile" },
  { label: "Change password", href: "/change-password" },
]

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <Flex h={"full"} direction={"column"} grow={1}>
      <Header />
      <HStack mx={5} my={2}>
        <For each={links}>
          {
            (link, index) => (
              <React.Fragment key={link.href}>
                <Link href={link.href}>
                  <ChakraLink as={"p"} colorPalette={"cyan"}>
                    {link.label}
                  </ChakraLink>
                </Link>
                {(index < links.length - 1) && <p> - </p>}
              </React.Fragment>
            )
          }
        </For>
      </HStack>
      {children}
    </Flex>
  );
}
