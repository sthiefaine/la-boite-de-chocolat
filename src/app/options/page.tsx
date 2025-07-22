"use client";

import { Settings, SkipForward, RotateCcw, Trash2, Database } from "lucide-react";
import { useOptionsStore } from "@/lib/store/options";
import { useState, useEffect } from "react";
import styles from "./OptionsPage.module.css";

export default function OptionsPage() {
  const { options, updateOptions, resetOptions } = useOptionsStore();
  const [localStorageSize, setLocalStorageSize] = useState<number>(0);
  const [storageDetails, setStorageDetails] = useState<{
    player: number;
    queue: number;
    options: number;
    other: number;
  }>({ player: 0, queue: 0, options: 0, other: 0 });

  // Calculer la taille du localStorage avec détails
  const calculateLocalStorageSize = () => {
    let totalSize = 0;
    let playerSize = 0;
    let queueSize = 0;
    let optionsSize = 0;
    let otherSize = 0;

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const keySize = key.length;
        const valueSize = localStorage[key].length;
        const itemSize = keySize + valueSize;
        totalSize += itemSize;

        if (key === "la-boite-de-chocolat-player") {
          playerSize += itemSize;
        } else if (key === "la-boite-de-chocolat-file-d-attente") {
          queueSize += itemSize;
        } else if (key === "la-boite-de-chocolat-user-options") {
          optionsSize += itemSize;
        } else {
          otherSize += itemSize;
        }
      }
    }

    return {
      total: totalSize,
      details: { player: playerSize, queue: queueSize, options: optionsSize, other: otherSize }
    };
  };

  const clearLocalStorage = () => {
    if (confirm("Êtes-vous sûr de vouloir vider toutes les données locales ? Cette action ne peut pas être annulée.")) {
      localStorage.clear();
      setLocalStorageSize(0);
      setStorageDetails({ player: 0, queue: 0, options: 0, other: 0 });
      window.location.reload();
    }
  };

  useEffect(() => {
    const { total, details } = calculateLocalStorageSize();
    setLocalStorageSize(total);
    setStorageDetails(details);
  }, []);

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

          <div className={styles.optionCard}>
            <div className={styles.optionHeader}>
              <div className={styles.optionIcon}>
                <Database size={24} />
              </div>
              <div className={styles.optionInfo}>
                <h3 className={styles.optionTitle}>Données locales</h3>
                <p className={styles.optionDescription}>
                  Gestion des données stockées localement dans votre navigateur
                </p>
              </div>
            </div>

            <div className={styles.optionControls}>
              <div className={styles.storageInfo}>
                <div className={styles.storageDetails}>
                  <span className={styles.storageSize}>
                    Total : {(localStorageSize / 1024).toFixed(2)} KB
                  </span>
                  {localStorageSize > 0 && (
                    <div className={styles.storageBreakdown}>
                      {storageDetails.player > 0 && (
                        <span className={styles.storageItem}>
                          Lecteur : {(storageDetails.player / 1024).toFixed(2)} KB
                        </span>
                      )}
                      {storageDetails.queue > 0 && (
                        <span className={styles.storageItem}>
                          File d'attente : {(storageDetails.queue / 1024).toFixed(2)} KB
                        </span>
                      )}
                      {storageDetails.options > 0 && (
                        <span className={styles.storageItem}>
                          Options : {(storageDetails.options / 1024).toFixed(2)} KB
                        </span>
                      )}
                      {storageDetails.other > 0 && (
                        <span className={styles.storageItem}>
                          Autres : {(storageDetails.other / 1024).toFixed(2)} KB
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={clearLocalStorage}
                  className={styles.clearButton}
                  title="Vider toutes les données locales"
                  disabled={localStorageSize === 0}
                >
                  <Trash2 size={16} />
                  Vider le cache
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
