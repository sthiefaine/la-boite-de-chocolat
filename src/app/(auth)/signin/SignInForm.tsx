"use client";
import { signIn } from "@/lib/auth/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { useEffect } from "react";
import styles from "../AuthPage.module.css";

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

async function signInAction(prevState: SignInState, formData: FormData): Promise<SignInState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  try {
    const { data, error } = await signIn.email({
      email,
      password,
      rememberMe: false,
    },
  );
    console.log("Résultat de la connexion:", { data, error });
    if (error) {
      return {
        error: error.message || "Erreur de connexion",
        success: false,
      };
    }
    return {
      error: null,
      success: true,
      data,
    };
  } catch (err) {
    return {
      error: "Une erreur inattendue s'est produite",
      success: false,
    };
  }
}

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [state, formAction, isPending] = useActionState(signInAction, {
    error: null,
    success: false,
  } as SignInState);

  useEffect(() => {
    if (state.success) {
      // Redirection côté client pour s'assurer que ça fonctionne
      router.push(callbackUrl);
      router.refresh();
    }
  }, [state.success, router, callbackUrl]);

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.inputGroup}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="votre@email.com"
          required
          className={styles.input}
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="password" className={styles.label}>
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Votre mot de passe"
          defaultValue="password123"
          required
          className={styles.input}
        />
      </div>

      {state.error && <div className={styles.error}>{state.error}</div>}

      <button type="submit" disabled={isPending} className={styles.button}>
        {isPending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}