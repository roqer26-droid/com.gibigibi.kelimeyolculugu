import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Coins,
  Home,
  Lightbulb,
  Map,
  Settings,
  Sparkles,
} from 'lucide-react';
import { LevelDefinition, LevelProgress } from '../engine/types';
import { getThemeForLevel } from '../data/themes';
import { VERIFIED_TURKISH_DICTIONARY } from '../data/turkishDictionary';
import {
  HINT_COST,
  detectAutoCompletedWords,
  evaluateSubmittedWord,
  getAvailableBonusWordsForLevel,
  getWordCellKeys,
  isLevelComplete,
  pickHintCellKey,
} from '../engine/wordChecker';
import { CrosswordGrid, HighlightEffect } from './CrosswordGrid';
import { LetterWheel } from './LetterWheel';
import { BonusWordsModal } from './BonusWordsModal';
import { LevelCompleteModal } from './LevelCompleteModal';
import { soundManager } from '../utils/sound';

interface ToastState {
  id: number;
  text: string;
  tone: 'info' | 'bonus' | 'warn';
}

interface PreviewFeedback {
  word: string;
  mode: 'invalid' | 'already' | 'bonus' | 'correct';
  nonce: number;
}

interface GameScreenProps {
  level: LevelDefinition;
  progress: LevelProgress;
  coins: number;
  totalBonusFound: number;
  isLevelAlreadyCompleted: boolean;
  onWordFound: (wordsToAdd: string[]) => void;
  onBonusFound: (word: string, coinsEarned: number) => void;
  onHintUsed: (cellKeyStr: string, autoCompletedWords: string[]) => void;
  onLevelCompleted: (level: LevelDefinition) => {
    earnedCoins: number;
    isFirstTimeClear: boolean;
  };
  onNextLevel: () => void;
  onOpenMenu: () => void;
  onOpenLevels: () => void;
  onOpenSettings: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  level,
  progress,
  coins,
  totalBonusFound,
  onWordFound,
  onBonusFound,
  onHintUsed,
  onLevelCompleted,
  onNextLevel,
  onOpenMenu,
  onOpenLevels,
  onOpenSettings,
}) => {
  const theme = getThemeForLevel(level.id);

  const [activeWord, setActiveWord] = useState('');
  const [previewFeedback, setPreviewFeedback] = useState<PreviewFeedback | null>(null);
  const [highlight, setHighlight] = useState<HighlightEffect | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [bonusBounce, setBonusBounce] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [completionInfo, setCompletionInfo] = useState<{
    earnedCoins: number;
    isFirstTimeClear: boolean;
  } | null>(null);

  const feedbackTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const completeTimerRef = useRef<number | null>(null);
  const completionTriggeredRef = useRef<number | null>(null);
  const nonceRef = useRef(0);

  // Bölüm değiştiğinde geçici ekran durumlarını sıfırla
  useEffect(() => {
    setActiveWord('');
    setPreviewFeedback(null);
    setHighlight(null);
    setToast(null);
    setShowBonusModal(false);
    setCompletionInfo(null);
    completionTriggeredRef.current = null;

    return () => {
      if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (completeTimerRef.current) window.clearTimeout(completeTimerRef.current);
    };
  }, [level.id]);

  const availableBonusWords = useMemo(
    () => getAvailableBonusWordsForLevel(level, VERIFIED_TURKISH_DICTIONARY),
    [level]
  );

  const showToast = useCallback((text: string, tone: ToastState['tone'] = 'info') => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    const id = ++nonceRef.current;
    setToast({ id, text, tone });
    toastTimerRef.current = window.setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 2100);
  }, []);

  const flashPreview = useCallback(
    (word: string, mode: PreviewFeedback['mode'], duration = 450) => {
      if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
      const nonce = ++nonceRef.current;
      setPreviewFeedback({ word, mode, nonce });
      feedbackTimerRef.current = window.setTimeout(() => {
        setPreviewFeedback((curr) => (curr?.nonce === nonce ? null : curr));
      }, duration);
    },
    []
  );

  const triggerHighlight = useCallback(
    (type: HighlightEffect['type'], cellKeys: string[]) => {
      const nonce = ++nonceRef.current;
      setHighlight({ type, cellKeys, nonce });
    },
    []
  );

  // Tüm hedef kelimeler bulunduğunda bölüm tamamlama akışını tetikle
  const checkAndTriggerCompletion = useCallback(
    (nextFoundWords: readonly string[]) => {
      if (
        isLevelComplete(level, nextFoundWords) &&
        completionTriggeredRef.current !== level.id
      ) {
        completionTriggeredRef.current = level.id;
        if (completeTimerRef.current) window.clearTimeout(completeTimerRef.current);
        // Persist the reward and next unlock before the celebration delay.
        const result = onLevelCompleted(level);
        completeTimerRef.current = window.setTimeout(() => {
          soundManager.playLevelComplete();
          setCompletionInfo(result);
        }, 680);
      }
    },
    [level, onLevelCompleted]
  );

  const handleSelectionChange = useCallback((word: string) => {
    setActiveWord(word);
    if (word.length > 0) {
      setPreviewFeedback(null);
    }
  }, []);

  const handleSubmitWord = useCallback(
    (word: string) => {
      setActiveWord('');
      if (completionTriggeredRef.current === level.id) return;

      const outcome = evaluateSubmittedWord(
        word,
        level,
        progress.foundWords,
        progress.bonusWords
      );

      switch (outcome.status) {
        case 'too-short':
          if ([...word].length >= 2) {
            soundManager.playInvalidWord();
            flashPreview(word, 'invalid', 420);
          }
          break;

        case 'target-found': {
          soundManager.playCorrectWord();
          flashPreview(outcome.word, 'correct', 380);

          const nextFound = [...progress.foundWords, outcome.word];
          // Kesişimler + ipuçları sayesinde kendiliğinden tüm harfleri açılan başka kelimeler varsa onları da ekle
          const autoCompleted = detectAutoCompletedWords(
            level,
            nextFound,
            progress.revealedCells
          );
          const allNewWords = [outcome.word, ...autoCompleted];

          // Vurgulanacak kutular
          const keysToHighlight = new Set<string>();
          for (const w of allNewWords) {
            const placed = level.words.find((pw) => pw.word === w);
            if (placed) {
              for (const k of getWordCellKeys(placed)) {
                keysToHighlight.add(k);
              }
            }
          }
          triggerHighlight('found', Array.from(keysToHighlight));
          onWordFound(allNewWords);

          checkAndTriggerCompletion([...progress.foundWords, ...allNewWords]);
          break;
        }

        case 'already-found-target': {
          soundManager.playAlreadyFound();
          flashPreview(outcome.word, 'already', 550);
          showToast('Bu kelimeyi zaten buldun', 'info');
          const placed = level.words[outcome.wordIndex];
          if (placed) {
            triggerHighlight('already', getWordCellKeys(placed));
          }
          break;
        }

        case 'bonus-found': {
          soundManager.playBonusWord();
          flashPreview(outcome.word, 'bonus', 550);
          showToast(`Bonus kelime! +${outcome.coinsEarned} altın`, 'bonus');
          setBonusBounce(true);
          window.setTimeout(() => setBonusBounce(false), 500);
          onBonusFound(outcome.word, outcome.coinsEarned);
          break;
        }

        case 'already-found-bonus': {
          soundManager.playAlreadyFound();
          flashPreview(outcome.word, 'already', 520);
          showToast('Bu kelimeyi zaten buldun', 'info');
          break;
        }

        case 'invalid': {
          soundManager.playInvalidWord();
          flashPreview(outcome.word, 'invalid', 440);
          break;
        }
      }
    },
    [
      level,
      progress.foundWords,
      progress.bonusWords,
      progress.revealedCells,
      flashPreview,
      showToast,
      triggerHighlight,
      onWordFound,
      onBonusFound,
      checkAndTriggerCompletion,
    ]
  );

  // İpucu düğmesi: altın karşılığında henüz açılmamış bir harf kutusunu açar
  const handleUseHint = useCallback(() => {
    if (completionTriggeredRef.current === level.id) return;

    const hintCell = pickHintCellKey(
      level,
      progress.foundWords,
      progress.revealedCells
    );
    if (!hintCell) return;

    if (coins < HINT_COST) {
      soundManager.playInvalidWord();
      showToast(`İpucu için ${HINT_COST} altın gerekli`, 'warn');
      return;
    }

    const nextRevealed = [...progress.revealedCells, hintCell];
    const autoCompleted = detectAutoCompletedWords(
      level,
      progress.foundWords,
      nextRevealed
    );

    if (autoCompleted.length > 0) {
      soundManager.playCorrectWord();
      const highlightKeys = new Set<string>([hintCell]);
      for (const w of autoCompleted) {
        const placed = level.words.find((pw) => pw.word === w);
        if (placed) {
          getWordCellKeys(placed).forEach((k) => highlightKeys.add(k));
        }
      }
      triggerHighlight('found', Array.from(highlightKeys));
    } else {
      soundManager.playHint();
      triggerHighlight('hint', [hintCell]);
    }

    onHintUsed(hintCell, autoCompleted);
    checkAndTriggerCompletion([...progress.foundWords, ...autoCompleted]);
  }, [
    level,
    progress.foundWords,
    progress.revealedCells,
    coins,
    showToast,
    triggerHighlight,
    onHintUsed,
    checkAndTriggerCompletion,
  ]);

  const isWheelDisabled = completionInfo !== null || completionTriggeredRef.current === level.id;
  const displayedWord = activeWord || previewFeedback?.word || '';

  return (
    <div className="relative z-10 flex h-full w-full flex-col justify-between">
      {/* ÜST ÇUBUK */}
      <header className="mx-auto flex w-full max-w-xl shrink-0 items-center justify-between gap-1.5 px-2 pt-3 pb-1.5 sm:gap-2 sm:px-5 sm:pt-4">
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onOpenMenu();
            }}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/92 text-slate-700 shadow-md ring-1 ring-white/90 transition hover:scale-105 active:scale-95 sm:h-10 sm:w-10"
            aria-label="Ana menü"
            title="Ana menü"
          >
            <Home className="h-4.5 w-4.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onOpenLevels();
            }}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/92 text-slate-700 shadow-md ring-1 ring-white/90 transition hover:scale-105 active:scale-95 sm:h-10 sm:w-10"
            aria-label="Bölümler"
            title="Bölümler"
          >
            <Map className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Bölüm ve tema göstergesi */}
        <div className="flex min-w-0 flex-col items-center rounded-2xl bg-white/92 px-2.5 py-1 shadow-md ring-1 ring-white/90 backdrop-blur-xs sm:px-4">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="whitespace-nowrap text-xs font-black tracking-tight text-slate-800 sm:text-base">
              Bölüm {level.id}
            </span>
            <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-600 sm:px-2 sm:text-[11px]">
              {progress.foundWords.length}/{level.words.length}
            </span>
          </div>
          <span className="max-w-[7.5rem] truncate text-[9px] font-extrabold tracking-wide text-slate-500 uppercase sm:max-w-none sm:text-[10px]" title={theme.name}>
            {theme.name}
          </span>
        </div>

        {/* Altın ve ayarlar */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <div
            className="flex h-9 items-center gap-1 rounded-full bg-white/92 px-2 text-xs font-black text-amber-600 shadow-md ring-1 ring-white/90 sm:h-10 sm:gap-1.5 sm:px-3 sm:text-sm"
            aria-label={`Altın miktarı: ${coins}`}
          >
            <Coins className="h-4 w-4 text-amber-500" />
            <span>{coins}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onOpenSettings();
            }}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/92 text-slate-700 shadow-md ring-1 ring-white/90 transition hover:scale-105 active:scale-95 sm:h-10 sm:w-10"
            aria-label="Ayarlar"
            title="Ayarlar"
          >
            <Settings className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* ORTA ALAN: BULMACA IZGARASI + UÇUCU BİLDİRİM */}
      <main className="relative mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col items-center justify-center px-2">
        {/* Uçucu bildirim mesajı */}
        {toast && (
          <div
            key={toast.id}
            className="animate-toast-pop pointer-events-none absolute top-1 z-30 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-extrabold shadow-lg sm:text-sm"
            style={{
              background:
                toast.tone === 'bonus'
                  ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)'
                  : toast.tone === 'warn'
                    ? 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)'
                    : 'rgba(15, 23, 42, 0.84)',
              color: '#ffffff',
            }}
            role="status"
            aria-live="polite"
          >
            {toast.tone === 'bonus' && <Sparkles className="h-3.5 w-3.5" />}
            <span>{toast.text}</span>
          </div>
        )}

        <CrosswordGrid
          level={level}
          theme={theme}
          foundWords={progress.foundWords}
          revealedCells={progress.revealedCells}
          highlight={highlight}
        />
      </main>

      {/* ALT ALAN: OLUŞTURULAN KELİME + ÇEMBER + BONUS & İPUCU DÜĞMELERİ */}
      <section className="mx-auto flex w-full max-w-xl shrink-0 flex-col items-center pb-4 sm:pb-6">
        {/* Oluşturulan kelime önizleme alanı (çemberin hemen üzerinde, sabit yükseklikte) */}
        <div className="mb-2.5 flex h-11 items-center justify-center">
          {displayedWord && (
            <div
              key={previewFeedback ? `fb-${previewFeedback.nonce}` : 'live'}
              className={`flex items-center justify-center rounded-full px-5 py-1.5 text-xl font-black tracking-[0.14em] text-white shadow-lg transition-all sm:text-2xl ${
                previewFeedback?.mode === 'invalid' ? 'animate-word-shake' : ''
              }`}
              style={{
                background:
                  previewFeedback?.mode === 'invalid'
                    ? 'linear-gradient(180deg, #fb7185 0%, #e11d48 100%)'
                    : previewFeedback?.mode === 'already'
                      ? 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)'
                      : previewFeedback?.mode === 'bonus'
                        ? 'linear-gradient(180deg, #f59e0b 0%, #ea580c 100%)'
                        : previewFeedback?.mode === 'correct'
                          ? theme.filledTileBg
                          : theme.previewPillBg,
                boxShadow: '0 6px 16px rgba(15, 23, 42, 0.24)',
              }}
              aria-live="polite"
            >
              {displayedWord}
            </div>
          )}
        </div>

        {/* Harf çemberi ve yan erişilebilir düğmeler */}
        <div className="relative flex w-full items-end justify-center gap-3 px-3 sm:gap-6">
          {/* Sol: Bonus kelimeler düğmesi */}
          <div className="flex flex-col items-center pb-2">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setShowBonusModal(true);
              }}
              className={`relative flex h-13 w-13 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-white/90 bg-white/92 text-amber-600 shadow-[0_4px_0_rgba(15,23,42,0.14),0_8px_18px_rgba(15,23,42,0.14)] transition hover:scale-105 active:scale-95 sm:h-14 sm:w-14 ${
                bonusBounce ? 'animate-bonus-bounce' : ''
              }`}
              aria-label={`Bonus kelimeler (${progress.bonusWords.length})`}
              title="Bonus kelimeler"
            >
              <Sparkles className="h-5.5 w-5.5 fill-amber-300 text-amber-500" />
              <span className="mt-0.5 text-[10px] font-black text-slate-600">
                Bonus
              </span>
              {progress.bonusWords.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                  {progress.bonusWords.length}
                </span>
              )}
            </button>
          </div>

          {/* Merkez: Harf çemberi */}
          <LetterWheel
            levelId={level.id}
            letters={level.letters}
            theme={theme}
            disabled={isWheelDisabled}
            onSelectionChange={handleSelectionChange}
            onSubmitWord={handleSubmitWord}
          />

          {/* Sağ: İpucu düğmesi */}
          <div className="flex flex-col items-center pb-2">
            <button
              type="button"
              onClick={handleUseHint}
              disabled={isWheelDisabled}
              className="relative flex h-13 w-13 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-white/90 bg-white/92 text-sky-600 shadow-[0_4px_0_rgba(15,23,42,0.14),0_8px_18px_rgba(15,23,42,0.14)] transition hover:scale-105 active:scale-95 disabled:opacity-50 sm:h-14 sm:w-14"
              aria-label={`İpucu kullan (${HINT_COST} altın)`}
              title={`İpucu (${HINT_COST} altın)`}
            >
              <Lightbulb className="h-5.5 w-5.5 fill-amber-200 text-amber-500" />
              <span className="mt-0.5 text-[10px] font-black text-slate-600">
                İpucu
              </span>
              <span
                className={`absolute -top-1.5 -right-1.5 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm ring-2 ring-white ${
                  coins >= HINT_COST ? 'bg-sky-500' : 'bg-slate-400'
                }`}
              >
                {HINT_COST}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Bonus kelimeler penceresi */}
      {showBonusModal && (
        <BonusWordsModal
          bonusWords={progress.bonusWords}
          availableCount={availableBonusWords.length}
          totalBonusFound={totalBonusFound}
          onClose={() => setShowBonusModal(false)}
        />
      )}

      {/* Bölüm tamamlama kutlama penceresi */}
      {completionInfo && (
        <LevelCompleteModal
          level={level}
          earnedCoins={completionInfo.earnedCoins}
          bonusCountInLevel={progress.bonusWords.length}
          isFirstTimeClear={completionInfo.isFirstTimeClear}
          onNextLevel={onNextLevel}
          onOpenLevels={onOpenLevels}
        />
      )}
    </div>
  );
};
