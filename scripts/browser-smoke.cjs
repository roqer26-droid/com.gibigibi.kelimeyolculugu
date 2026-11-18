/* Optional: run against a Vite server with Playwright and a bundled levels fixture. */
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { LEVELS } = require(process.env.KELIME_LEVELS_MODULE || '/tmp/kelime-levels.cjs');
let activeBrowser;

const url = process.env.KELIME_URL || 'http://127.0.0.1:4173/';
const saveKey = 'kelime_yolculugu_save_v1';
const level = (id) => LEVELS.find((entry) => entry.id === id);
const saveFor = (id, progress = {}, completed = [], coins = 120) => ({
  version: 1,
  unlockedLevel: id,
  currentLevel: id,
  coins,
  completedLevels: completed,
  totalBonusFound: 0,
  progressByLevel: progress,
  settings: { soundEnabled: false },
});

async function seed(page, save) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: saveKey, value: save });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Devam Et/ }).waitFor();
}

async function openGame(page) {
  await page.getByRole('button', { name: /Devam Et/ }).click();
  await page.locator('[aria-label="Harf çemberi"]').waitFor();
}

async function tilePositions(page) {
  return page.locator('[data-tile-id]').evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return {
      id: node.getAttribute('data-tile-id'),
      letter: node.getAttribute('data-letter'),
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
    };
  }));
}

async function positionsForWord(page, word) {
  const tiles = await tilePositions(page);
  const used = new Set();
  return [...word].map((letter) => {
    const tile = tiles.find((candidate) => candidate.letter === letter && !used.has(candidate.id));
    assert.ok(tile, `${word}: no unused tile for ${letter}`);
    used.add(tile.id);
    return tile;
  });
}

async function mouseWord(page, word) {
  const points = await positionsForWord(page, word);
  await page.mouse.move(points[0].x, points[0].y);
  await page.mouse.down();
  for (const point of points.slice(1)) {
    await page.mouse.move(point.x, point.y);
    await page.waitForTimeout(12);
  }
  if (points.length > 1) assert.ok(await page.locator('[aria-label="Harf çemberi"] polyline').count());
  await page.mouse.up();
}

async function touchWord(page, context, word) {
  const points = await positionsForWord(page, word);
  const client = await context.newCDPSession(page);
  const touch = (point) => [{ x: point.x, y: point.y, id: 1, radiusX: 2, radiusY: 2, force: 1 }];
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: touch(points[0]) });
  for (const point of points.slice(1)) {
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: touch(point) });
    await page.waitForTimeout(18);
  }
  if (points.length > 1) assert.ok(await page.locator('[aria-label="Harf çemberi"] polyline').count());
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
}

async function waitForFound(page, id, word) {
  await page.waitForFunction(({ key, id, word }) => {
    const save = JSON.parse(localStorage.getItem(key) || '{}');
    return save.progressByLevel?.[id]?.foundWords?.includes(word);
  }, { key: saveKey, id, word });
}

