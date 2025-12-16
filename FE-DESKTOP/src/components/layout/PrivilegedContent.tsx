"use client";

import { useAppSelector } from "@/service/hooks";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";
import { UserState } from "@/types/UserState";
import check from "check-types";

export default function PrivilegedContent(
  { children, loading, unauthenticatedContent, requiredPrivileges }: {
    children?: React.ReactNode;
    loading?: React.ReactNode;
    unauthenticatedContent?: React.ReactNode;
    requiredPrivileges: AnyAccessPrivileges[]
    // throwErrorAction?: () => Promise<Error>,
  },
) {
  const hydrating: boolean = useAppSelector((state) =>
    state.auth.hydrating
  );
  const userState: UserState | null = useAppSelector((state) =>
    state.auth.userState
  );

  if (hydrating) {
    if (loading) {
      return loading
    }
    return <div />
  }

  if (check.null(userState) || !requiredPrivileges.find(rp => check.contains(userState!.accessPrivileges, rp))) {
    if (unauthenticatedContent) {
      /*
      if (throwErrorAction) {
        throw throwErrorAction()
      }
      */
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

  return children;
}
