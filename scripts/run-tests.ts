import assert from 'node:assert/strict';
import { RAW_LEVELS, LEVELS } from '../src/data/levels';
import { validateLevel, validateAllLevels, compileGrid } from '../src/engine/validator';
import {
  evaluateSubmittedWord,
  pickHintCellKey,
  detectAutoCompletedWords,
  getWordCellKeys,
  getVisibleCellKeys,
  isLevelComplete,
} from '../src/engine/wordChecker';
import {
  toTurkishUpper,
  toTurkishLower,
  canBuildWordFromLetters,
} from '../src/utils/turkish';
import { LevelDefinition } from '../src/engine/types';
import { getThemeForLevel, THEME_ORDER } from '../src/data/themes';
import { THIRD_JOURNEY_NAMES } from '../src/data/thirdJourneyNames';
import { VERIFIED_TURKISH_DICTIONARY } from '../src/data/turkishDictionary';
import { loadSaveState } from '../src/utils/storage';
import { THIRD_EXCLUSIONS, THIRD_REVIEW_WORDS } from './third-journey-exclusions';

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`✅ ${name}`);
}

// 1. Türkçe büyük/küçük harf dönüşüm testleri
test('Türkçe I/İ ve özel karakter (Ç, Ğ, İ, Ö, Ş, Ü) dönüşümleri doğru', () => {
  assert.equal(toTurkishUpper('i'), 'İ');
  assert.equal(toTurkishUpper('ı'), 'I');
  assert.equal(toTurkishLower('İ'), 'i');
  assert.equal(toTurkishLower('I'), 'ı');
  assert.equal(toTurkishUpper('deniz'), 'DENİZ');
  assert.equal(toTurkishUpper('sarı'), 'SARI');
  assert.equal(toTurkishUpper('şeker'), 'ŞEKER');
  assert.equal(toTurkishUpper('çardak'), 'ÇARDAK');
  assert.equal(toTurkishUpper('sağlam'), 'SAĞLAM');
  assert.equal(toTurkishUpper('görkem'), 'GÖRKEM');
  assert.equal(toTurkishUpper('kürek'), 'KÜREK');
  assert.equal(toTurkishLower('MİNARE'), 'minare');
  assert.equal(toTurkishLower('TASARIM'), 'tasarım');
});

// 2. Harf frekans kontrolü (aynı taş birden fazla kullanılamaz)
test('Harf havuzu frekans kontrolü aynı taşın tekrar kullanımını engeller', () => {
  assert.equal(canBuildWordFromLetters('KARA', ['K', 'A', 'R', 'A']), true);
  assert.equal(canBuildWordFromLetters('KARA', ['K', 'A', 'R', 'T']), false);
  assert.equal(canBuildWordFromLetters('ŞEKER', ['Ş', 'E', 'K', 'E', 'R']), true);
  assert.equal(canBuildWordFromLetters('ŞEKER', ['Ş', 'E', 'K', 'R']), false);
  // I ile İ karışmamalı!
  assert.equal(canBuildWordFromLetters('SARI', ['S', 'A', 'R', 'İ']), false);
  assert.equal(canBuildWordFromLetters('SARI', ['S', 'A', 'R', 'I']), true);
});

// 3. 350 bölümün tamamı doğrulanmış ve çözülebilir
test('3000 farklı bölümün tamamı otomatik doğrulamadan geçer', () => {
  assert.equal(RAW_LEVELS.length, 3000, `3000 bölüm olmalı (mevcut: ${RAW_LEVELS.length})`);
  assert.equal(LEVELS.length, RAW_LEVELS.length);
  const report = validateAllLevels(RAW_LEVELS);
  assert.equal(
    report.invalidResults.length,
    0,
    `Hatalı bölümler: ${JSON.stringify(report.invalidResults)}`
  );
  assert.equal(report.validLevels.length, RAW_LEVELS.length);

  // Bölüm ID benzersizliği ve tema dağılımı (her 10 bölümde 1 tema)
  const ids = new Set(RAW_LEVELS.map((l) => l.id));
  assert.equal(ids.size, RAW_LEVELS.length);
  for (const lvl of RAW_LEVELS) {
    assert.equal(lvl.theme, THEME_ORDER[Math.floor((lvl.id - 1) / 10) % THEME_ORDER.length]);
  }

  // Tüm 6 Türkçe özel harf + I oyun boyunca kullanılmış mı?
  const allLettersUsed = new Set(RAW_LEVELS.flatMap((l) => l.letters));
  for (const special of ['Ç', 'Ğ', 'İ', 'Ö', 'Ş', 'Ü', 'I']) {
    assert.ok(allLettersUsed.has(special), `Özel harf eksik: ${special}`);
  }
});