function almostComplete(id) {
  const current = level(id);
  const target = current.words[current.words.length - 1].word;
  return {
    target,
    progress: { [id]: { foundWords: current.words.filter((entry) => entry.word !== target).map((entry) => entry.word), revealedCells: [], bonusWords: [] } },
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  activeBrowser = browser;
  const errors = [];
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await desktop.newPage();
  page.on('pageerror', (error) => errors.push(error.message));

  await seed(page, saveFor(1001, {}, [1000]));
  await openGame(page);
  assert.equal(await page.locator('[data-tile-id]').count(), 9);
  const initialTiles = await tilePositions(page);
  const three = initialTiles.slice(0, 3);
  await page.mouse.move(three[0].x, three[0].y);
  await page.mouse.down();
  await page.mouse.move(three[1].x, three[1].y);
  await page.mouse.move(three[2].x, three[2].y);
  assert.equal(await page.locator('[data-selected="true"]').count(), 3);
  await page.mouse.move(three[0].x, three[0].y);
  assert.equal(await page.locator('[data-selected="true"]').count(), 3);
  await page.mouse.move(three[1].x, three[1].y);
  assert.equal(await page.locator('[data-selected="true"]').count(), 2);
  await page.mouse.up();

  const before = (await tilePositions(page)).map((tile) => tile.letter).sort().join('');
  await page.getByRole('button', { name: 'Harfleri karıştır' }).click();
  await page.waitForTimeout(350);
  assert.equal((await tilePositions(page)).map((tile) => tile.letter).sort().join(''), before);
  await page.getByRole('button', { name: /İpucu kullan/ }).click();
  await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key) || '{}').coins === 95, saveKey);
  const hintSave = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), saveKey);
  assert.equal(hintSave.progressByLevel[1001].revealedCells.length, 1);

  await mouseWord(page, 'KEFİL');
  await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key) || '{}').progressByLevel?.[1001]?.bonusWords?.includes('KEFİL'), saveKey);
  assert.equal(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).coins, saveKey), 100);
  await mouseWord(page, 'KEFİL');
  await page.getByText('Bu kelimeyi zaten buldun').waitFor();
  assert.equal(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).coins, saveKey), 100);

  const firstWord = level(1001).words[0].word;
  await mouseWord(page, firstWord);
  await waitForFound(page, 1001, firstWord);
  await mouseWord(page, firstWord);
  await page.getByText('Bu kelimeyi zaten buldun').waitFor();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await openGame(page);
  assert.ok(await page.locator(`[role="gridcell"][aria-label="${[...firstWord][0]}"]`).count());
  await waitForFound(page, 1001, firstWord);

  // A completed 1000-level save migrates without losing gold or settings.
  await seed(page, saveFor(1000, {}, [1000], 375));
  let saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), saveKey);
  assert.equal(saved.currentLevel, 1001);
  assert.equal(saved.unlockedLevel, 1001);
  assert.equal(saved.coins, 375);
  await page.getByRole('button', { name: 'Bölümler' }).click();
  const selector = page.locator('#chapter-jump');
  assert.equal(await selector.locator('option').count(), 300);
  await selector.selectOption('299');
  assert.ok(await page.getByText('Mavi Uçurum Gölü: Derinlikler', { exact: true }).count());
  assert.equal(await page.getByRole('button', { name: 'Bölüm 3000 (Kilitli)' }).isDisabled(), true);
  await selector.selectOption('149');
  assert.ok(await page.getByText('Yıldız Yansımalı Göl', { exact: true }).count());
  assert.equal(await page.getByRole('button', { name: 'Bölüm 1500 (Kilitli)' }).isDisabled(), true);
  await page.getByRole('button', { name: 'Sonraki bölüm aralığı' }).click();
  assert.ok(await page.getByText('Akşam Güneşi Vadisi', { exact: true }).count());
  assert.equal(await page.getByRole('button', { name: 'Bölüm 1501 (Kilitli)' }).isDisabled(), true);
  await page.getByRole('button', { name: 'Önceki bölüm aralığı' }).click();
  assert.equal(await page.getByRole('button', { name: 'Bölüm 1500 (Kilitli)' }).isDisabled(), true);

  // Complete the previous final section and go to the first new section.
  const previousFinal = almostComplete(1000);
  await seed(page, saveFor(1000, previousFinal.progress, [], 300));
  await openGame(page);
  await mouseWord(page, previousFinal.target);
  await page.getByRole('dialog', { name: 'Bölüm 1000 tamamlandı' }).waitFor();
  assert.ok(await page.getByText('Yeni manzara açıldı: Leylak Tepeleri!').count());
  saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), saveKey);
  assert.equal(saved.unlockedLevel, 1001);
  assert.equal(saved.coins, 300 + level(1000).rewardCoins);
  await page.getByRole('button', { name: 'Sonraki Bölüm' }).click();
  assert.ok(await page.getByText('Bölüm 1001', { exact: true }).count());

  // Persistence must not depend on the celebration timeout finishing.
  await seed(page, saveFor(1000, previousFinal.progress, [], 300));
  await openGame(page);
  await mouseWord(page, previousFinal.target);
  await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key) || '{}').completedLevels?.includes(1000), saveKey);
  await page.reload({ waitUntil: 'domcontentloaded' });
  saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), saveKey);
  assert.equal(saved.unlockedLevel, 1001);
  assert.equal(saved.coins, 300 + level(1000).rewardCoins);

  const regionBoundary = almostComplete(1010);
  await seed(page, saveFor(1010, regionBoundary.progress));
  await openGame(page);
  await mouseWord(page, regionBoundary.target);
  await page.getByRole('dialog', { name: 'Bölüm 1010 tamamlandı' }).waitFor();
  assert.ok(await page.getByText('Yeni manzara açıldı: Çam Kozalağı Vadisi!').count());
  await page.getByRole('button', { name: 'Sonraki Bölüm' }).click();
  assert.ok(await page.getByText('Bölüm 1011', { exact: true }).count());

  // A finished 1500-level save unlocks the next section, preserving the wallet.
  await seed(page, saveFor(1500, {}, [1500], 875));
  saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), saveKey);
  assert.equal(saved.currentLevel, 1501);
  assert.equal(saved.unlockedLevel, 1501);
  assert.equal(saved.coins, 875);

  const secondFinal = almostComplete(1500);
  await seed(page, saveFor(1500, secondFinal.progress, [], 300));
  await openGame(page);
  await mouseWord(page, secondFinal.target);
  await page.getByRole('dialog', { name: 'Bölüm 1500 tamamlandı' }).waitFor();
  assert.ok(await page.getByText('Yeni manzara açıldı: Akşam Güneşi Vadisi!').count());
  await page.getByRole('button', { name: 'Sonraki Bölüm' }).click();
  assert.ok(await page.getByText('Bölüm 1501', { exact: true }).count());

  const final = almostComplete(3000);
  await seed(page, saveFor(3000, final.progress));
  await openGame(page);
  await mouseWord(page, final.target);
  await page.getByRole('dialog', { name: 'Bölüm 3000 tamamlandı' }).waitFor();
  assert.ok(await page.getByText('Tüm 3000 bölümü başarıyla tamamladın!').count());

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const mobilePage = await mobile.newPage();
  mobilePage.on('pageerror', (error) => errors.push(error.message));
  const mobileWord = level(1501).words[0].word;
  await seed(mobilePage, saveFor(1501));
  await openGame(mobilePage);
  const mobileTiles = (await tilePositions(mobilePage)).slice(0, 3);
  const touchClient = await mobile.newCDPSession(mobilePage);
  const point = (tile) => [{ x: tile.x, y: tile.y, id: 1, radiusX: 2, radiusY: 2, force: 1 }];
  await touchClient.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(mobileTiles[0]) });
  await mobilePage.waitForTimeout(20);
  await touchClient.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(mobileTiles[1]) });
  await mobilePage.waitForTimeout(20);
  await touchClient.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(mobileTiles[2]) });
  await mobilePage.waitForTimeout(20);
  assert.equal(await mobilePage.locator('[data-selected="true"]').count(), 3);
  await touchClient.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(mobileTiles[1]) });
  await mobilePage.waitForTimeout(20);
  assert.equal(await mobilePage.locator('[data-selected="true"]').count(), 2);
  await touchClient.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await touchClient.detach();
  await touchWord(mobilePage, mobile, mobileWord);
  await waitForFound(mobilePage, 1501, mobileWord);
  assert.equal(await mobilePage.evaluate(() => window.scrollY), 0);
  assert.equal(await mobilePage.locator('[aria-label="Harf çemberi"]').evaluate((node) => getComputedStyle(node).touchAction), 'none');
  await mobilePage.reload({ waitUntil: 'domcontentloaded' });
  await openGame(mobilePage);
  await waitForFound(mobilePage, 1501, mobileWord);

  // On a small phone a 10x11 puzzle must remain within its parent and the viewport.
  await mobilePage.setViewportSize({ width: 320, height: 568 });
  const large = LEVELS.find((entry) => {
    if (entry.id < 1501) return false;
    const rows = Math.max(...entry.words.map((w) => w.row + (w.dir === 'down' ? w.word.length : 1)));
    const cols = Math.max(...entry.words.map((w) => w.col + (w.dir === 'across' ? w.word.length : 1)));
    return rows === 10 && cols === 11;
  });
  assert.ok(large);
  await seed(mobilePage, saveFor(large.id));
  await openGame(mobilePage);
  await mobilePage.waitForTimeout(200);
  const geometry = await mobilePage.locator('[role="grid"]').evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const container = node.parentElement.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, containerTop: container.top, containerBottom: container.bottom, width: innerWidth };
  });
  assert.ok(geometry.left >= 0 && geometry.right <= geometry.width, JSON.stringify(geometry));
  assert.ok(geometry.top >= geometry.containerTop - 1 && geometry.bottom <= geometry.containerBottom + 1, JSON.stringify(geometry));

  assert.deepEqual(errors, []);
  await browser.close();
  console.log('Browser interaction checks passed: mouse, touch, shuffle, hint, persistence, migration, completion and small-screen layout.');
}

main().catch(async (error) => {
  console.error(error);
  if (activeBrowser) await activeBrowser.close();
  process.exitCode = 1;
});