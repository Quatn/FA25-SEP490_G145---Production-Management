"use client";

import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import { Stack, Text } from "@chakra-ui/react";
import check from "check-types";

export default function UserDetailsStack() {
  const userState: UserState | null = useAppSelector((state) =>
    state.auth.userState
  );

  return (
    <Stack w="100%" h="100%" alignItems="start">
      {!check.null(userState)
        ? (
          <>
            {(Object.keys(userState) as (keyof UserState)[]).map((key) => (
              <Text key={String(key)}>
                {key}: {String(userState[key])}
              </Text>
            ))}
          </>
        )
        : (
          "No user state data"
        )}
    </Stack>
  );
}
