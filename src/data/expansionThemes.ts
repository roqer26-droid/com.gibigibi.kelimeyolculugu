import type { SceneExtra, ScenePalette } from './themes';

interface Palette {
  tileFrom: string;
  tileTo: string;
  tileBorder: string;
  accentText: string;
  selection?: 'blue' | 'turquoise';
  scene: ScenePalette;
}

const palettes = {
  lilac: {
    tileFrom: '#9160b8', tileTo: '#704193', tileBorder: '#553171', accentText: '#452360',
    scene: { kind: 'valley', skyTop: '#a9bbed', skyMid: '#e2d5f4', skyBottom: '#fbf6ff', sun: '#fff5d9', sunGlow: '#ffe4ae', farMtn: '#b6a6d5', midHill: '#a8d5b0', frontHill: '#579a72', tree: '#315e4a' },
  },
  forest: {
    tileFrom: '#397a62', tileTo: '#28604c', tileBorder: '#1c4938', accentText: '#123e30',
    scene: { kind: 'valley', skyTop: '#82c9d8', skyMid: '#c3e9df', skyBottom: '#f1faf1', sun: '#fff8d8', sunGlow: '#e8f2b5', farMtn: '#8bc5af', midHill: '#62a984', frontHill: '#317756', tree: '#1d4e3b' },
  },
  coral: {
    tileFrom: '#d36362', tileTo: '#ad474e', tileBorder: '#87343b', accentText: '#702730', selection: 'turquoise',
    scene: { kind: 'lake', skyTop: '#9fd8ed', skyMid: '#e9d9dc', skyBottom: '#fff4e9', sun: '#fff8e6', sunGlow: '#ffd1ad', farMtn: '#d6b2b5', midHill: '#ad8da0', frontHill: '#edc4ad', tree: '#3a745c', water: '#66c2c4', waterDeep: '#287e96' },
  },
  sunrise: {
    tileFrom: '#d97a4e', tileTo: '#b75a37', tileBorder: '#914326', accentText: '#7b351e',
    scene: { kind: 'sunset', skyTop: '#b991d0', skyMid: '#f3b29d', skyBottom: '#ffe6b6', sun: '#fff4d9', sunGlow: '#ffd08d', farMtn: '#d3a2a3', midHill: '#cd977b', frontHill: '#a9654f', tree: '#5f493f', sunY: 620 },
  },
  olive: {
    tileFrom: '#819254', tileTo: '#617539', tileBorder: '#4d5f2c', accentText: '#384a1f',
    scene: { kind: 'valley', skyTop: '#add4e6', skyMid: '#e3e8d5', skyBottom: '#fff7df', sun: '#fff8cf', sunGlow: '#fae8a5', farMtn: '#bdc99b', midHill: '#9caf70', frontHill: '#788c4c', tree: '#52633b' },
  },
  blueflower: {
    tileFrom: '#5b82c4', tileTo: '#3e65a4', tileBorder: '#304d81', accentText: '#233d6b',
    scene: { kind: 'valley', skyTop: '#a3d5f1', skyMid: '#d9e9f7', skyBottom: '#f8fcf5', sun: '#fffbe2', sunGlow: '#ffedb3', farMtn: '#a5bfe0', midHill: '#9fd6b5', frontHill: '#5ba981', tree: '#326c56' },
  },
  ocean: {
    tileFrom: '#287fa3', tileTo: '#1b6382', tileBorder: '#164b66', accentText: '#113c55', selection: 'turquoise',
    scene: { kind: 'lake', skyTop: '#81c9e3', skyMid: '#c8e8ef', skyBottom: '#effaf4', sun: '#fffbe9', sunGlow: '#f7eac2', farMtn: '#9fb9ce', midHill: '#668c9d', frontHill: '#d5d6b8', tree: '#386e64', water: '#5cb9cb', waterDeep: '#237698' },
  },
  copper: {
    tileFrom: '#b46a49', tileTo: '#925136', tileBorder: '#713a26', accentText: '#5d2d1d',
    scene: { kind: 'sunset', skyTop: '#c88f7a', skyMid: '#efc29d', skyBottom: '#fff2d4', sun: '#fff3d6', sunGlow: '#ffc39e', farMtn: '#bd8b76', midHill: '#aa6c51', frontHill: '#8f513c', tree: '#593c32', sunY: 620 },
  },
  dew: {
    tileFrom: '#4a9b8e', tileTo: '#347b70', tileBorder: '#285f58', accentText: '#1d4b45', selection: 'turquoise',
    scene: { kind: 'valley', skyTop: '#a6d9e8', skyMid: '#d7f0ed', skyBottom: '#f9fcf3', sun: '#fffbe5', sunGlow: '#e9f8c7', farMtn: '#a2cbc5', midHill: '#85c9a9', frontHill: '#4e9c75', tree: '#326e58' },
  },
  rose: {
    tileFrom: '#c46984', tileTo: '#a34d6d', tileBorder: '#7f3854', accentText: '#682b44',
    scene: { kind: 'valley', skyTop: '#c3d4eb', skyMid: '#f2d9e3', skyBottom: '#fff8f0', sun: '#fff7df', sunGlow: '#ffe0c5', farMtn: '#c8b1c5', midHill: '#a5d1ac', frontHill: '#62a87d', tree: '#356e50' },
  },
  night: {
    tileFrom: '#485b91', tileTo: '#344477', tileBorder: '#26345f', accentText: '#1b2850', selection: 'turquoise',
    scene: { kind: 'night', skyTop: '#111b3d', skyMid: '#293b70', skyBottom: '#7b769f', sun: '#fff8dd', sunGlow: '#d6d5f7', farMtn: '#3e4e78', midHill: '#30466b', frontHill: '#202f52', tree: '#172745', water: '#375d81', waterDeep: '#1b3655', stars: true },
  },
  gold: {
    tileFrom: '#bd9144', tileTo: '#987031', tileBorder: '#745321', accentText: '#5c4118',
    scene: { kind: 'sunset', skyTop: '#e2b587', skyMid: '#f3d5a3', skyBottom: '#fff5d9', sun: '#fffbe8', sunGlow: '#f9dc98', farMtn: '#d9bb8b', midHill: '#c9a36d', frontHill: '#ab8050', tree: '#70553a', sunY: 620 },
  },
  ice: {
    tileFrom: '#5b98b5', tileTo: '#3c7898', tileBorder: '#2c5c7a', accentText: '#204c69', selection: 'turquoise',
    scene: { kind: 'lake', skyTop: '#9bd2ec', skyMid: '#d0edf5', skyBottom: '#f5fcff', sun: '#ffffff', sunGlow: '#e4f7ff', farMtn: '#c0dbe9', midHill: '#9cc9d7', frontHill: '#d6eff2', tree: '#3d6e78', water: '#87cbda', waterDeep: '#468ca8' },
  },
  mist: {
    tileFrom: '#768a91', tileTo: '#5a6e76', tileBorder: '#41545e', accentText: '#344650', selection: 'turquoise',
    scene: { kind: 'lake', skyTop: '#acbdc8', skyMid: '#d8e2e3', skyBottom: '#f5f9f5', sun: '#fffdf0', sunGlow: '#f8f7e5', farMtn: '#aabdc0', midHill: '#809d98', frontHill: '#6b8a82', tree: '#425f59', water: '#8fb6bd', waterDeep: '#527f8d' },
  },
  meadow: {
    tileFrom: '#6a9f64', tileTo: '#4d8050', tileBorder: '#3a663e', accentText: '#2e5632',
    scene: { kind: 'valley', skyTop: '#9ed6ea', skyMid: '#d8eef0', skyBottom: '#fbfcf1', sun: '#fffce0', sunGlow: '#fff1ae', farMtn: '#acd0bc', midHill: '#a5d59d', frontHill: '#6caf75', tree: '#38794e' },
  },
  storm: {
    tileFrom: '#586789', tileTo: '#3f4d6e', tileBorder: '#2d3855', accentText: '#202a45', selection: 'turquoise',
    scene: { kind: 'sunset', skyTop: '#47546f', skyMid: '#7f8ba4', skyBottom: '#d6cad0', sun: '#f5ebdf', sunGlow: '#f5d7ad', farMtn: '#687289', midHill: '#535e75', frontHill: '#3d485e', tree: '#293749', sunY: 620 },
  },
  rainbow: {
    tileFrom: '#9a68b2', tileTo: '#795088', tileBorder: '#60396f', accentText: '#4b2959',
    scene: { kind: 'valley', skyTop: '#91d1e7', skyMid: '#d6eaf2', skyBottom: '#fbf8ed', sun: '#fffbe0', sunGlow: '#fff0b0', farMtn: '#c4b4d4', midHill: '#a6d4b4', frontHill: '#6cac81', tree: '#396f52' },
  },
} as const satisfies Record<string, Palette>;

