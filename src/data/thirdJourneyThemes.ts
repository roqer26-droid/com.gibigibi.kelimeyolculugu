import { region, type PaletteName } from './expansionThemes';
import type { SceneExtra, ScenePalette } from './themes';
import { THIRD_JOURNEY_NAMES } from './thirdJourneyNames';

export type ThirdJourneyThemeId = `journey_${number}`;

function tint(hex: string, amount: number): string {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const value = Number.parseInt(hex.slice(1), 16);
  const target = amount < 0 ? 0 : 255;
  const mix = (channel: number) => Math.round(channel + (target - channel) * Math.abs(amount));
  return `#${[value >> 16, (value >> 8) & 255, value & 255]
    .map((channel) => mix(channel).toString(16).padStart(2, '0'))
    .join('')}`;
}

function appearance(name: string): {
  palette: PaletteName;
  extra?: SceneExtra;
  flowerColor?: string;
  flowerAlt?: string;
  water: boolean;
} {
  const text = name.toLocaleLowerCase('tr-TR');
  const water = /kıyı|sahil|kumsal|koy|körfez|deniz|lagün|ada|takımada|nehir|dere|pınar|şelale|akarsu|göl|gölet|akıntı|boğaz|delta/.test(text);
  const ice = /buz|karlı|donmuş|ayaz|karlar/.test(text);
  const night = /gece|yıldız|ay ışığı|kızıl ay|lacivert/.test(text);
  const dawn = /akşam|şafak|gün ışığı|güneşli|güneş öpücüğü/.test(text);
  const red = /kızıl|kırmızı|volkan|ateş|kil|granit/.test(text);
  const purple = /mor|leylak|sümbül|haşhaş|lavanta/.test(text);
  const haze = /sis|gölge/.test(text);
  const arid = /kum|çöl|bozkır|kanyon|kur(u|u ) nehir/.test(text);
  const forest = /orman|koru|sedir|çam|kestane|meşe|huş|kavak|porsuk|incir|armut/.test(text);

  let palette: PaletteName = night ? 'night' : ice ? 'ice' : water ? 'ocean' :
    red ? 'copper' : purple ? 'lilac' : haze ? 'mist' : arid ? 'gold' :
      forest ? 'forest' : dawn ? 'sunrise' : 'meadow';
  if (water && /pembe|sedef|inci|mercan/.test(text) && !night && !ice) palette = 'coral';
  if (water && /gümüş|sis/.test(text) && !night && !ice) palette = 'mist';

  let extra: SceneExtra | undefined;
  if (/rüzgâr çanı/.test(text)) extra = 'wind_chimes';
  else if (/deniz feneri/.test(text)) extra = 'lighthouse';
  else if (/yaban atları/.test(text)) extra = 'horses';
  else if (/flamingo/.test(text)) extra = 'flamingos';
  else if (/çiçek yağmuru/.test(text)) extra = 'petals';
  else if (/şelale/.test(text) && ice) extra = 'icy_falls';
  else if (/şelale|pınar/.test(text)) extra = 'waterfall';
  else if (/buzdan kemer|taş kemer/.test(text)) extra = 'arches';
  else if (/mağara/.test(text)) extra = ice ? 'crystals' : 'cave';
  else if (/volkan/.test(text)) extra = 'volcano';
  else if (/krater|çanak/.test(text)) extra = 'crater';
  else if (/şimşek|fırtına/.test(text)) extra = 'lightning';
  else if (/yağmur/.test(text)) extra = 'rain';
  else if (/kelebek/.test(text)) extra = 'butterflies';
  else if (/leylek|turna|martı|kırlangıç|albatros|kuzgun|keklik|kartal|kumru|cennetkuş/.test(text)) extra = 'birds';
  else if (/çiçek|çiğ|çiğdem|gelincik|fundalık|sümbül|açelya|zambak|orkide|nergis|fesleğen|nanesi|haşhaş|şakayık|yonca|ayçiçek|safran/.test(text)) extra = 'flowers';
  else if (/yaprak/.test(text)) extra = 'leaves';
  else if (/yıldız|ay ışığı|gece/.test(text)) extra = 'stardust';
  else if (/sazlık|bataklık/.test(text)) extra = 'reeds';
  else if (/kayalık|uçurum|falez|sırt|sütun|taş|kanyon|bazalt/.test(text)) extra = 'cliffs';
  else if (/kum|çöl/.test(text)) extra = 'dunes';
  else if (/sis/.test(text)) extra = 'fog';
  else if (/çam|sedir/.test(text)) extra = 'pinecones';
  else if (forest) extra = 'groves';
  else if (water) extra = 'seafoam';

  let flowerColor = '#dc8da9';
  if (/mavi|mor|sümbül|lavanta/.test(text)) flowerColor = '#9180cc';
  else if (/sarı|nergis|ayçiçeği|safran/.test(text)) flowerColor = '#edc758';
  else if (/kırmızı|kızıl|gelincik/.test(text)) flowerColor = '#d85b5b';
  else if (/beyaz|kardelen/.test(text)) flowerColor = '#fff9ef';

  // Water-only decorations need a lake; ice and night palettes also support dry landscapes.
  if (extra === 'arches' || extra === 'icy_falls' || extra === 'waterfall' || extra === 'flamingos') {
    if (!water && !ice) palette = 'ocean';
  }
  return { palette, extra, flowerColor, flowerAlt: '#fff0c8', water: water || extra === 'arches' || extra === 'icy_falls' || extra === 'waterfall' || extra === 'flamingos' };
}

/** One ten-level region per entry; IDs remain stable when the game is updated. */
export const THIRD_JOURNEY_REGIONS = THIRD_JOURNEY_NAMES.map((name, index) => {
  const style = appearance(name);
  const id = `journey_${1501 + index * 10}` as ThirdJourneyThemeId;
  const base = region(id, name, `${name} manzarasında kelime yolculuğu`, style.palette, style.extra, style.flowerColor, style.flowerAlt);
  const variation = ((index * 13) % 7 - 3) * 0.018;
  const scene: ScenePalette = {
    ...base.scene,
    skyTop: tint(base.scene.skyTop, variation),
    skyMid: tint(base.scene.skyMid, variation),
    farMtn: tint(base.scene.farMtn, variation),
    midHill: tint(base.scene.midHill, variation),
    frontHill: tint(base.scene.frontHill, variation),
    tree: tint(base.scene.tree, variation),
  };
  if (!style.water) {
    delete scene.water;
    delete scene.waterDeep;
  }
  return { ...base, scene };
});