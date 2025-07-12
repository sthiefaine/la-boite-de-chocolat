"use client";

import { useEffect, useState } from "react";
import { ScrollingTitleClient } from "./ScrollingTitleClient";

interface ScrollingTitleWrapperProps {
  title: string;
  speed?: number;
  separator?: string;
  maxLength?: number;
  type?: "marquee" | "bounce" | "typing";
  enabled?: boolean;
}

export function ScrollingTitleWrapper(props: ScrollingTitleWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ne rendre le composant que côté client
  if (!isClient) {
    return null;
  }

  return <ScrollingTitleClient {...props} />;
} 