// 4. Negatif doğrulayıcı testleri (hatalı bölüm verisinin yakalandığını kanıtla)
test('Doğrulayıcı 5 ten az hedef kelimeyi yakalar', () => {
  const broken: LevelDefinition = {
    ...RAW_LEVELS[0],
    words: RAW_LEVELS[0].words.slice(0, 4),
  };
  const res = validateLevel(broken);
  assert.equal(res.valid, false);
});

test('Tekrarlanan bölüm numaralarının hiçbiri oyuncuya açılmaz', () => {
  const duplicate = { ...RAW_LEVELS[0], words: [...RAW_LEVELS[0].words] };
  const report = validateAllLevels([RAW_LEVELS[0], duplicate]);
  assert.equal(report.invalidResults.length, 2);
  assert.equal(report.validLevels.length, 0);
});

test('Doğrulayıcı harf frekansını aşan kelimeyi yakalar', () => {
  const broken: LevelDefinition = {
    ...RAW_LEVELS[4], // ŞEKER -> iki E gerektirir
    letters: ['Ş', 'E', 'K', 'R'], // tek E bırak
  };
  const res = validateLevel(broken);
  assert.equal(res.valid, false);
});

test('Doğrulayıcı kesişim uyuşmazlığını yakalar', () => {
  const broken: LevelDefinition = {
    id: 999,
    theme: 'valley',
    letters: ['S', 'A', 'R', 'I'],
    rewardCoins: 30,
    words: [
      { word: 'SARI', row: 0, col: 0, dir: 'across' },
      { word: 'SIRA', row: 0, col: 1, dir: 'down' }, // (0,1) A vs S çakışması!
      { word: 'ASIR', row: 2, col: 0, dir: 'across' },
      { word: 'ARI', row: 0, col: 3, dir: 'down' },
      { word: 'SIR', row: 2, col: 2, dir: 'down' },
    ],
  };
  const res = validateLevel(broken);
  assert.equal(res.valid, false);
});

test('Doğrulayıcı kopuk (bağlantısız) bulmacayı yakalar', () => {
  const broken: LevelDefinition = {
    ...RAW_LEVELS[0],
    words: RAW_LEVELS[0].words.map((w, idx) =>
      idx === 4 ? { ...w, row: 10, col: 10 } : w
    ),
  };
  const res = validateLevel(broken);
  assert.equal(res.valid, false);
});

test('Doğrulayıcı istemsiz yan yana komşuluğu yakalar', () => {
  const broken: LevelDefinition = {
    id: 998,
    theme: 'valley',
    letters: ['S', 'A', 'R', 'I'],
    rewardCoins: 30,
    words: [
      { word: 'SARI', row: 0, col: 0, dir: 'across' },
      { word: 'SIRA', row: 1, col: 0, dir: 'across' }, // hemen altına bitişik!
      { word: 'ASIR', row: 0, col: 1, dir: 'down' },
      { word: 'ARI', row: 0, col: 3, dir: 'down' },
      { word: 'SIR', row: 2, col: 2, dir: 'down' },
    ],
  };
  const res = validateLevel(broken);
  assert.equal(res.valid, false);
});

// 5. Kelime kontrolü ve bonus sistemi testleri
test('Kelime kontrolü: hedef, tekrar hedef, doğrulanmış bonus, tekrar bonus, geçersiz dizi', () => {
  const level1 = RAW_LEVELS[0]; // S, A, R, I -> targets: SARI, SIRA, ASIR, ARI, SIR

  // Hedef kelime
  const r1 = evaluateSubmittedWord('sarı', level1, [], []);
  assert.equal(r1.status, 'target-found');

  // Zaten bulunmuş hedef kelime
  const r2 = evaluateSubmittedWord('SARI', level1, ['SARI'], []);
  assert.equal(r2.status, 'already-found-target');

  // Doğrulanmış bonus kelime (ASI)
  const r3 = evaluateSubmittedWord('ASI', level1, ['SARI'], []);
  assert.equal(r3.status, 'bonus-found');

  // Aynı bonus kelime ikinci kez ödül vermez
  const r4 = evaluateSubmittedWord('ASI', level1, ['SARI'], ['ASI']);
  assert.equal(r4.status, 'already-found-bonus');

  // Rastgele anlamsız harf dizisi bonus sayılmaz!
  const r5 = evaluateSubmittedWord('RSIA', level1, [], []);
  assert.equal(r5.status, 'invalid');

  // Kısa kelime (2 harf)
  const r6 = evaluateSubmittedWord('AR', level1, [], []);
  assert.equal(r6.status, 'too-short');
});