export type PaletteName = keyof typeof palettes;

export function region<const Id extends string>(
  id: Id,
  name: string,
  subtitle: string,
  palette: PaletteName,
  extra?: SceneExtra,
  flowerColor?: string,
  flowerAlt?: string,
) {
  const base: Palette = palettes[palette];
  return {
    id, name, subtitle,
    tileFrom: base.tileFrom,
    tileTo: base.tileTo,
    tileBorder: base.tileBorder,
    accentText: base.accentText,
    selection: base.selection,
    scene: {
      ...base.scene,
      ...(extra ? { extra } : {}),
      ...(extra === 'stardust' ? { stars: true } : {}),
      ...(flowerColor ? { flowerColor } : {}),
      ...(flowerAlt ? { flowerAlt } : {}),
    },
  };
}

/** 1001–1500: each entry is one ten-level region, in journey order. */
export const EXPANSION_REGIONS = [
  region('lilac_hills', 'Leylak Tepeleri', 'Leylak kokulu yamaçlarda sakin bir yol', 'lilac', 'flowers', '#a77ac7', '#f5e8ff'),
  region('pinecone_valley', 'Çam Kozalağı Vadisi', 'Çamların ve kozalakların gölgelediği vadi', 'forest', 'pinecones'),
  region('scarlet_coral_reef', 'Al Mercan Resifi', 'Al mercanların renklendirdiği berrak sular', 'coral', 'reef'),
  region('sunrise_plateau', 'Gün Doğumu Platosu', 'Güneşin ilk ışıklarıyla aydınlanan plato', 'sunrise'),
  region('hazelnut_grove', 'Fındık Korusu', 'Fındık ağaçlarıyla dolu yeşil bir koru', 'olive', 'groves'),
  region('bluebell_meadow', 'Mavi Çan Çayırı', 'Mavi çan çiçeklerinin sallandığı çayır', 'blueflower', 'flowers', '#588bc8', '#e7f4ff'),
  region('swallow_cove', 'Kırlangıç Koyu', 'Kırlangıçların süzüldüğü sakin koy', 'ocean', 'birds'),
  region('copper_mountains', 'Bakır Dağlar', 'Bakır renkli kayalar ve uzak dağlar', 'copper', 'cliffs'),
  region('dewdrop_garden', 'Çiy Taneleri Bahçesi', 'Sabah çiyinin parladığı yeşil bahçe', 'dew', 'dew'),
  region('carnation_slope', 'Karanfil Yamacı', 'Renk renk karanfillerle kaplı yamaç', 'rose', 'flowers', '#db6b83', '#fff0d5'),
  region('sweetgum_forest', 'Sığla Ormanı', 'Sığla ağaçlarının gölgesinde serin orman', 'forest', 'groves'),
  region('lily_pond', 'Zambak Göleti', 'Su zambaklarıyla çevrili sessiz gölet', 'ocean', 'lotus', '#f7e0f0', '#f8d979'),
  region('red_maple_valley', 'Kızıl Akçaağaç Vadisi', 'Kızıl yaprakların kapladığı sonbahar vadisi', 'copper', 'leaves'),
  region('moonstone_beach', 'Aytaşı Kumsalı', 'Ay ışığında parlayan açık renkli kumsal', 'night', 'stardust'),
  region('dune_flower_plain', 'Kumul Çiçekleri Ovası', 'Kumulların arasında açan kır çiçekleri', 'gold', 'dune_flowers', '#f6e6b4', '#d86d7e'),
  region('breakwater_rocks', 'Dalgakıran Kayalıkları', 'Dalgaların köpürdüğü kıyı kayalıkları', 'ocean', 'seafoam'),
  region('tamarisk_shore', 'Ilgın Sahili', 'Ilgın ağaçlarının gölgelediği sahil', 'coral', 'groves'),
  region('summit_sea', 'Doruklar Denizi', 'Dorukların arasında uzanan masmavi deniz', 'ocean', 'cliffs'),
  region('stone_pine_grove', 'Fıstık Çamı Korusu', 'Fıstık çamlarıyla dolu sıcak bir koru', 'olive', 'pinecones'),
  region('mystic_cave', 'Sırlı Mağara', 'Işığın kayalara yansıdığı gizemli mağara', 'mist', 'cave'),
  region('thyme_plateau', 'Kekik Yaylası', 'Kekik kokularıyla dolu serin yayla', 'olive', 'flowers', '#ae9ac2', '#fff0ca'),
  region('pelican_lagoon', 'Pelikan Lagünü', 'Pelikanların dinlendiği geniş lagün', 'ocean', 'birds'),
  region('ruby_sunset', 'Yakut Gün Batımı', 'Yakut renklerine boyanan akşam göğü', 'copper', 'stardust'),
  region('weeping_willow_shore', 'Salkım Söğüt Kıyısı', 'Söğüt dallarının suya uzandığı kıyı', 'ocean', 'groves'),
  region('wild_rose_valley', 'Yaban Gülü Vadisi', 'Yaban güllerinin açtığı huzurlu vadi', 'rose', 'flowers', '#e68a9c', '#fff3d4'),
  region('glacial_waterfall', 'Buzul Şelalesi', 'Buzlarla çevrili şelale ve serin sular', 'ice', 'icy_falls'),
  region('desert_night_oasis', 'Çöl Gecesi Vahası', 'Yıldızlı çöl gecesinde sessiz vaha', 'night', 'palms'),
  region('echo_cliff', 'Uğultulu Uçurum', 'Rüzgârın kayalarda yankılandığı uçurum', 'storm', 'cliffs'),
  region('orchid_forest', 'Orkide Ormanı', 'Yabani orkidelerin süslediği yeşil orman', 'lilac', 'flowers', '#d897c9', '#fff3d5'),
  region('silver_sand_island', 'Gümüş Kum Adası', 'Gümüş renkli kumlarıyla sessiz bir ada', 'mist', 'seafoam'),
  region('wildflower_plateau', 'Kır Çiçekleri Platosu', 'Rengârenk kır çiçekleriyle dolu plato', 'meadow', 'flowers', '#e88ba7', '#f9e7a8'),
  region('olive_blossom_garden', 'Zeytin Çiçeği Bahçesi', 'Zeytin çiçeklerinin kokusuyla dolu bahçe', 'olive', 'groves'),
  region('misty_fjord', 'Sisler İçindeki Fiyort', 'Sisin sardığı derin ve sessiz fiyort', 'mist', 'fog'),
  region('cedar_mountains', 'Sedir Dağları', 'Sedir ağaçlarının yükseldiği dağlar', 'forest', 'cliffs'),
  region('seafoam_cove', 'Deniz Köpüğü Koyu', 'Köpüklerin kıyıya usulca ulaştığı koy', 'ocean', 'seafoam'),
  region('rainbow_cliffs', 'Gökkuşağı Kayalıkları', 'Gökkuşağı altında rengârenk kayalar', 'rainbow', 'rainbow_cliffs'),
  region('wild_apple_grove', 'Yaban Elması Korusu', 'Yaban elması ağaçlarıyla çevrili koru', 'olive', 'groves'),
  region('mottled_lake', 'Alaca Göl', 'Değişen gökyüzünü yansıtan alaca göl', 'coral', 'seafoam'),
  region('fern_cave', 'Eğrelti Mağarası', 'Eğrelti yapraklarının süslediği mağara', 'forest', 'cave'),
  region('cool_spring_valley', 'Serin Pınar Vadisi', 'Kaynak suyunun aktığı serin vadi', 'ocean', 'waterfall'),
  region('stork_plain', 'Leylekler Ovası', 'Leyleklerin gökyüzünde süzüldüğü geniş ova', 'meadow', 'birds'),
  region('purple_iris_marsh', 'Mor Süsen Bataklığı', 'Mor süsen çiçekleri ve sazlıklarla çevrili göl', 'ocean', 'lotus', '#a982d3', '#f8df8e'),
  region('wind_carved_rocks', 'Rüzgârın Oyduğu Kayalar', 'Rüzgârın şekillendirdiği doğal taşlar', 'gold', 'cliffs'),
  region('red_earth_hills', 'Kızıl Toprak Tepeleri', 'Kızıl toprağın ısıttığı dalgalı tepeler', 'copper', 'dunes'),
  region('blossoming_cherry_path', 'Çiçekli Kiraz Yolu', 'Kiraz çiçekleri altında uzanan patika', 'rose', 'flowers', '#f3b2c8', '#fff5e5'),
  region('sand_lily_coast', 'Kum Zambağı Sahili', 'Kum zambaklarının açtığı sakin sahil', 'ocean', 'lotus', '#fff8ec', '#f1ce78'),
  region('lightning_horizon', 'Şimşekli Ufuk', 'Uzak ufukta şimşeklerin aydınlattığı gökyüzü', 'storm', 'lightning'),
  region('hidden_glacier_pass', 'Saklı Buzul Geçidi', 'Buzlarla çevrili saklı bir dağ geçidi', 'ice', 'crystals'),
  region('amber_glow_bay', 'Amber Işıklı Körfez', 'Amber ışıkların suya yansıdığı körfez', 'coral', 'seafoam'),
  region('star_reflection_lake', 'Yıldız Yansımalı Göl', 'Yıldızların suya yansıdığı sakin göl', 'night', 'stardust'),
] as const;

export type ExpansionThemeId = (typeof EXPANSION_REGIONS)[number]['id'];