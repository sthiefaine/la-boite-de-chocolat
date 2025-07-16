"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { useEffect, useState } from "react";
import styles from "./SignUpForm.module.css";
import { signUpAction } from "@/app/actions/form";
import PasswordInput from "./Input/PasswordInput";
import GoogleButton from "./GoogleButton";

type SignUpState = {
  error: string | null;
  success: boolean;
  isValidKey: boolean;
};

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [state, formAction, isPending] = useActionState(signUpAction, {
    error: null,
    success: false,
    isValidKey: false,
  } as SignUpState);

  useEffect(() => {
    if (state.success) {
      // Vider les champs en cas de succès
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        router.push(callbackUrl);
      }, 100);
    }
  }, [state.success, router, callbackUrl]);

  return (
    <>
      {state.success ? (
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>
          <h2 className={styles.successTitle}>Inscription réussie !</h2>
          <p className={styles.successMessage}>Redirection en cours...</p>
        </div>
      ) : (
        <>
          <GoogleButton disabled={isPending} />

          <div className={styles.divider}>
            <span className={styles.dividerText}>ou</span>
          </div>

          <form action={formAction} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email<span className={styles.required}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="votre@email.com"
                required
                className={styles.input}
                autoComplete="email"
                disabled={isPending}
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Mot de passe<span className={styles.required}>*</span>
              </label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Votre mot de passe"
                required
                minLength={8}
                disabled={isPending}
                value={formData.password}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, password: value }))
                }
              />
              <div className={styles.passwordHint}>Minimum 8 caractères</div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirmer le mot de passe
                <span className={styles.required}>*</span>
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirmez votre mot de passe"
                required
                minLength={8}
                disabled={isPending}
                value={formData.confirmPassword}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: value }))
                }
              />
            </div>

            {/* Captcha caché comme leurre pour les robots */}
            <div
              className={styles.inputGroup}
              style={{
                position: "absolute",
                left: "-9999px",
                visibility: "hidden",
                opacity: 0,
                pointerEvents: "none",
              }}
            >
              <label htmlFor="captcha" className={styles.label}>
                Captcha
              </label>
              <span className={styles.captcha}>3+3 = ?</span>
              <input
                id="captcha"
                name="captcha"
                type="number"
                placeholder="3+3 = ?"
                className={styles.input}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {state.error && (
              <div className={styles.error} role="alert">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className={styles.button}
              aria-describedby={state.error ? "error-message" : undefined}
            >
              {isPending ? (
                <>
                  <span className="animate-pulse">Inscription en cours...</span>
                </>
              ) : (
                "S'inscrire"
              )}
            </button>
          </form>
        </>
      )}
    </>
  );
}
