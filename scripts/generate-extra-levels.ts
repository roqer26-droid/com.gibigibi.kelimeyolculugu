import { generateCompactCrosswordLayout } from '../src/engine/crosswordLayout';
import { validateLevel, compileGrid } from '../src/engine/validator';
import { LevelDefinition, PlacedWord, ThemeId } from '../src/engine/types';

interface Family {
  pool: string[];
  words: string[];
}

const F = (pool: string, words: string): Family => ({
  pool: pool.split(','),
  words: words.split(',').map((w) => w.trim()).filter(Boolean),
});

// Tüm kelimeler gerçek Türkçe sözlük kelimeleridir; özel isim/kısaltma yoktur.
const FAMILIES: Family[] = [
  F('D,E,F,T,E,R', 'DEFTER,DERT,FERT,TER,FER,EFE'),
  F('T,E,M,İ,Z,L,E', 'TEMİZ,TEMEL,ELZEM,İZLEM,EZME,ZİL,TİM,MİT'),
  F('K,İ,T,A,P', 'KİTAP,TAKİP,KAT,TAK,TİP,KAP,KİP'),
  F('H,A,V,U,Z,L,A', 'HAVUZ,HAVA,VAHA,HAL,HAZ'),
  F('Ç,A,M,A,Ş,I,R', 'ÇAMAŞIR,ÇARŞI,MAŞA,ÇAM,AŞI,ARA,ÇAR'),
  F('B,A,R,D,A,K', 'BARDAK,KARA,DARA,BAR,DAR,KAR,ARA,ADA'),
  F('P,E,R,D,E,N,A', 'PERDE,DERE,PEDER,EREN,DANE'),
  F('T,A,B,A,N,L', 'TABAN,BALTA,TABLA,BANT,BAL,TAN,TAB,ANA'),
  F('K,U,M,A,N,D,A', 'KUMANDA,DUMAN,ADAM,DANA,KUMA,KUM,KAN,DAM'),
  F('B,A,L,İ,N,A', 'BALİNA,ALAN,BAL,BAN,ANA,BALA'),
  F('T,E,R,Z,İ,L,A', 'TERZİ,TARZ,LİRA,TEZ,ZİL,LİR,TER,ZAR,ARZ'),
  F('P,A,M,U,K,L', 'PAMUK,KALP,PLAK,KUMA,KUM,KAP,PUL,KUL,LAM,LAP'),
  F('Ç,A,K,M,A,K', 'ÇAKMAK,ÇAKMA,MAÇ,KAMA,ÇAK,AKMA,KAM,AMA'),
  F('B,A,S,M,A,K', 'BASMAK,MAKAS,AKSAM,BASMA,MASA,KAS,KAM'),
  F('S,A,P,M,A,K', 'SAPMAK,SAPMA,KAPMA,MAKAS,KAP,PAS,SAP,KAM'),
  F('K,A,Y,I,K', 'KAYIK,KIYAK,AYIK,KAY,YAK,KAK'),
  F('K,Ö,P,R,Ü,E', 'KÖPRÜ,KÜRE,PÜRE,KÖR,KÜR'),
  F('G,İ,Ğ,N,E,R,L', 'İĞNE,GELİN,GERİ,ERİL,GRİ,LİR'),
  F('A,Ğ,I,Z,R,K,A', 'AĞIZ,KIZ,KIR,KAZ,KAR,IRK,AĞA,ARZ,ZAR'),
  F('Ç,O,C,U,K,A', 'ÇOCUK,KOCA,KOÇ,ÇOK,ÇAK'),
  F('L,İ,M,O,N,A', 'LİMON,ALİM,İMAL,MAİL,ANİ,MAL,LAM'),
  F('Z,E,Y,T,İ,N,A', 'ZEYTİN,YENİ,TANE,YAZ,TAN,NEY,TEZ,TİZ,TEN'),
  F('K,A,V,U,N,T,A', 'TAVUK,KAVUN,VATAN,TAVAN,KAN,KAT,TAV,ANT'),
  F('Ş,E,F,T,A,L,İ', 'ŞEFTALİ,ATEŞ,AİLE,TAŞ,FİL,ŞEF,FAL,TEL,LİF,TALİ'),
  F('K,İ,R,E,Ç,A,L', 'ÇİLEK,ÇELİK,KİREÇ,KİLER,ERİK,ÇARE,KİRA,LİRA,ÇEK,KİR,KİL'),
  F('B,İ,B,E,R,L', 'BİBER,LİBRE,BİLE,ERİL,BEL,BİR'),
  F('T,A,V,Ş,A,N', 'TAVŞAN,TAVAN,VATAN,TAVA,TAŞ,ŞAN,TAV,TAN,ATA,ANA'),
  F('Y,I,L,A,N,S', 'YILAN,SILA,ASIL,SAYI,YALI,SALI,YIL,AYI,YAN,YAS,SAL'),
  F('A,Y,N,A,K', 'AYNA,KAYA,AYAK,KAN,KAY,YAK,ANA,YAN'),
  F('A,R,K,A,D,A,Ş', 'ARKADAŞ,ARKA,DAR,ADA,ŞAD,KAR,ARA,ARK'),
  F('B,İ,L,G,İ,N,E', 'BİLGİ,BİLGİN,GELİN,BELGİ,İLGİ,BİLGE,BİLE'),
  F('O,K,U,L,A,Y', 'OKUL,OLAY,KOYU,YOL,KOY,YOK,YAK,KUL,KOLA'),
  F('A,L,İ,M,A', 'ALİM,AMİL,İMAL,MAİL,MAL,LAM'),
  F('S,İ,R,T,A', 'ASİT,ART,AST,TAR,ASİ'),
  F('K,A,M,Y,O,N', 'KAMYON,MAYO,KOMA,KOY,YOK,KAM,KAN,YAN'),
  F('S,Ü,T,Ç,Ü,A', 'SÜTÇÜ,ÜTÜ,ÜST,SÜT,TAÇ'),
  F('K,A,R,D,E,Ş,E', 'KARDEŞ,KEDER,DERE,KERE,KAR,DAR,ŞER'),
  F('B,A,Y,R,A,K', 'BAYRAK,YARA,AYAK,KAYA,RAY,BAR,KAR,ARA,YAK,BAY,ARK'),
  F('B,İ,L,E,Z,İ,K', 'BİLEZİK,BİLEK,BİLE,KİL,KEL,BEL,İKİZ'),
  F('H,A,L,I,S', 'HALI,SILA,ASIL,SALI,HAL,SAL'),
  F('K,A,R,N,A', 'KARA,KAR,KAN,ARA,ANA,NAR,ARK'),
  F('B,A,L,O,N,A', 'BALON,ALAN,BAL,BOL,BALA,ANA'),
  F('S,A,N,A,T', 'SANAT,TAN,ANA,ANT,AST,TAS,SAN'),
  F('M,A,S,A,L', 'MASAL,MASA,ASAL,SAL,AMA,ASA'),
  F('K,A,L,E,M', 'KALEM,EMLAK,KELAM,KALE,ELMA,ALEM,KAL,MAL'),
  F('S,E,R,İ,N,G', 'SERİN,ENGİN,GERİ,SERİ,SER,SİN'),
  F('K,A,R,T,A,L', 'KARTAL,TARLA,KATAR,AKTAR,KART,KAR,ART,ALT,ARA,TAR'),
  F('B,A,L,I,K', 'BALIK,BAL,KIL,AKI,ALIK'),
  F('D,A,V,U,L,E', 'DAVUL,ALEV,VEDA,DUA,DAL'),
  F('K,A,R,A,R', 'KARAR,KARA,AKAR,KAR,ARA,ARK'),
  F('S,A,R,A,Y', 'SARAY,YARA,AYAR,SARA,ARA,SAR,YAR'),
  F('M,E,R,A,K', 'MERAK,KREMA,KREM,KARE,KAR,ARK,ERK,KAM'),
  F('K,A,S,E,T', 'KASE,KAS,SET,KAT,KES,TEK,AST,SEK'),
  F('B,A,R,I,Ş', 'BARIŞ,ŞIRA,SARI,BAŞ,ARI,AŞI,BAR'),
  F('T,A,R,L,A', 'TARLA,ART,ALT,TAR,ARA,ATA'),
  F('K,U,M,A,R', 'KUMAR,KUMA,KURA,KUM,KAR,RAM'),
  F('S,A,H,İ,L', 'SAHİL,SİLAH,ASİL,SAHİ,HAL,SAL'),
  F('Ç,A,Y,I,R', 'ÇAYIR,ÇAY,AYI,AÇI,ÇAR,YAR,ARI,RAY'),
  F('Ç,I,K,R,A,K', 'ÇAKIR,AÇIK,ÇAKI,ÇIRA,KARI,ÇAR,KAR,KIR,ARI,AKI'),
  F('Y,A,L,I,S', 'YALI,SILA,SALI,ASIL,HALI,HAL,SAL'),
];

