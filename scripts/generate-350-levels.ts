import fs from 'node:fs';
import { generateCompactCrosswordLayout } from '../src/engine/crosswordLayout';
import { validateLevel, compileGrid } from '../src/engine/validator';
import { LevelDefinition, ThemeId } from '../src/engine/types';
import { RAW_LEVELS } from '../src/data/levels';

// ---------------------------------------------------------------------------
// 201–350. bölümler
// - Her bölümün harf havuzu oyundaki diğer tüm bölümlerden farklıdır.
// - Zorluk bölüm numarasıyla artar: en zengin 8 harfli havuzlar son bölümlere verilir.
// - Betik devam ettirilebilir: ilerleme /tmp/levels-350-state.json dosyasında tutulur.
// ---------------------------------------------------------------------------

const FIRST_ID = 201;
const LAST_ID = 350;
const TOTAL = LAST_ID - FIRST_ID + 1;
const STATE_PATH = '/tmp/levels-350-state.json';
const OUT_PATH = '/tmp/new-levels-350.json';
const RUN_BUDGET_MS = Number(process.env.RUN_BUDGET_MS ?? 470000);
const runStart = Date.now();

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

const words = (s: string): string[] => s.split(/\s+/).filter(Boolean);

// Bağlaç, zamir, ünlem ve çekimli görünen işlev kelimeleri
const FUNCTION_WORDS = new Set(
  words(`bir bu ne ve için mi de o ben çok ama evet var da mı değil şey hayır daha sen kadar bana gibi yok tamam her sana neden sadece burada nasıl hiç sonra şimdi öyle önce biraz hadi oldu yani böyle ona lütfen bile çünkü peki eğer artık kim başka belki biri olur olacak ile hiçbir biz demek hey tüm nerede merhaba efendim orada gerek tam bütün diye hemen siz size yüzden aynı tabii kendi bize buna kimse göre asla tekrar yoksa hala işte içinde yine bence olmak olmaz lazım zaten onlar haydi birkaç herkes pek ister hep etmek nereye hepsi buradan karşı kaç burası fakat benden yapmak diğer bunlar görmek niye aman kez bundan elbette falan hem onlara senden yapma oraya bazı ayrıca ondan nereden beri olmuş sanki veya
  şuna şunu şunda şundan bunu onu beni seni bizi sizi benim senin onun bizim sizin bende sende onda bizde sizde bizden sizden şunlar nesi kimi iken hani ancak lakin dahi hatta üzere ise yahut etti gitti geldi aldı dedi yaptı istedi bildi gördü durdu kaldı verdi olmadan olarak olsun olan olunca bakın durun koşun konuş seninki benimki onunki burda şurda orda şurada şuradan şuraya buraya burayı şurayı orayı neresi orası şurası hangisi başkası hepimiz hepiniz kimisi birisi öbür öteki ulan yahu eyvah aferin bravo
  çıkacak çıkan gelen giren olamaz bilir topla çalış inan say kes gönder kal yat yaşa filan mesela gerçi hele bari sırf karıma evin elim kaçta barda tavuklar meydanda saatinde vaktinde yukarıda alo vay halt
  etme olma deme gitme girme verme koyma durma kızma korkma sanma sorma yatma bakma kaçma çıkma atma bulma geçme dönme kalkma gelme yeme gülme unutma söyleme dokunma üzülme
  karaya sabaha geleni kana bağı adama akşamdan sabahtan gerçekte oturacak sever bul gene keşke zira denli oysa barı değiş mars beyninde halbuki madem meğer nitekim üstelik böylece şayet henüz bazen acaba galiba herhalde elbet birçok`)
);

const NAMES = new Set(
  words(`ali ayşe mehmet mustafa ahmet hasan hüseyin fatma emine hatice zeynep elif meryem ömer murat kemal osman yusuf ibrahim ismail ismet recep süleyman hakan serkan burak cem cenk ece eda selin selim ceren kerem okan gökhan buğra emre kaan tolga melis irem merve dilara beren mira lina doğan yılmaz öztürk arslan polat tekin salim erin`)
);

