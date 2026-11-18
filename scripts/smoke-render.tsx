import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LEVELS } from '../src/data/levels';
import { THEMES, THEME_ORDER, getThemeForLevel } from '../src/data/themes';
import { EXPANSION_REGIONS } from '../src/data/expansionThemes';
import { THIRD_JOURNEY_REGIONS } from '../src/data/thirdJourneyThemes';
import { ScenicBackground } from '../src/components/ScenicBackground';
import { LevelSelect } from '../src/components/LevelSelect';
import { MainMenu } from '../src/components/MainMenu';
import { GameScreen } from '../src/components/GameScreen';
import { LevelCompleteModal } from '../src/components/LevelCompleteModal';
import { SaveState } from '../src/engine/types';

/**
 * Duman testi: tüm manzaralar ve her manzaradan bir bölüm, React ile hatasız çiziliyor mu?
 */
const noop = (): void => undefined;

// 1) 300 manzaranın tamamı tanımlı ve çizilebiliyor
assert.equal(THEME_ORDER.length, 300);
assert.equal(new Set(THEME_ORDER).size, 300);
for (const id of THEME_ORDER) {
  const theme = THEMES[id];
  assert.ok(theme && theme.name.length > 0, `Tema eksik: ${id}`);
  const html = renderToStaticMarkup(<ScenicBackground theme={id} />);
  assert.ok(html.includes('<svg'), `Arka plan çizilemedi: ${id}`);
  assert.ok(!html.includes('NaN') && !html.includes('undefined'), `Geçersiz değer: ${id}`);
  // Seçim çizgisi her temada canlı mavi veya turkuaz
  assert.ok(['#0ea5e9', '#06b6d4'].includes(theme.lineColor), `Çizgi rengi: ${id}`);
}

// 2) Yeni 35 manzaranın adları ve sırası
const expectedNew35 = [
  'Yakut Kayalıkları', 'Söğütlü Dere', 'Mor Sümbül Yaylası', 'İnci Kıyısı', 'Dolunay Gölü',
  'Kehribar Tepeleri', 'Eğrelti Vadisi', 'Fırtına Burnu', 'Erik Çiçeği Bahçesi', 'Beyaz Kumullar',
  'Ayna Gölü', 'Uçurum Şelalesi', 'Sedef Koyu', 'Kestane Ormanı', 'Günebakan Tarlası',
  'Kırağı Ovası', 'Şelaleler Vadisi', 'Kızılçam Yaylası', 'Kuzey Işıkları Körfezi', 'Mor Ufuklar',
  'Deniz Mağarası', 'Badem Çiçeği Tepeleri', 'Turnalar Sazlığı', 'Zümrüt Lagün', 'Gölgeli Patika',
  'Kardelen Yamacı', 'Saklı Fiyort', 'Rüzgârlı Bozkır', 'Obsidyen Sahili', 'Köpüklü Akarsu',
  'Akasya Korusu', 'Şeftali Bahçesi', 'Alacakaranlık Adası', 'Pamuk Bulutlar Yaylası', 'Düşler Takımadası',
];
expectedNew35.forEach((name, i) => {
  assert.equal(getThemeForLevel(351 + i * 10).name, name);
  assert.equal(getThemeForLevel(360 + i * 10).name, name);
});

// 2b) Yeni 30 manzaranın adları ve sırası (701–1000)
const expectedNew30 = [
  'Safir Şelalesi', 'Ardıç Yaylası', 'Pembe Tuz Gölü', 'Çiğdem Çayırı', 'Kartal Kayalıkları',
  'Ihlamur Korusu', 'Ayışığı Lagünü', 'Kızıl Kum Denizi', 'Mavi Buz Mağarası', 'Nergis Vadisi',
  'Rüzgâr Değirmeni Tepesi', 'Yaban Mersini Ormanı', 'Serap Vahası', 'Beyaz Falezler', 'Lotus Göleti',
  'Sabah Sisi Ovası', 'Ateşböceği Deresi', 'Deniz Kemerleri', 'Mor Salkım Bahçesi', 'Saklı Krater Gölü',
  'Altın Başak Tarlası', 'Yağmur Sonrası Tepeler', 'Kutup Gecesi Körfezi', 'Çınarlı Nehir Yolu', 'Turuncu Çöl Kanyonu',
  'Yıldız Tozu Sahili', 'Bambu Vadisi', 'Çiçekli Dağ Geçidi', 'Gümüş Sis Ormanı', 'Sonsuz Ufuk Adası',
];
expectedNew30.forEach((name, i) => {
  assert.equal(getThemeForLevel(701 + i * 10).name, name);
  assert.equal(getThemeForLevel(710 + i * 10).name, name);
});

assert.equal(EXPANSION_REGIONS.length, 50);
EXPANSION_REGIONS.forEach((region, i) => {
  assert.equal(getThemeForLevel(1001 + i * 10).name, region.name);
  assert.equal(getThemeForLevel(1010 + i * 10).name, region.name);
});
assert.equal(THIRD_JOURNEY_REGIONS.length, 150);
THIRD_JOURNEY_REGIONS.forEach((region, i) => {
  assert.equal(getThemeForLevel(1501 + i * 10).name, region.name);
  assert.equal(getThemeForLevel(1510 + i * 10).name, region.name);
});

