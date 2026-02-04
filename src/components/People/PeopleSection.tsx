import Image from "next/image";
import Link from "next/link";
import styles from "./PeopleSection.module.css";
import { getUploadServerUrl, IMAGE_CONFIG } from "@/helpers/imageConfig";

interface PeopleSectionProps {
  credits: {
    director: {
      name: string;
      slug: string | null;
      photoFileName: string | null;
    } | null;
    cast: Array<{
      name: string;
      slug: string | null;
      character: string;
      photoFileName: string | null;
    }>;
  };
  filmTitle?: string;
}

export default function PeopleSection({ credits, filmTitle }: PeopleSectionProps) {
  if (!credits) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <svg
            className={styles.headerIcon}
            viewBox="0 0 24 24"
            fill="none"
            width="28"
            height="28"
          >
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              fill="currentColor"
            />
          </svg>
          <h2 className={styles.title}>Personnes</h2>
      </div>

      <div className={styles.content}>
          {/* Director Section */}
          {credits.director && credits.director.slug && (
            <div className={styles.directorSection}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.icon}>🎬</span>
                Réalisation
              </h3>
              <Link href={`/people/${credits.director.slug}`} className={styles.personLink}>
                <div className={styles.person}>
                  {credits.director.photoFileName ? (
                    <div className={styles.profileImage}>
                      <Image
                        src={getUploadServerUrl(credits.director.photoFileName, "people")}
                        alt={credits.director.name}
                        width={80}
                        height={80}
                        className={styles.avatar}
                        quality={IMAGE_CONFIG.defaultQuality}
                      />
                    </div>
                  ) : (
                    <div className={styles.profileImage}>
                      <div className={styles.avatarFallback}>👤</div>
                    </div>
                  )}
                  <div className={styles.personInfo}>
                    <div className={styles.personName}>{credits.director.name}</div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Cast Section */}
          {credits.cast.length > 0 && (
            <div className={styles.castSection}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.icon}>🎭</span>
                Distribution ({credits.cast.length})
              </h3>
              <div className={styles.castGrid}>
                {credits.cast.map((actor, index) => (
                  actor.slug ? (
                    <Link key={index} href={`/people/${actor.slug}`} className={styles.personLink}>
                      <div className={styles.person}>
                        {actor.photoFileName ? (
                          <div className={styles.profileImage}>
                            <Image
                              src={getUploadServerUrl(actor.photoFileName, "people")}
                              alt={actor.name}
                              width={80}
                              height={80}
                              className={styles.avatar}
                              quality={IMAGE_CONFIG.defaultQuality}
                            />
                          </div>
                        ) : (
                          <div className={styles.profileImage}>
                            <div className={styles.avatarFallback}>👤</div>
                          </div>
                        )}
                        <div className={styles.personInfo}>
                          <div className={styles.personName}>{actor.name}</div>
                          {actor.character && (
                            <div className={styles.personRole}>{actor.character}</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div key={index} className={styles.person}>
                      {actor.photoFileName ? (
                        <div className={styles.profileImage}>
                          <Image
                            src={getUploadServerUrl(actor.photoFileName, "people")}
                            alt={actor.name}
                            width={80}
                            height={80}
                            className={styles.avatar}
                            quality={IMAGE_CONFIG.defaultQuality}
                          />
                        </div>
                      ) : (
                        <div className={styles.profileImage}>
                          <div className={styles.avatarFallback}>👤</div>
                        </div>
                      )}
                      <div className={styles.personInfo}>
                        <div className={styles.personName}>{actor.name}</div>
                        {actor.character && (
                          <div className={styles.personRole}>{actor.character}</div>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