// 6. İpucu ve ortak kesişim hücresi + otomatik kelime tamamlama testi
test('Ortak kutudaki ipucu harfi her iki kesişen kelimede görünür ve son harf kelimeyi tamamlar', () => {
  const level1 = RAW_LEVELS[0];
  const { grid } = compileGrid(level1.words);

  // Kesişim hücresi bul
  const intersectionCell = Array.from(grid.cells.values()).find(
    (c) => c.wordIndices.length > 1
  );
  assert.ok(intersectionCell, 'Bölüm 1 en az bir kesişim kutusu içermeli');

  const key = `${intersectionCell.row},${intersectionCell.col}`;
  const visible = getVisibleCellKeys(level1, [], [key]);
  assert.equal(visible.has(key), true);

  // Kesişen iki kelimenin de bu hücreyi içerdiğini doğrula
  const wA = level1.words[intersectionCell.wordIndices[0]];
  const wB = level1.words[intersectionCell.wordIndices[1]];
  assert.ok(getWordCellKeys(wA).includes(key));
  assert.ok(getWordCellKeys(wB).includes(key));

  // Bir kelimenin tüm kutuları ipucu ile açıldığında kelime otomatik tamamlanır
  const targetWord = level1.words[0];
  const allKeys = getWordCellKeys(targetWord);
  const autoCompleted = detectAutoCompletedWords(level1, [], allKeys);
  assert.ok(autoCompleted.includes(targetWord.word));

  // Tüm kelimeler bulununca ipucu null döner
  const allWords = level1.words.map((w) => w.word);
  assert.equal(pickHintCellKey(level1, allWords, []), null);
});


test('Bölüm kimlikleri 1–3000 arası kesintisiz', () => {
  assert.equal(LEVELS.length, 3000);
  assert.deepEqual(LEVELS.map((l) => l.id), Array.from({ length: 3000 }, (_, i) => i + 1));
});

test('Her 10 bölümde tema değişir ve 300 doğa manzarası sırayla gelir', () => {
  assert.equal(THEME_ORDER.length, 300);
  assert.equal(new Set(THEME_ORDER).size, 300);
  for (const lvl of LEVELS) {
    const chapter = Math.floor((lvl.id - 1) / 10);
    assert.equal(lvl.theme, THEME_ORDER[chapter % THEME_ORDER.length], `Bölüm ${lvl.id} tema hatası`);
    assert.equal(getThemeForLevel(lvl.id).id, THEME_ORDER[chapter % THEME_ORDER.length]);
  }
  for (const id of THEME_ORDER) {
    assert.equal(LEVELS.filter((l) => l.theme === id).length, 10, `${id} manzarasının bölüm sayısı`);
  }
  assert.equal(getThemeForLevel(10).id, 'emerald');
  assert.equal(getThemeForLevel(350).id, 'rainbow');
  assert.equal(getThemeForLevel(351).id, 'ruby_cliffs');
  assert.equal(getThemeForLevel(700).id, 'dream_archipelago');
  assert.equal(getThemeForLevel(701).id, 'sapphire_falls');
  assert.equal(getThemeForLevel(1000).id, 'endless_horizon_isle');
  assert.equal(getThemeForLevel(1001).id, 'lilac_hills');
  assert.equal(getThemeForLevel(1500).id, 'star_reflection_lake');
  assert.equal(getThemeForLevel(1501).name, 'Akşam Güneşi Vadisi');
  assert.equal(getThemeForLevel(2990).name, 'Mavi Uçurum Gölü');
  assert.equal(getThemeForLevel(3000).name, 'Mavi Uçurum Gölü: Derinlikler');
});

