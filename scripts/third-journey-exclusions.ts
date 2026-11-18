// Additional exclusions used only while generating the 1501–3000 puzzles.
export const THIRD_EXCLUSIONS: ReadonlySet<string> = new Set(`
penis vajina genital sevişme lezbiyen biseksüel cinsellik pornografik mastürbasyon
dinamit mafya şiddet acımasız değersiz çürük bitkin edepsiz korkunç salakça sinsiçe
trajedi travma tutuklu ümitsiz üzgün zırhlı ziyan grip idrar martini
ırkçı ırkçılık çatışma savaşçı dindar tanrıça kıyamet nükleer radikal yumruk ödlek
sinsice zalimce düşman ölmüş şiddetle
arjantin tokyo siyahi füze şantaj tümör virüs
cinayet katliam saldırı uyuşturucu kokain eroin fuhuş hırsızlık soygun taciz
işkence kışkırtma tehdit küfür yalan nefret yaralama intihar intikam korkutmak
kahrolsun ölüm öldürmek uyuşturmak kanama hapishane savaş silah patlama
`.trim().split(/\s+/));

// A small final editorial review is applied after generation without reshuffling every puzzle.
export const THIRD_REVIEW_WORDS: ReadonlySet<string> = new Set(
  'SPERM ŞEYTANİ LEŞ BARUT BENCİLCE ÇALINTI PARAZİT'.split(' ')
);