// Argo, hakaret, şiddet, madde, hassas din/etnik köken ve özel isim niteliğindeki kelimeler
const BLOCKED = new Set(
  words(`star sam lan rab ker san kip pat fer mistik aort aport akort
  mart nisan mayıs haziran temmuz ağustos eylül ekim kasım aralık ocak şubat cuma cumartesi pazartesi salı çarşamba perşembe
  allah kuran peygamber tanrı isa musa mesih papa rahip rahibe papaz haham imam kilise cami havra tapınak şeytan iblis cin cehennem kafir dinsiz gavur günah lanetli büyücü cadı hortlak zombi vampir
  istanbul ankara izmir bursa antalya adana konya gaziantep kayseri mersin diyarbakır trabzon erzurum eskişehir samsun denizli şanlıurfa malatya kocaeli sakarya balıkesir kahramanmaraş van tekirdağ aydın manisa muğla ordu muş kars bolu rize çorum tokat elazığ sivas batman karaman kırıkkale nevşehir niğde aksaray kırşehir yozgat zonguldak bartın karabük düzce bilecik osmaniye kilis ardahan ığdır yalova tunceli hakkari şırnak siirt bitlis bingöl ağrı artvin gümüşhane bayburt giresun sinop kastamonu çankırı amasya çanakkale edirne kırklareli kütahya uşak ısparta burdur
  türkiye türkçe ingilizce almanca fransızca arapça rusça çince japonca korece italyanca ispanyolca yunanca amerikan amerika avrupa asya afrika ingiliz fransız alman rus arap yunan italyan ispanyol çin çinli japon kore koreli hint hintli iran irak suriye mısır yahudi ermeni rum kürt türk zenci çingene kızılderili meksika brezilya kanada londra paris berlin roma moskova
  sik sikiş amın amk amcık orospu orosbu fahişe piç göt bok boktan yarrak yarak taşak kahpe kaltak pezevenk ibne puşt sıç osur osuruk döl meme sürtük şırfıntı kancık kerhane genelev seks seksi cinsel erotik porno çıplak tecavüz taciz sapık ırz zina fuhuş sidik çiş kaka dışkı kusmuk
  hain ahlaksız aşağılık aptallık aptal aptalca alçak salak gerizekalı ahmak budala enayi şerefsiz haysiyetsiz namussuz rezil rezalet pislik iğrenç adi it hıyar öküz eşek domuz serseri manyak geri moron dangalak mankafa bunak
  katil cinayet savaş ölüm ölü ölme öldürme ceset cenaze mezar mezarlık tabut idam infaz işkence terör terörist kavga dayak şiddet soykırım katliam kıyım köle esir rehine tutsak hapis hapishane mahkum suç suçlu hırsız hırsızlık soygun soyguncu rüşvet silah bomba kurşun mermi tüfek tabanca bıçak zehir zehirli intihar intikam nefret lanet küfür iflas kaza hastalık kanser veba salgın felç felaket facia yangın deprem
  bira rakı şarap viski votka rom cin likör şampanya kokteyl alkol alkolik sarhoş ayyaş meyhane bar sigara puro tütün uyuşturucu esrar kokain eroin afyon kumar kumarbaz kumarhane bahis
  delilik sakat kötürüm topal dul yetim öksüz sağır kör sara sefil pis zorbalık zorba kaçık kanlı vefat rahmetli amin psikopat narkotik suçlama suçlamak paskalya kardinal kanka bakire gerzek ezik çete`)
);

function isGoodWord(w: string): boolean {
  if (w.length < 3 || w.length > 8) return false;
  if (!tdk.has(w)) return false;
  const r = freq.get(w);
  if (r === undefined || r > 10000) return false;
  if (FUNCTION_WORDS.has(w) || NAMES.has(w) || BLOCKED.has(w)) return false;
  if (w.endsWith('mak') || w.endsWith('mek')) return false;
  return true;
}

