"use client";
import Link from "next/link";
import { Suspense } from "react";
import styles from "../AuthPage.module.css";
import SignUpForm from "./SignUpForm";

function SignUpFormSkeleton() {
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
      <div className={styles.inputGroup}>
        <div className={styles.label}>Confirmer le mot de passe</div>
        <div className={styles.input} style={{ height: "2.5rem", backgroundColor: "var(--bg-primary)" }}></div>
      </div>
      <div className={styles.button} style={{ height: "2.5rem", backgroundColor: "var(--chocolate-light)" }}></div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Inscription</h1>

        <Suspense fallback={<SignUpFormSkeleton />}>
          <SignUpForm />
        </Suspense>

        <div className={styles.links}>
          <Link href="/signin" className={styles.link}>
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
