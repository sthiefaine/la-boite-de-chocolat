"use client";
import styles from "./FormSkeleton.module.css";

interface FormSkeletonProps {
  fields?: number;
  showButton?: boolean;
}

export default function FormSkeleton({
  fields = 2,
  showButton = true,
}: FormSkeletonProps) {
  return (
    <div className={styles.form}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className={styles.inputGroup}>
          <div className={styles.label}></div>
          <div className={styles.input}></div>
        </div>
      ))}

      {showButton && <div className={styles.button}></div>}
    </div>
  );
}
