import { Direction, PlacedWord, cellKey } from './types';
import { toTurkishUpper } from '../utils/turkish';

interface BoardState {
  cells: Map<string, string>;
  acrossCells: Set<string>;
  downCells: Set<string>;
  placements: PlacedWord[];
}

function cloneBoard(state: BoardState): BoardState {
  return {
    cells: new Map(state.cells),
    acrossCells: new Set(state.acrossCells),
    downCells: new Set(state.downCells),
    placements: [...state.placements],
  };
}

/**
 * Kelimenin belirtilen (row, col, dir) konumuna tüm sıkı bulmaca kurallarına
 * uygun biçimde yerleşip yerleşemeyeceğini kontrol eder.
 * Dönen değer kesişim sayısıdır; -1 ise yerleştirilemez.
 */
function checkPlacement(
  board: BoardState,
  word: string,
  row: number,
  col: number,
  dir: Direction,
  requireIntersection: boolean
): number {
  const chars = [...word];
  const dr = dir === 'down' ? 1 : 0;
  const dc = dir === 'across' ? 1 : 0;
  const sameDirSet = dir === 'across' ? board.acrossCells : board.downCells;

  // Başlangıç öncesi ve bitiş sonrası hücreler mutlaka boş olmalı
  if (board.cells.has(cellKey(row - dr, col - dc))) return -1;
  if (board.cells.has(cellKey(row + dr * chars.length, col + dc * chars.length))) return -1;

  let intersections = 0;

  for (let i = 0; i < chars.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    const key = cellKey(r, c);
    const existing = board.cells.get(key);

    if (existing !== undefined) {
      // Kesişen harf birebir aynı olmalı ve aynı yönde başka kelimeye ait olmamalı
      if (existing !== chars[i]) return -1;
      if (sameDirSet.has(key)) return -1;
      intersections++;
    } else {
      // Boş hücre: dik doğrultudaki komşular kesinlikle boş olmalı (istemsiz yan yana değme engeli)
      if (dir === 'across') {
        if (board.cells.has(cellKey(r - 1, c)) || board.cells.has(cellKey(r + 1, c))) {
          return -1;
        }
      } else {
        if (board.cells.has(cellKey(r, c - 1)) || board.cells.has(cellKey(r, c + 1))) {
          return -1;
        }
      }
    }
  }

  if (requireIntersection && intersections === 0) return -1;
  return intersections;
}

function applyPlacement(board: BoardState, placed: PlacedWord): void {
  const chars = [...placed.word];
  const dr = placed.dir === 'down' ? 1 : 0;
  const dc = placed.dir === 'across' ? 1 : 0;
  const sameDirSet = placed.dir === 'across' ? board.acrossCells : board.downCells;

  for (let i = 0; i < chars.length; i++) {
    const r = placed.row + dr * i;
    const c = placed.col + dc * i;
    const key = cellKey(r, c);
    board.cells.set(key, chars[i]);
    sameDirSet.add(key);
  }
  board.placements.push(placed);
}

function getBounds(placements: readonly PlacedWord[]): {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
  rows: number;
  cols: number;
} {
  let minRow = Infinity;
  let maxRow = -Infinity;
  let minCol = Infinity;
  let maxCol = -Infinity;

  for (const p of placements) {
    const len = [...p.word].length;
    const endRow = p.dir === 'down' ? p.row + len - 1 : p.row;
    const endCol = p.dir === 'across' ? p.col + len - 1 : p.col;
    if (p.row < minRow) minRow = p.row;
    if (endRow > maxRow) maxRow = endRow;
    if (p.col < minCol) minCol = p.col;
    if (endCol > maxCol) maxCol = endCol;
  }

  return {
    minRow,
    maxRow,
    minCol,
    maxCol,
    rows: maxRow - minRow + 1,
    cols: maxCol - minCol + 1,
  };
}

function scoreBoard(board: BoardState): number {
  const { rows, cols } = getBounds(board.placements);
  const maxDim = Math.max(rows, cols);
  const area = rows * cols;
  // Mobilde kareye yakın veya hafif yatay dikdörtgen (en fazla ~1.35 oran) çok rahat okunur
  const ratioPenalty = Math.abs(cols - rows * 1.15) * 8;
  // Daha fazla kesişim -> daha az toplam hücre -> daha bağlantılı ve sıkı bulmaca
  const totalWordChars = board.placements.reduce((sum, p) => sum + [...p.word].length, 0);
  const overlapCount = totalWordChars - board.cells.size;

  // Düşük skor daha iyidir
  return area * 1.5 + maxDim * 14 + ratioPenalty - overlapCount * 12;
}

function normalizePlacements(placements: readonly PlacedWord[]): PlacedWord[] {
  const { minRow, minCol } = getBounds(placements);
  return placements.map((p) => ({
    word: p.word,
    row: p.row - minRow,
    col: p.col - minCol,
    dir: p.dir,
  }));
}

interface CandidatePlacement {
  placed: PlacedWord;
  intersections: number;
  score: number;
}

