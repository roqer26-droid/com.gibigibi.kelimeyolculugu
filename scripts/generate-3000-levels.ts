import fs from 'node:fs';
import { THIRD_JOURNEY_REGIONS } from '../src/data/thirdJourneyThemes';
import { RAW_LEVELS } from '../src/data/levels';
import { VERIFIED_TURKISH_DICTIONARY } from '../src/data/turkishDictionary';
import { generateCompactCrosswordLayout } from '../src/engine/crosswordLayout';
import { LevelDefinition } from '../src/engine/types';
import { compileGrid, validateLevel } from '../src/engine/validator';
import { toTurkishUpper } from '../src/utils/turkish';
import { EXCLUDED_WORDS } from './turkish-exclusions';
import { THIRD_EXCLUSIONS, THIRD_REVIEW_WORDS } from './third-journey-exclusions';

// This is an offline build tool, not a runtime dependency. See README for source preparation.
const headwordsPath = process.env.HEADWORDS ?? '/tmp/tdk-headwords.json';
const frequencyPath = process.env.FREQUENCIES ?? '/tmp/tr-freq.txt';
const outputPath = process.env.OUTPUT ?? '/tmp/levels-3000.json';
const limit = Number(process.env.LEVEL_LIMIT ?? 1500);
const firstId = 1501;
const lastId = firstId + limit - 1;
if (!Number.isInteger(limit) || limit < 1 || limit > THIRD_JOURNEY_REGIONS.length * 10) {
  throw new Error('Bölüm sayısı mevcut manzara sayısını aşıyor.');
}

const headwords: string[] = JSON.parse(fs.readFileSync(headwordsPath, 'utf8'));
const frequency = new Map<string, number>();
fs.readFileSync(frequencyPath, 'utf8').split(/\r?\n/).forEach((line, index) => {
  const word = line.split(' ')[0];
  if (word && !frequency.has(word)) frequency.set(word, index);
});

const alphabet = [...'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'];
const alphabetIndex = new Map(alphabet.map((letter, index) => [letter, index]));
const excluded = new Set([...EXCLUDED_WORDS, ...THIRD_EXCLUSIONS]);
const countsFor = (word: string): Uint8Array => {
  const result = new Uint8Array(alphabet.length);
  for (const letter of word) {
    const index = alphabetIndex.get(letter);
    if (index === undefined) throw new Error(`Geçersiz Türkçe harf: ${letter}`);
    result[index]++;
  }
  return result;
};
const fits = (word: Uint8Array, pool: Uint8Array): boolean => {
  for (let i = 0; i < pool.length; i++) if (word[i] > pool[i]) return false;
  return true;
};
const keyFor = (letters: readonly string[]): string => [...letters].sort().join('');

interface DictionaryWord {
  word: string;
  counts: Uint8Array;
  rank: number;
}

// The existing bonus allowlist is additionally intersected with the TDK headwords.
const dictionary: DictionaryWord[] = headwords
  .filter((word) => {
    const rank = frequency.get(word);
    return rank !== undefined && rank < 16000 && !excluded.has(word) &&
      VERIFIED_TURKISH_DICTIONARY.has(toTurkishUpper(word));
  })
  .map((word) => ({ word: toTurkishUpper(word), counts: countsFor(toTurkishUpper(word)), rank: frequency.get(word)! }))
  .sort((a, b) => a.rank - b.rank);

const existingPools = new Set(RAW_LEVELS.filter((level) => level.id < firstId).map((level) => keyFor(level.letters)));
const existingWordSets = new Set(
  RAW_LEVELS.filter((level) => level.id < firstId).map((level) => [...level.words.map((item) => item.word)].sort().join('|'))
);

interface CandidatePool {
  key: string;
  letters: string[];
  anchor: DictionaryWord;
  carriers: DictionaryWord[];
  candidates: DictionaryWord[];
}

// Augment a real eight-letter headword with one stone that is used by another real word.
const pools = new Map<number, CandidatePool[]>([[8, []], [9, []]]);
const usedPoolKeys = new Set(existingPools);
const additions = [...'AELRKMNİTISODUYÜÖÇŞGBHPCĞFZV'];

