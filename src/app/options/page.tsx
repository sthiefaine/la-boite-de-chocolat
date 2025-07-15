"use client";

import { Settings, SkipForward, RotateCcw } from "lucide-react";
import { useOptionsStore } from "@/lib/store/options";
import styles from "./OptionsPage.module.css";

export default function OptionsPage() {
  const { options, updateOptions, resetOptions } = useOptionsStore();

  const handleSkipIntroChange = (checked: boolean) => {
    updateOptions({ skipIntro: checked });
  };

  const handleResetOptions = () => {
    resetOptions();
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>
                <Settings className={styles.titleIcon} />
                Options
              </h1>
              <button
                onClick={handleResetOptions}
                className={styles.resetButton}
                title="Remettre les options par défaut"
              >
                <RotateCcw size={16} />
                Réinitialiser
              </button>
            </div>
            <p className={styles.subtitle}>
              Personnalisez votre expérience d'écoute
            </p>
          </div>
        </div>

        <div className={styles.optionsSection}>
          <div className={styles.optionCard}>
            <div className={styles.optionHeader}>
              <div className={styles.optionIcon}>
                <SkipForward size={24} />
              </div>
              <div className={styles.optionInfo}>
                <h3 className={styles.optionTitle}>Passer l'intro</h3>
                <p className={styles.optionDescription}>
                  Ignore automatiquement les {options.introSkipTime} premières
                  secondes de chaque épisode
                </p>
              </div>
            </div>

            <div className={styles.optionControls}>
              <div className={styles.switchRow}>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={options.skipIntro}
                    onChange={(e) => handleSkipIntroChange(e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>

                {options.skipIntro && (
                  <span className={styles.timeLabel}>
                    Temps fixé à {options.introSkipTime} secondes
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