test('Genişletilmiş sözlük en az 2.500 doğrulanmış kelime içerir ve tüm hedefler kapsanır', () => {
  assert.ok(
    VERIFIED_TURKISH_DICTIONARY.size >= 2500,
    `Sözlük boyutu yetersiz: ${VERIFIED_TURKISH_DICTIONARY.size}`
  );
  for (const lvl of LEVELS) {
    for (const placed of lvl.words) {
      assert.ok(
        VERIFIED_TURKISH_DICTIONARY.has(toTurkishUpper(placed.word)),
        `Hedef kelime sözlükte yok: ${placed.word}`
      );
    }
  }
});

test('Her bölümde en az bir doğrulanmış bonus kelime bulunabilir', () => {
  for (const lvl of LEVELS) {
    const targets = new Set(lvl.words.map((w) => toTurkishUpper(w.word)));
    let found = 0;
    for (const w of VERIFIED_TURKISH_DICTIONARY) {
      if (targets.has(w)) continue;
      if (canBuildWordFromLetters(w, lvl.letters)) {
        found++;
        break;
      }
    }
    assert.ok(found > 0, `Bölüm ${lvl.id} için bonus kelime yok`);
  }
});

test('Yeni 100 bölümde (101–200) hedef kelime sayısı 5–10, harf çemberi 5–8 arasında', () => {
  const extra = LEVELS.filter((l) => l.id >= 101 && l.id <= 200);
  assert.equal(extra.length, 100);
  for (const lvl of extra) {
    assert.ok(lvl.words.length >= 5 && lvl.words.length <= 10, `Bölüm ${lvl.id} kelime sayısı`);
    assert.ok(lvl.letters.length >= 5 && lvl.letters.length <= 8, `Bölüm ${lvl.id} harf sayısı`);
  }
});

test('İlerleyen bölümlerde daha fazla harf ve daha uzun kelimeler kullanılır', () => {
  const late = LEVELS.filter((l) => l.id >= 161);
  const early = LEVELS.filter((l) => l.id <= 30);
  const avgLetters = (arr: typeof LEVELS) => arr.reduce((s, l) => s + l.letters.length, 0) / arr.length;
  const avgMaxWord = (arr: typeof LEVELS) => arr.reduce((s, l) => s + Math.max(...l.words.map((w) => [...w.word].length)), 0) / arr.length;
  assert.ok(avgLetters(late) > avgLetters(early), 'Geç bölümlerde harf sayısı artmalı');
  assert.ok(avgMaxWord(late) > avgMaxWord(early), 'Geç bölümlerde kelime uzunluğu artmalı');
  assert.ok(late.every((l) => l.letters.length >= 7), '161+ bölümlerde en az 7 harf');
});

test('201–350 bölümlerinde 8 harfli çember, 9–10 hedef kelime ve benzersiz harf havuzları var', () => {
  const extra = LEVELS.filter((l) => l.id >= 201 && l.id <= 350);
  assert.equal(extra.length, 150);
  const poolKey = (letters: readonly string[]) => [...letters].sort().join('');
  const earlierPools = new Set(LEVELS.filter((l) => l.id <= 200).map((l) => poolKey(l.letters)));
  const pools = new Set<string>();
  for (const lvl of extra) {
    assert.ok(lvl.words.length >= 5 && lvl.words.length <= 10, `Bölüm ${lvl.id} kelime sayısı`);
    assert.ok(lvl.letters.length >= 7 && lvl.letters.length <= 8, `Bölüm ${lvl.id} harf sayısı`);
    const key = poolKey(lvl.letters);
    assert.ok(!pools.has(key), `Bölüm ${lvl.id} harf havuzu tekrar ediyor`);
    assert.ok(!earlierPools.has(key), `Bölüm ${lvl.id} harf havuzu önceki bölümlerde kullanılmış`);
    pools.add(key);
  }
  const regular = extra.filter((l) => !l.isRestLevel);
  assert.ok(regular.every((l) => l.letters.length === 8), 'Normal bölümler 8 harfli olmalı');
  assert.ok(regular.every((l) => l.words.length >= 9), 'Normal bölümler en az 9 hedef kelime içermeli');
  // Her manzarada tam bir dinlenme bölümü bulunur
  for (let chapter = 20; chapter < 35; chapter++) {
    const rest = extra.filter((l) => Math.floor((l.id - 1) / 10) === chapter && l.isRestLevel);
    assert.equal(rest.length, 1, `Manzara ${chapter + 1} dinlenme bölümü`);
  }
});

