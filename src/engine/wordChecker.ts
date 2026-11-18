import { LevelDefinition, WordCheckOutcome, cellKey } from './types';
import { canBuildWordFromLetters, toTurkishUpper } from '../utils/turkish';
import { isVerifiedTurkishWord } from '../data/turkishDictionary';

export const HINT_COST = 25;
export const BONUS_WORD_REWARD = 5;
export const REPLAY_LEVEL_REWARD = 10;

/** True only when every target, not merely the same number of entries, was found. */
export function isLevelComplete(level: LevelDefinition, foundWords: readonly string[]): boolean {
  const found = new Set(foundWords.map(toTurkishUpper));
  return level.words.every((placed) => found.has(toTurkishUpper(placed.word)));
}

/**
 * Oyuncunun oluşturduğu kelimeyi hedef kelimeler ve doğrulanmış Türkçe sözlük
 * üzerinden değerlendirir.
 */
export function evaluateSubmittedWord(
  rawWord: string,
  level: LevelDefinition,
  foundWords: readonly string[],
  bonusWords: readonly string[]
): WordCheckOutcome {
  const word = toTurkishUpper(rawWord);
  if ([...word].length < 3) {
    return { status: 'too-short' };
  }

  // Güvenlik: bölüm harfleriyle yazılamayan hiçbir kelime kabul edilmez
  if (!canBuildWordFromLetters(word, level.letters)) {
    return { status: 'invalid', word };
  }

  const foundSet = new Set(foundWords.map(toTurkishUpper));
  const targetIndex = level.words.findIndex((w) => toTurkishUpper(w.word) === word);

  if (targetIndex !== -1) {
    if (foundSet.has(word)) {
      return { status: 'already-found-target', word, wordIndex: targetIndex };
    }
    return { status: 'target-found', word, wordIndex: targetIndex };
  }

  // Bonus kelime kontrolü: yalnızca doğrulanmış Türkçe sözlükte yer alan kelimeler
  if (isVerifiedTurkishWord(word)) {
    const bonusSet = new Set(bonusWords.map(toTurkishUpper));
    if (bonusSet.has(word)) {
      return { status: 'already-found-bonus', word };
    }
    return { status: 'bonus-found', word, coinsEarned: BONUS_WORD_REWARD };
  }

  return { status: 'invalid', word };
}

/**
 * Bir hedefin kapladığı tüm hücre anahtarlarını döndürür.
 */
export function getWordCellKeys(
  word: LevelDefinition['words'][number]
): string[] {
  const keys: string[] = [];
  const len = [...word.word].length;
  for (let i = 0; i < len; i++) {
    const r = word.dir === 'down' ? word.row + i : word.row;
    const c = word.dir === 'across' ? word.col + i : word.col;
    keys.push(cellKey(r, c));
  }
  return keys;
}

/**
 * Mevcut durumda görünen (bulunmuş kelimeler + açılmış ipuçları) tüm hücre anahtarlarını hesaplar.
 */
export function getVisibleCellKeys(
  level: LevelDefinition,
  foundWords: readonly string[],
  revealedCells: readonly string[]
): Set<string> {
  const visible = new Set<string>(revealedCells);
  const foundSet = new Set(foundWords.map(toTurkishUpper));

  for (const placed of level.words) {
    if (foundSet.has(toTurkishUpper(placed.word))) {
      for (const k of getWordCellKeys(placed)) {
        visible.add(k);
      }
    }
  }
  return visible;
}

/**
 * İpucu için henüz açılmamış en faydalı hücreyi seçer.
 * Kesişim kutuları veya az harfi kalmamış kelimelerin başlangıç kutularına öncelik verir.
 */
export function pickHintCellKey(
  level: LevelDefinition,
  foundWords: readonly string[],
  revealedCells: readonly string[]
): string | null {
  const visible = getVisibleCellKeys(level, foundWords, revealedCells);
  const foundSet = new Set(foundWords.map(toTurkishUpper));

  // Hücrelerin kaç farklı bulunmamış kelimede geçtiğini say
  const cellScore = new Map<string, number>();

  for (const placed of level.words) {
    if (foundSet.has(toTurkishUpper(placed.word))) continue;
    const keys = getWordCellKeys(placed);
    const hiddenKeys = keys.filter((k) => !visible.has(k));
    if (hiddenKeys.length === 0) continue;

    keys.forEach((k, idx) => {
      if (visible.has(k)) return;
      const base = cellScore.get(k) ?? 0;
      // Kesişim kutuları her kelime için skor alır; ilk harf hafif bonus alır
      const firstLetterBonus = idx === 0 ? 1.5 : 0;
      cellScore.set(k, base + 2 + firstLetterBonus);
    });
  }

  if (cellScore.size === 0) return null;

  let bestKey: string | null = null;
  let bestScore = -1;
  for (const [k, score] of cellScore.entries()) {
    if (score > bestScore) {
      bestScore = score;
      bestKey = k;
    }
  }
  return bestKey;
}

/**
 * İpuçları ve kesişen kelimeler sayesinde tüm kutuları görünür hale gelmiş ama
 * henüz 'foundWords' listesine eklenmemiş hedef kelimeleri tespit eder.
 */
export function detectAutoCompletedWords(
  level: LevelDefinition,
  foundWords: readonly string[],
  revealedCells: readonly string[]
): string[] {
  const visible = getVisibleCellKeys(level, foundWords, revealedCells);
  const foundSet = new Set(foundWords.map(toTurkishUpper));
  const newlyCompleted: string[] = [];

  for (const placed of level.words) {
    const normalized = toTurkishUpper(placed.word);
    if (foundSet.has(normalized)) continue;
    const allVisible = getWordCellKeys(placed).every((k) => visible.has(k));
    if (allVisible) {
      newlyCompleted.push(normalized);
    }
  }
  return newlyCompleted;
}

/**
 * Bu bölümde doğrulanmış sözlükten üretilebilecek toplam bonus kelime sayısını hesaplar.
 */
export function getAvailableBonusWordsForLevel(
  level: LevelDefinition,
  dictionary: ReadonlySet<string>
): string[] {
  const targets = new Set(level.words.map((w) => toTurkishUpper(w.word)));
  const result: string[] = [];
  for (const w of dictionary) {
    if (!targets.has(w) && canBuildWordFromLetters(w, level.letters)) {
      result.push(w);
    }
  }
  return result.sort((a, b) => a.localeCompare(b, 'tr-TR'));
}
