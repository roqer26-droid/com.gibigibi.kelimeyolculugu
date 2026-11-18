// Türkçe karakter kurallarına tam uyumlu metin ve harf yardımcıları

export const TURKISH_ALPHABET = [
  'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H',
  'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P',
  'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z',
] as const;

const TURKISH_LETTER_SET = new Set<string>(TURKISH_ALPHABET);

/**
 * Türkçe kurallarına göre büyük harfe dönüştürür.
 * Özellikle i -> İ ve ı -> I dönüşümlerini tarayıcı bağımsız biçimde güvence altına alır.
 */
export function toTurkishUpper(input: string): string {
  return input
    .replace(/i/g, 'İ')
    .replace(/ı/g, 'I')
    .toLocaleUpperCase('tr-TR')
    .trim();
}

/**
 * Türkçe kurallarına göre küçük harfe dönüştürür.
 * Özellikle İ -> i ve I -> ı dönüşümlerini güvence altına alır.
 */
export function toTurkishLower(input: string): string {
  return input
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLocaleLowerCase('tr-TR')
    .trim();
}

/**
 * Verilen metnin yalnızca geçerli Türkçe harflerden oluşup oluşmadığını kontrol eder.
 */
export function isValidTurkishWordFormat(word: string): boolean {
  const normalized = toTurkishUpper(word);
  if (normalized.length === 0) return false;
  for (const ch of normalized) {
    if (!TURKISH_LETTER_SET.has(ch)) {
      return false;
    }
  }
  return true;
}

/**
 * Harf dizisinden veya kelimeden harf frekans haritası üretir.
 */
export function countLetters(input: string | readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  const chars = typeof input === 'string' ? [...toTurkishUpper(input)] : input.map(toTurkishUpper);
  for (const ch of chars) {
    counts.set(ch, (counts.get(ch) ?? 0) + 1);
  }
  return counts;
}

/**
 * Bir kelimenin verilen harf çemberindeki taşlarla (her taş en fazla bir kez kullanılarak)
 * yazılıp yazılamayacağını kontrol eder.
 */
export function canBuildWordFromLetters(word: string, pool: readonly string[]): boolean {
  const wordCounts = countLetters(word);
  const poolCounts = countLetters(pool);

  for (const [letter, needed] of wordCounts.entries()) {
    if ((poolCounts.get(letter) ?? 0) < needed) {
      return false;
    }
  }
  return true;
}

/**
 * İki Türkçe kelimeyi harf bazında büyük harfe normalize ederek karşılaştırır.
 */
export function equalsTurkish(a: string, b: string): boolean {
  return toTurkishUpper(a) === toTurkishUpper(b);
}
