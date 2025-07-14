"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./PasswordInput.module.css";

interface PasswordInputProps {
  id: string;
  name: string;
  placeholder: string;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}

export default function PasswordInput({
  id,
  name,
  placeholder,
  required = false,
  autoComplete = "current-password",
  minLength,
  disabled = false,
  value,
  onChange,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.passwordContainer}>
      <input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        required={required}
        className={`${styles.input} ${styles.passwordInput}`}
        autoComplete={autoComplete}
        minLength={minLength}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className={styles.eyeButton}
        onClick={() => setShowPassword(!showPassword)}
        aria-label={
          showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
        }
        disabled={disabled}
      >
        {showPassword ? (
          <EyeOff size={20} />
        ) : (
          <Eye size={20} />
        )}
      </button>
    </div>
  );
}
