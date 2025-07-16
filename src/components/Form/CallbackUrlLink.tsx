"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface CallbackUrlLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export default function CallbackUrlLink({
  href,
  className,
  children,
}: CallbackUrlLinkProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const finalHref = callbackUrl
    ? `${href}?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : href;

  return (
    <Link href={finalHref} className={className}>
      {children}
    </Link>
  );
}
