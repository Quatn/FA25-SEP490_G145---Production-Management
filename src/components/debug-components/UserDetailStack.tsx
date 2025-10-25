"use client";

import { useAppSelector } from "@/service/hooks";
import { UserProfile } from "@/types/UserProfile";
import { Stack, Text } from "@chakra-ui/react";
import check from "check-types";

export default function UserDetailsStack() {
  const userState: UserProfile = useAppSelector((state) =>
    state.auth.userState
  );

  return (
    <Stack w="100%" h="100%" alignItems="start">
      {check.nonEmptyObject(userState)
        ? (
          <>
            {(Object.keys(userState) as (keyof UserProfile)[]).map((key) => (
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
