"use client";

import Link from "next/link";
import { ArrowLeft, Settings, SkipForward, RotateCcw } from "lucide-react";
import { useOptionsStore } from "@/lib/store/options";
import styles from "./OptionsPage.module.css";

export default function OptionsPage() {
  const { options, updateOptions, resetOptions } = useOptionsStore();

  const handleSkipIntroChange = (checked: boolean) => {
    console.log("Updating skipIntro:", checked);
    updateOptions({ skipIntro: checked });
  };

  const handleResetOptions = () => {
    console.log("Resetting options");
    resetOptions();
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>
              <Settings className={styles.titleIcon} />
              Options
            </h1>
            <p className={styles.subtitle}>
              Personnalisez votre expérience d'écoute
            </p>
          </div>
        </div>

        {/* Options */}
        <div className={styles.optionsSection}>
          <div className={styles.optionCard}>
            <div className={styles.optionHeader}>
              <div className={styles.optionIcon}>
                <SkipForward size={24} />
              </div>
              <div className={styles.optionInfo}>
                <h3 className={styles.optionTitle}>Passer l'intro</h3>
                <p className={styles.optionDescription}>
                  Ignore automatiquement les {options.introSkipTime} premières secondes de chaque
                  épisode
                </p>
              </div>
            </div>

            <div className={styles.optionControls}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={options.skipIntro}
                  onChange={(e) => handleSkipIntroChange(e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>

              {options.skipIntro && (
                <div className={styles.timeInfo}>
                  <span className={styles.timeLabel}>
                    Temps fixé à {options.introSkipTime} secondes
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Option d'info */}
          <div className={styles.infoCard}>
            <h4 className={styles.infoTitle}>💡 Comment ça marche ?</h4>
            <p className={styles.infoText}>
              Quand cette option est activée, le lecteur audio passera
              automatiquement les {options.introSkipTime} premières secondes de chaque épisode. Utile
              pour éviter les intros répétitives ou les jingles.
            </p>
          </div>

          {/* Bouton reset */}
          <div className={styles.resetSection}>
            <button
              onClick={handleResetOptions}
              className={styles.resetButton}
              title="Remettre les options par défaut"
            >
              <RotateCcw size={16} />
              Remettre les options par défaut
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
