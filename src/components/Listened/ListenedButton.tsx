"use client";

import { useState, useOptimistic, useTransition, useEffect } from "react";
import { toggleListened, isEpisodeListened } from "@/app/actions/listened";
import { useSession } from "@/lib/auth/auth-client";
import styles from "./ListenedButton.module.css";

interface ListenedButtonProps {
  episodeId: string;
  initialListened?: boolean;
  variant?: "default" | "overlay";
  className?: string;
  children?: React.ReactNode;
}

export default function ListenedButton({
  episodeId,
  initialListened = false,
  variant = "default",
  className,
  children,
}: ListenedButtonProps) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [isListened, setIsListened] = useState(initialListened);

  const [optimisticListened, addOptimisticListened] = useOptimistic(
    isListened,
    (_state, newValue: boolean) => newValue
  );

  useEffect(() => {
    const loadListenedState = async () => {
      if (session?.user && !initialListened) {
        try {
          const listened = await isEpisodeListened(
            episodeId,
            session.user.id
          );
          setIsListened(listened);
        } catch {
          // Silently fail
        }
      }
    };

    loadListenedState();
  }, [session?.user, episodeId, initialListened]);

  const handleToggle = () => {
    if (!session?.user || isPending) return;

    startTransition(async () => {
      const newValue = !optimisticListened;
      addOptimisticListened(newValue);

      try {
        const result = await toggleListened(episodeId, session.user.id);

        if (result.success) {
          setIsListened(result.listened!);
        } else {
          addOptimisticListened(!newValue);
        }
      } catch {
        addOptimisticListened(!newValue);
      }
    });
  };

  const isActive = optimisticListened;

  return (
    <button
      className={`${className ?? styles.listenedButton} ${
        variant === "overlay" ? styles.overlay : ""
      } ${isActive ? styles.active : ""}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
      }}
      disabled={isPending}
      title={
        !session?.user
          ? "Connectez-vous pour marquer comme écouté"
          : isActive
          ? "Marquer comme non écouté"
          : "Marquer comme écouté"
      }
      aria-label={isActive ? "Marquer comme non écouté" : "Marquer comme écouté"}
      aria-pressed={isActive}
    >
      <svg
        className={styles.checkIcon}
        viewBox="0 0 24 24"
        fill={isActive ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isActive ? (
          <>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="10" />
            <polyline points="16 8 12 14 9 11" />
          </>
        )}
      </svg>
      {children}
    </button>
  );
}
