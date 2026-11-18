# Kelime Yolculuğu (com.gibigibi.kelimeyolculugu)

gibigibi Games – Kelime Yolculuğu. React + Vite web oyunu; Capacitor ile Android uygulamasına (APK) sarılır. Açılışta Son Kule ile aynı 5 saniyelik gibigibi Games introsu oynar.

## APK nasıl alınır
1. GitHub → **Actions** → **Android APK** → son çalışma (veya **Run workflow**) → **Artifacts** → `kelime-yolculugu-debug-apk`.
2. İndirilen zip içindeki `app-debug.apk` telefona kurulur (Ayarlar'da "bilinmeyen kaynaklardan yükleme" izni gerekir).
3. Her `main` push'u yeni APK üretir; `versionCode` çalışma numarasıdır. Debug APK depodaki sabit anahtarla (`android/app/kelimeyolculugu-debug.keystore`) imzalıdır, bu yüzden yeni APK eskisinin üzerine güncelleme olarak kurulur ve kayıtlar korunur.

## İmzalı release APK / AAB (Play Store)
Depoda **Settings → Secrets and variables → Actions** altına `RELEASE_KEYSTORE_BASE64`, `RELEASE_KEYSTORE_PASSWORD`, `RELEASE_KEY_ALIAS`, `RELEASE_KEY_PASSWORD` eklenirse iş akışı `kelime-yolculugu-release` artifact'ını (APK + AAB) da üretir.

## Yerelde
```
npm ci
npm run build && npx cap sync android
cd android && ./gradlew assembleDebug
```
Gereken: Node 20, JDK 17, Android SDK (API 34).

## Yapı
- `src/` oyun; `src/components/IntroSplash.tsx` gibigibi Games introsu
- `android/` Capacitor Android projesi (simgeler `res/mipmap-*`, dikey yön, tam ekran, geri tuşu `src/App.tsx` içinde)
- Yazı tipleri pakete gömülüdür (`@fontsource`), oyun internetsiz çalışır.

---

## Oyun hakkında

Türkçe, mobil ve masaüstü tarayıcılarda oynanabilen; kesişen kelime bulmacası ile harf çemberini birleştiren bir kelime oyunu.

## Oyun Yapısı

- **3000 bölüm**
- Her bölümde **5–10 hedef kelime** ve **4–9 harf taşı** (ilerleyen bölümlerde 7–9 harf)
- Her 10 bölümde bir değişen 300 farklı doğa manzarası:
  - 1–10 **Zümrüt Vadi**, 11–20 **Saklı Şelale**, 21–30 **Masmavi Koy**, 31–40 **Lavanta Tepeleri**, 41–50 **Sessiz Göl**
  - 51–60 **Altın Kumsal**, 61–70 **Sisli Dağlar**, 71–80 **Mercan Adası**, 81–90 **Gümüş Nehir**, 91–100 **Güneşli Yayla**
  - 101–110 **Çam Ormanı**, 111–120 **Kızıl Kanyon**, 121–130 **Nilüfer Bahçesi**, 131–140 **Buzul Vadisi**, 141–150 **Yıldızlı Çöl**
  - 151–160 **Bahar Çayırı**, 161–170 **Gün Batımı Sahili**, 171–180 **Bulut Zirvesi**, 181–190 **Saklı Vaha**, 191–200 **Mehtap Körfezi**
  - 201–210 **Menekşe Vadisi**, 211–220 **Kristal Şelale**, 221–230 **Zeytinlik Tepeleri**, 231–240 **Turkuaz Lagün**, 241–250 **Sonbahar Ormanı**
  - 251–260 **Papatya Ovası**, 261–270 **Karlı Zirveler**, 271–280 **Sazlık Kıyısı**, 281–290 **Kelebek Bahçesi**, 291–300 **Şafak Koyu**
  - 301–310 **Yosunlu Kanyon**, 311–320 **Yağmur Ormanı**, 321–330 **Volkanik Ada**, 331–340 **Gelincik Tarlası**, 341–350 **Gökkuşağı Vadisi**
  - 351–360 **Yakut Kayalıkları**, 361–370 **Söğütlü Dere**, 371–380 **Mor Sümbül Yaylası**, 381–390 **İnci Kıyısı**, 391–400 **Dolunay Gölü**
  - 401–410 **Kehribar Tepeleri**, 411–420 **Eğrelti Vadisi**, 421–430 **Fırtına Burnu**, 431–440 **Erik Çiçeği Bahçesi**, 441–450 **Beyaz Kumullar**
  - 451–460 **Ayna Gölü**, 461–470 **Uçurum Şelalesi**, 471–480 **Sedef Koyu**, 481–490 **Kestane Ormanı**, 491–500 **Günebakan Tarlası**
  - 501–510 **Kırağı Ovası**, 511–520 **Şelaleler Vadisi**, 521–530 **Kızılçam Yaylası**, 531–540 **Kuzey Işıkları Körfezi**, 541–550 **Mor Ufuklar**
  - 551–560 **Deniz Mağarası**, 561–570 **Badem Çiçeği Tepeleri**, 571–580 **Turnalar Sazlığı**, 581–590 **Zümrüt Lagün**, 591–600 **Gölgeli Patika**
  - 601–610 **Kardelen Yamacı**, 611–620 **Saklı Fiyort**, 621–630 **Rüzgârlı Bozkır**, 631–640 **Obsidyen Sahili**, 641–650 **Köpüklü Akarsu**
  - 651–660 **Akasya Korusu**, 661–670 **Şeftali Bahçesi**, 671–680 **Alacakaranlık Adası**, 681–690 **Pamuk Bulutlar Yaylası**, 691–700 **Düşler Takımadası**
  - 701–710 **Safir Şelalesi**, 711–720 **Ardıç Yaylası**, 721–730 **Pembe Tuz Gölü**, 731–740 **Çiğdem Çayırı**, 741–750 **Kartal Kayalıkları**
  - 751–760 **Ihlamur Korusu**, 761–770 **Ayışığı Lagünü**, 771–780 **Kızıl Kum Denizi**, 781–790 **Mavi Buz Mağarası**, 791–800 **Nergis Vadisi**
  - 801–810 **Rüzgâr Değirmeni Tepesi**, 811–820 **Yaban Mersini Ormanı**, 821–830 **Serap Vahası**, 831–840 **Beyaz Falezler**, 841–850 **Lotus Göleti**
  - 851–860 **Sabah Sisi Ovası**, 861–870 **Ateşböceği Deresi**, 871–880 **Deniz Kemerleri**, 881–890 **Mor Salkım Bahçesi**, 891–900 **Saklı Krater Gölü**
  - 901–910 **Altın Başak Tarlası**, 911–920 **Yağmur Sonrası Tepeler**, 921–930 **Kutup Gecesi Körfezi**, 931–940 **Çınarlı Nehir Yolu**, 941–950 **Turuncu Çöl Kanyonu**
  - 951–960 **Yıldız Tozu Sahili**, 961–970 **Bambu Vadisi**, 971–980 **Çiçekli Dağ Geçidi**, 981–990 **Gümüş Sis Ormanı**, 991–1000 **Sonsuz Ufuk Adası**
  - 1001–1010 **Leylak Tepeleri**, 1011–1020 **Çam Kozalağı Vadisi**, 1021–1030 **Al Mercan Resifi**, 1031–1040 **Gün Doğumu Platosu**, 1041–1050 **Fındık Korusu**
  - 1051–1060 **Mavi Çan Çayırı**, 1061–1070 **Kırlangıç Koyu**, 1071–1080 **Bakır Dağlar**, 1081–1090 **Çiy Taneleri Bahçesi**, 1091–1100 **Karanfil Yamacı**
  - 1101–1110 **Sığla Ormanı**, 1111–1120 **Zambak Göleti**, 1121–1130 **Kızıl Akçaağaç Vadisi**, 1131–1140 **Aytaşı Kumsalı**, 1141–1150 **Kumul Çiçekleri Ovası**
  - 1151–1160 **Dalgakıran Kayalıkları**, 1161–1170 **Ilgın Sahili**, 1171–1180 **Doruklar Denizi**, 1181–1190 **Fıstık Çamı Korusu**, 1191–1200 **Sırlı Mağara**
  - 1201–1210 **Kekik Yaylası**, 1211–1220 **Pelikan Lagünü**, 1221–1230 **Yakut Gün Batımı**, 1231–1240 **Salkım Söğüt Kıyısı**, 1241–1250 **Yaban Gülü Vadisi**
  - 1251–1260 **Buzul Şelalesi**, 1261–1270 **Çöl Gecesi Vahası**, 1271–1280 **Uğultulu Uçurum**, 1281–1290 **Orkide Ormanı**, 1291–1300 **Gümüş Kum Adası**
  - 1301–1310 **Kır Çiçekleri Platosu**, 1311–1320 **Zeytin Çiçeği Bahçesi**, 1321–1330 **Sisler İçindeki Fiyort**, 1331–1340 **Sedir Dağları**, 1341–1350 **Deniz Köpüğü Koyu**
  - 1351–1360 **Gökkuşağı Kayalıkları**, 1361–1370 **Yaban Elması Korusu**, 1371–1380 **Alaca Göl**, 1381–1390 **Eğrelti Mağarası**, 1391–1400 **Serin Pınar Vadisi**
  - 1401–1410 **Leylekler Ovası**, 1411–1420 **Mor Süsen Bataklığı**, 1421–1430 **Rüzgârın Oyduğu Kayalar**, 1431–1440 **Kızıl Toprak Tepeleri**, 1441–1450 **Çiçekli Kiraz Yolu**
  - 1451–1460 **Kum Zambağı Sahili**, 1461–1470 **Şimşekli Ufuk**, 1471–1480 **Saklı Buzul Geçidi**, 1481–1490 **Amber Işıklı Körfez**, 1491–1500 **Yıldız Yansımalı Göl**
  - 1501–2990 arasında kullanıcı tarafından verilen 149 manzara adı sırayla kullanılır; tam liste `src/data/thirdJourneyNames.ts` dosyasındadır.
  - 2991–3000: **Mavi Uçurum Gölü: Derinlikler**. Verilen listede 149 ad bulunduğu için son manzara, son adın bir varyasyonu olarak eklenmiştir.
- 1501–3000 arasındaki normal bölümlerde 9 harfli çember ve 9–10 hedef kelime vardır. Her manzarada 8 harfli, 5 hedefli bir dinlenme bölümü bulunur. Yeni bölümlerin harf havuzları önceki bölümlerden ve birbirlerinden farklıdır.
- Bölüm seçimi, performans için her sayfada 100 bölüm gösterir; manzara seçicisinden istenen aralığa doğrudan gidilebilir.
- Manzaralarda temaya özel hareketli ayrıntılar: şelale, kar, yağmur, düşen yapraklar, kelebekler, mercanlar, çiy taneleri, deniz köpüğü, kuşlar, kutup ışıkları, kayan yıldızlar ve şimşekler (`prefers-reduced-motion` açıkken süs animasyonları durur)
- Seçim çizgisi tüm manzaralarda canlı mavi/turkuaz
- Yatay ve dikey kelimelerin ortak harflerden kesiştiği bağlantılı bulmacalar
- Sürükleme ile harf seçimi, geri sürükleyerek seçim iptali ve ortada harf karıştırma
- Altınla ipucu, doğrulanmış Türkçe sözlükten bonus kelimeler, bölüm ödülü
- `localStorage` ile bölüm, bulmaca, ipucu, bonus ve altın kaydı
- Web Audio API ile üretilen seçim, doğru cevap, bonus ve bölüm sonu sesleri

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda Vite tarafından verilen yerel adresi açın.

Üretim derlemesi:

```bash
npm run build
npm run preview
```

> `npm run build` tek dosyalık `dist/index.html` üretir.

## Doğrulama ve Testler

Tüm bölümler uygulama açılırken otomatik doğrulanır. Hatalı bir bölüm oyuncuya açılmaz; bölüm doğrulayıcısı şunları denetler:

- 5–10 hedef kelime
- Kelimelerin bölüm harfleriyle ve harf adetleri aşılmadan yazılabilmesi
- Kesişim harflerinin birebir eşleşmesi
- Tek parça bağlantılı bulmaca
- İstemsiz yan yana kutu / çakışma olmaması
- Tüm hedefler bulunduğunda bulmacanın tamamlanması

Motor ve bölüm testlerini çalıştırmak için:

```bash
npx esbuild scripts/run-tests.ts --bundle --platform=node --format=esm --define:import.meta.env.DEV=false --outfile=/tmp/run-tests.mjs && node /tmp/run-tests.mjs
```

Arayüz duman testi (300 manzaranın tamamı, sayfalı bölüm seçimi ve her manzaradan oyun ekranları hatasız çiziliyor mu):

```bash
npx esbuild scripts/smoke-render.tsx --bundle --platform=node --format=cjs --jsx=automatic --define:import.meta.env.DEV=false --outfile=/tmp/smoke-render.cjs && node /tmp/smoke-render.cjs
```

## Yeni Bölüm Ekleme

1. `src/data/levels.ts` içindeki `LevelDefinition` biçimini kullanabilirsiniz.
2. Yalnızca harf havuzu ve hedef kelimelerle hızlıca bölüm üretmek için `createAutoLevel` fonksiyonu otomatik yerleşim üretir ve doğrular:

```ts
import { createAutoLevel } from './data/levels';

const yeniBolum = createAutoLevel({
  id: 3001,
  theme: 'emerald',
  letters: ['K', 'A', 'L', 'E', 'M'],
  targetWords: ['KALEM', 'KALE', 'ELMA', 'ALEM', 'EMLAK'],
  rewardCoins: 250,
});
```

3. 1001–1500 bölümünün sabit verisi `src/data/levels1500.ts`, 1501–3000 bölümünün verisi `src/data/levels3000.ts` içindedir. Üreticiler TDK başlıklarını (`/tmp/tdk-headwords.json`) ve Türkçe sıklık listesini (`/tmp/tr-freq.txt`) kullanarak yerleşimleri JSON olarak üretir.
4. Hedef kelimeler gerçek Türkçe kelimeler olmalı; özel isim, kısaltma ve rastgele harf dizisi kullanılmamalıdır.

Bonus sistemi yalnızca `src/data/turkishDictionary.ts` içindeki yerleşik kelime listesiyle çalışır; listedeki kelimeler ödüllendirilir, rastgele harf dizileri kabul edilmez. Önceki liste [VikiSözlük kaynaklı kelime listesinden](https://github.com/mertemin/turkish-word-list) ve önceki hedeflerden derlenmiştir. 1501–3000 bölümlerinin hedefleri ayrıca [TDK 12. baskı önbelleğindeki](https://github.com/metwse/tdk-sozluk/releases/tag/12-ham) madde başlarıyla eşleştirilmiştir; sıralama için [Türkçe sıklık listesi](https://github.com/hermitdave/FrequencyWords) kullanılmıştır. Bu kaynaklar oyun sırasında indirilmez.

Yeni bölümleri yeniden üretmek için TDK arşivini `/tmp/tdk.tar.gz`, sıklık listesini `/tmp/tr-freq.txt` olarak indirdikten sonra:

```bash
python3 scripts/prepare-tdk-headwords.py /tmp/tdk.tar.gz /tmp/tdk-headwords.json
npx esbuild scripts/generate-3000-levels.ts --bundle --platform=node --format=esm --define:import.meta.env.DEV=false --outfile=/tmp/generate-3000.mjs
node /tmp/generate-3000.mjs
npx esbuild scripts/verify-third-journey-words.ts --bundle --platform=node --format=esm --outfile=/tmp/verify-words.mjs
node /tmp/verify-words.mjs
```

Üretici `/tmp/levels-3000.json` üretir; uygulama kayıtlı statik bölüm verisini kullanır.

## Kayıt

- Anahtar: `kelime_yolculugu_save_v1`
- Saklananlar: açılan bölüm, aktif bölüm, bulunan kelimeler, ipuçları, bonus kelimeler, altın, tamamlanan bölümler ve ses ayarı.
- Önceki sürümleri (30, 100, 200, 350, 700, 1000 veya 1500 bölüm) bitiren kayıtlar yeni bölümlere otomatik olarak taşınır. İlerleme ve altın korunur.
- Ayarlar ekranındaki **İlerlemeyi Sıfırla** düğmesi kaydı temizler.

## Dosya Yapısı

- `src/data/levels.ts`, `src/data/levels1500.ts` ve `src/data/levels3000.ts` — 3000 bölüm ve otomatik doğrulama
- `src/data/themes.ts`, `src/data/expansionThemes.ts`, `src/data/thirdJourneyThemes.ts` — 300 manzara ve 10 bölümlük bölüm eşlemesi
- `src/data/turkishDictionary.ts` — bonus kelime sözlüğü
- `src/engine/crosswordLayout.ts` — kesişen bulmaca yerleşim motoru
- `src/engine/validator.ts` — bölüm doğrulayıcı
- `src/engine/wordChecker.ts` — kelime, ipucu ve bonus mantığı
- `src/components/` — menü, bölüm seçimi, oyun ekranı, çember, bulmaca, modaller
- `src/utils/` — Türkçe harf kuralları, kayıt ve ses