for (const size of [9, 8]) {
  const starts = dictionary.filter((word) => word.word.length === size || word.word.length === size - 1);
  const candidates: CandidatePool[] = [];
  for (const anchor of starts) {
    const extraLetters = anchor.word.length === size ? [''] : additions;
    for (const extra of extraLetters) {
      const letters = [...anchor.word, ...(extra ? [extra] : [])];
      const key = keyFor(letters);
      if (usedPoolKeys.has(key)) continue;
      const poolCounts = countsFor(key);
      const available = dictionary.filter((word) => word.word !== anchor.word && word.word.length <= size && fits(word.counts, poolCounts));
      const extraIndex = extra ? alphabetIndex.get(extra)! : -1;
      const carriers = extra ? available.filter((word) => word.counts[extraIndex] > anchor.counts[extraIndex]) : available;
      const minimum = size === 9 ? 10 : 7;
      if (available.length < minimum || carriers.length === 0) continue;
      if (available.filter((word) => word.word.length >= 4).length < (size === 9 ? 6 : 4)) continue;
      usedPoolKeys.add(key);
      candidates.push({ key, letters, anchor, carriers, candidates: available });
    }
  }
  pools.set(size, candidates);
}

console.log(`TDK ile eşleşen sözlük: ${dictionary.length} kelime, 9 harfli havuz: ${pools.get(9)!.length}, 8 harfli havuz: ${pools.get(8)!.length}`);

