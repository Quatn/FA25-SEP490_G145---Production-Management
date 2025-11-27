"use client";

import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import check from "check-types";

export default function AuthenticatedContent(
  { children, loading, unauthenticatedContent, throwErrorAction }: {
    children?: React.ReactNode;
    loading?: React.ReactNode;
    unauthenticatedContent?: React.ReactNode;
    throwErrorAction?: () => Error,
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

  if (check.null(userState)) {
    if (unauthenticatedContent) {
      if (throwErrorAction) {
        throw throwErrorAction()
      }
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
