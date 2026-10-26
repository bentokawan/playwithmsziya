import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FilterCategoryId, LanguageCode } from './types';
import { CATEGORY_FILTERS, HOME_GAMES } from './homeData';
import { HeaderBar } from './components/HeaderBar';
import { CategoryTabs } from './components/CategoryTabs';
import { GameGrid } from './components/GameGrid';
import { BottomDock } from './components/BottomDock';
import { LanguageModal } from './components/LanguageModal';
import styles from './Home.module.css';

const LANGUAGE_STORAGE_KEY = 'lang';

function readStoredLanguage(): LanguageCode | null {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === 'id' || stored === 'en' ? stored : null;
  } catch {
    return null;
  }
}

interface HomePageProps {
  readonly onOpenParentGate?: () => void;
}

export function HomePage({ onOpenParentGate }: HomePageProps) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterCategoryId>('semua');
  const [language, setLanguage] = useState<LanguageCode>(() => readStoredLanguage() ?? 'id');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(() => readStoredLanguage() === null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      /* storage tidak tersedia — abaikan */
    }
  }, [language]);

  const filteredGames =
    activeFilter === 'semua'
      ? HOME_GAMES
      : HOME_GAMES.filter((game) => game.category === activeFilter);

  const handleSelectGame = (path: string) => {
    navigate(path);
  };

  const handleOpenLanguageModal = () => {
    setIsLanguageModalOpen(true);
  };

  const handleSelectLanguage = (selected: LanguageCode) => {
    setLanguage(selected);
    setIsLanguageModalOpen(false);
  };

  const handleCloseLanguageModal = () => {
    setIsLanguageModalOpen(false);
  };

  const handleToggleSound = () => {
    setIsMuted((prev) => !prev);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleParentGate = () => {
    if (onOpenParentGate) {
      onOpenParentGate();
    }
  };

  return (
    <div className={styles.canvasContainer}>
      <main className={styles.screen}>
        <HeaderBar
          language={language}
          onToggleLanguage={handleOpenLanguageModal}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />

        <CategoryTabs
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          categories={CATEGORY_FILTERS}
        />

        <GameGrid games={filteredGames} onSelectGame={handleSelectGame} />

        <BottomDock
          childName="Adik Bintang"
          streakDays={3}
          totalStars={12}
          onOpenParentGate={handleParentGate}
        />

        {isLanguageModalOpen && (
          <LanguageModal
            currentLanguage={language}
            onSelect={handleSelectLanguage}
            onClose={handleCloseLanguageModal}
          />
        )}

        <footer className={styles.footerStrip}>
          <span className={styles.footerLeft}>
            <span className={styles.footerDot} aria-hidden="true" /> Lingkungan Bermain Aman &amp; Ramah Anak (Usia 4-6)
          </span>
          <span className={styles.footerRight}>PENDIDIKAN SADAR ANAK &nbsp;•&nbsp; TANPA IKLAN</span>
        </footer>
      </main>
    </div>
  );
}
