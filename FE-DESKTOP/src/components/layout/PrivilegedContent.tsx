"use client";

import { useAppSelector } from "@/service/hooks";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";
import { UserState } from "@/types/UserState";
import check from "check-types";

export default function PrivilegedContent(
  { children, unauthenticatedContent, requiredPrivileges }: {
    children?: React.ReactNode;
    unauthenticatedContent?: React.ReactNode;
    requiredPrivileges: AnyAccessPrivileges[]
  },
) {
  const userState: UserState | null = useAppSelector((state) =>
    state.auth.userState
  );

  if (check.null(userState) || !check.contains(requiredPrivileges, userState.accessPrivileges)) {
    if (unauthenticatedContent) {
      return (
        <div>
          {unauthenticatedContent}
        </div>
      );
    }
    return (
      <div />
    )
  }

  return (
    <div>
      {children}
    </div>
  );
}