// 3) Menü ve bölüm seçimi (tüm bölümler açıkken)
const save: SaveState = {
  version: 1,
  unlockedLevel: 3000,
  currentLevel: 2995,
  coins: 500,
  completedLevels: Array.from({ length: 2994 }, (_, i) => i + 1),
  totalBonusFound: 12,
  progressByLevel: { 2995: { foundWords: [LEVELS[2994].words[0].word], revealedCells: [], bonusWords: [] } },
  settings: { soundEnabled: false },
};
const menuHtml = renderToStaticMarkup(
  <MainMenu save={save} onContinue={noop} onOpenLevels={noop} onOpenSettings={noop} onToggleSound={noop} />
);
assert.ok(menuHtml.includes('Mavi Uçurum Gölü: Derinlikler') && menuHtml.includes('2995 / 3000'));
const selectHtml = renderToStaticMarkup(<LevelSelect save={save} onSelectLevel={noop} onBack={noop} />);
for (const name of [...expectedNew35, ...expectedNew30, ...EXPANSION_REGIONS.map((region) => region.name), ...THIRD_JOURNEY_REGIONS.map((region) => region.name)]) {
  assert.ok(selectHtml.includes(name), `Bölüm seçiminde yok: ${name}`);
}
assert.ok(selectHtml.includes('Bölüm 2991 – 3000'));
assert.ok(selectHtml.includes('Manzaraya git'));
assert.equal((selectHtml.match(/aria-label="Bölüm \d+/g) ?? []).length, 100);
assert.equal((selectHtml.match(/<option /g) ?? []).length, 300);

// 4) Her manzaradan ilk ve son bölüm oyun ekranında çiziliyor
let rendered = 0;
for (let chapter = 0; chapter < 300; chapter++) {
  for (const id of [chapter * 10 + 1, chapter * 10 + 10]) {
    const level = LEVELS.find((l) => l.id === id);
    assert.ok(level, `Bölüm yok: ${id}`);
    const html = renderToStaticMarkup(
      <GameScreen
        level={level}
        progress={{ foundWords: [level.words[0].word], revealedCells: [], bonusWords: [] }}
        coins={100}
        totalBonusFound={0}
        isLevelAlreadyCompleted={false}
        onWordFound={noop}
        onBonusFound={noop}
        onHintUsed={noop}
        onLevelCompleted={() => ({ earnedCoins: level.rewardCoins, isFirstTimeClear: true })}
        onNextLevel={noop}
        onOpenMenu={noop}
        onOpenLevels={noop}
        onOpenSettings={noop}
      />
    );
    assert.ok(html.includes(`Bölüm ${id}`), `Oyun ekranı çizilemedi: ${id}`);
    assert.equal((html.match(/role="gridcell"/g) ?? []).length > 0, true);
    rendered++;
  }
}

// 5) Son bölümün kutlama ekranı ve yeni manzara bildirimi
const finalHtml = renderToStaticMarkup(
  <LevelCompleteModal level={LEVELS[2999]} earnedCoins={500} bonusCountInLevel={2} isFirstTimeClear onNextLevel={noop} onOpenLevels={noop} />
);
assert.ok(finalHtml.includes('Tüm 3000 bölümü başarıyla tamamladın!'));
const unlockHtml = renderToStaticMarkup(
  <LevelCompleteModal level={LEVELS[349]} earnedCoins={188} bonusCountInLevel={0} isFirstTimeClear onNextLevel={noop} onOpenLevels={noop} />
);
assert.ok(unlockHtml.includes('Yeni manzara açıldı: Yakut Kayalıkları!'));
const unlockHtml2 = renderToStaticMarkup(
  <LevelCompleteModal level={LEVELS[699]} earnedCoins={390} bonusCountInLevel={0} isFirstTimeClear onNextLevel={noop} onOpenLevels={noop} />
);
assert.ok(unlockHtml2.includes('Yeni manzara açıldı: Safir Şelalesi!'));
const unlockHtml3 = renderToStaticMarkup(
  <LevelCompleteModal level={LEVELS[999]} earnedCoins={510} bonusCountInLevel={0} isFirstTimeClear onNextLevel={noop} onOpenLevels={noop} />
);
assert.ok(unlockHtml3.includes('Yeni manzara açıldı: Leylak Tepeleri!'));
const unlockHtml4 = renderToStaticMarkup(
  <LevelCompleteModal level={LEVELS[1499]} earnedCoins={614} bonusCountInLevel={0} isFirstTimeClear onNextLevel={noop} onOpenLevels={noop} />
);
assert.ok(unlockHtml4.includes('Yeni manzara açıldı: Akşam Güneşi Vadisi!'));

console.log(`✅ Duman testi geçti: 300 manzara, sayfalı bölüm seçimi ve ${rendered} oyun ekranı hatasız çizildi.`);

// İsteğe bağlı: manzaraları SVG dosyası olarak dışa aktar (görsel kontrol için)
if (process.env.SCENE_DIR) {
  fs.mkdirSync(process.env.SCENE_DIR, { recursive: true });
  for (const id of THEME_ORDER) {
    const html = renderToStaticMarkup(<ScenicBackground theme={id} />);
    const start = html.indexOf('<svg');
    const end = html.indexOf('</svg>') + '</svg>'.length;
    const svg = html
      .slice(start, end)
      .replace('<svg class="h-full w-full"', '<svg width="450" height="600"');
    fs.writeFileSync(`${process.env.SCENE_DIR}/${id}.svg`, svg);
  }
  console.log('SVG manzaraları yazıldı:', process.env.SCENE_DIR);
}
