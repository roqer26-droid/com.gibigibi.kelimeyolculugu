import { RAW_LEVELS } from '../src/data/levels';
import { compileGrid, validateLevel } from '../src/engine/validator';
import { VERIFIED_TURKISH_DICTIONARY } from '../src/data/turkishDictionary';
import { countLetters } from '../src/utils/turkish';
import { getThemeForLevel } from '../src/data/themes';

/**
 * Oyundaki tüm bölümleri doğrular:
 * - Hedef kelime sayısı 5–10
 * - Tüm kelimeler harf havuzuyla yazılabiliyor
 * - Kesişimler doğru, bulmaca bağlantılı, istemsiz komşuluk yok
 * - Tema, bölüm numarasına göre doğru atanmış
 * - Her bölümde en az bir bonus kelime bulunabilir
 */

let failed = 0;
const dictionary = [...VERIFIED_TURKISH_DICTIONARY].map((word) => ({
  word,
  counts: [...countLetters(word)],
}));

for (const level of RAW_LEVELS) {
  const validation = validateLevel(level);
  const { grid } = compileGrid(level.words);

  const targetSet = new Set(level.words.map((w) => w.word));
  const poolCounts = countLetters(level.letters);
  let bonusCount = 0;
  for (const entry of dictionary) {
    if (entry.word.length <= level.letters.length && !targetSet.has(entry.word) &&
      entry.counts.every(([letter, count]) => (poolCounts.get(letter) ?? 0) >= count)) {
      bonusCount++;
    }
  }

  const themeOk = getThemeForLevel(level.id).id === level.theme;

  if (!validation.valid || !themeOk || bonusCount === 0) {
    failed++;
    console.error(
      `❌ Bölüm ${level.id}: valid=${validation.valid} themeOk=${themeOk} bonus=${bonusCount}`,
      validation.errors
    );
  } else {
    console.log(
      `✅ Bölüm ${String(level.id).padStart(3, '0')} [${level.theme}] | Harf: ${level.letters.join('')} (${level.letters.length}) | Hedef: ${level.words.length} | Izgara: ${grid.rows}x${grid.cols} | Bonus: ${bonusCount}`
    );
  }
}

console.log('\n==============================');
console.log(`Toplam geçerli bölüm: ${RAW_LEVELS.length - failed} / ${RAW_LEVELS.length}`);
if (failed > 0) {
  process.exit(1);
}
