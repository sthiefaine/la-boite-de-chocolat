import React from "react";
import styles from "./ButtonSkeleton.module.css";

interface ButtonSkeletonProps {
  variant?: "primary" | "secondary" | "download" | "tmdb";
  size?: "small" | "medium" | "large";
  className?: string;
  showIcon?: boolean;
}

export default function ButtonSkeleton({
  variant = "primary",
  size = "medium",
  className = "",
  showIcon = true,
}: ButtonSkeletonProps) {
  return (
    <div className={`${styles.buttonSkeleton} ${styles[variant]} ${styles[size]} ${className}`}>
      {showIcon && <div className={styles.iconSkeleton}></div>}
      <div className={styles.textSkeleton}></div>
    </div>
  );
} 