"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

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

  // Callback optimisé pour l'intersection observer
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && displayedCount < items.length) {
      setDisplayedCount((prev) => prev + itemsPerPage);
    }
  }, [displayedCount, items.length, itemsPerPage]);

  // Intersection Observer avec callback optimisé
  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, { 
      threshold, 
      rootMargin 
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [handleIntersection, threshold, rootMargin]);

  // Mémoisation des résultats pour éviter les re-calculs
  const displayedItems = useMemo(() => 
    items.slice(0, displayedCount), 
    [items, displayedCount]
  );
  
  const hasMore = useMemo(() => 
    displayedCount < items.length, 
    [displayedCount, items.length]
  );

  return {
    displayedItems,
    hasMore,
    observerRef,
    displayedCount,
    totalCount: items.length,
  };
}
