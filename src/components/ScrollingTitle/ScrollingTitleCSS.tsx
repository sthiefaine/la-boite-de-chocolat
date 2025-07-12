"use client";

import { useEffect } from "react";

interface ScrollingTitleCSSProps {
  title: string;
  speed?: number;
  enabled?: boolean;
}

export function ScrollingTitleCSS({
  title,
  speed = 3000,
  enabled = true
}: ScrollingTitleCSSProps) {
  useEffect(() => {
    if (!enabled) return;

    const originalTitle = document.title;
    let currentIndex = 0;
    const maxLength = 50;

    // Ne pas animer si le titre est assez court
    if (title.length <= maxLength) {
      document.title = title;
      return;
    }

    const interval = setInterval(() => {
      // Créer un effet de défilement
      const scrollTitle = title + " • " + title;
      const displayTitle = scrollTitle.substring(currentIndex, currentIndex + maxLength);
      document.title = displayTitle;
      
      currentIndex = (currentIndex + 1) % (title.length + 3); // +3 pour " • "
    }, speed);

    return () => {
      clearInterval(interval);
      document.title = originalTitle;
    };
  }, [title, speed, enabled]);

  return null;
} 