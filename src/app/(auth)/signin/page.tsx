import Link from "next/link";
import { Suspense } from "react";
import styles from "../AuthPage.module.css";
import SignInForm from "./SignInForm";

function SignInFormSkeleton() {
  return (
    <div className={styles.form}>
      <div className={styles.inputGroup}>
        <div className={styles.label}>Email</div>
        <div className={styles.input} style={{ height: "2.5rem", backgroundColor: "var(--bg-primary)" }}></div>
      </div>
      <div className={styles.inputGroup}>
        <div className={styles.label}>Mot de passe</div>
        <div className={styles.input} style={{ height: "2.5rem", backgroundColor: "var(--bg-primary)" }}></div>
      </div>
      <div className={styles.button} style={{ height: "2.5rem", backgroundColor: "var(--chocolate-light)" }}></div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Connexion</h1>

        <Suspense fallback={<SignInFormSkeleton />}>
          <SignInForm />
        </Suspense>

        <div className={styles.links}>
          <Link href="/signup" className={styles.link}>
            Pas encore de compte ? S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}
