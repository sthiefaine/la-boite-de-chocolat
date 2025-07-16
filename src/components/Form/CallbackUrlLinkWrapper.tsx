"use client";
import { Suspense } from "react";
import CallbackUrlLink from "./CallbackUrlLink";

interface CallbackUrlLinkWrapperProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export default function CallbackUrlLinkWrapper({
  href,
  className,
  children,
}: CallbackUrlLinkWrapperProps) {
  return (
    <Suspense fallback={<span className={className}>{children}</span>}>
      <CallbackUrlLink href={href} className={className}>
        {children}
      </CallbackUrlLink>
    </Suspense>
  );
} 