"use client";

import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import { Avatar, Box, Center, HStack, Spinner, Stack, Text } from "@chakra-ui/react";
import check from "check-types";
import Link from "next/link";

export default function UserAvatar(props: { displayDetails?: boolean }) {
  const userState: UserState | null = useAppSelector((state) =>
    state.auth.userState
  );
  const hydrating: boolean = useAppSelector((state) => {
    return state.auth.hydrating
  });

  if (hydrating) {
    return (
      <Center>
        <Spinner />
      </Center>
    )
  }

  if (check.null(userState)) {
    return (
      <Box />
    )
  }

  return (
    <Stack gap="8" ms="2">
      <Link href="/profile">
        <HStack gap="4">
          <Avatar.Root bg={"bg"}>
            <Avatar.Fallback name={userState.name} />
            {/*<Avatar.Image src={user.avatar} />*/}
          </Avatar.Root>
          {props.displayDetails &&
            <Stack gap="0">
              <Text fontWeight="medium">{userState.name}</Text>
              <Text color="fg.muted" textStyle="sm">
                {userState.email}
              </Text>
            </Stack>
          }
        </HStack>
      </Link>
    </Stack>
  );
}
