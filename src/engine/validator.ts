import {
  CompiledGrid,
  Direction,
  GridCell,
  LevelDefinition,
  PlacedWord,
  ValidationResult,
  cellKey,
} from './types';
import {
  canBuildWordFromLetters,
  isValidTurkishWordFormat,
  toTurkishUpper,
} from '../utils/turkish';

/**
 * Yerleştirilmiş kelimelerden derlenmiş ızgara (grid) haritası üretir.
 * Çakışma (farklı harf üst üste binmesi) varsa errors dizisine ekler.
 */
export function compileGrid(words: readonly PlacedWord[]): {
  grid: CompiledGrid;
  conflicts: string[];
} {
  const cells = new Map<string, GridCell>();
  const conflicts: string[] = [];
  let maxRow = 0;
  let maxCol = 0;

  words.forEach((placed, wordIndex) => {
    const chars = [...placed.word];
    for (let i = 0; i < chars.length; i++) {
      const r = placed.dir === 'down' ? placed.row + i : placed.row;
      const c = placed.dir === 'across' ? placed.col + i : placed.col;
      if (r > maxRow) maxRow = r;
      if (c > maxCol) maxCol = c;

      const key = cellKey(r, c);
      const existing = cells.get(key);
      if (existing) {
        if (existing.letter !== chars[i]) {
          conflicts.push(
            `Kesişim çakışması (${r},${c}): '${existing.letter}' ile '${chars[i]}' (${placed.word}) eşleşmiyor.`
          );
        }
        if (!existing.wordIndices.includes(wordIndex)) {
          existing.wordIndices.push(wordIndex);
        }
      } else {
        cells.set(key, {
          row: r,
          col: c,
          letter: chars[i],
          wordIndices: [wordIndex],
        });
      }
    }
  });

  return {
    grid: {
      rows: cells.size > 0 ? maxRow + 1 : 0,
      cols: cells.size > 0 ? maxCol + 1 : 0,
      cells,
    },
    conflicts,
  };
}

/**
 * Verilen ızgaradaki tüm en az 2 harfli kesintisiz yatay ve dikey kutu dizilerini tarar.
 * Bu sayede istemsiz yan yana değmeler veya yeni kelime gibi görünen bitişik kutular kesin olarak tespit edilir.
 */
export function extractMaximalSegments(grid: CompiledGrid): PlacedWord[] {
  const segments: PlacedWord[] = [];

  // Yatay (across) tarama
  for (let r = 0; r < grid.rows; r++) {
    let c = 0;
    while (c < grid.cols) {
      if (grid.cells.has(cellKey(r, c))) {
        const startCol = c;
        let word = '';
        while (c < grid.cols && grid.cells.has(cellKey(r, c))) {
          word += grid.cells.get(cellKey(r, c))!.letter;
          c++;
        }
        if ([...word].length >= 2) {
          segments.push({ word, row: r, col: startCol, dir: 'across' });
        }
      } else {
        c++;
      }
    }
  }

  // Dikey (down) tarama
  for (let c = 0; c < grid.cols; c++) {
    let r = 0;
    while (r < grid.rows) {
      if (grid.cells.has(cellKey(r, c))) {
        const startRow = r;
        let word = '';
        while (r < grid.rows && grid.cells.has(cellKey(r, c))) {
          word += grid.cells.get(cellKey(r, c))!.letter;
          r++;
        }
        if ([...word].length >= 2) {
          segments.push({ word, row: startRow, col: c, dir: 'down' });
        }
      } else {
        r++;
      }
    }
  }

  return segments;
}

function placementSignature(p: PlacedWord): string {
  return `${p.dir}:${p.row}:${p.col}:${p.word}`;
}

/**
 * Bir bölümün tüm oyun ve bulmaca kurallarına uygunluğunu otomatik doğrular.
 */
