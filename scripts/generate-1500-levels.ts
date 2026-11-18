import fs from 'node:fs';
import { EXPANSION_REGIONS } from '../src/data/expansionThemes';
import { RAW_LEVELS } from '../src/data/levels';
import { VERIFIED_TURKISH_DICTIONARY } from '../src/data/turkishDictionary';
import { generateCompactCrosswordLayout } from '../src/engine/crosswordLayout';
import { LevelDefinition } from '../src/engine/types';
import { compileGrid, validateLevel } from '../src/engine/validator';
import { toTurkishUpper } from '../src/utils/turkish';
import { EXCLUDED_WORDS } from './turkish-exclusions';

// This is an offline build tool, not a runtime dependency. See README for source preparation.
const headwordsPath = process.env.HEADWORDS ?? '/tmp/tdk-headwords.json';
const frequencyPath = process.env.FREQUENCIES ?? '/tmp/tr-freq.txt';
const outputPath = process.env.OUTPUT ?? '/tmp/levels-1500.json';
const limit = Number(process.env.LEVEL_LIMIT ?? 500);
const firstId = 1001;
const lastId = firstId + limit - 1;

const headwords: string[] = JSON.parse(fs.readFileSync(headwordsPath, 'utf8'));
const frequency = new Map<string, number>();
fs.readFileSync(frequencyPath, 'utf8').split(/\r?\n/).forEach((line, index) => {
  const word = line.split(' ')[0];
  if (word && !frequency.has(word)) frequency.set(word, index);
});

const alphabet = [...'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'];
const alphabetIndex = new Map(alphabet.map((letter, index) => [letter, index]));
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
    return rank !== undefined && rank < 16000 && !EXCLUDED_WORDS.has(word) &&
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

let seed = 240519;
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
  const desired = isRest ? 5 : id >= 1301 ? 9 : 8;
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
        theme: EXPANSION_REGIONS[regionIndex].id,
        letters: [...pool.letters].sort((a, b) => alphabetIndex.get(a)! - alphabetIndex.get(b)!),
        words,
        rewardCoins: 515 + Math.floor((id - firstId) / 5),
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

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(`${result.length} bölüm ${outputPath} dosyasına yazıldı.`);