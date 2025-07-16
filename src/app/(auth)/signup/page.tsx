"use client";
import { Suspense } from "react";
import styles from "../AuthPage.module.css";
import SignUpForm from "@/components/Form/SignUpForm";
import FormSkeleton from "@/components/Form/FormSkeleton";
import CallbackUrlLink from "@/components/Form/CallbackUrlLink";

export default function SignUpPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Inscription</h1>

        <Suspense fallback={<FormSkeleton fields={4} />}>
          <SignUpForm />
        </Suspense>

        <div className={styles.links}>
          <CallbackUrlLink href="/signin" className={styles.link}>
            Déjà un compte ? Se connecter
          </CallbackUrlLink>
        </div>
      </div>
    </div>
  );
}
