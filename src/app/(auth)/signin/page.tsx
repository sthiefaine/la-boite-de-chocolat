import styles from "../AuthPage.module.css";
import SignInFormWrapper from "@/components/Form/SignInFormWrapper";
import CallbackUrlLinkWrapper from "@/components/Form/CallbackUrlLinkWrapper";

export default function SignInPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Connexion</h1>

        <SignInFormWrapper />

        <div className={styles.links}>
          <CallbackUrlLinkWrapper href="/signup" className={styles.link}>
            Pas encore de compte ? S'inscrire
          </CallbackUrlLinkWrapper>
        </div>
      </div>
    </div>
  );
}
