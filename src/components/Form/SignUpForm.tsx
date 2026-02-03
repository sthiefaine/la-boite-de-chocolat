"use client";
import styles from "./SignUpForm.module.css";
import GoogleButton from "./GoogleButton";

export default function SignUpForm() {
  return (
    <>
      <p className={styles.info}>
        Inscrivez-vous avec votre compte Google
      </p>
      <GoogleButton disabled={false} />
    </>
  );
}
