import React from 'react';
import { BookOpen, Coins, Sparkles, X } from 'lucide-react';
import { BONUS_WORD_REWARD } from '../engine/wordChecker';
import { soundManager } from '../utils/sound';

interface BonusWordsModalProps {
  bonusWords: readonly string[];
  availableCount: number;
  totalBonusFound: number;
  onClose: () => void;
}

export const BonusWordsModal: React.FC<BonusWordsModalProps> = ({
  bonusWords,
  availableCount,
  totalBonusFound,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-[3px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Bonus kelimeler"
    >
      <div
        className="animate-modal-enter relative w-full max-w-sm rounded-3xl border-2 border-white/90 bg-white/95 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Bonus Kelimeler</h2>
              <p className="text-xs font-semibold text-slate-500">
                Bu bölümde {bonusWords.length} / {availableCount} bulundu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3.5 flex items-center justify-between rounded-2xl bg-amber-50/90 px-3.5 py-2.5 text-xs font-bold text-amber-800 ring-1 ring-amber-200/80">
          <span className="flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-amber-500" />
            Her yeni bonus kelime +{BONUS_WORD_REWARD} altın verir.
          </span>
          <span className="rounded-full bg-white px-2 py-0.5 text-amber-700 shadow-xs">
            Toplam: {totalBonusFound}
          </span>
        </div>

        <p className="mt-3 text-xs font-semibold text-slate-500">
          Bonuslar, oyunun yerleşik Türkçe kelime listesiyle sınırlıdır.
        </p>

        <div className="custom-scroll mt-4 max-h-56 overflow-y-auto pr-1">
          {bonusWords.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center">
              <BookOpen className="h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-bold text-slate-600">
                Henüz bonus kelime bulmadın
              </p>
              <p className="mt-1 text-xs font-medium text-slate-400">
                Listede bulunan ve bulmacada yer almayan kelimeler bonus altın kazandırır.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {bonusWords.map((word) => (
                <span
                  key={word}
                  className="rounded-xl bg-sky-50 px-3 py-1.5 text-sm font-extrabold tracking-wide text-sky-800 ring-1 ring-sky-200/80"
                >
                  {word}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="mt-5 w-full cursor-pointer rounded-2xl bg-slate-800 py-3 text-sm font-extrabold text-white transition hover:bg-slate-700 active:scale-[0.98]"
        >
          Tamam
        </button>
      </div>
    </div>
  );
};