export function validateLevel(level: LevelDefinition): ValidationResult {
  const errors: string[] = [];

  // 1. Hedef kelime sayısı 5-10 arasında mı?
  if (level.words.length < 5 || level.words.length > 10) {
    errors.push(
      `Hedef kelime sayısı 5 ile 10 arasında olmalıdır (mevcut: ${level.words.length}).`
    );
  }

  // 2. Harf çemberi geçerli mi? (4-9 tekil Türkçe harf)
  if (level.letters.length < 4 || level.letters.length > 9) {
    errors.push(
      `Harf çemberi 4 ile 9 harf içermelidir (mevcut: ${level.letters.length}).`
    );
  }
  for (const ch of level.letters) {
    const upper = toTurkishUpper(ch);
    if ([...upper].length !== 1 || !isValidTurkishWordFormat(upper) || ch !== upper) {
      errors.push(`Geçersiz harf çemberi taşı: '${ch}'.`);
    }
  }

  // 3. Kelime kuralları: en az 3 harf, Türkçe büyük harf, benzersizlik, harf havuzu frekans kontrolü
  const seenWords = new Set<string>();
  const seenPlacements = new Set<string>();

  for (const placed of level.words) {
    const normalized = toTurkishUpper(placed.word);
    const len = [...normalized].length;

    if (placed.word !== normalized) {
      errors.push(
        `Kelime Türkçe büyük harf biçiminde değil: '${placed.word}' (beklenen: '${normalized}').`
      );
    }

    if (!isValidTurkishWordFormat(normalized)) {
      errors.push(`Geçersiz karakter içeren kelime: '${placed.word}'.`);
    }

    if (len < 3) {
      errors.push(`Kelime en az 3 harfli olmalıdır: '${placed.word}'.`);
    }

    if (seenWords.has(normalized)) {
      errors.push(`Aynı kelime bölümde birden fazla hedef olarak kullanılmış: '${normalized}'.`);
    }
    seenWords.add(normalized);

    if (!canBuildWordFromLetters(normalized, level.letters)) {
      errors.push(
        `'${normalized}' kelimesi bölüm harfleriyle [${level.letters.join(', ')}] harf adedi aşılmadan yazılamıyor.`
      );
    }

    if (!Number.isInteger(placed.row) || !Number.isInteger(placed.col) || placed.row < 0 || placed.col < 0) {
      errors.push(`Geçersiz koordinat: '${placed.word}' (${placed.row},${placed.col}).`);
    }

    const dir: Direction = placed.dir;
    if (dir !== 'across' && dir !== 'down') {
      errors.push(`Geçersiz yön: '${String(dir)}' (${placed.word}).`);
    }

    const sig = placementSignature(placed);
    if (seenPlacements.has(sig)) {
      errors.push(`Aynı konuma mükerrer yerleştirme: ${sig}.`);
    }
    seenPlacements.add(sig);
  }

  // 4. Kesişim uyumu ve ızgara derleme
  const { grid, conflicts } = compileGrid(level.words);
  errors.push(...conflicts);

  // 5. İstemsiz komşuluk / çakışma / uç uca birleşme kontrolü
  // Izgaradaki 2+ uzunluğundaki tüm kesintisiz kutu dizileri, tam olarak hedef kelimelerle birebir eşleşmelidir.
  const segments = extractMaximalSegments(grid);
  const expectedSet = new Set(level.words.map(placementSignature));
  const actualSet = new Set(segments.map(placementSignature));

  for (const seg of segments) {
    const sig = placementSignature(seg);
    if (!expectedSet.has(sig)) {
      errors.push(
        `İstemsiz bitişik kutu dizisi veya çakışma tespit edildi: '${seg.word}' (${seg.dir} @ ${seg.row},${seg.col}).`
      );
    }
  }

  for (const placed of level.words) {
    const sig = placementSignature(placed);
    if (!actualSet.has(sig)) {
      errors.push(
        `Hedef kelime ızgarada bağımsız ve eksiksiz yer almıyor (başka bir kelimeyle aynı doğrultuda birleşmiş olabilir): '${placed.word}' (${placed.dir} @ ${placed.row},${placed.col}).`
      );
    }
  }

  // 6. Bağlantılılık (Single Connected Component) kontrolü
  if (level.words.length > 0) {
    const adj: Set<number>[] = level.words.map(() => new Set<number>());
    for (const cell of grid.cells.values()) {
      for (const a of cell.wordIndices) {
        for (const b of cell.wordIndices) {
          if (a !== b) {
            adj[a].add(b);
            adj[b].add(a);
          }
        }
      }
    }

    const visited = new Set<number>([0]);
    const queue: number[] = [0];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const next of adj[curr]) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }

    if (visited.size !== level.words.length) {
      const disconnected = level.words
        .filter((_, idx) => !visited.has(idx))
        .map((w) => w.word);
      errors.push(
        `Bulmaca tam bağlantılı değil! Ana gruba bağlı olmayan kelimeler: ${disconnected.join(', ')}.`
      );
    }
  }

  // 7. Tamamlanabilirlik kontrolü: tüm hedefler bulunduğunda tüm hücreler açılıyor mu?
  const coveredCells = new Set<string>();
  for (const placed of level.words) {
    const len = [...placed.word].length;
    for (let i = 0; i < len; i++) {
      const r = placed.dir === 'down' ? placed.row + i : placed.row;
      const c = placed.dir === 'across' ? placed.col + i : placed.col;
      coveredCells.add(cellKey(r, c));
    }
  }
  if (coveredCells.size !== grid.cells.size) {
    errors.push('Hedef kelimelerin tamamı bulunduğunda açıkta kalan hücre mevcut.');
  }

  return {
    levelId: level.id,
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Tüm bölümleri doğrular, geçerli olanları ayırır ve hatalı olanları raporlar.
 */
export function validateAllLevels(levels: readonly LevelDefinition[]): {
  validLevels: LevelDefinition[];
  results: ValidationResult[];
  invalidResults: ValidationResult[];
} {
  const results = levels.map(validateLevel);
  const idCounts = new Map<number, number>();
  for (const level of levels) idCounts.set(level.id, (idCounts.get(level.id) ?? 0) + 1);
  results.forEach((result) => {
    if ((idCounts.get(result.levelId) ?? 0) > 1) {
      result.errors.push(`Bölüm numarası birden fazla kez kullanılmış: ${result.levelId}.`);
      result.valid = false;
    }
  });
  const invalidResults = results.filter((r) => !r.valid);
  const validLevels = levels.filter((_, index) => results[index].valid);

  return {
    validLevels,
    results,
    invalidResults,
  };
}
