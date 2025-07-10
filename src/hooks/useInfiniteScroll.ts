"use client";

import { useState, useEffect, useRef } from "react";

interface UseInfiniteScrollProps {
  items: any[];
  itemsPerPage?: number;
  rootMargin?: string;
  threshold?: number;
  resetDependencies?: any[];
}

export function useInfiniteScroll({
  items,
  itemsPerPage = 12,
  rootMargin = "300px",
  threshold = 0.1,
  resetDependencies = [],
}: UseInfiniteScrollProps) {
  const [displayedCount, setDisplayedCount] = useState(itemsPerPage);
  const observerRef = useRef<HTMLDivElement>(null);

  // Reset quand les dépendances changent (filtres, etc.)
  useEffect(() => {
    setDisplayedCount(itemsPerPage);
  }, [...resetDependencies, itemsPerPage]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && displayedCount < items.length) {
          setDisplayedCount((prev) => prev + itemsPerPage);
        }
      },
      { threshold, rootMargin }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [displayedCount, items.length, itemsPerPage, threshold, rootMargin]);

  const displayedItems = items.slice(0, displayedCount);
  const hasMore = displayedCount < items.length;

  return {
    displayedItems,
    hasMore,
    observerRef,
    displayedCount,
    totalCount: items.length,
  };
}