test('Yeni 350 bölümde (351–700) 35 yeni manzara, benzersiz harf havuzları ve doğrulanmış hedefler var', () => {
  const extra = LEVELS.filter((l) => l.id >= 351 && l.id <= 700);
  assert.equal(extra.length, 350);
  const poolKey = (letters: readonly string[]) => [...letters].sort().join('');
  const earlierPools = new Set(LEVELS.filter((l) => l.id <= 350).map((l) => poolKey(l.letters)));
  const pools = new Set<string>();
  for (const lvl of extra) {
    assert.ok(lvl.words.length >= 5 && lvl.words.length <= 10, `Bölüm ${lvl.id} kelime sayısı`);
    assert.ok(lvl.letters.length >= 7 && lvl.letters.length <= 8, `Bölüm ${lvl.id} harf sayısı`);
    const key = poolKey(lvl.letters);
    assert.ok(!pools.has(key), `Bölüm ${lvl.id} harf havuzu tekrar ediyor`);
    assert.ok(!earlierPools.has(key), `Bölüm ${lvl.id} harf havuzu önceki bölümlerde kullanılmış`);
    pools.add(key);
  }
  // Her 10 bölümde 1 dinlenme bölümü
  for (let chapter = 35; chapter < 70; chapter++) {
    const rest = extra.filter((l) => Math.floor((l.id - 1) / 10) === chapter && l.isRestLevel);
    assert.equal(rest.length, 1, `Manzara ${chapter + 1} dinlenme bölümü`);
  }
});

test('Yeni 300 bölümde (701–1000) 30 yeni manzara, 9 harfli çember ve benzersiz harf havuzları var', () => {
  const extra = LEVELS.filter((l) => l.id >= 701 && l.id <= 1000);
  assert.equal(extra.length, 300);
  const poolKey = (letters: readonly string[]) => [...letters].sort().join('');
  const earlierPools = new Set(LEVELS.filter((l) => l.id <= 700).map((l) => poolKey(l.letters)));
  const pools = new Set<string>();
  for (const lvl of extra) {
    const key = poolKey(lvl.letters);
    assert.ok(!pools.has(key), `Bölüm ${lvl.id} harf havuzu tekrar ediyor`);
    assert.ok(!earlierPools.has(key), `Bölüm ${lvl.id} harf havuzu önceki bölümlerde kullanılmış`);
    pools.add(key);
    if (lvl.isRestLevel) {
      assert.equal(lvl.letters.length, 8, `Dinlenme bölümü ${lvl.id} 8 harfli olmalı`);
      assert.equal(lvl.words.length, 5, `Dinlenme bölümü ${lvl.id} 5 kelimeli olmalı`);
    } else {
      assert.equal(lvl.letters.length, 9, `Bölüm ${lvl.id} 9 harfli olmalı`);
      assert.ok(lvl.words.length >= 9 && lvl.words.length <= 10, `Bölüm ${lvl.id} kelime sayısı`);
      assert.ok(lvl.words.some((w) => [...w.word].length === 9), `Bölüm ${lvl.id} 9 harfli kelime içermeli`);
    }
    const { grid } = compileGrid(lvl.words);
    assert.ok(grid.rows <= 10 && grid.cols <= 11, `Bölüm ${lvl.id} ızgarası çok büyük: ${grid.rows}x${grid.cols}`);
  }
  // Her manzarada tam bir dinlenme bölümü
  for (let chapter = 70; chapter < 100; chapter++) {
    const rest = extra.filter((l) => Math.floor((l.id - 1) / 10) === chapter && l.isRestLevel);
    assert.equal(rest.length, 1, `Manzara ${chapter + 1} dinlenme bölümü`);
  }
  // Manzara adları verilen sırayla
  const names = [
    'Safir Şelalesi', 'Ardıç Yaylası', 'Pembe Tuz Gölü', 'Çiğdem Çayırı', 'Kartal Kayalıkları',
    'Ihlamur Korusu', 'Ayışığı Lagünü', 'Kızıl Kum Denizi', 'Mavi Buz Mağarası', 'Nergis Vadisi',
    'Rüzgâr Değirmeni Tepesi', 'Yaban Mersini Ormanı', 'Serap Vahası', 'Beyaz Falezler', 'Lotus Göleti',
    'Sabah Sisi Ovası', 'Ateşböceği Deresi', 'Deniz Kemerleri', 'Mor Salkım Bahçesi', 'Saklı Krater Gölü',
    'Altın Başak Tarlası', 'Yağmur Sonrası Tepeler', 'Kutup Gecesi Körfezi', 'Çınarlı Nehir Yolu', 'Turuncu Çöl Kanyonu',
    'Yıldız Tozu Sahili', 'Bambu Vadisi', 'Çiçekli Dağ Geçidi', 'Gümüş Sis Ormanı', 'Sonsuz Ufuk Adası',
  ];
  assert.equal(names.length, 30);
  names.forEach((name, i) => {
    assert.equal(getThemeForLevel(701 + i * 10).name, name);
    assert.equal(getThemeForLevel(710 + i * 10).name, name);
  });
});

