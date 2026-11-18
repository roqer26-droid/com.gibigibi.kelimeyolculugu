import fs from 'node:fs';
import { generateCompactCrosswordLayout } from '../src/engine/crosswordLayout';
import { validateLevel, compileGrid } from '../src/engine/validator';
import { LevelDefinition, PlacedWord, ThemeId } from '../src/engine/types';

// ---------------------------------------------------------------------------
// 101–200. bölümler: daha fazla harf (7–8) ve daha uzun kelimeler (8–9 harf)
// ---------------------------------------------------------------------------

const tdk = new Set(
  fs
    .readFileSync('/tmp/tr-words.txt', 'utf8')
    .split(/\r?\n/)
    .map((w) => w.trim())
    .filter((w) => /^[a-zçğıöşü]+$/.test(w))
);

const freq = new Map<string, number>();
fs.readFileSync('/tmp/tr-freq.txt', 'utf8')
  .split(/\r?\n/)
  .forEach((l, i) => {
    const [w] = l.split(' ');
    if (w && !freq.has(w)) freq.set(w, i);
  });

const FUNCTION_WORDS = new Set(
  'bir bu ne ve için mi de o ben çok ama evet var da mı değil şey hayır daha sen kadar bana gibi yok iyi tamam her sana neden zaman sadece burada nasıl hiç sonra şimdi öyle önce biraz hadi güzel oldu yani böyle ona lütfen bile çünkü peki eğer artık geri kim başka belki tek doğru büyük biri olur bay olacak adam ile hiçbir biz yardım demek hey tüm fazla yeni gün nerede merhaba efendim orada son kötü gece sorun iki harika gerek tam bütün diye hemen siz küçük size yüzden bayan aynı tabii kendi kız devam bize izin buna anne selam kimse göre asla özür baba önemli tekrar yoksa hala işte içinde yine bence olmak bugün olmaz uzun lazım zaten para ilk gerçek onlar haydi birkaç emin herkes dakika pek ister saat yıl çocuk yer hep ilgili etmek nereye hepsi buradan lanet karşı kaç burası hazır fakat eski benden yapmak kadın söz zor tane diğer bunlar kişi görmek kabul niye aman sağ tanrı yarın kez bundan elbette falan hem yanlış onlara senden hoş doktor yapma özel yemek hafta kontrol oraya geç mutlu bazı ayrıca ondan nereden dışarı beri yalan yalnız insan merak polis erkek dün haber olmuş akşam geçen sakin sanki beş karar nefret sabah veya'.split(' ')
);

const NAMES = new Set(
  'ali ayşe mehmet mustafa ahmet hasan hüseyin fatma emine hatice zeynep elif meryem ömer murat kemal osman yusuf ibrahim ismail ismet recep süleyman hakan serkan burak cem can cenk ece eda ela nur su ezgi deniz selin selim ceren kerem okan volkan gökhan buğra emre erdem yiğit kaan tolga melis irem gizem merve buse dilara beren mira lina defne asya poyraz lodos ayaz'.split(' ')
);

const BLOCKED = new Set(
  'star sam lan rab ker san kip pat fer mistik aort aport akort mart nisan mayıs haziran temmuz ağustos eylül ekim kasım aralık ocak şubat cuma cumartesi pazartesi salı çarşamba perşembe allah kuran peygamber istanbul ankara izmir bursa antalya adana konya gaziantep kayseri mersin diyarbakır trabzon erzurum eskişehir samsun denizli şanlıurfa malatya kocaeli sakarya balıkesir kahramanmaraş van tekirdağ aydın manisa muğla afyonkarahisar ordu muş kars bolu rize çorum tokat elazığ sivas batman karaman kırıkkale nevşehir niğde aksaray kırşehir yozgat zonguldak bartın karabük düzce bilecik osmaniye kilis ardahan ığdır yalova tunceli hakkari şırnak siirt bitlis bingöl ağrı artvin gümüşhane bayburt giresun sinop kastamonu çankırı amasya çanakkale edirne kırklareli kütahya uşak ısparta burdur türkiye türkçe ingilizce almanca fransızca arapça rusça çince japonca korece italyanca ispanyolca yunanca amerikan ingiliz fransız alman rus arap yunan italyan ispanyol çin japon kore hint iran irak suriye yahudi ermeni rum kürt türk zenci çingene hain ahlaksız aşağılık aptallık aptal alçak katil cinayet savaş ölüm zehir hırsız lanet nefret küfür iflas kaza hastalık kanser intihar sik amın amk orospu orosbu piç göt bok yarrak yarak taşak kahpe kaltak pezevenk ibne puşt sıç osur döl meme amin mini intikam delilik seninki nesi kimi iken hani senin benim bizim sizin onun onların bunu şunu onu şuna şunda onda şundan ondan burda şurda orda şurada şuradan şuraya buraya burayı şurayı orayı neresi orası şurası iblis şeytan cin bira rakı şarap viski votka rom sigara tütün uyuşturucu esrar kokain eroin'.split(' ')
);

