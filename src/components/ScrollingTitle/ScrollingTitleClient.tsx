"use client";

import { useEffect, useRef } from "react";

interface ScrollingTitleClientProps {
  title: string;
  speed?: number;
  separator?: string;
  maxLength?: number;
  type?: "marquee" | "bounce" | "typing";
  enabled?: boolean;
}

export function ScrollingTitleClient({
  title,
  speed = 2000,
  separator = " • ",
  maxLength = 50,
  type = "marquee",
  enabled = true
}: ScrollingTitleClientProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const originalTitle = useRef<string>("");

  useEffect(() => {
    // Sauvegarder le titre original
    originalTitle.current = document.title;

    // Ne pas faire défiler si le titre est assez court ou si désactivé
    if (!enabled || title.length <= maxLength) {
      document.title = title;
      return;
    }

    let currentIndex = 0;
    const fullTitle = title + separator + title;

    const updateTitle = () => {
      switch (type) {
        case "marquee":
          // Défilement continu
          const marqueeTitle = fullTitle.substring(currentIndex, currentIndex + maxLength);
          document.title = marqueeTitle;
          currentIndex = (currentIndex + 1) % (title.length + separator.length);
          break;

        case "bounce":
          // Rebond entre le début et la fin
          if (currentIndex <= title.length - maxLength) {
            document.title = title.substring(currentIndex, currentIndex + maxLength);
            currentIndex++;
          } else {
            document.title = title.substring(title.length - maxLength - currentIndex + title.length - maxLength);
            currentIndex--;
            if (currentIndex <= 0) currentIndex = 0;
          }
          break;

        case "typing":
          // Effet de frappe
          if (currentIndex <= title.length) {
            document.title = title.substring(0, currentIndex);
            currentIndex++;
          } else {
            // Pause puis recommence
            setTimeout(() => {
              currentIndex = 0;
            }, 1000);
          }
          break;
      }
    };

    // Démarrer l'animation
    intervalRef.current = setInterval(updateTitle, speed);

    // Nettoyer à la fin
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        document.title = originalTitle.current;
      }
    };
  }, [title, speed, separator, maxLength, type, enabled]);

  // Ce composant ne rend rien visuellement
  return null;
} 