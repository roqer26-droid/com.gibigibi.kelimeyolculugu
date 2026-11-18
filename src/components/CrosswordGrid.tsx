import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LevelDefinition, cellKey } from '../engine/types';
import { compileGrid } from '../engine/validator';
import { getWordCellKeys } from '../engine/wordChecker';
import { ThemeConfig } from '../data/themes';
import { toTurkishUpper } from '../utils/turkish';

export interface HighlightEffect {
  type: 'found' | 'already' | 'hint';
  cellKeys: string[];
  nonce: number;
}

interface CrosswordGridProps {
  level: LevelDefinition;
  theme: ThemeConfig;
  foundWords: readonly string[];
  revealedCells: readonly string[];
  highlight: HighlightEffect | null;
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  level,
  theme,
  foundWords,
  revealedCells,
  highlight,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [bounds, setBounds] = useState({ width: 340, height: 280 });

  const { grid } = useMemo(() => compileGrid(level.words), [level.words]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setBounds({ width: rect.width, height: rect.height });
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Bulunmuş kelimelere ait kutuları ve ipucu ile açılan kutuları ayır
  const { foundCellSet, hintCellSet } = useMemo(() => {
    const foundWordSet = new Set(foundWords.map(toTurkishUpper));
    const fSet = new Set<string>();
    for (const placed of level.words) {
      if (foundWordSet.has(toTurkishUpper(placed.word))) {
        for (const k of getWordCellKeys(placed)) {
          fSet.add(k);
        }
      }
    }
    const hSet = new Set<string>();
    for (const k of revealedCells) {
      if (!fSet.has(k)) {
        hSet.add(k);
      }
    }
    return { foundCellSet: fSet, hintCellSet: hSet };
  }, [level.words, foundWords, revealedCells]);

  // Ekran genişliği ve yüksekliğine göre dinamik kutu boyutu hesaplama
  const { tileSize, gap, fontSize, radius } = useMemo(() => {
    const padX = 16;
    const padY = 12;
    const availW = Math.max(160, bounds.width - padX);
    const availH = Math.max(140, bounds.height - padY);

    const cols = Math.max(1, grid.cols);
    const rows = Math.max(1, grid.rows);

    // Önce tahmini boşluk ile sığdır
    const provisionalGap = cols >= 8 || rows >= 8 ? 5 : 7;
    const maxW = (availW - provisionalGap * (cols - 1)) / cols;
    const maxH = (availH - provisionalGap * (rows - 1)) / rows;

    const rawSize = Math.floor(Math.min(maxW, maxH, 58));
    const minTileSize = Math.max(grid.rows, grid.cols) >= 10 ? 15 : Math.max(grid.rows, grid.cols) >= 9 ? 18 : 22;
    const size = Math.max(minTileSize, rawSize);
    const finalGap = Math.max(3, Math.min(8, Math.round(size * 0.14)));

    // Boşluk sonrası taşma olmaması için son ince ayar
    const totalW = size * cols + finalGap * (cols - 1);
    const totalH = size * rows + finalGap * (rows - 1);
    let adjustedSize = size;
    if (totalW > availW) {
      adjustedSize = Math.floor((availW - finalGap * (cols - 1)) / cols);
    }
    if (totalH > availH) {
      adjustedSize = Math.min(
        adjustedSize,
        Math.floor((availH - finalGap * (rows - 1)) / rows)
      );
    }
    adjustedSize = Math.max(minTileSize, adjustedSize);

    return {
      tileSize: adjustedSize,
      gap: finalGap,
      fontSize: Math.max(11, Math.round(adjustedSize * 0.55)),
      radius: Math.max(6, Math.round(adjustedSize * 0.22)),
    };
  }, [bounds.width, bounds.height, grid.cols, grid.rows]);

  // Vurgu animasyonunda harf sırasına göre kademeli gecikme (dalga efekti)
  const highlightIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    if (highlight) {
      highlight.cellKeys.forEach((k, idx) => map.set(k, idx));
    }
    return map;
  }, [highlight]);

  const cellsList = useMemo(() => Array.from(grid.cells.values()), [grid.cells]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-2 py-1"
    >
      <div
        className="relative"
        style={{
          width: grid.cols * tileSize + (grid.cols - 1) * gap,
          height: grid.rows * tileSize + (grid.rows - 1) * gap,
        }}
        role="grid"
        aria-label={`Bölüm ${level.id} kelime bulmacası`}
      >
        {cellsList.map((cell) => {
          const key = cellKey(cell.row, cell.col);
          const isFound = foundCellSet.has(key);
          const isHint = hintCellSet.has(key);
          const isVisible = isFound || isHint;

          const hlIdx = highlightIndexMap.get(key);
          const isHighlighted = hlIdx !== undefined && highlight !== null;

          let animClass = '';
          let showGlowOverlay = false;
          let animDelay = '0ms';
          if (isHighlighted && highlight) {
            if (highlight.type === 'found') {
              animClass = 'animate-tile-pop';
              showGlowOverlay = true;
              animDelay = `${hlIdx * 55}ms`;
            } else if (highlight.type === 'already') {
              animClass = 'animate-tile-already';
              animDelay = `${hlIdx * 35}ms`;
            } else if (highlight.type === 'hint') {
              animClass = 'animate-hint-reveal';
              showGlowOverlay = true;
            }
          }

          const left = cell.col * (tileSize + gap);
          const top = cell.row * (tileSize + gap);

          return (
            <div
              key={key}
              role="gridcell"
              aria-label={isVisible ? cell.letter : 'Boş kutu'}
              className="absolute"
              style={{
                left,
                top,
                width: tileSize,
                height: tileSize,
              }}
            >
              <div
                key={isHighlighted ? `hl-${highlight?.nonce}` : 'steady'}
                className={`relative flex h-full w-full items-center justify-center font-black transition-colors duration-200 ${animClass}`}
                style={{
                  borderRadius: radius,
                  fontSize,
                  lineHeight: 1,
                  animationDelay: animDelay,
                  background: isFound
                    ? theme.filledTileBg
                    : isHint
                      ? theme.hintTileBg
                      : 'rgba(255, 253, 248, 0.93)',
                  color: isFound
                    ? theme.filledTileText
                    : isHint
                      ? theme.hintTileText
                      : 'transparent',
                  border: isFound
                    ? `1.5px solid ${theme.filledTileBorder}`
                    : isHint
                      ? `1.5px solid ${theme.hintTileBorder}`
                      : '1.5px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: isFound
                    ? theme.filledTileShadow
                    : isHint
                      ? '0 3px 0 rgba(217, 119, 6, 0.45), 0 6px 12px rgba(15, 23, 42, 0.14)'
                      : '0 3px 0 rgba(15, 23, 42, 0.15), 0 6px 12px rgba(15, 23, 42, 0.10)',
                }}
              >
                {/* Bulunan kutularda kısa parlama efekti katmanı */}
                {showGlowOverlay && (
                  <span
                    className="animate-tile-glow pointer-events-none absolute inset-0"
                    style={{
                      borderRadius: radius,
                      animationDelay: animDelay,
                    }}
                    aria-hidden="true"
                  />
                )}
                {/* İç yüzey üst parıltısı */}
                <span
                  className="pointer-events-none absolute inset-x-[12%] top-[6%] h-[22%] rounded-full"
                  style={{
                    background: isFound
                      ? 'rgba(255, 255, 255, 0.22)'
                      : 'rgba(255, 255, 255, 0.65)',
                  }}
                />
                {isVisible && (
                  <span className="relative z-10 select-none tracking-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]">
                    {cell.letter}
                  </span>
                )}
                {isHint && (
                  <span
                    className="pointer-events-none absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500"
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
