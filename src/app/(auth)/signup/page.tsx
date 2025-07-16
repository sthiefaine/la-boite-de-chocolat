"use client";
import styles from "../AuthPage.module.css";
import SignUpFormWrapper from "@/components/Form/SignUpFormWrapper";
import CallbackUrlLinkWrapper from "@/components/Form/CallbackUrlLinkWrapper";

export default function SignUpPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Inscription</h1>

        <SignUpFormWrapper />

        <div className={styles.links}>
          <CallbackUrlLinkWrapper href="/signin" className={styles.link}>
            Déjà un compte ? Se connecter
          </CallbackUrlLinkWrapper>
        </div>
      </div>
    </div>
  );
}
