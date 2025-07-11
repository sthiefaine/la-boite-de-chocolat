"use client";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";
import styles from "../AuthPage.module.css";

type SignUpState = {
  error: string | null;
  success: boolean;
};

async function signUpAction(
  prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    return {
      error: "Les mots de passe ne correspondent pas",
      success: false,
    };
  }

  if (password.length < 6) {
    return {
      error: "Le mot de passe doit contenir au moins 6 caractères",
      success: false,
    };
  }

  try {
    console.log("Tentative d'inscription pour:", email);

    return {
      error: "Bloqué par le dev",
      success: true,
    };

    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name: email.split("@")[0], // Utilise la partie avant @ comme nom
      callbackURL: "/",
    });

    console.log("Résultat de l'inscription:", { data, error });

    if (error) {
      return {
        error: error?.message || "Erreur d'inscription",
        success: false,
      };
    }

    return {
      error: null,
      success: true,
    };
  } catch (err) {
    console.error("Erreur:", err);
    return {
      error: "Erreur d'inscription",
      success: false,
    };
  }
}

export default function SignUpForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signUpAction, {
    error: null,
    success: false,
  } as SignUpState);

  useEffect(() => {
    if (state.success) {
      router.push("/");
    }
  }, [state.success, router]);

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
          required
          className={styles.input}
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="confirmPassword" className={styles.label}>
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirmez votre mot de passe"
          required
          className={styles.input}
        />
      </div>

      {state.error && <div className={styles.error}>{state.error}</div>}

      <button type="submit" disabled={isPending} className={styles.button}>
        {isPending ? "Inscription..." : "S'inscrire"}
      </button>
    </form>
  );
}
