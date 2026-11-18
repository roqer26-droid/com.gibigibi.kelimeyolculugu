import fs from 'node:fs';
import { THIRD_JOURNEY_LEVELS } from '../src/data/levels3000';
import { toTurkishLower } from '../src/utils/turkish';

const path = process.env.HEADWORDS ?? '/tmp/tdk-headwords.json';
if (!fs.existsSync(path)) {
  throw new Error(`TDK başlık dosyası bulunamadı: ${path}. Önce prepare-tdk-headwords.py çalıştırın.`);
}
const headwords = new Set<string>(JSON.parse(fs.readFileSync(path, 'utf8')));
const missing: string[] = [];
let checked = 0;
for (const level of THIRD_JOURNEY_LEVELS) {
  for (const placed of level.words) {
    checked++;
    if (!headwords.has(toTurkishLower(placed.word))) missing.push(`${level.id}: ${placed.word}`);
  }
}
if (missing.length) throw new Error(`TDK başlıklarında bulunamayan hedefler: ${missing.join(', ')}`);
console.log(`${THIRD_JOURNEY_LEVELS.length} bölümün ${checked} hedefi TDK başlıklarıyla eşleşti.`);