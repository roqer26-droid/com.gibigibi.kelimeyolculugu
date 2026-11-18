import React, { useMemo } from 'react';
import { ArrowRight, Award, Coins, Map, Sparkles, Star } from 'lucide-react';
import { LevelDefinition } from '../engine/types';
import { getThemeForLevel, THEMES } from '../data/themes';
import { LEVELS } from '../data/levels';
import { soundManager } from '../utils/sound';

interface LevelCompleteModalProps {
  level: LevelDefinition;
  earnedCoins: number;
  bonusCountInLevel: number;
  isFirstTimeClear: boolean;
  onNextLevel: () => void;
  onOpenLevels: () => void;
}

const CONFETTI_COLORS = [
  '#38bdf8',
  '#34d399',
  '#fbbf24',
  '#fb7185',
  '#a78bfa',
  '#f97316',
];

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  earnedCoins,
  bonusCountInLevel,
  isFirstTimeClear,
  onNextLevel,
  onOpenLevels,
}) => {
  const hasNextLevel = level.id < LEVELS.length;
  const currentTheme = getThemeForLevel(level.id);
  const nextTheme = hasNextLevel ? getThemeForLevel(level.id + 1) : null;
  const unlockedNewTheme =
    isFirstTimeClear && nextTheme !== null && nextTheme.id !== currentTheme.id;

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 24 }, (_, idx) => ({
        id: idx,
        left: `${4 + ((idx * 37) % 92)}%`,
        delay: `${(idx % 8) * 0.14}s`,
        duration: `${2.2 + (idx % 5) * 0.35}s`,
        color: CONFETTI_COLORS[idx % CONFETTI_COLORS.length],
        size: 8 + (idx % 3) * 3,
      })),
    []
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-[4px]"
      role="dialog"
      aria-modal="true"
      aria-label={`Bölüm ${level.id} tamamlandı`}
    >
      {/* Kutlama konfetileri */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {confettiPieces.map((p) => (
          <span
            key={p.id}
            className="absolute top-0 rounded-sm"
            style={{
              left: p.left,
              width: p.size,
              height: p.size * 1.4,
              backgroundColor: p.color,
              animation: `confettiFall ${p.duration} ease-in ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Kutlama kartı */}
      <div className="animate-modal-enter relative w-full max-w-sm overflow-hidden rounded-3xl border-2 border-white/90 bg-white/95 p-6 text-center shadow-2xl">
        {/* Üst dekoratif yıldız halkası */}
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30">
          {hasNextLevel ? <Star className="h-9 w-9 fill-white" /> : <Award className="h-9 w-9" />}
        </div>

        <p className="text-xs font-extrabold uppercase tracking-wider text-sky-600">
          {currentTheme.name}
        </p>
        <h2 className="mt-1 text-2xl font-black text-slate-800">
          {hasNextLevel ? `Bölüm ${level.id} Tamamlandı!` : 'Harika Bir Yolculuk!'}
        </h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          {hasNextLevel
            ? 'Tüm hedef kelimeleri başarıyla buldun.'
            : `Tüm ${LEVELS.length} bölümü başarıyla tamamladın!`}
        </p>

        {/* Özet kartları */}
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl bg-slate-50 px-2 py-3 ring-1 ring-slate-200/80">
            <div className="text-xs font-bold text-slate-400">Kelime</div>
            <div className="mt-0.5 text-lg font-black text-slate-700">
              {level.words.length}/{level.words.length}
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 px-2 py-3 ring-1 ring-amber-200/80">
            <div className="text-xs font-bold text-amber-600">Ödül</div>
            <div className="mt-0.5 flex items-center justify-center gap-1 text-lg font-black text-amber-600">
              <Coins className="h-4 w-4" />+{earnedCoins}
            </div>
          </div>

          <div className="rounded-2xl bg-sky-50 px-2 py-3 ring-1 ring-sky-200/80">
            <div className="text-xs font-bold text-sky-600">Bonus</div>
            <div className="mt-0.5 text-lg font-black text-sky-700">
              {bonusCountInLevel}
            </div>
          </div>
        </div>

        {/* Yeni manzara açıldı bildirimi */}
        {unlockedNewTheme && nextTheme && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-50 to-sky-50 px-3.5 py-2.5 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-200">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
            <span>Yeni manzara açıldı: {THEMES[nextTheme.id].name}!</span>
          </div>
        )}

        {/* Düğmeler */}
        <div className="mt-6 flex flex-col gap-2.5">
          {hasNextLevel && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onNextLevel();
              }}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-base font-black text-white shadow-lg transition-all hover:brightness-105 active:scale-[0.98]"
              style={{
                background: currentTheme.accentBg,
                boxShadow: '0 6px 18px rgba(15, 23, 42, 0.2)',
              }}
            >
              <span>Sonraki Bölüm</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onOpenLevels();
            }}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-extrabold text-slate-700 transition-all hover:bg-slate-100 active:scale-[0.98]"
          >
            <Map className="h-4 w-4" />
            <span>Bölümler</span>
          </button>
        </div>
      </div>
    </div>
  );
};