test('Hiçbir bölümde cinsellik, şiddet, alkol/madde, hakaret veya hassas içerik taşıyan kelime yok', () => {
  const blocked = new Set([
    'ORGAZM', 'CİNSELLİK', 'ÇIPLAKLIK', 'FAHİŞELİK', 'KAHROLSUN', 'KAHROLASI', 'BIÇAKLAMA', 'KUDUZ', 'MARİHUANA', 'TEKİLA',
    'STRİPTİZ', 'SUİKAST', 'SUİKASTÇI', 'TIMARHANE', 'ZALİM', 'TUTUKLAMA', 'KORKAK', 'KÜSTAH', 'KÜSTAHLIK', 'AMİGO', 'AMAZON',
    'PATLAYICI', 'MAYIN', 'FİŞEK', 'FİDYE', 'SALDIRGAN', 'SALDIRMAK', 'CENNET', 'SOSYALİST', 'PEDER', 'HAMİLELİK', 'MORUK',
    'BİSEKSÜEL', 'ŞİZOFRENİ', 'SUİSTİMAL', 'FECİ', 'HACI', 'GAZA', 'BENCİL', 'BENCİLLİK', 'İHANET', 'SİLAHLI', 'KİMYASAL',
    'SALAK', 'MANYAK', 'SAPIK', 'SEKS', 'SEKSİ', 'ALKOL', 'KANKA', 'DAYAK', 'KANAMA', 'KATİL', 'CİNAYET', 'İNTİHAR', 'ŞEYTAN',
    'İBLİS', 'BİRA', 'RAKI', 'ŞARAP', 'VİSKİ', 'SİGARA', 'AHMAK', 'APTAL',
  ]);
  for (const lvl of LEVELS) {
    for (const w of lvl.words) assert.ok(!blocked.has(w.word), `Bölüm ${lvl.id}: ${w.word}`);
  }
  for (const w of blocked) {
    assert.ok(!VERIFIED_TURKISH_DICTIONARY.has(w) || LEVELS.some((l) => l.words.some((x) => x.word === w)), `Bonus sözlüğünde hassas kelime: ${w}`);
  }
});

