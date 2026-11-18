import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { LevelDefinition, SaveState, ScreenId } from './engine/types';
import { LEVELS, getLevelById } from './data/levels';
import { getThemeForLevel } from './data/themes';
import { HINT_COST, REPLAY_LEVEL_REWARD } from './engine/wordChecker';
import {
  clearSaveState,
  createDefaultSaveState,
  createEmptyProgress,
  loadSaveState,
  persistSaveState,
} from './utils/storage';
import { soundManager } from './utils/sound';
import { ScenicBackground } from './components/ScenicBackground';
import { MainMenu } from './components/MainMenu';
import { LevelSelect } from './components/LevelSelect';
import { GameScreen } from './components/GameScreen';
import { SettingsModal } from './components/SettingsModal';
import { IntroSplash } from './components/IntroSplash';

export function App(): React.ReactElement {
  const [save, setSave] = useState<SaveState>(() =>
    loadSaveState(Math.max(1, LEVELS.length))
  );
  const [screen, setScreen] = useState<ScreenId>('menu');
  const [activeLevelId, setActiveLevelId] = useState<number>(() =>
    loadSaveState(Math.max(1, LEVELS.length)).currentLevel
  );
  const [showSettings, setShowSettings] = useState(false);
  // gibigibi Games introsu: her açılışta bir kez (5 sn), ardından menüye geçiş
  const [showIntro, setShowIntro] = useState(true);

  // Android geri tuşu: açık pencereyi kapatır, oyundan/bölüm seçiminden menüye döner, menüde uygulamadan çıkar
  const backStateRef = useRef({ showIntro, showSettings, screen });
  backStateRef.current = { showIntro, showSettings, screen };
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const handle = CapApp.addListener('backButton', () => {
      const st = backStateRef.current;
      if (st.showIntro) return;
      if (st.showSettings) {
        setShowSettings(false);
        return;
      }
      if (st.screen !== 'menu') {
        setScreen('menu');
        return;
      }
      void CapApp.exitApp();
    });
    return () => {
      void handle.then((h) => h.remove());
    };
  }, []);

  // Ses ayarını ses yöneticisiyle senkronize tut
  useEffect(() => {
    soundManager.setEnabled(save.settings.soundEnabled);
  }, [save.settings.soundEnabled]);

  // Tüm oyun ilerlemesini anlık olarak localStorage'a kaydet
  useEffect(() => {
    persistSaveState(save);
  }, [save]);

  const activeLevel = useMemo(
    () => getLevelById(activeLevelId) ?? LEVELS[0],
    [activeLevelId]
  );

  // Arka plan teması: oyun ekranında aktif bölümün teması, diğer ekranlarda mevcut ilerleme teması
  const displayThemeId = useMemo(() => {
    const refLevelId = screen === 'game' ? activeLevelId : save.currentLevel;
    return getThemeForLevel(refLevelId).id;
  }, [screen, activeLevelId, save.currentLevel]);

  // Bölümü başlat veya devam et (eğer daha önce tamamen bitmiş bir bölüm tekrar seçildiyse kutuları sıfırla, bonus kayıtlarını koru)
  const openLevelForPlay = useCallback((levelId: number) => {
    const targetLevel = getLevelById(levelId);
    if (!targetLevel) return;

    setSave((prev) => {
      const existing = prev.progressByLevel[levelId] ?? createEmptyProgress();
      const isAlreadySolvedGrid =
        existing.foundWords.length >= targetLevel.words.length;

      return {
        ...prev,
        currentLevel: levelId,
        progressByLevel: isAlreadySolvedGrid
          ? {
              ...prev.progressByLevel,
              [levelId]: {
                foundWords: [],
                revealedCells: [],
                bonusWords: existing.bonusWords,
              },
            }
          : prev.progressByLevel,
      };
    });

    setActiveLevelId(levelId);
    setScreen('game');
  }, []);

  const handleContinue = useCallback(() => {
    openLevelForPlay(save.currentLevel);
  }, [openLevelForPlay, save.currentLevel]);

  const handleSelectLevel = useCallback(
    (levelId: number) => {
      if (levelId > save.unlockedLevel) return;
      openLevelForPlay(levelId);
    },
    [openLevelForPlay, save.unlockedLevel]
  );

  const handleToggleSound = useCallback(() => {
    setSave((prev) => {
      const nextEnabled = !prev.settings.soundEnabled;
      soundManager.setEnabled(nextEnabled);
      if (nextEnabled) {
        soundManager.playClick();
      }
      return {
        ...prev,
        settings: {
          ...prev.settings,
          soundEnabled: nextEnabled,
        },
      };
    });
  }, []);

  const handleWordFound = useCallback(
    (wordsToAdd: string[]) => {
      setSave((prev) => {
        const currentProg =
          prev.progressByLevel[activeLevelId] ?? createEmptyProgress();
        const mergedFound = Array.from(
          new Set([...currentProg.foundWords, ...wordsToAdd])
        );
        return {
          ...prev,
          progressByLevel: {
            ...prev.progressByLevel,
            [activeLevelId]: {
              ...currentProg,
              foundWords: mergedFound,
            },
          },
        };
      });
    },
    [activeLevelId]
  );

  const handleBonusFound = useCallback(
    (word: string, coinsEarned: number) => {
      setSave((prev) => {
        const currentProg =
          prev.progressByLevel[activeLevelId] ?? createEmptyProgress();
        if (currentProg.bonusWords.includes(word)) {
          return prev;
        }
        return {
          ...prev,
          coins: prev.coins + coinsEarned,
          totalBonusFound: prev.totalBonusFound + 1,
          progressByLevel: {
            ...prev.progressByLevel,
            [activeLevelId]: {
              ...currentProg,
              bonusWords: [...currentProg.bonusWords, word],
            },
          },
        };
      });
    },
    [activeLevelId]
  );

  const handleHintUsed = useCallback(
    (cellKeyStr: string, autoCompletedWords: string[]) => {
      setSave((prev) => {
        if (prev.coins < HINT_COST) return prev;
        const currentProg =
          prev.progressByLevel[activeLevelId] ?? createEmptyProgress();
        const nextRevealed = currentProg.revealedCells.includes(cellKeyStr)
          ? currentProg.revealedCells
          : [...currentProg.revealedCells, cellKeyStr];
        const nextFound =
          autoCompletedWords.length > 0
            ? Array.from(new Set([...currentProg.foundWords, ...autoCompletedWords]))
            : currentProg.foundWords;

        return {
          ...prev,
          coins: prev.coins - HINT_COST,
          progressByLevel: {
            ...prev.progressByLevel,
            [activeLevelId]: {
              ...currentProg,
              revealedCells: nextRevealed,
              foundWords: nextFound,
            },
          },
        };
      });
    },
    [activeLevelId]
  );

  const handleLevelCompleted = useCallback(
    (level: LevelDefinition) => {
      const isFirstTimeClear = !save.completedLevels.includes(level.id);
      const earnedCoins = isFirstTimeClear ? level.rewardCoins : REPLAY_LEVEL_REWARD;

      setSave((prev) => {
        const firstClear = !prev.completedLevels.includes(level.id);
        const reward = firstClear ? level.rewardCoins : REPLAY_LEVEL_REWARD;
        const nextUnlocked = Math.min(
          LEVELS.length,
          Math.max(prev.unlockedLevel, level.id + 1)
        );
        const nextCurrent =
          level.id < LEVELS.length ? level.id + 1 : level.id;
        const completedLevels = firstClear
          ? [...prev.completedLevels, level.id]
          : prev.completedLevels;

        return {
          ...prev,
          coins: prev.coins + reward,
          unlockedLevel: nextUnlocked,
          currentLevel: nextCurrent,
          completedLevels,
        };
      });

      return { earnedCoins, isFirstTimeClear };
    },
    [save.completedLevels]
  );

  const handleNextLevel = useCallback(() => {
    const nextId = Math.min(LEVELS.length, activeLevelId + 1);
    openLevelForPlay(nextId);
  }, [activeLevelId, openLevelForPlay]);

  const handleResetProgress = useCallback(() => {
    clearSaveState();
    const fresh = createDefaultSaveState();
    setSave(fresh);
    setActiveLevelId(1);
    setScreen('menu');
  }, []);

  if (!activeLevel) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-sky-100 p-6 text-center text-slate-800">
        <div className="max-w-sm rounded-3xl bg-white p-6 shadow-xl">
          <h1 className="text-xl font-black">Bölüm Verisi Yüklenemedi</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Geçerli doğrulanmış bölüm bulunamadı. Lütfen bölüm doğrulama kayıtlarını kontrol edin.
          </p>
        </div>
      </div>
    );
  }

  const activeProgress =
    save.progressByLevel[activeLevel.id] ?? createEmptyProgress();

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Doğa manzaralı canlı arka plan */}
      <ScenicBackground theme={displayThemeId} />

      {/* Aktif ekran */}
      {screen === 'menu' && (
        <MainMenu
          save={save}
          onContinue={handleContinue}
          onOpenLevels={() => setScreen('levels')}
          onOpenSettings={() => setShowSettings(true)}
          onToggleSound={handleToggleSound}
        />
      )}

      {screen === 'levels' && (
        <LevelSelect
          save={save}
          onSelectLevel={handleSelectLevel}
          onBack={() => setScreen('menu')}
        />
      )}

      {screen === 'game' && (
        <GameScreen
          level={activeLevel}
          progress={activeProgress}
          coins={save.coins}
          totalBonusFound={save.totalBonusFound}
          isLevelAlreadyCompleted={save.completedLevels.includes(activeLevel.id)}
          onWordFound={handleWordFound}
          onBonusFound={handleBonusFound}
          onHintUsed={handleHintUsed}
          onLevelCompleted={handleLevelCompleted}
          onNextLevel={handleNextLevel}
          onOpenMenu={() => setScreen('menu')}
          onOpenLevels={() => setScreen('levels')}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* Ayarlar penceresi */}
      {showSettings && (
        <SettingsModal
          soundEnabled={save.settings.soundEnabled}
          onToggleSound={handleToggleSound}
          onResetProgress={handleResetProgress}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Açılış introsu (menü arkada hazır, intro bitince yumuşak geçiş) */}
      {showIntro && <IntroSplash onDone={() => setShowIntro(false)} />}
    </div>
  );
}

export default App;
