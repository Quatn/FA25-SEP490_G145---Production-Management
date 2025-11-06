"use client";

import { useAppSelector } from "@/service/hooks";
import { UserProfile } from "@/types/UserProfile";
import check from "check-types";

export default function AuthenticatedContent(
  { children, unauthenticatedContent }: {
    children?: React.ReactNode;
    unauthenticatedContent?: React.ReactNode;
  },
) {
  const userState: UserProfile = useAppSelector((state) =>
    state.auth.userState
  );

  if (check.nonEmptyObject(userState)) {
    return (
      <div>
        {children}
      </div>
    );
  } else if (unauthenticatedContent) {
    return (
      <div>
        {unauthenticatedContent}
      </div>
    );
  }

  return (
    <div>
    </div>
  );
}
