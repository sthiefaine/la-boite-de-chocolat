"use client";

import styles from "./BackButton.module.css";

interface BackButtonProps {
  className?: string;
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
}

export default function BackButton({
  className,
  children,
  size = "medium",
}: BackButtonProps) {
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  const buttonClasses = [styles.backButton, styles[size], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button onClick={handleGoBack} className={buttonClasses}>
      {children}
    </button>
  );
}
