'use client';

import { useState, useEffect } from 'react';
import styles from './EpisodeEdit.module.css';

interface TabNavigationProps {
  children: React.ReactNode;
}

export default function TabNavigation({ children }: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    // Gérer les clics sur les onglets
    const handleTabClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains(styles.tab)) {
        const tabId = target.getAttribute('data-tab');
        if (tabId) {
          setActiveTab(tabId);
        }
      }
    };

    document.addEventListener('click', handleTabClick);
    return () => document.removeEventListener('click', handleTabClick);
  }, []);

  useEffect(() => {
    // Mettre à jour les classes des onglets et panneaux
    const tabs = document.querySelectorAll(`.${styles.tab}`);
    const panels = document.querySelectorAll(`.${styles.tabPanel}`);

    tabs.forEach(tab => {
      const tabId = tab.getAttribute('data-tab');
      if (tabId === activeTab) {
        tab.classList.add(styles.tabActive);
      } else {
        tab.classList.remove(styles.tabActive);
      }
    });

    panels.forEach(panel => {
      const panelId = panel.getAttribute('data-tab');
      if (panelId === activeTab) {
        panel.classList.add(styles.tabPanelActive);
      } else {
        panel.classList.remove(styles.tabPanelActive);
      }
    });
  }, [activeTab]);

  return <>{children}</>;
} 