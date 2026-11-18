import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { ThemeConfig } from '../data/themes';
import { soundManager } from '../utils/sound';

interface WheelTile {
  id: number;
  letter: string;
}

interface Point {
  x: number;
  y: number;
}

interface LetterWheelProps {
  levelId: number;
  letters: readonly string[];
  theme: ThemeConfig;
  disabled?: boolean;
  onSelectionChange: (word: string) => void;
  onSubmitWord: (word: string) => void;
}

export const LetterWheel: React.FC<LetterWheelProps> = ({
  levelId,
  letters,
  theme,
  disabled = false,
  onSelectionChange,
  onSubmitWord,
}) => {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const [wheelSize, setWheelSize] = useState(248);

  // Her taş benzersiz id'ye sahip (aynı harften birden fazla taş olabilir)
  const [tiles, setTiles] = useState<WheelTile[]>(() =>
    letters.map((letter, idx) => ({ id: idx, letter }))
  );

  // Bölüm değiştiğinde taşları sıfırla
  useEffect(() => {
    setTiles(letters.map((letter, idx) => ({ id: idx, letter })));
    setSelectedIds([]);
    selectedIdsRef.current = [];
    setPointerPos(null);
    isDraggingRef.current = false;
    activePointerIdRef.current = null;
    onSelectionChange('');
  }, [levelId, letters, onSelectionChange]);

  // Ekran boyutuna göre çember çapını uyumlu tut
  useEffect(() => {
    const updateSize = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      if (vh < 600 || vw < 340) {
        setWheelSize(190);
      } else if (vh < 680 || vw < 370) {
        setWheelSize(210);
      } else if (vh < 770) {
        setWheelSize(232);
      } else {
        setWheelSize(252);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pointerPos, setPointerPos] = useState<Point | null>(null);
  const [shuffleSpin, setShuffleSpin] = useState(false);

  const selectedIdsRef = useRef<number[]>([]);
  const isDraggingRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);

  const count = tiles.length;
  const center = wheelSize / 2;
  // Harf sayısı arttıkça taşlar küçülür; 9 harfte bile taşlar birbirine değmez
  const nodeScale = count >= 9 ? 0.19 : count === 8 ? 0.21 : count === 7 ? 0.225 : 0.25;
  const nodeSize = Math.round(wheelSize * nodeScale);
  const nodeRadius = nodeSize / 2;
  const orbitRadius = center - nodeRadius - 12;

  // Her taşın çember üzerindeki konumu
  const tilePositions = useMemo(() => {
    const map = new Map<number, Point>();
    tiles.forEach((tile, idx) => {
      const angle = -Math.PI / 2 + (idx / Math.max(1, count)) * Math.PI * 2;
      map.set(tile.id, {
        x: center + Math.cos(angle) * orbitRadius,
        y: center + Math.sin(angle) * orbitRadius,
      });
    });
    return map;
  }, [tiles, count, center, orbitRadius]);

  const tileById = useMemo(() => {
    const map = new Map<number, WheelTile>();
    tiles.forEach((t) => map.set(t.id, t));
    return map;
  }, [tiles]);

  const buildWord = useCallback(
    (ids: readonly number[]) =>
      ids.map((id) => tileById.get(id)?.letter ?? '').join(''),
    [tileById]
  );

  const updateSelection = useCallback(
    (nextIds: number[]) => {
      selectedIdsRef.current = nextIds;
      setSelectedIds(nextIds);
      onSelectionChange(buildWord(nextIds));
    },
    [buildWord, onSelectionChange]
  );

  const getRelativePoint = useCallback((clientX: number, clientY: number): Point | null => {
    const el = wheelRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const hitTestTile = useCallback(
    (pt: Point, hitScale = 1.08): number | null => {
      const maxDist = nodeRadius * hitScale;
      let closestId: number | null = null;
      let closestDist = maxDist;

      for (const tile of tiles) {
        const pos = tilePositions.get(tile.id);
        if (!pos) continue;
        const dx = pt.x - pos.x;
        const dy = pt.y - pos.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= closestDist) {
          closestDist = dist;
          closestId = tile.id;
        }
      }
      return closestId;
    },
    [tiles, tilePositions, nodeRadius]
  );

  const finishDrag = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    activePointerIdRef.current = null;
    setPointerPos(null);

    const ids = selectedIdsRef.current;
    const word = buildWord(ids);
    selectedIdsRef.current = [];
    setSelectedIds([]);

    if (word.length > 0) {
      onSubmitWord(word);
    } else {
      onSelectionChange('');
    }
  }, [buildWord, onSelectionChange, onSubmitWord]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      // Sadece birincil fare düğmesi veya dokunma
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      // Ortadaki karıştırma düğmesine tıklandıysa sürüklemeyi başlatma
      const target = e.target as HTMLElement;
      if (target.closest('[data-shuffle-btn="true"]')) {
        return;
      }

      const pt = getRelativePoint(e.clientX, e.clientY);
      if (!pt) return;

      const hitId = hitTestTile(pt, 1.15);
      if (hitId === null) return;

      e.preventDefault();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Bazı tarayıcılarda sessizce devam et
      }

      activePointerIdRef.current = e.pointerId;
      isDraggingRef.current = true;
      setPointerPos(pt);
      updateSelection([hitId]);
      soundManager.playSelectLetter(0);
    },
    [disabled, getRelativePoint, hitTestTile, updateSelection]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current || activePointerIdRef.current !== e.pointerId) return;
      e.preventDefault();

      const pt = getRelativePoint(e.clientX, e.clientY);
      if (!pt) return;
      setPointerPos(pt);

      const hitId = hitTestTile(pt, 1.02);
      if (hitId === null) return;

      const current = selectedIdsRef.current;
      const lastIdx = current.length - 1;

      // Geri sürükleme: bir önceki harfe dönülürse son seçim iptal edilir
      if (current.length >= 2 && current[lastIdx - 1] === hitId) {
        const next = current.slice(0, -1);
        updateSelection(next);
        soundManager.playDeselectLetter();
        return;
      }

      // Kullanılmış başka bir harf taşının üzerinden geçmek yeni harf eklemez
      if (current.includes(hitId)) {
        return;
      }

      const next = [...current, hitId];
      updateSelection(next);
      soundManager.playSelectLetter(next.length - 1);
    },
    [getRelativePoint, hitTestTile, updateSelection]
  );

  const handlePointerUpOrCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current || activePointerIdRef.current !== e.pointerId) return;
      e.preventDefault();
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Sessizce devam et
      }
      finishDrag();
    },
    [finishDrag]
  );

  // Harfleri karıştırma düğmesi: yalnızca taşların çemberdeki sırasını değiştirir
  const handleShuffle = useCallback(() => {
    if (disabled || isDraggingRef.current) return;
    soundManager.playShuffle();
    setShuffleSpin(true);
    window.setTimeout(() => setShuffleSpin(false), 360);

    setTiles((prev) => {
      if (prev.length <= 1) return prev;
      const copy = [...prev];
      // Gerçekten yer değişmesi için Fisher-Yates + aynı sıra kontrolü
      for (let attempt = 0; attempt < 4; attempt++) {
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        const changed = copy.some((t, idx) => t.id !== prev[idx].id);
        if (changed) break;
      }
      return copy;
    });
  }, [disabled]);

  // SVG bağlantı çizgisi noktaları
  const linePoints = useMemo(() => {
    const pts: Point[] = [];
    for (const id of selectedIds) {
      const pos = tilePositions.get(id);
      if (pos) pts.push(pos);
    }
    if (pointerPos && pts.length > 0) {
      pts.push(pointerPos);
    }
    return pts;
  }, [selectedIds, tilePositions, pointerPos]);

  const polylineStr = useMemo(
    () => linePoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
    [linePoints]
  );

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const centerBtnSize = Math.max(42, Math.round(wheelSize * 0.19));

  return (
    <div
      ref={wheelRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
      onContextMenu={(e) => e.preventDefault()}
      className="relative select-none rounded-full"
      style={{
        width: wheelSize,
        height: wheelSize,
        touchAction: 'none',
        background:
          'radial-gradient(circle at 50% 35%, rgba(255, 255, 255, 0.94) 0%, rgba(248, 250, 252, 0.85) 100%)',
        boxShadow:
          '0 14px 36px rgba(15, 23, 42, 0.22), 0 4px 12px rgba(15, 23, 42, 0.10), inset 0 2px 6px rgba(255, 255, 255, 0.95)',
        border: '2.5px solid rgba(255, 255, 255, 0.9)',
      }}
      aria-label="Harf çemberi"
    >
      {/* Hafif dekoratif iç halka */}
      <div
        className="pointer-events-none absolute inset-3 rounded-full"
        style={{
          border: '1.5px dashed rgba(148, 163, 184, 0.24)',
        }}
      />

      {/* Seçilen harfler arasındaki canlı mavi/turkuaz çizgi */}
      <svg
        className="pointer-events-none absolute inset-0 z-10 overflow-visible"
        width={wheelSize}
        height={wheelSize}
      >
        {linePoints.length >= 2 && (
          <>
            {/* Parlak dış hale */}
            <polyline
              points={polylineStr}
              fill="none"
              stroke={theme.lineGlow}
              strokeWidth={18}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Ana çizgi */}
            <polyline
              points={polylineStr}
              fill="none"
              stroke={theme.lineColor}
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>

      {/* Harf taşları */}
      {tiles.map((tile) => {
        const pos = tilePositions.get(tile.id);
        if (!pos) return null;
        const isSelected = selectedSet.has(tile.id);

        return (
          <div
            key={tile.id}
            data-tile-id={tile.id}
            data-letter={tile.letter}
            data-selected={isSelected}
            className="pointer-events-none absolute z-20 flex items-center justify-center rounded-full font-black"
            style={{
              width: nodeSize,
              height: nodeSize,
              left: pos.x - nodeRadius,
              top: pos.y - nodeRadius,
              fontSize: Math.round(nodeSize * 0.52),
              lineHeight: 1,
              background: isSelected
                ? theme.activeNodeBg
                : 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
              color: isSelected ? '#ffffff' : '#1e293b',
              border: isSelected
                ? '2px solid rgba(255, 255, 255, 0.85)'
                : '1.5px solid rgba(203, 213, 225, 0.85)',
              boxShadow: isSelected
                ? theme.activeNodeShadow
                : '0 4px 0 rgba(148, 163, 184, 0.35), 0 6px 14px rgba(15, 23, 42, 0.12)',
              transform: isSelected ? 'scale(1.16)' : 'scale(1)',
              transition:
                'left 0.28s cubic-bezier(0.22, 1, 0.36, 1), top 0.28s cubic-bezier(0.22, 1, 0.36, 1), transform 0.14s cubic-bezier(0.22, 1.4, 0.36, 1), background 0.14s ease, color 0.14s ease',
            }}
          >
            <span className="select-none">{tile.letter}</span>
          </div>
        );
      })}

      {/* Ortadaki harfleri karıştırma düğmesi */}
      <button
        type="button"
        data-shuffle-btn="true"
        onClick={handleShuffle}
        disabled={disabled}
        title="Harfleri karıştır"
        aria-label="Harfleri karıştır"
        className="absolute z-30 flex cursor-pointer items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-600 shadow-md transition-all hover:scale-105 hover:bg-sky-50 hover:text-sky-600 active:scale-95 disabled:opacity-50"
        style={{
          width: centerBtnSize,
          height: centerBtnSize,
          left: center - centerBtnSize / 2,
          top: center - centerBtnSize / 2,
        }}
      >
        <Shuffle
          className="h-5 w-5 transition-transform duration-300"
          style={{
            transform: shuffleSpin ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
    </div>
  );
};
