import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.text}>
          Les images de films sont fournies par{" "}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            TMDb
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
