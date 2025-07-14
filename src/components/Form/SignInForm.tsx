"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { useEffect, useState } from "react";
import styles from "./SignInForm.module.css";
import { signInAction } from "@/app/actions/form";
import PasswordInput from "./Input/PasswordInput";

type SignInState = {
  error: string | null;
  success: boolean;
  data?: {
    redirect: boolean;
    token: string;
    url: string | undefined;
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
};

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [state, formAction, isPending] = useActionState(signInAction, {
    error: null,
    success: false,
  } as SignInState);

  useEffect(() => {
    if (state.success) {
      setFormData({ email: "", password: "" });
      router.push(callbackUrl);
      router.refresh();
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
          <h2 className={styles.successTitle}>Connexion réussie !</h2>
          <p className={styles.successMessage}>Redirection en cours...</p>
        </div>
      ) : (
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
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
              disabled={isPending}
              value={formData.password}
              onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
            />
          </div>

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
                <span className="animate-pulse">Connexion en cours...</span>
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>
      )}
    </>
  );
} 