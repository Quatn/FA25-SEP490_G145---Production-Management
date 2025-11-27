"use client";
import InsufficientPrivilegeErrorWarning from "@/components/layout/InsufficientPrivilegeErrorWarning";
import UnauthenticatedErrorWarning from "@/components/layout/UnauthenticatedErrorWarning";
import { InsufficientPrivilegeError } from "@/lib/errors/InsufficientPrivilegeError";
import { UnauthenticatedError } from "@/lib/errors/UnauthenticatedError";
import { useEffect } from "react";

export default function AuthenticatedLayoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.log(error)
  }, [error])


  if (error.name === UnauthenticatedError.name) {
    return <UnauthenticatedErrorWarning />;
  }

  if (error.name === InsufficientPrivilegeError.name) {
    const path = (error as InsufficientPrivilegeError).path
    return <InsufficientPrivilegeErrorWarning path={path} />;
  }

  return <UnauthenticatedErrorWarning />;
}
