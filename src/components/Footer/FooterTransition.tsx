"use client";

import { usePlayerStore } from "@/lib/store/player";
import styles from "./FooterTransition.module.css";
import { useShallow } from "zustand/react/shallow";

export default function FooterTransition() {
  const { episode, isMinimized } = usePlayerStore(
    useShallow((state) => ({
      episode: state.episode,
      isMinimized: state.isMinimized,
    }))
  );

  if (episode === null) {
    return null;
  }

  return (
    <div
      className={`${styles.transition} ${isMinimized ? styles.minimized : ""}`}
    />
  );
}