function findCandidatesForWord(
  board: BoardState,
  word: string,
  scoreCandidates = true
): CandidatePlacement[] {
  const chars = [...word];
  const candidates: CandidatePlacement[] = [];
  const seen = new Set<string>();

  for (const [key, cellLetter] of board.cells.entries()) {
    const [rStr, cStr] = key.split(',');
    const cellRow = Number(rStr);
    const cellCol = Number(cStr);

    for (let i = 0; i < chars.length; i++) {
      if (chars[i] !== cellLetter) continue;

      const tryDirs: Direction[] = ['across', 'down'];
      for (const dir of tryDirs) {
        const startRow = dir === 'down' ? cellRow - i : cellRow;
        const startCol = dir === 'across' ? cellCol - i : cellCol;
        const sig = `${dir}:${startRow}:${startCol}`;
        if (seen.has(sig)) continue;
        seen.add(sig);

        const intersections = checkPlacement(board, word, startRow, startCol, dir, true);
        if (intersections > 0) {
          const placed: PlacedWord = { word, row: startRow, col: startCol, dir };
          if (scoreCandidates) {
            const next = cloneBoard(board);
            applyPlacement(next, placed);
            candidates.push({
              placed,
              intersections,
              score: scoreBoard(next),
            });
          } else {
            candidates.push({ placed, intersections, score: 0 });
          }
        }
      }
    }
  }

  if (scoreCandidates) {
    candidates.sort((a, b) => a.score - b.score);
  }
  return candidates;
}

/**
 * Verilen hedef kelimelerden kompakt, tam bağlantılı ve istemsiz komşuluk içermeyen
 * en uygun bulmaca yerleşimini üretir.
 */
export function generateCompactCrosswordLayout(
  rawWords: readonly string[],
  options?: {
    maxBranching?: number;
    maxNodes?: number;
    /** true: en kısıtlı kelimeyi seç (MRV). false: en uzun kelimeyi seç (daha hızlı). */
    mrv?: boolean;
    /** Adayları tahta skoruna göre sırala (daha kaliteli ama daha yavaş). */
    scoreCandidates?: boolean;
    /** Stop as soon as a layout satisfies the requested dimensions. */
    firstSolution?: boolean;
    maxRows?: number;
    maxCols?: number;
  }
): PlacedWord[] | null {
  const maxBranching = options?.maxBranching ?? 6;
  const maxNodes = options?.maxNodes ?? 8000;
  const useMrv = options?.mrv ?? true;
  const scoreCandidates = options?.scoreCandidates ?? true;
  const firstSolution = options?.firstSolution ?? false;

  const words = [...new Set(rawWords.map(toTurkishUpper))].sort(
    (a, b) => [...b].length - [...a].length || a.localeCompare(b, 'tr-TR')
  );

  if (words.length === 0) return null;

  let bestSolution: PlacedWord[] | null = null;
  let bestScore = Infinity;
  let nodesVisited = 0;

  function search(board: BoardState, remaining: string[]): void {
    if (nodesVisited >= maxNodes || (firstSolution && bestSolution)) return;
    nodesVisited++;

    if (options?.maxRows || options?.maxCols) {
      const bounds = getBounds(board.placements);
      if (bounds.rows > (options.maxRows ?? Infinity) || bounds.cols > (options.maxCols ?? Infinity)) {
        return;
      }
    }

    if (remaining.length === 0) {
      const s = scoreBoard(board);
      if (s < bestScore) {
        bestScore = s;
        bestSolution = normalizePlacements(board.placements);
      }
      return;
    }

    // Erken budama: zaten en iyi skordan çok daha kötü bir alana çıktıysa dur
    if (bestSolution && scoreBoard(board) > bestScore + 120) {
      return;
    }

    // Önce en az geçerli adaya sahip (en kısıtlı) kelimeyi seç (MRV heuristiği)
    let chosenIdx = -1;
    let chosenCandidates: CandidatePlacement[] = [];

    if (useMrv) {
      for (let idx = 0; idx < remaining.length; idx++) {
        const cands = findCandidatesForWord(board, remaining[idx], scoreCandidates);
        if (cands.length === 0) {
          // Bu kelime hiçbir yere bağlanamıyor — ama başka bir kelime yerleştirilince bağlanabilir!
          continue;
        }
        if (chosenIdx === -1 || cands.length < chosenCandidates.length) {
          chosenIdx = idx;
          chosenCandidates = cands;
        }
      }
    } else {
      // Hızlı mod: en uzun kalan kelimeyi dene
      let longestIdx = 0;
      for (let idx = 1; idx < remaining.length; idx++) {
        if ([...remaining[idx]].length > [...remaining[longestIdx]].length) {
          longestIdx = idx;
        }
      }
      const cands = findCandidatesForWord(board, remaining[longestIdx], scoreCandidates);
      if (cands.length > 0) {
        chosenIdx = longestIdx;
        chosenCandidates = cands;
      }
    }

    if (chosenIdx === -1) {
      // Kalan kelimelerin hiçbiri mevcut tahtaya bağlanamıyor
      return;
    }

    const nextRemaining = remaining.filter((_, i) => i !== chosenIdx);
    const limit = Math.min(chosenCandidates.length, maxBranching);

    for (let i = 0; i < limit; i++) {
      const nextBoard = cloneBoard(board);
      applyPlacement(nextBoard, chosenCandidates[i].placed);
      search(nextBoard, nextRemaining);
    }
  }

  // En uzun kelimeyi başlangıçta yatay (ve gerekirse dikey) yerleştirerek ara
  const firstWord = words[0];
  const rest = words.slice(1);

  for (const startDir of ['across', 'down'] as const) {
    const initial: BoardState = {
      cells: new Map(),
      acrossCells: new Set(),
      downCells: new Set(),
      placements: [],
    };
    applyPlacement(initial, { word: firstWord, row: 0, col: 0, dir: startDir });
    search(initial, rest);
    if (firstSolution && bestSolution) break;
  }

  return bestSolution;
}
