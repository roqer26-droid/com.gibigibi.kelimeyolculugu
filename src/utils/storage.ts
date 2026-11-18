import { LevelProgress, SaveState } from '../engine/types';

const STORAGE_KEY = 'kelime_yolculugu_save_v1';
const SAVE_VERSION = 1;
export const INITIAL_COINS = 120;

export function createEmptyProgress(): LevelProgress {
  return {
    foundWords: [],
    revealedCells: [],
    bonusWords: [],
  };
}

export function createDefaultSaveState(): SaveState {
  return {
    version: SAVE_VERSION,
    unlockedLevel: 1,
    currentLevel: 1,
    coins: INITIAL_COINS,
    completedLevels: [],
    totalBonusFound: 0,
    progressByLevel: {},
    settings: {
      soundEnabled: true,
    },
  };
}

export function loadSaveState(maxLevelId: number): SaveState {
  const fallback = createDefaultSaveState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<SaveState>;
    if (!parsed || typeof parsed !== 'object') return fallback;

    const safeMax = Math.max(1, maxLevelId);
    const unlockedLevel =
      typeof parsed.unlockedLevel === 'number' && Number.isFinite(parsed.unlockedLevel)
        ? Math.min(safeMax, Math.max(1, Math.floor(parsed.unlockedLevel)))
        : 1;

    const currentLevel =
      typeof parsed.currentLevel === 'number' && Number.isFinite(parsed.currentLevel)
        ? Math.min(unlockedLevel, Math.max(1, Math.floor(parsed.currentLevel)))
        : unlockedLevel;

    const coins =
      typeof parsed.coins === 'number' && Number.isFinite(parsed.coins) && parsed.coins >= 0
        ? Math.floor(parsed.coins)
        : INITIAL_COINS;

    const completedLevels = Array.isArray(parsed.completedLevels)
      ? [
          ...new Set(
            parsed.completedLevels.filter(
              (n): n is number =>
                typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= safeMax
            )
          ),
        ]
      : [];

    const totalBonusFound =
      typeof parsed.totalBonusFound === 'number' &&
      Number.isFinite(parsed.totalBonusFound) &&
      parsed.totalBonusFound >= 0
        ? Math.floor(parsed.totalBonusFound)
        : 0;

    const progressByLevel: Record<number, LevelProgress> = {};
    if (parsed.progressByLevel && typeof parsed.progressByLevel === 'object') {
      for (const [k, v] of Object.entries(parsed.progressByLevel)) {
        const id = Number(k);
        if (!Number.isInteger(id) || id < 1 || id > safeMax || !v || typeof v !== 'object') {
          continue;
        }
        const rawProg = v as Partial<LevelProgress>;
        progressByLevel[id] = {
          foundWords: Array.isArray(rawProg.foundWords)
            ? rawProg.foundWords.filter((s): s is string => typeof s === 'string')
            : [],
          revealedCells: Array.isArray(rawProg.revealedCells)
            ? rawProg.revealedCells.filter((s): s is string => typeof s === 'string')
            : [],
          bonusWords: Array.isArray(rawProg.bonusWords)
            ? rawProg.bonusWords.filter((s): s is string => typeof s === 'string')
            : [],
        };
      }
    }

    const soundEnabled =
      parsed.settings && typeof parsed.settings.soundEnabled === 'boolean'
        ? parsed.settings.soundEnabled
        : true;

    // Önceki sürümleri bitiren oyuncuları yeni içeriğe kesintisiz taşı
    let migratedUnlocked = unlockedLevel;
    let migratedCurrent = currentLevel;
    if (safeMax > 30 && unlockedLevel === 30 && completedLevels.includes(30)) {
      migratedUnlocked = 31;
      migratedCurrent = currentLevel <= 30 ? 31 : currentLevel;
    }
    if (safeMax > 100 && unlockedLevel === 100 && completedLevels.includes(100)) {
      migratedUnlocked = 101;
      migratedCurrent = currentLevel <= 100 ? 101 : currentLevel;
    }
    if (safeMax > 200 && unlockedLevel === 200 && completedLevels.includes(200)) {
      migratedUnlocked = 201;
      migratedCurrent = currentLevel <= 200 ? 201 : currentLevel;
    }
    if (safeMax > 350 && unlockedLevel === 350 && completedLevels.includes(350)) {
      migratedUnlocked = 351;
      migratedCurrent = currentLevel <= 350 ? 351 : currentLevel;
    }
    if (safeMax > 700 && unlockedLevel === 700 && completedLevels.includes(700)) {
      migratedUnlocked = 701;
      migratedCurrent = currentLevel <= 700 ? 701 : currentLevel;
    }
    if (safeMax > 1000 && unlockedLevel === 1000 && completedLevels.includes(1000)) {
      migratedUnlocked = 1001;
      // Keep a deliberately selected replay, but move a finished final level forward.
      migratedCurrent = currentLevel === 1000 ? 1001 : currentLevel;
    }
    if (safeMax > 1500 && unlockedLevel === 1500 && completedLevels.includes(1500)) {
      migratedUnlocked = 1501;
      migratedCurrent = currentLevel === 1500 ? 1501 : currentLevel;
    }
    migratedCurrent = Math.min(migratedUnlocked, migratedCurrent);

    return {
      version: SAVE_VERSION,
      unlockedLevel: migratedUnlocked,
      currentLevel: migratedCurrent,
      coins,
      completedLevels,
      totalBonusFound,
      progressByLevel,
      settings: {
        soundEnabled,
      },
    };
  } catch {
    return fallback;
  }
}

export function persistSaveState(state: SaveState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Depolama kotası veya gizli mod durumunda oyun kesintisiz devam eder
  }
}

export function clearSaveState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sessizce yoksay
  }
}