function isGoodWord(w: string): boolean {
  if (w.length < 3 || w.length > 9) return false;
  if (!tdk.has(w)) return false;
  const r = freq.get(w);
  if (r === undefined || r > 9000) return false;
  if (FUNCTION_WORDS.has(w) || NAMES.has(w) || BLOCKED.has(w)) return false;
  if (w.endsWith('mak') || w.endsWith('mek')) return false; // fiil mastarları
  return true;
}

const toUpper = (w: string): string =>
  w.replace(/i/g, 'İ').replace(/ı/g, 'I').toLocaleUpperCase('tr-TR');

function countsOf(letters: string[]): Record<string, number> {
  const c: Record<string, number> = {};
  for (const ch of letters) c[ch] = (c[ch] ?? 0) + 1;
  return c;
}

function canBuild(word: string, poolCounts: Record<string, number>): boolean {
  const c = { ...poolCounts };
  for (const ch of word) {
    if (!c[ch]) return false;
    c[ch]--;
  }
  return true;
}

const GOOD_WORDS = [...tdk].filter(isGoodWord);
GOOD_WORDS.sort((a, b) => (freq.get(a) ?? 1e9) - (freq.get(b) ?? 1e9));
console.log('İyi kelime havuzu:', GOOD_WORDS.length);

interface Anchor {
  word: string;
  letters: string[];
  candidates: string[];
  longCandidates: string[];
  rank: number;
}

const anchors: Anchor[] = [];
for (const w of tdk) {
  if (w.length < 6 || w.length > 8) continue;
  const r = freq.get(w);
  if (r === undefined || r > 15000) continue;
  if (FUNCTION_WORDS.has(w) || NAMES.has(w) || BLOCKED.has(w)) continue;
  if (w.endsWith('mak') || w.endsWith('mek')) continue;
  const letters = w.split('');
  if (new Set(letters).size < 5) continue;
  const poolCounts = countsOf(letters);
  const candidates = GOOD_WORDS.filter((v) => canBuild(v, poolCounts));
  if (candidates.length < 10) continue;
  const longCandidates = candidates.filter((v) => v.length >= 6);
  anchors.push({
    word: toUpper(w),
    letters: letters.map(toUpper),
    candidates: candidates.map(toUpper),
    longCandidates: longCandidates.map(toUpper),
    rank: r,
  });
}
anchors.sort((a, b) => a.rank - b.rank);
console.log('Çapa adayı:', anchors.length);

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
const rng = mulberry32(20260220);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const THEME_ORDER: ThemeId[] = [
  'emerald', 'waterfall', 'azure', 'lavender', 'silent',
  'golden', 'misty', 'coral', 'silver', 'plateau',
  'pine', 'canyon', 'lily', 'glacier', 'desert',
  'meadow', 'coast', 'cloud', 'oasis', 'moonlight',
];

function themeFor(id: number): ThemeId {
  return THEME_ORDER[Math.floor((id - 1) / 10) % THEME_ORDER.length];
}

const REST = new Set([107, 124, 143, 168, 186, 197]);

function desiredFor(id: number): number {
  if (REST.has(id)) return 5;
  if (id <= 130) return 7;
  if (id <= 140) return 8;
  if (id <= 170) return 8;
  if (id <= 190) return 9;
  return 10;
}

function maxWordLenFor(id: number): number {
  if (id <= 140) return 7;
  if (id <= 170) return 8;
  return 9;
}

function anchorLenAllowed(id: number, len: number): boolean {
  if (id <= 140) return len === 6 || len === 7;
  if (id >= 191) return len === 8;
  return len === 7 || len === 8;
}

const rewardFor = (id: number) => Math.min(190, 35 + Math.round((id - 30) * 0.9));

const usedSets = new Set<string>();
const anchorUse = new Map<string, number>();
const lastUsed = new Map<string, number>();
const levels: LevelDefinition[] = [];

function solveSubset(words: string[], id: number): PlacedWord[] | null {
  void id;
  const placed = generateCompactCrosswordLayout(words, {
    maxBranching: 6,
    maxNodes: 10000,
    mrv: true,
    scoreCandidates: true,
  });
  if (!placed) return null;
  const { grid } = compileGrid(placed);
  if (grid.rows > 10 || grid.cols > 10) return null;
  return placed;
}