const toUpper = (w: string): string =>
  w.replace(/i/g, 'İ').replace(/ı/g, 'I').toLocaleUpperCase('tr-TR');
const toLower = (w: string): string =>
  w.replace(/İ/g, 'i').replace(/I/g, 'ı').toLocaleLowerCase('tr-TR');

const ALPHABET = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('');
const sortLetters = (letters: string[]): string[] =>
  [...letters].sort((a, b) => ALPHABET.indexOf(a) - ALPHABET.indexOf(b));
const poolKeyOf = (letters: string[]): string => sortLetters(letters).join('');

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

// Mevcut 1–200. bölümlerde kullanılan havuzlar ve hedef kelimeler tekrar edilmez
const existing = RAW_LEVELS.filter((l) => l.id < FIRST_ID);
const existingPools = new Set(existing.map((l) => poolKeyOf(l.letters)));
const existingTargets = new Set(existing.flatMap((l) => l.words.map((w) => w.word)));

interface Anchor {
  word: string;
  letters: string[];
  poolKey: string;
  candidates: string[]; // sıklık sırasına göre (çapa hariç)
  longCount: number;
  rank: number;
  isVerb: boolean;
  richness: number;
}

const byPool = new Map<string, Anchor>();
for (const w of tdk) {
  if (w.length !== 7 && w.length !== 8) continue;
  const r = freq.get(w);
  if (r === undefined || r > 22000) continue;
  if (FUNCTION_WORDS.has(w) || NAMES.has(w) || BLOCKED.has(w)) continue;
  const lower = w.split('');
  if (new Set(lower).size < 5) continue;
  const upperWord = toUpper(w);
  if (existingTargets.has(upperWord)) continue;
  const letters = lower.map(toUpper);
  const poolKey = poolKeyOf(letters);
  if (existingPools.has(poolKey)) continue;
  const pc = countsOf(lower);
  const cands = GOOD_WORDS.filter((v) => v !== w && canBuild(v, pc));
  if (cands.length < 6) continue;
  const isVerb = w.endsWith('mak') || w.endsWith('mek');
  const longCount = cands.filter((v) => v.length >= 5).length;
  const anchor: Anchor = {
    word: upperWord,
    letters,
    poolKey,
    candidates: cands.map(toUpper),
    longCount,
    rank: r,
    isVerb,
    richness: longCount * 2 + cands.length - (isVerb ? 6 : 0),
  };
  const prev = byPool.get(poolKey);
  if (
    !prev ||
    (prev.isVerb && !isVerb) ||
    (prev.isVerb === isVerb && r < prev.rank)
  ) {
    byPool.set(poolKey, anchor);
  }
}
const anchors = [...byPool.values()];

const THEME_ORDER: ThemeId[] = [
  'emerald', 'waterfall', 'azure', 'lavender', 'silent',
  'golden', 'misty', 'coral', 'silver', 'plateau',
  'pine', 'canyon', 'lily', 'glacier', 'desert',
  'meadow', 'coast', 'cloud', 'oasis', 'moonlight',
  'violet', 'crystal', 'olive', 'lagoon', 'autumn',
  'daisy', 'snowy', 'reed', 'butterfly', 'dawn',
  'mossy', 'rainforest', 'volcanic', 'poppy', 'rainbow',
];
const themeFor = (id: number): ThemeId =>
  THEME_ORDER[Math.floor((id - 1) / 10) % THEME_ORDER.length];

// Her manzarada bir dinlenme bölümü
const REST = new Set([204, 217, 226, 238, 243, 259, 265, 272, 287, 294, 306, 313, 328, 335, 347]);

function desiredFor(id: number): number {
  if (REST.has(id)) return id <= 275 ? 5 : 6;
  if (id <= 260) return 9;
  if (id <= 310) return id % 2 === 0 ? 10 : 9;
  return 10;
}

const rewardFor = (id: number): number => 190 + Math.round((id - 200) * 0.4);

