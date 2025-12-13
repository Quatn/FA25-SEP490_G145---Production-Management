"use client";

import { useRouter } from "next/navigation";
import React from "react";

interface BackLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  fallbackUrl?: string;
}

export function BackLink({
  children,
  fallbackUrl = "/",
  ...props
}: BackLinkProps) {
  const router = useRouter();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();

    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }

    props.onClick?.(e);
  }

  return (
    <a
      href="#"
      {...props}
      onClick={handleClick}
      role="button"
      style={{ cursor: "pointer", ...props.style }}
    >
      {children}
    </a>
  );
}
