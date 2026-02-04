"use client";

import { useState, useEffect } from "react";

/**
 * Hook pour animer un nombre de 0 à une valeur finale
 * @param end - Valeur finale à atteindre
 * @param duration - Durée de l'animation en ms (défaut: 1000ms)
 * @param shouldAnimate - Si false, affiche directement la valeur finale
 * @returns Le nombre actuel animé
 */
export function useCountAnimation(
  end: number,
  duration: number = 1000,
  shouldAnimate: boolean = true
): number {
  const [count, setCount] = useState(shouldAnimate ? 0 : end);

  useEffect(() => {
    if (!shouldAnimate) {
      setCount(end);
      return;
    }

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Utiliser easeOutExpo pour une animation plus naturelle
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, shouldAnimate]);

  return count;
}