test('1001–1500 arası bölümler ve verilen 50 manzara sırayla açılır', () => {
  const names = [
    'Leylak Tepeleri', 'Çam Kozalağı Vadisi', 'Al Mercan Resifi', 'Gün Doğumu Platosu', 'Fındık Korusu',
    'Mavi Çan Çayırı', 'Kırlangıç Koyu', 'Bakır Dağlar', 'Çiy Taneleri Bahçesi', 'Karanfil Yamacı',
    'Sığla Ormanı', 'Zambak Göleti', 'Kızıl Akçaağaç Vadisi', 'Aytaşı Kumsalı', 'Kumul Çiçekleri Ovası',
    'Dalgakıran Kayalıkları', 'Ilgın Sahili', 'Doruklar Denizi', 'Fıstık Çamı Korusu', 'Sırlı Mağara',
    'Kekik Yaylası', 'Pelikan Lagünü', 'Yakut Gün Batımı', 'Salkım Söğüt Kıyısı', 'Yaban Gülü Vadisi',
    'Buzul Şelalesi', 'Çöl Gecesi Vahası', 'Uğultulu Uçurum', 'Orkide Ormanı', 'Gümüş Kum Adası',
    'Kır Çiçekleri Platosu', 'Zeytin Çiçeği Bahçesi', 'Sisler İçindeki Fiyort', 'Sedir Dağları', 'Deniz Köpüğü Koyu',
    'Gökkuşağı Kayalıkları', 'Yaban Elması Korusu', 'Alaca Göl', 'Eğrelti Mağarası', 'Serin Pınar Vadisi',
    'Leylekler Ovası', 'Mor Süsen Bataklığı', 'Rüzgârın Oyduğu Kayalar', 'Kızıl Toprak Tepeleri', 'Çiçekli Kiraz Yolu',
    'Kum Zambağı Sahili', 'Şimşekli Ufuk', 'Saklı Buzul Geçidi', 'Amber Işıklı Körfez', 'Yıldız Yansımalı Göl',
  ];
  names.forEach((name, index) => {
    const start = 1001 + index * 10;
    assert.equal(getThemeForLevel(start).name, name);
    assert.equal(getThemeForLevel(start + 9).name, name);
  });

  const levels = LEVELS.filter((level) => level.id >= 1001 && level.id <= 1500);
  assert.equal(levels.length, 500);
  const poolKey = (letters: readonly string[]) => [...letters].sort().join('');
  const earlierPools = new Set(LEVELS.filter((level) => level.id <= 1000).map((level) => poolKey(level.letters)));
  const newPools = new Set<string>();
  for (const level of levels) {
    const key = poolKey(level.letters);
    assert.ok(!earlierPools.has(key) && !newPools.has(key), `Harf havuzu tekrarı: ${level.id}`);
    newPools.add(key);
    assert.equal(level.letters.length, level.isRestLevel ? 8 : 9);
    assert.ok(level.words.length >= 5 && level.words.length <= 10);
    const { grid } = compileGrid(level.words);
    assert.ok(grid.rows <= 10 && grid.cols <= 11, `Ekrana sığmayan bulmaca: ${level.id}`);

    // Every tile is useful in at least one target, including duplicate letters.
    for (const letter of new Set(level.letters)) {
      const available = level.letters.filter((tile) => tile === letter).length;
      assert.ok(level.words.some((placed) => [...placed.word].filter((ch) => ch === letter).length >= available));
    }

    const found: string[] = [];
    for (const placed of level.words) {
      assert.equal(evaluateSubmittedWord(placed.word, level, found, []).status, 'target-found');
      found.push(placed.word);
    }
    assert.ok(isLevelComplete(level, found), `Bölüm tamamlanmadı: ${level.id}`);
    assert.ok(!isLevelComplete(level, [...found.slice(0, -1), found[0]]), `Eksik hedefle tamamlandı: ${level.id}`);
  }
  for (let index = 0; index < 50; index++) {
    assert.equal(levels.filter((level) => Math.floor((level.id - 1001) / 10) === index && level.isRestLevel).length, 1);
  }
});

test('1000. bölüm kaydı 1001. bölümü açar ve mevcut verileri korur', () => {
  const storage = new Map<string, string>();
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    } },
  });
  try {
    const save = {
      version: 1, unlockedLevel: 1000, currentLevel: 1000, coins: 375,
      completedLevels: [1000], totalBonusFound: 2,
      progressByLevel: { 999: { foundWords: ['ÖRNEK'], revealedCells: ['0,0'], bonusWords: ['DENEME'] } },
      settings: { soundEnabled: false },
    };
    storage.set('kelime_yolculugu_save_v1', JSON.stringify(save));
    const migrated = loadSaveState(1500);
    assert.equal(migrated.unlockedLevel, 1001);
    assert.equal(migrated.currentLevel, 1001);
    assert.equal(migrated.coins, 375);
    assert.deepEqual(migrated.progressByLevel[999], save.progressByLevel[999]);
    assert.equal(migrated.settings.soundEnabled, false);

    storage.set('kelime_yolculugu_save_v1', JSON.stringify({ ...save, currentLevel: 50 }));
    assert.equal(loadSaveState(1500).currentLevel, 50);
    storage.set('kelime_yolculugu_save_v1', JSON.stringify({ ...save, completedLevels: [] }));
    assert.equal(loadSaveState(1500).unlockedLevel, 1000);
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});