// 8 harfli havuz arzına göre harf planı: yetmezse en düşük numaralı bölümler 7 harf alır
const nonRestIds: number[] = [];
for (let id = FIRST_ID; id <= LAST_ID; id++) if (!REST.has(id)) nonRestIds.push(id);
const supply8 = anchors.filter((a) => a.word.length === 8 && a.candidates.length >= 9).length;
const supply7 = anchors.filter((a) => a.word.length === 7 && a.candidates.length >= 9).length;
const need7 = Math.max(0, nonRestIds.length - Math.floor(supply8 * 0.85));
const sevenIds = new Set<number>();
for (const id of nonRestIds) {
  if (sevenIds.size >= need7) break;
  if (id % 2 === 1) sevenIds.add(id);
}
for (const id of nonRestIds) {
  if (sevenIds.size >= need7) break;
  sevenIds.add(id);
}

console.log(
  `İyi kelime: ${GOOD_WORDS.length} | Çapa (benzersiz havuz): ${anchors.length} | 8 harfli zengin: ${supply8} | 7 harfli zengin: ${supply7} | 7 harf planlanan bölüm: ${sevenIds.size}`
);

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260301);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Devam ettirilebilir durum
let stateLevels: LevelDefinition[] = [];
if (fs.existsSync(STATE_PATH)) {
  stateLevels = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')).levels as LevelDefinition[];
  const before = stateLevels.length;
  stateLevels = stateLevels.filter(
    (l) =>
      !l.words.some((w) => {
        const lw = toLower(w.word);
        return BLOCKED.has(lw) || FUNCTION_WORDS.has(lw) || NAMES.has(lw);
      })
  );
  if (before !== stateLevels.length) {
    console.log(`Engellenen kelime içeren ${before - stateLevels.length} bölüm yeniden üretilecek.`);
  }
}
const done = new Set(stateLevels.map((l) => l.id));
const usedPools = new Set(stateLevels.map((l) => poolKeyOf(l.letters)));

function saveState(): void {
  fs.writeFileSync(STATE_PATH, JSON.stringify({ levels: stateLevels }));
}

function tryBuild(id: number, anchor: Anchor, count: number): LevelDefinition | null {
  const pool = anchor.candidates;
  const rankOf = new Map(pool.map((w, i) => [w, i]));
  const longFirst = [...pool].sort(
    (a, b) => b.length - a.length || (rankOf.get(a) ?? 0) - (rankOf.get(b) ?? 0)
  );
  const long4 = pool.filter((w) => w.length >= 4);
  const short3 = pool.filter((w) => w.length < 4);
  const orders: string[][] = [
    longFirst,
    [...long4, ...short3],
    [...shuffle(long4), ...shuffle(short3)],
  ];

  const seen = new Set<string>();
  for (const order of orders) {
    const selected = [anchor.word, ...order.slice(0, count - 1)];
    if (selected.length < count) continue;
    const key = [...selected].sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);

    const placed = generateCompactCrosswordLayout(selected, {
      maxBranching: 6,
      maxNodes: 7000,
      mrv: true,
      scoreCandidates: true,
    });
    if (!placed) continue;
    const { grid } = compileGrid(placed);
    if (grid.rows > 10 || grid.cols > 10) continue;

    const level: LevelDefinition = {
      id,
      theme: themeFor(id),
      letters: sortLetters(anchor.letters),
      words: placed,
      rewardCoins: rewardFor(id),
      ...(REST.has(id) ? { isRestLevel: true } : {}),
    };
    if (!validateLevel(level).valid) continue;
    return level;
  }
  return null;
}

function attempt(
  id: number,
  list: Anchor[],
  counts: number[],
  deadline: number
): { level: LevelDefinition; anchor: Anchor } | null {
  for (const anchor of list) {
    if (Date.now() > deadline) return null;
    for (const count of counts) {
      if (count - 1 > anchor.candidates.length) continue;
      const level = tryBuild(id, anchor, count);
      if (level) return { level, anchor };
    }
  }
  return null;
}

let interrupted = false;
let failedIds: number[] = [];

