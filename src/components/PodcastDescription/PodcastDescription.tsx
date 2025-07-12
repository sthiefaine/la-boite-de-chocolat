"use client";

import { useState } from "react";
import { formatPodcastDescription, truncateText } from "@/lib/podcastHelpers";
import styles from "./PodcastDescription.module.css";

interface PodcastDescriptionProps {
  description: string;
  showFull?: boolean;
  maxLength?: number;
}

export default function PodcastDescription({
  description,
  showFull = false,
  maxLength = 300,
}: PodcastDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(showFull);
  const info = formatPodcastDescription(description);
  const displayText = isExpanded
    ? info.cleanDescription
    : truncateText(info.cleanDescription, maxLength);

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        {displayText.split("\n\n").map((paragraph, index) => (
          <p key={index} className={styles.paragraph}>
            {paragraph}
          </p>
        ))}
        {!isExpanded && info.cleanDescription.length > maxLength && (
          <button
            className={styles.readMore}
            onClick={() => setIsExpanded(true)}
          >
            Lire la suite
          </button>
        )}
      </div>

      {(info.socialLinks.length > 0 || info.hosts) && (
        <div className={styles.metadata}>
          {info.hosts && info.hosts.length > 0 && (
            <div className={styles.hosts}>
              <span className={styles.label}>Avec :</span>
              <span className={styles.hostsList}>{info.hosts.join(", ")}</span>
            </div>
          )}

          {info.socialLinks.length > 0 && (
            <div className={styles.socialLinks}>
              {info.socialLinks.map((link, index) => (
                <span key={index} className={styles.socialLink}>
                  {link}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