// zaten var olan 1-30 bölümlerinde kullanılan harf havuzlarına çok benzeyenleri ikinci turda kullanacağız.

const RAW_TDK = process.env.TDK_WORDS ?? '/tmp/tr-words.txt';
import fs from 'node:fs';
const tdkSet = new Set(
  fs.readFileSync(RAW_TDK, 'utf8').split(/\r?\n/).map((w) => w.trim()).filter((w) => /^[a-zçğıöşü]+$/.test(w))
);

function toLower(w: string): string {
  return w.replace(/İ/g, 'i').replace(/I/g, 'ı').toLocaleLowerCase('tr-TR');
}
function counts(pool: string[]): Record<string, number> {
  const c: Record<string, number> = {};
  for (const ch of pool) c[ch] = (c[ch] ?? 0) + 1;
  return c;
}
function canBuild(word: string, pool: string[]): boolean {
  const c = counts(pool);
  for (const ch of word) {
    if (!c[ch]) return false;
    c[ch]--;
  }
  return true;
}

// Kelime havuzunu doğrula; sözlükte olmayan kelimeleri at
let hadErrors = false;
const cleanFamilies: Family[] = [];
for (const fam of FAMILIES) {
  const kept: string[] = [];
  for (const w of fam.words) {
    if (!canBuild(w, fam.pool)) {
      console.error('HARF HATASI', fam.pool.join(''), w);
      hadErrors = true;
      continue;
    }
    if (!tdkSet.has(toLower(w))) {
      console.error('SÖZLÜK HATASI', w, 'pool', fam.pool.join(''));
      hadErrors = true;
      continue;
    }
    kept.push(w);
  }
  if (kept.length >= 5) {
    cleanFamilies.push({ pool: fam.pool, words: [...new Set(kept)].sort((a, b) => b.length - a.length || a.localeCompare(b, 'tr-TR')) });
  } else {
    console.error('YETERSİZ AİLE', fam.pool.join(''), 'kalan', kept.length, kept.join(','));
  }
}