let seed = 291123;
function random(): number {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const randomized = new Map([...pools].map(([size, list]) => [size, shuffle(list)]));
const usedNewPools = new Set<string>();
const lastAnchorUse = new Map<string, number>();
const result: LevelDefinition[] = [];

for (let id = firstId; id <= lastId; id++) {
  const regionIndex = Math.floor((id - firstId) / 10);
  const isRest = (id - firstId) % 10 === 6;
  const size = isRest ? 8 : 9;
  const desired = isRest ? 5 : id >= 2401 && id % 3 === 0 ? 10 : 9;
  const source = randomized.get(size)!;
  const start = Math.floor(random() * Math.max(1, source.length));
  let level: LevelDefinition | undefined;

  for (let step = 0; step < source.length && !level; step++) {
    const pool = source[(start + step) % source.length];
    if (usedNewPools.has(pool.key) || id - (lastAnchorUse.get(pool.anchor.word) ?? -100) < 15) continue;
    if (pool.candidates.length < desired) continue;

    // Prefer frequent, four-or-more-letter words and keep at least one unused bonus.
    for (let attempt = 0; attempt < 5 && !level; attempt++) {
      const carrier = pool.carriers[attempt % Math.min(pool.carriers.length, 5)];
      const base = [pool.anchor.word, carrier.word];
      const preferred = shuffle(pool.candidates.filter((word) => word.word.length >= 4).slice(0, 20));
      const remaining = shuffle(pool.candidates.slice(0, 35));
      const selected = [...new Set([...base, ...preferred.map((word) => word.word), ...remaining.map((word) => word.word)])].slice(0, desired);
      if (selected.length !== desired || existingWordSets.has([...selected].sort().join('|'))) continue;

      const words = generateCompactCrosswordLayout(selected, {
        maxBranching: 7,
        maxNodes: 4500,
        mrv: true,
        scoreCandidates: true,
        firstSolution: true,
        maxRows: 10,
        maxCols: 11,
      });
      if (!words) continue;
      const candidate: LevelDefinition = {
        id,
        theme: THIRD_JOURNEY_REGIONS[regionIndex].id,
        letters: [...pool.letters].sort((a, b) => alphabetIndex.get(a)! - alphabetIndex.get(b)!),
        words,
        rewardCoins: 615 + Math.floor((id - firstId) / 5),
        ...(isRest ? { isRestLevel: true } : {}),
      };
      const validation = validateLevel(candidate);
      const { grid } = compileGrid(words);
      if (!validation.valid || grid.cols > 11 || grid.rows > 10) continue;

      level = candidate;
      usedNewPools.add(pool.key);
      existingWordSets.add([...selected].sort().join('|'));
      lastAnchorUse.set(pool.anchor.word, id);
    }
  }

  if (!level) throw new Error(`Bölüm ${id} için doğrulanmış kompakt yerleşim üretilemedi.`);
  result.push(level);
  if ((id - firstId + 1) % 25 === 0 || id === lastId) {
    console.log(`${id - firstId + 1}/${limit}: bölüm ${id}, ${level.letters.length} harf, ${level.words.length} hedef`);
  }
}

// Replace reviewed-out words using vocabulary already present in the generated set.
const reviewedVocabulary = new Set(
  result.flatMap((entry) => entry.words.map((word) => word.word)).filter((word) => !THIRD_REVIEW_WORDS.has(word))
);
for (let index = 0; index < result.length; index++) {
  const original = result[index];
  const removed = original.words.filter((entry) => THIRD_REVIEW_WORDS.has(entry.word));
  if (!removed.length) continue;
  const kept = original.words.map((entry) => entry.word).filter((word) => !THIRD_REVIEW_WORDS.has(word));
  const poolCounts = countsFor(original.letters.join(''));
  const alternatives = dictionary.filter((entry) =>
    reviewedVocabulary.has(entry.word) && !kept.includes(entry.word) && fits(entry.counts, poolCounts)
  );
  let repaired: LevelDefinition | undefined;

  const tryRepair = (replacement: string[]) => {
    const selected = [...kept, ...replacement];
    const key = [...selected].sort().join('|');
    if (existingWordSets.has(key)) return;
    // Every tile, including duplicate letters, must still be useful in a target.
    for (let i = 0; i < poolCounts.length; i++) {
      if (poolCounts[i] && !selected.some((word) => countsFor(word)[i] >= poolCounts[i])) return;
    }
    const words = generateCompactCrosswordLayout(selected, {
      maxBranching: 7, maxNodes: 4500, mrv: true, scoreCandidates: true,
      firstSolution: true, maxRows: 10, maxCols: 11,
    });
    if (!words) return;
    const candidate = { ...original, words };
    if (!validateLevel(candidate).valid) return;
    existingWordSets.add(key);
    repaired = candidate;
  };

  if (removed.length === 1) {
    for (const alternative of alternatives) {
      tryRepair([alternative.word]);
      if (repaired) break;
    }
  } else if (removed.length === 2) {
    outer: for (let a = 0; a < alternatives.length; a++) {
      for (let b = a + 1; b < alternatives.length; b++) {
        tryRepair([alternatives[a].word, alternatives[b].word]);
        if (repaired) break outer;
      }
    }
  }
  if (!repaired) {
    // If the removed word was the only carrier for a tile, choose a fresh pool.
    const source = randomized.get(original.letters.length)!;
    for (const pool of source) {
      if (usedNewPools.has(pool.key) || !reviewedVocabulary.has(pool.anchor.word)) continue;
      const carriers = pool.carriers.filter((entry) => reviewedVocabulary.has(entry.word));
      const available = pool.candidates.filter((entry) => reviewedVocabulary.has(entry.word));
      if (!carriers.length || available.length < original.words.length) continue;
      const selected = [...new Set([
        pool.anchor.word,
        carriers[0].word,
        ...available.map((entry) => entry.word),
      ])].slice(0, original.words.length);
      if (selected.length !== original.words.length) continue;
      const key = [...selected].sort().join('|');
      if (existingWordSets.has(key)) continue;
      const words = generateCompactCrosswordLayout(selected, {
        maxBranching: 7, maxNodes: 4500, mrv: true, scoreCandidates: true,
        firstSolution: true, maxRows: 10, maxCols: 11,
      });
      if (!words) continue;
      const candidate = {
        ...original,
        letters: [...pool.letters].sort((a, b) => alphabetIndex.get(a)! - alphabetIndex.get(b)!),
        words,
      };
      if (!validateLevel(candidate).valid) continue;
      repaired = candidate;
      usedNewPools.add(pool.key);
      existingWordSets.add(key);
      break;
    }
  }
  if (!repaired) throw new Error(`Bölüm ${original.id} için yeni kelime yerleştirilemedi.`);
  result[index] = repaired;
}

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(`${result.length} bölüm ${outputPath} dosyasına yazıldı.`);