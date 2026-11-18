import React, { useState } from 'react';
import {
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { LEVEL_VALIDATION_REPORT, LEVELS } from '../data/levels';
import { soundManager } from '../utils/sound';

interface SettingsModalProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  soundEnabled,
  onToggleSound,
  onResetProgress,
  onClose,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-[3px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Ayarlar"
    >
      <div
        className="animate-modal-enter relative w-full max-w-sm rounded-3xl border-2 border-white/90 bg-white/95 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800">Ayarlar</h2>
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

        {/* Ses Ayarı */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3.5 ring-1 ring-slate-200/80">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                soundEnabled
                  ? 'bg-sky-100 text-sky-600'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-800">
                Ses Efektleri
              </div>
              <div className="text-xs font-semibold text-slate-500">
                {soundEnabled ? 'Açık' : 'Kapalı'}
              </div>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            onClick={onToggleSound}
            className={`relative h-7 w-13 cursor-pointer rounded-full transition-colors ${
              soundEnabled ? 'bg-sky-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Nasıl Oynanır */}
        <div className="mt-3.5 rounded-2xl bg-sky-50/75 p-4 ring-1 ring-sky-100">
          <div className="flex items-center gap-2 text-sm font-extrabold text-sky-900">
            <HelpCircle className="h-4 w-4 text-sky-600" />
            <span>Nasıl Oynanır?</span>
          </div>
          <ul className="mt-2 space-y-1.5 text-xs font-semibold leading-relaxed text-slate-600">
            <li>• Çemberdeki harfleri parmağınla veya fareyle sürükleyerek birleştir.</li>
            <li>• Bir önceki harfe geri sürükleyerek son seçimi iptal edebilirsin.</li>
            <li>• Hedef kelimeler dışındaki geçerli Türkçe kelimeler bonus altın kazandırır.</li>
            <li>• Süre sınırı yoktur; dilediğinde ipucu kullanarak bir harf açabilirsin.</li>
          </ul>
        </div>

        {/* Bölüm Doğrulama Özeti */}
        <div className="mt-3.5 flex items-center justify-between rounded-2xl bg-emerald-50/80 px-3.5 py-2.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200/70">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Doğrulanmış Bulmacalar
          </span>
          <span>
            {LEVELS.length} / {LEVEL_VALIDATION_REPORT.results.length} Bölüm
          </span>
        </div>

        {/* İlerlemeyi Sıfırla */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setConfirmReset(true);
              }}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 py-2.5 text-xs font-extrabold text-rose-600 transition hover:bg-rose-100/70"
            >
              <RotateCcw className="h-4 w-4" />
              <span>İlerlemeyi Sıfırla</span>
            </button>
          ) : (
            <div className="rounded-2xl bg-rose-50 p-3 text-center ring-1 ring-rose-200">
              <p className="text-xs font-bold text-rose-800">
                Tüm bölüm ilerlemen ve altınların başlangıca dönecek. Emin misin?
              </p>
              <div className="mt-2.5 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setConfirmReset(false);
                  }}
                  className="flex-1 cursor-pointer rounded-xl bg-white py-2 text-xs font-extrabold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    onResetProgress();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer rounded-xl bg-rose-600 py-2 text-xs font-extrabold text-white hover:bg-rose-700"
                >
                  Evet, Sıfırla
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