console.log('Doğrulanan aile sayısı:', cleanFamilies.length, 'hata:', hadErrors);

// Deterministik RNG
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260214);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function themeFor(id: number): ThemeId {
  const chapter = Math.floor((id - 1) / 10);
  return (['valley', 'lake', 'sunset'] as ThemeId[])[chapter % 3];
}

function targetRanges(id: number): [number, number] {
  if (id <= 40) return [5, 6];
  if (id <= 50) return [6, 7];
  if (id <= 60) return [6, 8];
  if (id <= 70) return [7, 8];
  if (id <= 80) return [8, 9];
  return [8, 10];
}

const restLevelIds = new Set([37, 44, 53, 64, 77, 86, 97]);
const rewardFor = (id: number) => Math.min(120, 35 + Math.round((id - 30) * 0.9));

const usedSets = new Set<string>();
const familyUse = new Map<number, number>();
const levels: LevelDefinition[] = [];
const specs: { id: number; theme: ThemeId; letters: string[]; targetWords: string[]; rewardCoins: number; isRestLevel?: boolean; words: PlacedWord[] }[] = [];

function solveSubset(pool: string[], words: string[], requireDimension = 9): { placed: PlacedWord[]; rows: number; cols: number } | null {
  const placed = generateCompactCrosswordLayout(words, { maxBranching: 8, maxNodes: 50000 });
  if (!placed) return null;
  const { grid } = compileGrid(placed);
  if (grid.rows > requireDimension || grid.cols > requireDimension) return null;
  if (grid.rows * grid.cols > requireDimension * requireDimension) return null;
  return { placed, rows: grid.rows, cols: grid.cols };
}

