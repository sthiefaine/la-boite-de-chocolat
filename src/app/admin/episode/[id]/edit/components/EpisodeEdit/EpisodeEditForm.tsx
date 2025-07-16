"use client";

import { useState } from "react";
import { formatEpisodeDescription } from "@/helpers/podcastHelpers";
import { PODCAST_GENRES, AGE_RATINGS, AGE_RATING_LABELS } from "@/helpers/helpers";
import FileUpload from "./FileUpload";
import styles from "./EpisodeEditForm.module.css";

interface EpisodeEditFormProps {
  initialData: {
    title: string;
    description: string;
    genre: string | null;
    imgFileName: string | null;
    age: string | null;
  };
  onSubmit: (data: {
    title: string;
    description: string;
    genre: string | null;
    imgFileName: string | null;
    age: string | null;
  }) => Promise<void>;
  loading: boolean;
}

export default function EpisodeEditForm({
  initialData,
  onSubmit,
  loading,
}: EpisodeEditFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [descriptionView, setDescriptionView] = useState<"raw" | "formatted">(
    "raw"
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className={styles.formSection}>
      <h2 className={styles.sectionTitle}>Informations de l'épisode</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Titre *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="genre" className={styles.label}>
            Genre
          </label>
          <select
            id="genre"
            name="genre"
            value={formData.genre || ""}
            onChange={handleInputChange}
            className={styles.select}
          >
            <option value="">Sélectionner un genre</option>
            {Object.values(PODCAST_GENRES).map((genre) => (
              <option key={genre} value={genre}>
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="age" className={styles.label}>
            Âge recommandé
          </label>
          <select
            id="age"
            name="age"
            value={formData.age || ""}
            onChange={handleInputChange}
            className={styles.select}
          >
            <option value="">Sélectionner un âge</option>
            {Object.values(AGE_RATINGS).map((age) => (
              <option key={age} value={age}>
                {AGE_RATING_LABELS[age as keyof typeof AGE_RATING_LABELS]}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Poster de l'épisode</label>
          <FileUpload
            currentFileName={formData.imgFileName}
            onFileUploaded={(fileName) => {
              setFormData((prev) => ({
                ...prev,
                imgFileName: fileName,
              }));
            }}
          />
        </div>

        <div className={styles.formGroup}>
          <div className={styles.descriptionHeader}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <div className={styles.descriptionToggle}>
              <button
                type="button"
                onClick={() => setDescriptionView("raw")}
                className={`${styles.toggleButton} ${
                  descriptionView === "raw" ? styles.active : ""
                }`}
              >
                Brut
              </button>
              <button
                type="button"
                onClick={() => setDescriptionView("formatted")}
                className={`${styles.toggleButton} ${
                  descriptionView === "formatted" ? styles.active : ""
                }`}
              >
                Formaté
              </button>
            </div>
          </div>

          {descriptionView === "raw" ? (
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={styles.textarea}
              rows={8}
            />
          ) : (
            <div className={styles.formattedDescription}>
              <div
                className={styles.descriptionPreview}
                dangerouslySetInnerHTML={{
                  __html: formatEpisodeDescription(formData.description),
                }}
              />
            </div>
          )}
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? "Mise à jour..." : "Mettre à jour l'épisode"}
          </button>
        </div>
      </form>
    </div>
  );
}