test('1501–3000 bölümleri ve 150 yeni manzara kurallara uygundur', () => {
  const levels = LEVELS.filter((level) => level.id >= 1501);
  assert.equal(levels.length, 1500);
  assert.equal(THIRD_JOURNEY_NAMES.length, 150);
  assert.equal(THIRD_JOURNEY_NAMES[0], 'Akşam Güneşi Vadisi');
  assert.equal(THIRD_JOURNEY_NAMES[148], 'Mavi Uçurum Gölü');
  assert.equal(THIRD_JOURNEY_NAMES[149], 'Mavi Uçurum Gölü: Derinlikler');
  THIRD_JOURNEY_NAMES.forEach((name, index) => {
    const start = 1501 + index * 10;
    assert.equal(getThemeForLevel(start).name, name);
    assert.equal(getThemeForLevel(start + 9).name, name);
  });

  const poolKey = (letters: readonly string[]) => [...letters].sort().join('');
  const earlierPools = new Set(LEVELS.filter((level) => level.id <= 1500).map((level) => poolKey(level.letters)));
  const earlierTargets = new Set(LEVELS.filter((level) => level.id <= 1500).map((level) => level.words.map((w) => w.word).sort().join('|')));
  const pools = new Set<string>();
  const targetSets = new Set<string>();
  for (const level of levels) {
    const key = poolKey(level.letters);
    const targetSet = level.words.map((w) => w.word).sort().join('|');
    assert.ok(!earlierPools.has(key) && !pools.has(key), `Harf havuzu tekrarı: ${level.id}`);
    assert.ok(!earlierTargets.has(targetSet) && !targetSets.has(targetSet), `Hedef kümesi tekrarı: ${level.id}`);
    pools.add(key);
    targetSets.add(targetSet);
    assert.equal(level.letters.length, level.isRestLevel ? 8 : 9);
    assert.ok(level.isRestLevel ? level.words.length === 5 : level.words.length >= 9 && level.words.length <= 10);
    const { grid } = compileGrid(level.words);
    assert.ok(grid.rows <= 10 && grid.cols <= 11, `Izgara çok büyük: ${level.id}`);

    for (const letter of new Set(level.letters)) {
      const count = level.letters.filter((tile) => tile === letter).length;
      assert.ok(level.words.some((placed) => [...placed.word].filter((ch) => ch === letter).length >= count));
    }

    const found: string[] = [];
    for (const placed of level.words) {
      assert.ok(!THIRD_EXCLUSIONS.has(toTurkishLower(placed.word)), `Dışlanan kelime: ${placed.word}`);
      assert.ok(!THIRD_REVIEW_WORDS.has(placed.word), `Gözden çıkarılan kelime: ${placed.word}`);
      assert.equal(evaluateSubmittedWord(placed.word, level, found, []).status, 'target-found');
      found.push(placed.word);
    }
    assert.ok(isLevelComplete(level, found), `Bölüm tamamlanmadı: ${level.id}`);
    assert.ok(!isLevelComplete(level, [...found.slice(0, -1), found[0]]), `Eksik hedefle tamamlandı: ${level.id}`);
  }
  for (let index = 0; index < 150; index++) {
    assert.equal(levels.filter((level) => Math.floor((level.id - 1501) / 10) === index && level.isRestLevel).length, 1);
  }
});

test('1500. bölüm kaydı 1501. bölümü açar ve ilerlemeyi korur', () => {
  const storage = new Map<string, string>();
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    } },
  });
  try {
    const save = {
      version: 1, unlockedLevel: 1500, currentLevel: 1500, coins: 875,
      completedLevels: [1500], totalBonusFound: 2,
      progressByLevel: { 1499: { foundWords: ['ÖRNEK'], revealedCells: ['0,0'], bonusWords: ['DENEME'] } },
      settings: { soundEnabled: false },
    };
    storage.set('kelime_yolculugu_save_v1', JSON.stringify(save));
    const migrated = loadSaveState(3000);
    assert.equal(migrated.unlockedLevel, 1501);
    assert.equal(migrated.currentLevel, 1501);
    assert.equal(migrated.coins, 875);
    assert.deepEqual(migrated.progressByLevel[1499], save.progressByLevel[1499]);
    assert.equal(migrated.settings.soundEnabled, false);

    storage.set('kelime_yolculugu_save_v1', JSON.stringify({ ...save, currentLevel: 50 }));
    assert.equal(loadSaveState(3000).currentLevel, 50);
    storage.set('kelime_yolculugu_save_v1', JSON.stringify({ ...save, completedLevels: [] }));
    assert.equal(loadSaveState(3000).unlockedLevel, 1500);
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});

console.log(`\n🎉 Tüm ${passed} otomatik doğrulama testi başarıyla geçti!`);