function tryBuildLevel(id: number, fam: Family, count: number): LevelDefinition | null {
  const desired = Math.min(count, fam.words.length, 10);
  if (desired < 5) return null;

  // En uzun kelime (aile çapası) her zaman hedefler arasında olsun
  const anchor = fam.words[0];
  const restPool = fam.words.slice(1);
  // İlk deneme: en uzun kelimeler öncelikli, sonrasında karışık varyasyonlar
  const baseOrders: string[][] = [];
  const byLength = [...restPool].sort((a, b) => b.length - a.length || a.localeCompare(b, 'tr-TR'));
  baseOrders.push(byLength);
  for (let k = 0; k < 24; k++) baseOrders.push(shuffle(restPool));

  const seenSubsets = new Set<string>();
  for (const order of baseOrders) {
    for (let extra = 0; extra <= 2; extra++) {
      const want = Math.max(5, desired - extra);
      const selected = [anchor, ...order.slice(0, want - 1)];
      const key = [...selected].sort((a, b) => a.localeCompare(b, 'tr-TR')).join('|');
      if (seenSubsets.has(key)) continue;
      seenSubsets.add(key);
      if (usedSets.has(key)) continue;

      const solved = solveSubset(fam.pool, selected);
      if (!solved) continue;
      const level: LevelDefinition = {
        id,
        theme: themeFor(id),
        letters: [...fam.pool],
        words: solved.placed,
        rewardCoins: rewardFor(id),
        ...(restSet.has(id) ? { isRestLevel: true } : {}),
      };
      const result = validateLevel(level);
      if (!result.valid) {
        console.error('GEÇERSİZ', id, result.errors);
        continue;
      }
      usedSets.add(key);
      return level;
    }
  }
  return null;
}

const lastUsed = new Map<number, number>();
const restSet = new Set([37, 44, 53, 64, 77, 86, 97]);

function desiredFor(id: number): number {
  if (restSet.has(id)) return id <= 53 ? 5 : id <= 77 ? 5 : 5;
  if (id <= 36) return 5;
  if (id <= 40) return 6;
  if (id <= 43) return 6;
  if (id <= 50) return 7;
  if (id <= 53) return 7;
  if (id <= 60) return 8;
  if (id <= 63) return 7;
  if (id <= 70) return 8;
  if (id <= 76) return 8;
  if (id <= 80) return 9;
  if (id <= 85) return 8;
  if (id <= 90) return 9;
  if (id <= 96) return 9;
  return 10;
}

