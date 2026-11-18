import fs from 'node:fs';
import { RAW_LEVELS } from '../src/data/levels';
import { generateCompactCrosswordLayout } from '../src/engine/crosswordLayout';
import { compileGrid, validateLevel } from '../src/engine/validator';
import { LevelDefinition } from '../src/engine/types';

// levels.ts içindeki uygun olmayan kelimeleri, yalnızca zaten incelenmiş kelime dağarcığından
// seçilen kelimelerle yerinde değiştirir ve bulmacayı yeniden yerleştirir.
const BAD = new Set((process.env.BAD ?? 'İHANET SİLAHLI KİMYASAL').split(/\s+/).filter(Boolean));

let src = fs.readFileSync('src/data/levels.ts', 'utf8');
const vocab = new Set<string>([...src.matchAll(/word: '([^']+)'/g)].map((m) => m[1]));
for (const b of BAD) vocab.delete(b);

const canBuild = (word: string, letters: string[]): boolean => {
  const c: Record<string, number> = {};
  for (const ch of letters) c[ch] = (c[ch] ?? 0) + 1;
  for (const ch of word) {
    if (!c[ch]) return false;
    c[ch]--;
  }
  return true;
};

let fixed = 0;
for (const level of RAW_LEVELS) {
  const bad = level.words.filter((w) => BAD.has(w.word)).map((w) => w.word);
  if (bad.length === 0) continue;
  const keep = level.words.map((w) => w.word).filter((w) => !BAD.has(w));
  const maxCols = level.letters.length >= 9 ? 11 : 10;
  const pool = [...vocab]
    .filter((w) => !keep.includes(w) && [...w].length >= 3 && [...w].length <= level.letters.length && canBuild(w, level.letters))
    .sort((a, b) => [...b].length - [...a].length || a.localeCompare(b, 'tr-TR'))
    .slice(0, 22);

  const attempt = (extra: string[]): LevelDefinition | null => {
    const placed = generateCompactCrosswordLayout([...keep, ...extra], { maxBranching: 6, maxNodes: 10000 });
    if (!placed) return null;
    const { grid } = compileGrid(placed);
    if (grid.rows > 10 || grid.cols > maxCols) return null;
    const candidate: LevelDefinition = { ...level, words: placed };
    return validateLevel(candidate).valid ? candidate : null;
  };

  let result: LevelDefinition | null = null;
  if (bad.length === 1) {
    for (const c of pool) { result = attempt([c]); if (result) break; }
  } else {
    outer: for (let a = 0; a < pool.length; a++) for (let b = a + 1; b < pool.length; b++) {
      result = attempt([pool[a], pool[b]]);
      if (result) break outer;
    }
  }
  if (!result && keep.length >= 5) result = attempt([]);
  if (!result) { console.error(`❌ Bölüm ${level.id}: düzeltilemedi (${bad.join(', ')})`); continue; }

  const start = src.indexOf(`\n    id: ${level.id},\n`);
  const wordsStart = src.indexOf('    words: [\n', start) + '    words: [\n'.length;
  const wordsEnd = src.indexOf('\n    ],\n  },', wordsStart);
  const lines = result.words.map((w) => `      { word: '${w.word}', row: ${w.row}, col: ${w.col}, dir: '${w.dir}' },`).join('\n');
  src = src.slice(0, wordsStart) + lines + src.slice(wordsEnd);
  fixed++;
  const added = result.words.map((w) => w.word).filter((w) => !level.words.some((o) => o.word === w));
  console.log(`✅ Bölüm ${level.id}: çıkarılan [${bad.join(', ')}] → eklenen [${added.join(', ') || '-'}] (${result.words.length} kelime)`);
}
fs.writeFileSync('src/data/levels.ts', src, 'utf8');
console.log(`Düzeltilen bölüm sayısı: ${fixed}`);