function tryBuild(id: number, anchor: Anchor, count: number): LevelDefinition | null {
  const maxLen = maxWordLenFor(id);
  const pool = anchor.candidates.filter((w) => w !== anchor.word && w.length <= maxLen);
  const longFirst = [...pool].sort(
    (a, b) => b.length - a.length || (freq.get(toLower(a)) ?? 1e9) - (freq.get(toLower(b)) ?? 1e9)
  );

  const orders: string[][] = [longFirst];
  for (let k = 0; k < 1; k++) {
    const top = pool.slice(0, 35);
    const rest = pool.slice(35);
    orders.push([...shuffle(top), ...shuffle(rest)]);
  }

  const seen = new Set<string>();
  for (const order of orders) {
    for (let extra = 0; extra <= 1; extra++) {
      const want = Math.max(5, count - extra);
      const selected = [anchor.word, ...order.slice(0, want - 1)];
      const key = [...selected].sort((a, b) => a.localeCompare(b, 'tr-TR')).join('|');
      if (seen.has(key) || usedSets.has(key)) continue;
      seen.add(key);

      const placed = solveSubset(selected, id);
      if (!placed) continue;

      const level: LevelDefinition = {
        id,
        theme: themeFor(id),
        letters: [...anchor.letters],
        words: placed,
        rewardCoins: rewardFor(id),
        ...(REST.has(id) ? { isRestLevel: true } : {}),
      };
      const result = validateLevel(level);
      if (!result.valid) continue;
      usedSets.add(key);
      return level;
    }
  }
  return null;
}

function toLower(w: string): string {
  return w.replace(/İ/g, 'i').replace(/I/g, 'ı').toLocaleLowerCase('tr-TR');
}

for (let id = 101; id <= 200; id++) {
  const levelStart = Date.now();
  const desired = desiredFor(id);
  const isRest = REST.has(id);

  const candidates = anchors
    .filter((a) => {
      if (!anchorLenAllowed(id, a.word.length)) return false;
      const use = anchorUse.get(a.word) ?? 0;
      if (use >= 2) return false;
      const last = lastUsed.get(a.word);
      if (last !== undefined && id - last < 6) return false;
      if (a.candidates.length < Math.max(5, desired - 1)) return false;
      if (!isRest && id >= 141 && a.word.length === 8 && a.longCandidates.length < 3) return false;
      return true;
    })
    .sort((a, b) => {
      const ua = anchorUse.get(a.word) ?? 0;
      const ub = anchorUse.get(b.word) ?? 0;
      if (ua !== ub) return ua - ub;
      if (!isRest && a.longCandidates.length !== b.longCandidates.length)
        return b.longCandidates.length - a.longCandidates.length;
      if (isRest && a.word.length !== b.word.length) return a.word.length - b.word.length;
      if (!isRest && a.word.length !== b.word.length) return b.word.length - a.word.length;
      return a.rank - b.rank;
    });

  let built: LevelDefinition | null = null;
  let usedAnchor: Anchor | null = null;
  const budget = isRest ? 20 : 20;

  for (const anchor of candidates.slice(0, budget)) {
    if (Date.now() - levelStart > 30000) break;
    const counts = [desired, desired - 1, desired + 1]
      .filter((v) => v >= 5 && v <= 10 && v <= anchor.candidates.length);
    for (const count of [...new Set(counts)]) {
      built = tryBuild(id, anchor, count);
      if (built) {
        usedAnchor = anchor;
        break;
      }
    }
    if (built) break;
  }

  // Zaman aşımı durumunda: daha az hedefle herhangi bir çapa dene
  if (!built) {
    for (const anchor of candidates.slice(0, 30)) {
      if (Date.now() - levelStart > 60000) break;
      built = tryBuild(id, anchor, 5);
      if (built) {
        usedAnchor = anchor;
        break;
      }
    }
  }

  if (!built || !usedAnchor) {
    console.error('BÖLÜM ÜRETİLEMEDİ', id);
    continue;
  }

  anchorUse.set(usedAnchor.word, (anchorUse.get(usedAnchor.word) ?? 0) + 1);
  lastUsed.set(usedAnchor.word, id);

  const ALPHABET = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('');
  built.letters = [...built.letters].sort(
    (a, b) => ALPHABET.indexOf(a) - ALPHABET.indexOf(b)
  );

  levels.push(built);
  const { grid } = compileGrid(built.words);
  console.log(
    `✅ ${id} [${built.theme}] ${built.letters.join('')} (${built.letters.length}) → ${built.words.length} kelime ${grid.rows}x${grid.cols} (${Date.now() - levelStart}ms) | ${built.words.map((w) => w.word).join(', ')}`
  );
}

console.log('\nToplam üretilen:', levels.length);
fs.writeFileSync('/tmp/new-levels-200.json', JSON.stringify(levels, null, 2));
if (levels.length !== 100) {
  console.error('EKSİK BÖLÜM VAR!', levels.length);
  process.exitCode = 1;
}