// En yüksek numaradan başla: en zengin havuzlar en zor bölümlere gider
for (let id = LAST_ID; id >= FIRST_ID; id--) {
  if (done.has(id)) continue;
  if (Date.now() - runStart > RUN_BUDGET_MS) {
    interrupted = true;
    break;
  }
  const t0 = Date.now();
  const isRest = REST.has(id);
  const desired = desiredFor(id);
  const wantLen = isRest || sevenIds.has(id) ? 7 : 8;
  const otherLen = wantLen === 8 ? 7 : 8;
  const minCands = isRest ? desired - 1 : desired;

  const available = anchors.filter((a) => !usedPools.has(a.poolKey));
  const pick = (len: number): Anchor[] => {
    const list = available.filter((a) => a.word.length === len && a.candidates.length >= minCands);
    if (isRest) {
      list.sort(
        (a, b) =>
          Number(a.isVerb) - Number(b.isVerb) ||
          a.candidates.length - b.candidates.length ||
          a.rank - b.rank
      );
    } else {
      list.sort((a, b) => b.richness - a.richness || a.rank - b.rank);
    }
    return list;
  };

  const mainCounts = isRest
    ? [...new Set([desired, Math.max(5, desired - 1)])]
    : [desired, desired - 1];

  let result = attempt(id, pick(wantLen).slice(0, 10), mainCounts, t0 + 25000);
  if (!result) {
    result = attempt(id, pick(otherLen).slice(0, 8), mainCounts, t0 + 40000);
  }
  if (!result) {
    const anyList = available
      .filter((a) => a.candidates.length >= 6)
      .sort((a, b) => b.richness - a.richness)
      .slice(0, 15);
    const lowCounts = [...new Set([desired - 2, 7, 6, 5].filter((v) => v >= 5 && v <= desired))];
    result = attempt(id, anyList, lowCounts, t0 + 60000);
  }

  if (!result) {
    failedIds.push(id);
    console.error(`❌ ${id} üretilemedi`);
    continue;
  }

  usedPools.add(result.anchor.poolKey);
  stateLevels.push(result.level);
  done.add(id);
  saveState();

  const { grid } = compileGrid(result.level.words);
  console.log(
    `✅ ${id} [${result.level.theme}] ${result.level.letters.join('')} (${result.level.letters.length}) → ${result.level.words.length} kelime ${grid.rows}x${grid.cols} (${Date.now() - t0}ms) | ${result.level.words.map((w) => w.word).join(', ')}`
  );
}

stateLevels.sort((a, b) => a.id - b.id);
saveState();
console.log(`\nTamamlanan: ${stateLevels.length} / ${TOTAL}${interrupted ? ' (süre doldu, yeniden çalıştırın)' : ''}`);
if (failedIds.length > 0) console.log('Üretilemeyen:', failedIds.join(','));

if (stateLevels.length === TOTAL) {
  fs.writeFileSync(OUT_PATH, JSON.stringify(stateLevels, null, 2));
  const distinct = new Set(stateLevels.flatMap((l) => l.words.map((w) => w.word)));
  const stats = (from: number, to: number): string => {
    const arr = stateLevels.filter((l) => l.id >= from && l.id <= to && !l.isRestLevel);
    const avg = (f: (l: LevelDefinition) => number): string =>
      (arr.reduce((s, l) => s + f(l), 0) / Math.max(1, arr.length)).toFixed(2);
    return `${from}-${to}: harf ort ${avg((l) => l.letters.length)}, kelime ort ${avg((l) => l.words.length)}, en uzun kelime ort ${avg((l) => Math.max(...l.words.map((w) => w.word.length)))}`;
  };
  console.log(stats(201, 250));
  console.log(stats(251, 300));
  console.log(stats(301, 350));
  console.log('Farklı hedef kelime:', distinct.size);
  console.log('KELIMELER:', [...distinct].sort((a, b) => a.localeCompare(b, 'tr-TR')).join(' '));
  console.log('JSON yazıldı:', OUT_PATH);
} else {
  process.exitCode = interrupted ? 3 : 1;
}
