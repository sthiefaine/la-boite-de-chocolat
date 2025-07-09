import Link from "next/link";
import Image from "next/image";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.imageContainer}>
          <Image
            src="/images/boite-de-chocolat-404.png"
            alt="La Boîte de Chocolat - Page non trouvée"
            width={150}
            height={150}
            objectFit="contain"
            objectPosition="center"
            priority
            className={styles.image}
          />
        </div>

        <div className={styles.textContent}>
          <h1 className={styles.title}>Oups ! Cette page n'existe pas</h1>
          <p className={styles.description}>
            Il semble que vous vous soyez égaré dans notre boîte de chocolat...
            Mais pas de panique ! Vous pouvez toujours aller écouter nos
            podcasts avec films !
          </p>

          <div className={styles.actions}>
            <Link href="/" className={styles.primaryButton}>
              🏠 Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
