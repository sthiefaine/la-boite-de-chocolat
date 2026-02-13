import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllPeople } from "@/app/actions/person";
import { getUploadServerUrl, IMAGE_CONFIG } from "@/helpers/imageConfig";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import { SITE_URL } from "@/helpers/config";
import styles from "./PeoplePage.module.css";

export const metadata: Metadata = {
  title: "Toutes les Personnes | La Boîte de Chocolat",
  description:
    "Découvrez tous les acteurs et réalisateurs des films analysés dans le podcast La Boîte de Chocolat.",
  alternates: {
    canonical: `${SITE_URL}/people`,
  },
};

export default async function PeoplePage() {
  const result = await getAllPeople();
  const people = result.success ? result.data : [];

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: "Personnes" },
          ]}
        />

        <div className={styles.header}>
          <h1 className={styles.title}>Personnes</h1>
          <p className={styles.subtitle}>
            {people.length} acteur{people.length > 1 ? "s" : ""} et réalisateur
            {people.length > 1 ? "s" : ""} dans le podcast
          </p>
        </div>

        {people.length === 0 ? (
          <div className={styles.empty}>Aucune personne trouvée.</div>
        ) : (
          <div className={styles.grid}>
            {people.map((person) => (
              <Link
                key={person.id}
                href={`/people/${person.slug}`}
                className={styles.personCard}
              >
                <div className={styles.profileImage}>
                  {person.photoFileName ? (
                    <Image
                      src={getUploadServerUrl(person.photoFileName, "people")}
                      alt={person.name}
                      width={72}
                      height={72}
                      className={styles.avatar}
                      quality={IMAGE_CONFIG.defaultQuality}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.avatarFallback}>👤</div>
                  )}
                </div>
                <div className={styles.personInfo}>
                  <h2 className={styles.personName}>{person.name}</h2>
                  <div className={styles.personStats}>
                    {person.filmsAsDirector > 0 && (
                      <span className={styles.stat}>
                        🎬 {person.filmsAsDirector} film
                        {person.filmsAsDirector > 1 ? "s" : ""}
                      </span>
                    )}
                    {person.filmsAsActor > 0 && (
                      <span className={styles.stat}>
                        🎭 {person.filmsAsActor} film
                        {person.filmsAsActor > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
