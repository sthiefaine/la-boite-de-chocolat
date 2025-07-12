import React from "react";
import Link from "next/link";
import styles from "./Button.module.css";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "download" | "tmdb";
  size?: "small" | "medium" | "large";
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
  download?: boolean;
  target?: string;
  rel?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "medium",
  href,
  onClick,
  disabled = false,
  loading = false,
  className = "",
  icon,
  download,
  target,
  rel,
}: ButtonProps) {
  const baseClassName = `${styles.button} ${styles[variant]} ${styles[size]} ${className}`;
  const isDisabled = disabled || loading;

  const buttonContent = (
    <>
      {loading && <span className={styles.loadingSpinner}></span>}
      {icon && !loading && <span className={styles.buttonIcon}>{icon}</span>}
      <span className={styles.buttonText}>{children}</span>
    </>
  );

  // Si c'est un lien externe
  if (href && (href.startsWith("http") || target === "_blank")) {
    return (
      <a
        href={href}
        className={`${baseClassName} ${isDisabled ? styles.disabled : ""}`}
        target={target}
        rel={rel || (target === "_blank" ? "noopener noreferrer" : undefined)}
        download={download}
        onClick={onClick}
      >
        {buttonContent}
      </a>
    );
  }

  // Si c'est un lien interne
  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClassName} ${isDisabled ? styles.disabled : ""}`}
        onClick={onClick}
      >
        {buttonContent}
      </Link>
    );
  }

  // Bouton standard
  return (
    <button
      className={`${baseClassName} ${isDisabled ? styles.disabled : ""}`}
      onClick={onClick}
      disabled={isDisabled}
      type="button"
    >
      {buttonContent}
    </button>
  );
} 