for (let id = 31; id <= 100; id++) {
  const desired = desiredFor(id);
  const isRest = restSet.has(id);
  const globalMax = Math.min(10, desired + 1);
  const tileAllowed = (tileCount: number) => {
    if (id <= 40) return tileCount === 5;
    if (isRest) return tileCount >= 5 && tileCount <= 6;
    return tileCount >= 6 && tileCount <= 7;
  };

  const buildFromFamilies = (minWordCount: number, minRelaxedWords: number, allowUse: number, minDistance = 0): { level: LevelDefinition; familyIdx: number } | null => {
    const list = [...cleanFamilies.keys()]
      .filter((idx) => {
        const fam = cleanFamilies[idx];
        const use = familyUse.get(idx) ?? 0;
        if (use >= allowUse) return false;
        if (!tileAllowed(fam.pool.length)) return false;
        if (fam.words.length < minRelaxedWords) return false;
        if (minDistance > 0) {
          const last = lastUsed.get(idx);
          if (last !== undefined && id - last < minDistance) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const fa = cleanFamilies[a];
        const fb = cleanFamilies[b];
        const ua = familyUse.get(a) ?? 0;
        const ub = familyUse.get(b) ?? 0;
        const richA = fa.words.length >= 8 ? 1 : 0;
        const richB = fb.words.length >= 8 ? 1 : 0;
        if (isRest) {
          if (fa.words.length !== fb.words.length) return fa.words.length - fb.words.length;
          if (fa.pool.length !== fb.pool.length) return fa.pool.length - fb.pool.length;
          return (ua - ub);
        }
        if (id >= 91) {
          if (fa.words.length !== fb.words.length) return fb.words.length - fa.words.length;
          if (richA !== richB) return richB - richA;
        } else if (id >= 71) {
          if (richA !== richB) return richB - richA;
          if (fa.words.length !== fb.words.length) return fb.words.length - fa.words.length;
        } else {
          if (ua !== ub) return ua - ub;
          if (richA !== richB) return richA - richB;
        }
        const da = id - (lastUsed.get(a) ?? -100);
        const db = id - (lastUsed.get(b) ?? -100);
        if (da !== db) return db - da;
        return rng() - 0.5;
      });

    for (const idx of list) {
      const fam = cleanFamilies[idx];
      if (fam.words.length < minWordCount) continue;
      const counts = [desired, desired - 1, desired + 1, Math.min(globalMax, fam.words.length)]
        .filter((v) => v >= 5 && v <= 10 && v <= fam.words.length)
        .sort((a, b) => Math.abs(a - desired) - Math.abs(b - desired));
      for (const count of [...new Set(counts)]) {
        const level = tryBuildLevel(id, fam, count);
        if (level) return { level, familyIdx: idx };
      }
    }
    return null;
  };

  const firstUseLimit = id < 71 ? 1 : 99;
  const spacing = id >= 71 && !isRest ? 10 : 0;

  // 1. tur: hedef kelime sayısı ve harf çemberi tam uyumlu,
  // geç bölümlerde aynı aile en az 10 bölüm arayla geri döner
  let result = buildFromFamilies(desired, Math.max(5, desired - 1), firstUseLimit, spacing);

  // 2. tur: hedef sayısı biraz esnek, harf çemberi kuralı korunur
  if (!result) result = buildFromFamilies(5, 5, firstUseLimit, 0);

  // Son çare: kelime sayısı en az 5, aile kullanım sınırı esnetilir
  if (!result) result = buildFromFamilies(5, 5, 99, 0);

  if (!result) {
    console.error('BÖLÜM ÜRETİLEMEDİ', id, 'istenen', desired);
    continue;
  }

  const built = result.level;
  const chosenFamilyIdx = result.familyIdx;
  familyUse.set(chosenFamilyIdx, (familyUse.get(chosenFamilyIdx) ?? 0) + 1);
  lastUsed.set(chosenFamilyIdx, id);
  // Harf çemberini Türk alfabesine göre sırala
  const ALPHABET = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('');
  built.letters = [...built.letters].sort((a, b) => ALPHABET.indexOf(a) - ALPHABET.indexOf(b));
  levels.push(built);
  specs.push({
    id,
    theme: built.theme,
    letters: built.letters,
    targetWords: built.words.map((w) => w.word),
    rewardCoins: built.rewardCoins,
    ...(built.isRestLevel ? { isRestLevel: true } : {}),
    words: built.words,
  });
  const { grid } = compileGrid(built.words);
  console.log(`✅ ${id} [${built.theme}] ${built.letters.join('')} (${built.letters.length}) → ${built.words.length} kelime ${grid.rows}x${grid.cols} | ${built.words.map((w) => w.word).join(', ')}`);
}

console.log('\nAile kullanım dağılımı:');
for (const [idx, count] of [...familyUse.entries()].sort((a,b)=>b[1]-a[1])) {
  console.log(cleanFamilies[idx].pool.join(''), count);
}
console.log('\nToplam üretilen:', levels.length);
fs.writeFileSync('/tmp/new-levels.json', JSON.stringify(levels, null, 2));
if (levels.length !== 70) {
  console.error('EKSİK BÖLÜM VAR!', levels.length);
  process.exitCode = 1;
}
