"use client";

import { usePathname } from "next/navigation";
import React from "react";

interface URLMatchProps {
  path: string;
  exact?: boolean;
  children?: React.ReactNode;
  notMatched?: React.ReactNode;
}

export function URLMatch({
  path,
  exact = false,
  children,
  notMatched = null,
}: URLMatchProps) {
  const pathname = usePathname();

  const matched = exact
    ? pathname === path
    : pathname.startsWith(path);

  return matched ? <>{children}</> : <>{notMatched}</>;
}
