import React from 'react';
import {
  Coins,
  Compass,
  Map,
  Play,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { SaveState } from '../engine/types';
import { getThemeForLevel } from '../data/themes';
import { LEVELS } from '../data/levels';
import { soundManager } from '../utils/sound';

interface MainMenuProps {
  save: SaveState;
  onContinue: () => void;
  onOpenLevels: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
}

const TITLE_TILES = ['K', 'E', 'L', 'İ', 'M', 'E'];

export const MainMenu: React.FC<MainMenuProps> = ({
  save,
  onContinue,
  onOpenLevels,
  onOpenSettings,
  onToggleSound,
}) => {
  const theme = getThemeForLevel(save.currentLevel);
  const completedCount = save.completedLevels.length;

  return (
    <div className="relative z-10 flex h-full w-full flex-col justify-between px-5 py-5 sm:py-7">
      {/* Üst çubuk */}
      <div className="mx-auto flex w-full max-w-md items-center justify-between">
        <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 text-sm font-black text-amber-600 shadow-md ring-1 ring-white/80 backdrop-blur-xs">
          <Coins className="h-4 w-4 text-amber-500" />
          <span>{save.coins}</span>
        </div>

        <button
          type="button"
          onClick={onToggleSound}
          aria-label={save.settings.soundEnabled ? 'Sesi kapat' : 'Sesi aç'}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md ring-1 ring-white/80 transition hover:scale-105 active:scale-95"
        >
          {save.settings.soundEnabled ? (
            <Volume2 className="h-5 w-5 text-sky-600" />
          ) : (
            <VolumeX className="h-5 w-5 text-slate-400" />
          )}
        </button>
      </div>

      {/* Orta logo ve karşılama alanı */}
      <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
        {/* Dekoratif minyatür harf kutuları */}
        <div className="mb-3 flex items-center gap-1.5" aria-hidden="true">
          {TITLE_TILES.map((ch, idx) => (
            <div
              key={idx}
              className="title-tile flex h-10 w-10 items-center justify-center rounded-xl border border-white/90 bg-white/95 text-lg font-black text-slate-800 shadow-[0_3px_0_rgba(15,23,42,0.16),0_6px_14px_rgba(15,23,42,0.12)] sm:h-11 sm:w-11 sm:text-xl"
              style={{
                ['--tilt' as string]: `${(idx % 2 === 0 ? -1 : 1) * (idx === 2 || idx === 3 ? 2 : 4)}deg`,
                animationDelay: `${idx * 0.22}s`,
              }}
            >
              {ch}
            </div>
          ))}
        </div>

        <div className="relative">
          <div
            className="title-glow pointer-events-none absolute inset-0 -z-0 rounded-full bg-white/25 blur-2xl"
            aria-hidden="true"
          />
          <h1
            aria-label="Kelime Yolculuğu"
            className="relative z-10 text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_10px_rgba(15,23,42,0.32)] sm:text-5xl"
          >
            {'Kelime Yolculuğu'.split('').map((ch, idx) => (
              <span
                key={idx}
                className="title-letter"
                style={{ animationDelay: `${idx * 0.09}s` }}
                aria-hidden="true"
              >
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
          </h1>
        </div>

        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/88 px-4 py-1.5 text-xs font-extrabold text-slate-700 shadow-sm ring-1 ring-white/90 backdrop-blur-xs sm:text-sm">
          <Compass className="h-4 w-4 text-sky-600" />
          <span>
            {theme.name} • Bölüm {save.currentLevel} / {LEVELS.length}
          </span>
        </div>

        {/* Ana menü düğmeleri */}
        <div className="mt-9 flex w-full max-w-[300px] flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onContinue();
            }}
            className="group relative flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-white/75 px-6 py-4 text-lg font-black text-white shadow-[0_6px_0_rgba(15,23,42,0.2),0_14px_26px_rgba(15,23,42,0.22)] transition-all hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0.5 active:scale-[0.99]"
            style={{ background: theme.accentBg }}
          >
            <Play className="h-6 w-6 fill-white transition-transform group-hover:scale-110" />
            <span>Devam Et</span>
            <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-extrabold">
              Bölüm {save.currentLevel}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onOpenLevels();
            }}
            className="flex w-full cursor-pointer items-center justify-between rounded-2xl border-2 border-white/90 bg-white/92 px-5 py-3.5 text-base font-extrabold text-slate-700 shadow-[0_4px_0_rgba(15,23,42,0.12),0_10px_20px_rgba(15,23,42,0.12)] backdrop-blur-xs transition-all hover:bg-white active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              <Map className="h-5 w-5 text-sky-600" />
              <span>Bölümler</span>
            </span>
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-extrabold text-sky-700 ring-1 ring-sky-200/80">
              {completedCount} / {LEVELS.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onOpenSettings();
            }}
            className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border-2 border-white/85 bg-white/88 px-5 py-3.5 text-base font-extrabold text-slate-700 shadow-[0_4px_0_rgba(15,23,42,0.10),0_8px_18px_rgba(15,23,42,0.10)] backdrop-blur-xs transition-all hover:bg-white active:scale-[0.98]"
          >
            <Settings className="h-5 w-5 text-slate-500" />
            <span>Ayarlar</span>
          </button>
        </div>
      </div>

      {/* Alt bilgi */}
      <div className="mx-auto flex w-full max-w-md items-center justify-center">
        <p className="rounded-full bg-slate-900/28 px-4 py-1 text-xs font-bold text-white/95 backdrop-blur-[2px]">
          Süre sınırı yok • Sakin Türkçe kelime bulmaca
        </p>
      </div>
    </div>
  );
};
