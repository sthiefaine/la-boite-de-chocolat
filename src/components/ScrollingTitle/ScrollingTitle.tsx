"use client";

import { useScrollingTitle } from "@/hooks/useScrollingTitle";

interface ScrollingTitleProps {
  title: string;
  speed?: number;
  separator?: string;
  maxLength?: number;
  type?: "marquee" | "bounce" | "typing";
  enabled?: boolean;
}

export function ScrollingTitle({
  title,
  speed = 2000,
  separator = " • ",
  maxLength = 50,
  type = "marquee",
  enabled = true
}: ScrollingTitleProps) {
  // Toujours appeler le hook, mais avec un titre vide si désactivé
  useScrollingTitle({
    title: enabled ? title : "",
    speed,
    separator,
    maxLength,
    type
  });

  // Ce composant ne rend rien visuellement
  return null;
} 