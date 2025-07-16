import { Suspense } from "react";
import styles from "../AuthPage.module.css";
import SignInForm from "@/components/Form/SignInForm";
import FormSkeleton from "@/components/Form/FormSkeleton";
import CallbackUrlLink from "@/components/Form/CallbackUrlLink";

export default function SignInPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Connexion</h1>

        <Suspense fallback={<FormSkeleton fields={2} />}>
          <SignInForm />
        </Suspense>

        <div className={styles.links}>
          <CallbackUrlLink href="/signup" className={styles.link}>
            Pas encore de compte ? S'inscrire
          </CallbackUrlLink>
        </div>
      </div>
    </div>
  );
}
