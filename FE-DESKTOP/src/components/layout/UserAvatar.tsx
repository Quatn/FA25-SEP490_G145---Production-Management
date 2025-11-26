"use client";

import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import { Avatar, Box, HStack, Stack, Text } from "@chakra-ui/react";
import check from "check-types";

export default function UserAvatar() {
  const userState: UserState | null = useAppSelector((state) =>
    state.auth.userState
  );

  if (check.null(userState)) {
    return (
      <Box />
    )
  }

  return (
    <Stack gap="8" ms="2">
      <HStack gap="4">
        <Avatar.Root bg={"bg"}>
          <Avatar.Fallback name={userState.name} />
          {/*<Avatar.Image src={user.avatar} />*/}
        </Avatar.Root>
        <Stack gap="0">
          <Text fontWeight="medium">{userState.name}</Text>
          <Text color="fg.muted" textStyle="sm">
            {userState.email}
          </Text>
        </Stack>
      </HStack>
    </Stack>
  );
}
