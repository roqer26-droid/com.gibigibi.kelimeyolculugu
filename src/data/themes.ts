import { ThemeId } from '../engine/types';
import { EXPANSION_REGIONS } from './expansionThemes';
import type { ExpansionThemeId } from './expansionThemes';
import { THIRD_JOURNEY_REGIONS } from './thirdJourneyThemes';
import type { ThirdJourneyThemeId } from './thirdJourneyThemes';

export type SceneKind = 'valley' | 'lake' | 'sunset' | 'night';

/** Manzaraya özgü ek ayrıntı katmanı */
export type SceneExtra =
  | 'flowers'
  | 'waterfall'
  | 'groves'
  | 'leaves'
  | 'snow'
  | 'reeds'
  | 'butterflies'
  | 'moss'
  | 'rain'
  | 'volcano'
  | 'rainbow'
  | 'windmill'
  | 'fireflies'
  | 'lotus'
  | 'bamboo'
  | 'aurora'
  | 'wheat'
  | 'crystals'
  | 'arches'
  | 'wisteria'
  | 'fog'
  | 'cliffs'
  | 'palms'
  | 'salt'
  | 'crater'
  | 'stardust'
  | 'dunes'
  | 'pinecones'
  | 'reef'
  | 'birds'
  | 'dew'
  | 'dune_flowers'
  | 'seafoam'
  | 'cave'
  | 'icy_falls'
  | 'rainbow_cliffs'
  | 'lightning'
  | 'lighthouse'
  | 'horses'
  | 'flamingos'
  | 'petals'
  | 'wind_chimes';

export interface ScenePalette {
  kind: SceneKind;
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  sun: string;
  sunGlow: string;
  farMtn: string;
  midHill: string;
  frontHill: string;
  tree: string;
  /** Tanımlıysa ön planda tepeler yerine su (göl/koy/deniz) çizilir */
  water?: string;
  waterDeep?: string;
  stars?: boolean;
  sunY?: number;
  extra?: SceneExtra;
  flowerColor?: string;
  flowerAlt?: string;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  // Bulmaca kutusu renkleri
  filledTileBg: string;
  filledTileBorder: string;
  filledTileShadow: string;
  filledTileText: string;
  hintTileBg: string;
  hintTileBorder: string;
  hintTileText: string;
  // Seçim çizgisi ve aktif taş renkleri (her temada canlı mavi veya turkuaz)
  lineColor: string;
  lineGlow: string;
  activeNodeBg: string;
  activeNodeShadow: string;
  previewPillBg: string;
  // Arayüz vurgu renkleri
  accentBg: string;
  accentHover: string;
  accentText: string;
  badgeBg: string;
  headerPillBg: string;
  bannerBg: string;
  // Doğa arka planı
  scene: ScenePalette;
}

interface Palette {
  tileFrom: string;
  tileTo: string;
  tileBorder: string;
  /** Verilmezse kutu renkleri kullanılır */
  accentFrom?: string;
  accentTo?: string;
  accentHover?: string;
  accentText: string;
  bannerBg?: string;
  selection?: 'blue' | 'turquoise';
  scene: ScenePalette;
}

const SELECTION_COLORS = {
  blue: { line: '#0ea5e9', from: '#38bdf8', to: '#0284c7' },
  turquoise: { line: '#06b6d4', from: '#22d3ee', to: '#0891b2' },
} as const;

function makeTheme(id: ThemeId, name: string, subtitle: string, p: Palette): ThemeConfig {
  const sel = SELECTION_COLORS[p.selection ?? 'blue'];
  const accentFrom = p.accentFrom ?? p.tileFrom;
  const accentTo = p.accentTo ?? p.tileTo;
  return {
    id,
    name,
    subtitle,
    filledTileBg: `linear-gradient(180deg, ${p.tileFrom} 0%, ${p.tileTo} 100%)`,
    filledTileBorder: p.tileBorder,
    filledTileShadow: `0 4px 0 ${p.tileBorder}, 0 8px 16px ${p.tileBorder}40`,
    filledTileText: '#ffffff',
    hintTileBg: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)',
    hintTileBorder: '#d97706',
    hintTileText: '#92400e',
    lineColor: sel.line,
    lineGlow: `${sel.line}73`,
    activeNodeBg: `linear-gradient(180deg, ${sel.from} 0%, ${sel.to} 100%)`,
    activeNodeShadow: `0 6px 16px ${sel.to}73`,
    previewPillBg: `linear-gradient(180deg, ${sel.from} 0%, ${sel.to} 100%)`,
    accentBg: `linear-gradient(180deg, ${accentFrom} 0%, ${accentTo} 100%)`,
    accentHover: p.accentHover ?? p.tileBorder,
    accentText: p.accentText,
    badgeBg: `${accentTo}e6`,
    headerPillBg: 'rgba(255, 255, 255, 0.88)',
    bannerBg: p.bannerBg ?? `linear-gradient(90deg, ${accentFrom} 0%, ${accentTo} 100%)`,
    scene: p.scene,
  };
}

/** Manzara paletini kısa biçimde yazmak için yardımcı */
function scn(
  kind: SceneKind,
  sky: [string, string, string],
  sun: [string, string],
  land: [string, string, string, string], // uzak dağ, orta tepe, ön tepe, ağaç
  more: Partial<ScenePalette> = {}
): ScenePalette {
  return {
    kind,
    skyTop: sky[0],
    skyMid: sky[1],
    skyBottom: sky[2],
    sun: sun[0],
    sunGlow: sun[1],
    farMtn: land[0],
    midHill: land[1],
    frontHill: land[2],
    tree: land[3],
    ...more,
  };
}

const expansionThemes = Object.fromEntries(
  EXPANSION_REGIONS.map((region) => [
    region.id,
    makeTheme(region.id, region.name, region.subtitle, region),
  ])
) as Record<ExpansionThemeId, ThemeConfig>;

const thirdJourneyThemes = Object.fromEntries(
  THIRD_JOURNEY_REGIONS.map((entry) => [entry.id, makeTheme(entry.id, entry.name, entry.subtitle, entry)])
) as Record<ThirdJourneyThemeId, ThemeConfig>;

export const THEMES: Record<ThemeId, ThemeConfig> = {
  ...expansionThemes,
  ...thirdJourneyThemes,
  // ----------------------------------------------------------------- 1–100
  emerald: makeTheme('emerald', 'Zümrüt Vadi', 'Yemyeşil tepeler ve berrak gökyüzü', {
    tileFrom: '#10b981', tileTo: '#059669', tileBorder: '#047857', accentText: '#065f46',
    scene: {
      kind: 'valley',
      skyTop: '#38bdf8', skyMid: '#8be0ff', skyBottom: '#eefcf2',
      sun: '#fffbeb', sunGlow: '#fef08a',
      farMtn: '#7dd3fc', midHill: '#4ade80', frontHill: '#16a34a', tree: '#15803d',
    },
  }),
  waterfall: makeTheme('waterfall', 'Saklı Şelale', 'Turkuaz sular ve serin şelale sesi', {
    tileFrom: '#14b8a6', tileTo: '#0d9488', tileBorder: '#0f766e', accentText: '#134e4a',
    scene: {
      kind: 'lake',
      skyTop: '#0ea5e9', skyMid: '#7dd3fc', skyBottom: '#e0f2fe',
      sun: '#ffffff', sunGlow: '#e0f2fe',
      farMtn: '#67e8f9', midHill: '#2dd4bf', frontHill: '#0d9488', tree: '#0f766e',
      water: '#06b6d4', waterDeep: '#0369a1',
      extra: 'waterfall',
    },
  }),
  azure: makeTheme('azure', 'Masmavi Koy', 'Derin mavi koy ve sakin dalgalar', {
    tileFrom: '#2563eb', tileTo: '#1d4ed8', tileBorder: '#1e40af', accentText: '#1e3a8a',
    selection: 'turquoise',
    scene: {
      kind: 'lake',
      skyTop: '#0284c7', skyMid: '#38bdf8', skyBottom: '#e0f2fe',
      sun: '#ffffff', sunGlow: '#e0f2fe',
      farMtn: '#93c5fd', midHill: '#3b82f6', frontHill: '#1d4ed8', tree: '#1e40af',
      water: '#0284c7', waterDeep: '#075985',
    },
  }),
  lavender: makeTheme('lavender', 'Lavanta Tepeleri', 'Mor lavanta tarlaları ve tatlı esinti', {
    tileFrom: '#8b5cf6', tileTo: '#7c3aed', tileBorder: '#6d28d9', accentText: '#4c1d95',
    scene: {
      kind: 'valley',
      skyTop: '#c4b5fd', skyMid: '#e9d5ff', skyBottom: '#faf5ff',
      sun: '#fef3c7', sunGlow: '#fde68a',
      farMtn: '#c4b5fd', midHill: '#a78bfa', frontHill: '#7c3aed', tree: '#6d28d9',
    },
  }),
  silent: makeTheme('silent', 'Sessiz Göl', 'Gri-mavi göl ve dingin sessizlik', {
    tileFrom: '#64748b', tileTo: '#475569', tileBorder: '#334155', accentText: '#1e293b',
    scene: {
      kind: 'lake',
      skyTop: '#94a3b8', skyMid: '#cbd5e1', skyBottom: '#f1f5f9',
      sun: '#f8fafc', sunGlow: '#e2e8f0',
      farMtn: '#cbd5e1', midHill: '#94a3b8', frontHill: '#64748b', tree: '#475569',
      water: '#64748b', waterDeep: '#334155',
    },
  }),
  golden: makeTheme('golden', 'Altın Kumsal', 'Altın sarısı kum ve sıcak güneş', {
    tileFrom: '#e59a06', tileTo: '#c27803', tileBorder: '#9a5f02', accentText: '#78350f',
    scene: {
      kind: 'sunset',
      skyTop: '#fbbf24', skyMid: '#fde68a', skyBottom: '#fffbeb',
      sun: '#fffbeb', sunGlow: '#fde047',
      farMtn: '#fcd34d', midHill: '#fbbf24', frontHill: '#d97706', tree: '#b45309',
      sunY: 620,
    },
  }),
  misty: makeTheme('misty', 'Sisli Dağlar', 'Sisler içinde yükselen görkemli dağlar', {
    tileFrom: '#78716c', tileTo: '#57534e', tileBorder: '#44403c', accentText: '#292524',
    scene: {
      kind: 'valley',
      skyTop: '#d6d3d1', skyMid: '#e7e5e4', skyBottom: '#fafaf9',
      sun: '#fafaf9', sunGlow: '#e7e5e4',
      farMtn: '#a8a29e', midHill: '#78716c', frontHill: '#57534e', tree: '#44403c',
    },
  }),
  coral: makeTheme('coral', 'Mercan Adası', 'Mercan pembesi sular ve tropik huzur', {
    tileFrom: '#f43f5e', tileTo: '#e11d48', tileBorder: '#be123c', accentText: '#881337',
    scene: {
      kind: 'lake',
      skyTop: '#fda4af', skyMid: '#fecdd3', skyBottom: '#fff1f2',
      sun: '#fffbeb', sunGlow: '#ffe4e6',
      farMtn: '#fda4af', midHill: '#fb7185', frontHill: '#e11d48', tree: '#be123c',
      water: '#fb7185', waterDeep: '#be123c',
    },
  }),
  silver: makeTheme('silver', 'Gümüş Nehir', 'Gümüş gibi parlayan sakin nehir', {
    tileFrom: '#8292a8', tileTo: '#5f6f85', tileBorder: '#475569', accentText: '#334155',
    scene: {
      kind: 'lake',
      skyTop: '#cbd5e1', skyMid: '#e2e8f0', skyBottom: '#f8fafc',
      sun: '#ffffff', sunGlow: '#f1f5f9',
      farMtn: '#cbd5e1', midHill: '#94a3b8', frontHill: '#64748b', tree: '#475569',
      water: '#94a3b8', waterDeep: '#475569',
    },
  }),
  plateau: makeTheme('plateau', 'Güneşli Yayla', 'Güneşli yaylalar ve ferah rüzgâr', {
    tileFrom: '#65a30d', tileTo: '#4d7c0f', tileBorder: '#3f6212', accentText: '#365314',
    scene: {
      kind: 'valley',
      skyTop: '#7dd3fc', skyMid: '#bae6fd', skyBottom: '#f7fee7',
      sun: '#fef9c3', sunGlow: '#fef08a',
      farMtn: '#a3e635', midHill: '#84cc16', frontHill: '#65a30d', tree: '#4d7c0f',
    },
  }),

  // --------------------------------------------------------------- 101–200
  pine: makeTheme('pine', 'Çam Ormanı', 'Derin yeşil çam ormanı ve kuş sesleri', {
    tileFrom: '#166534', tileTo: '#14532d', tileBorder: '#052e16', accentText: '#052e16',
    scene: {
      kind: 'valley',
      skyTop: '#86efac', skyMid: '#bbf7d0', skyBottom: '#f0fdf4',
      sun: '#fef9c3', sunGlow: '#fef08a',
      farMtn: '#4ade80', midHill: '#22c55e', frontHill: '#15803d', tree: '#14532d',
    },
  }),
  canyon: makeTheme('canyon', 'Kızıl Kanyon', 'Kızıl kayalar ve derin kanyonlar', {
    tileFrom: '#dc2626', tileTo: '#b91c1c', tileBorder: '#7f1d1d', accentText: '#450a0a',
    scene: {
      kind: 'sunset',
      skyTop: '#7c2d12', skyMid: '#c2410c', skyBottom: '#fdba74',
      sun: '#ffedd5', sunGlow: '#fb923c',
      farMtn: '#9a3412', midHill: '#c2410c', frontHill: '#7c2d12', tree: '#431407',
      sunY: 640,
    },
  }),
  lily: makeTheme('lily', 'Nilüfer Bahçesi', 'Pembe nilüferler ve sakin gölet', {
    tileFrom: '#ec4899', tileTo: '#db2777', tileBorder: '#9d174d', accentText: '#831843',
    scene: {
      kind: 'lake',
      skyTop: '#fbcfe8', skyMid: '#fce7f3', skyBottom: '#fdf2f8',
      sun: '#fffbeb', sunGlow: '#fce7f3',
      farMtn: '#f9a8d4', midHill: '#f472b6', frontHill: '#db2777', tree: '#9d174d',
      water: '#f472b6', waterDeep: '#be185d',
    },
  }),
  glacier: makeTheme('glacier', 'Buzul Vadisi', 'Buz mavisi vadiler ve bembeyaz zirveler', {
    tileFrom: '#22d3ee', tileTo: '#0891b2', tileBorder: '#0e7490', accentText: '#164e63',
    scene: {
      kind: 'valley',
      skyTop: '#67e8f9', skyMid: '#a5f3fc', skyBottom: '#ecfeff',
      sun: '#ffffff', sunGlow: '#cffafe',
      farMtn: '#a5f3fc', midHill: '#67e8f9', frontHill: '#0891b2', tree: '#155e75',
    },
  }),
  desert: makeTheme('desert', 'Yıldızlı Çöl', 'Yıldızlar altında sessiz çöl gecesi', {
    tileFrom: '#6366f1', tileTo: '#4f46e5', tileBorder: '#3730a3', accentText: '#312e81',
    scene: {
      kind: 'night',
      skyTop: '#1e1b4b', skyMid: '#3730a3', skyBottom: '#7c3aed',
      sun: '#fef9c3', sunGlow: '#a5b4fc',
      farMtn: '#4338ca', midHill: '#3730a3', frontHill: '#1e1b4b', tree: '#312e81',
      stars: true,
    },
  }),
  meadow: makeTheme('meadow', 'Bahar Çayırı', 'Çiçekli bahar çayırı ve kelebekler', {
    tileFrom: '#22c55e', tileTo: '#16a34a', tileBorder: '#15803d', accentText: '#14532d',
    scene: {
      kind: 'valley',
      skyTop: '#7dd3fc', skyMid: '#bae6fd', skyBottom: '#f0fdf4',
      sun: '#fef9c3', sunGlow: '#fef08a',
      farMtn: '#86efac', midHill: '#4ade80', frontHill: '#22c55e', tree: '#15803d',
      extra: 'flowers', flowerColor: '#f472b6', flowerAlt: '#fde047',
    },
  }),
  coast: makeTheme('coast', 'Gün Batımı Sahili', 'Turuncu gün batımı ve sakin sahil', {
    tileFrom: '#f97316', tileTo: '#ea580c', tileBorder: '#c2410c', accentText: '#7c2d12',
    scene: {
      kind: 'sunset',
      skyTop: '#7c3aed', skyMid: '#ec4899', skyBottom: '#fdba74',
      sun: '#ffedd5', sunGlow: '#fb923c',
      farMtn: '#9d4edd', midHill: '#db2777', frontHill: '#9d174d', tree: '#831843',
      sunY: 635,
    },
  }),
  cloud: makeTheme('cloud', 'Bulut Zirvesi', 'Bulutların üzerinde yükselen zirve', {
    tileFrom: '#0ea5e9', tileTo: '#0284c7', tileBorder: '#0369a1', accentText: '#075985',
    selection: 'turquoise',
    scene: {
      kind: 'valley',
      skyTop: '#38bdf8', skyMid: '#bae6fd', skyBottom: '#f0f9ff',
      sun: '#ffffff', sunGlow: '#e0f2fe',
      farMtn: '#bae6fd', midHill: '#7dd3fc', frontHill: '#38bdf8', tree: '#0369a1',
    },
  }),
  oasis: makeTheme('oasis', 'Saklı Vaha', 'Çölde saklı serin vaha ve palmiyeler', {
    tileFrom: '#d97706', tileTo: '#b45309', tileBorder: '#92400e', accentText: '#78350f',
    scene: {
      kind: 'sunset',
      skyTop: '#f59e0b', skyMid: '#fbbf24', skyBottom: '#fef3c7',
      sun: '#fffbeb', sunGlow: '#fde047',
      farMtn: '#d97706', midHill: '#b45309', frontHill: '#92400e', tree: '#78350f',
      sunY: 620,
    },
  }),
  moonlight: makeTheme('moonlight', 'Mehtap Körfezi', 'Mehtap altında parlayan koy', {
    tileFrom: '#334155', tileTo: '#1e293b', tileBorder: '#0f172a', accentText: '#0f172a',
    scene: {
      kind: 'night',
      skyTop: '#0f172a', skyMid: '#1e3a5f', skyBottom: '#334155',
      sun: '#e2e8f0', sunGlow: '#94a3b8',
      farMtn: '#334155', midHill: '#1e293b', frontHill: '#0f172a', tree: '#1e293b',
      water: '#1e3a5f', waterDeep: '#0f172a',
      stars: true,
    },
  }),

  // --------------------------------------------------------------- 201–350
  violet: makeTheme('violet', 'Menekşe Vadisi', 'Mor menekşeler ve yumuşak vadi esintisi', {
    tileFrom: '#9333ea', tileTo: '#7e22ce', tileBorder: '#6b21a8', accentText: '#581c87',
    scene: {
      kind: 'valley',
      skyTop: '#818cf8', skyMid: '#c4b5fd', skyBottom: '#ede9fe',
      sun: '#fef9c3', sunGlow: '#fde68a',
      farMtn: '#a5b4fc', midHill: '#6ee7b7', frontHill: '#10b981', tree: '#047857',
      extra: 'flowers', flowerColor: '#7c3aed', flowerAlt: '#e9d5ff',
    },
  }),
  crystal: makeTheme('crystal', 'Kristal Şelale', 'Kristal berraklığında dökülen sular', {
    tileFrom: '#0ea5e9', tileTo: '#0284c7', tileBorder: '#075985', accentText: '#0c4a6e',
    selection: 'turquoise',
    scene: {
      kind: 'lake',
      skyTop: '#38bdf8', skyMid: '#a5f3fc', skyBottom: '#ecfeff',
      sun: '#ffffff', sunGlow: '#cffafe',
      farMtn: '#94a3b8', midHill: '#64748b', frontHill: '#0f766e', tree: '#115e59',
      water: '#22d3ee', waterDeep: '#0e7490',
      extra: 'waterfall',
    },
  }),
  olive: makeTheme('olive', 'Zeytinlik Tepeleri', 'Gümüş yapraklı zeytin ağaçları ve ılık tepeler', {
    tileFrom: '#7a8b2f', tileTo: '#5f6f22', tileBorder: '#4a5719', accentText: '#3a4513',
    scene: {
      kind: 'valley',
      skyTop: '#7dd3fc', skyMid: '#bae6fd', skyBottom: '#fefce8',
      sun: '#fef9c3', sunGlow: '#fde68a',
      farMtn: '#bcc79a', midHill: '#a3b06a', frontHill: '#7a8b2f', tree: '#55651f',
      extra: 'groves',
    },
  }),
  lagoon: makeTheme('lagoon', 'Turkuaz Lagün', 'Turkuaz sular ve bembeyaz kumlar', {
    tileFrom: '#0d9488', tileTo: '#0f766e', tileBorder: '#115e59', accentText: '#134e4a',
    scene: {
      kind: 'lake',
      skyTop: '#22d3ee', skyMid: '#a5f3fc', skyBottom: '#f0fdfa',
      sun: '#fffbeb', sunGlow: '#fef08a',
      farMtn: '#5eead4', midHill: '#34d399', frontHill: '#fde68a', tree: '#047857',
      water: '#2dd4bf', waterDeep: '#0d9488',
    },
  }),
  autumn: makeTheme('autumn', 'Sonbahar Ormanı', 'Kızıl yapraklar ve altın sarısı orman', {
    tileFrom: '#c2410c', tileTo: '#9a3412', tileBorder: '#7c2d12', accentText: '#7c2d12',
    scene: {
      kind: 'valley',
      skyTop: '#fdba74', skyMid: '#fed7aa', skyBottom: '#fff7ed',
      sun: '#fffbeb', sunGlow: '#fde68a',
      farMtn: '#d6a77a', midHill: '#f59e0b', frontHill: '#b45309', tree: '#9a3412',
      extra: 'leaves',
    },
  }),
  daisy: makeTheme('daisy', 'Papatya Ovası', 'Bembeyaz papatyalarla kaplı geniş ova', {
    tileFrom: '#d4a106', tileTo: '#b28704', tileBorder: '#8a6a03', accentText: '#713f12',
    scene: {
      kind: 'valley',
      skyTop: '#60a5fa', skyMid: '#bfdbfe', skyBottom: '#f0fdf4',
      sun: '#fef9c3', sunGlow: '#fef08a',
      farMtn: '#a7f3d0', midHill: '#86efac', frontHill: '#4ade80', tree: '#16a34a',
      extra: 'flowers', flowerColor: '#ffffff', flowerAlt: '#facc15',
    },
  }),
  snowy: makeTheme('snowy', 'Karlı Zirveler', 'Karla kaplı zirveler ve tertemiz hava', {
    tileFrom: '#5b7fb5', tileTo: '#44649a', tileBorder: '#34507f', accentText: '#1e3a5f',
    selection: 'turquoise',
    scene: {
      kind: 'valley',
      skyTop: '#60a5fa', skyMid: '#93c5fd', skyBottom: '#dbeafe',
      sun: '#ffffff', sunGlow: '#e0f2fe',
      farMtn: '#cbd5e1', midHill: '#e2e8f0', frontHill: '#f8fafc', tree: '#1e3a5f',
      extra: 'snow',
    },
  }),
  reed: makeTheme('reed', 'Sazlık Kıyısı', 'Rüzgârda salınan sazlar ve durgun su', {
    tileFrom: '#8a7a3c', tileTo: '#6f6230', tileBorder: '#574c25', accentText: '#3f371a',
    selection: 'turquoise',
    scene: {
      kind: 'lake',
      skyTop: '#93c5fd', skyMid: '#bfdbfe', skyBottom: '#fef9c3',
      sun: '#fffbeb', sunGlow: '#fde68a',
      farMtn: '#a8b8a0', midHill: '#84a98c', frontHill: '#6b8f3a', tree: '#52796f',
      water: '#7fb7be', waterDeep: '#3d7a85',
      extra: 'reeds',
    },
  }),
  butterfly: makeTheme('butterfly', 'Kelebek Bahçesi', 'Rengârenk kelebekler ve çiçekli bahçe', {
    tileFrom: '#d946ef', tileTo: '#c026d3', tileBorder: '#a21caf', accentText: '#86198f',
    scene: {
      kind: 'valley',
      skyTop: '#7dd3fc', skyMid: '#bae6fd', skyBottom: '#fdf4ff',
      sun: '#fef9c3', sunGlow: '#fde68a',
      farMtn: '#f0abfc', midHill: '#86efac', frontHill: '#4ade80', tree: '#15803d',
      extra: 'butterflies', flowerColor: '#e879f9', flowerAlt: '#fbbf24',
    },
  }),
  dawn: makeTheme('dawn', 'Şafak Koyu', 'Şafağın ilk ışıklarıyla uyanan koy', {
    tileFrom: '#f2726a', tileTo: '#dc4f47', tileBorder: '#b93a33', accentText: '#7f1d1d',
    scene: {
      kind: 'sunset',
      skyTop: '#6366f1', skyMid: '#f9a8d4', skyBottom: '#fed7aa',
      sun: '#fff7ed', sunGlow: '#fdba74',
      farMtn: '#b197fc', midHill: '#e599b8', frontHill: '#9d4e7c', tree: '#6b2d5c',
      water: '#fbb6ce', waterDeep: '#8b5cf6',
      sunY: 640,
    },
  }),
  mossy: makeTheme('mossy', 'Yosunlu Kanyon', 'Yosun tutmuş kayalar ve serin kanyon', {
    tileFrom: '#3f7d58', tileTo: '#2f6145', tileBorder: '#234a34', accentText: '#14301f',
    scene: {
      kind: 'valley',
      skyTop: '#7dd3fc', skyMid: '#bae6fd', skyBottom: '#ecfccb',
      sun: '#fef9c3', sunGlow: '#fef08a',
      farMtn: '#a8a29e', midHill: '#78716c', frontHill: '#4d7c0f', tree: '#365314',
      extra: 'moss',
    },
  }),
  rainforest: makeTheme('rainforest', 'Yağmur Ormanı', 'Sık yeşillikler ve ince yağmur', {
    tileFrom: '#047857', tileTo: '#065f46', tileBorder: '#064e3b', accentText: '#022c22',
    scene: {
      kind: 'valley',
      skyTop: '#64748b', skyMid: '#94a3b8', skyBottom: '#d1fae5',
      sun: '#f1f5f9', sunGlow: '#e2e8f0',
      farMtn: '#6ee7b7', midHill: '#10b981', frontHill: '#047857', tree: '#064e3b',
      extra: 'rain',
    },
  }),
  volcanic: makeTheme('volcanic', 'Volkanik Ada', 'Lav ışığıyla parlayan gizemli ada', {
    tileFrom: '#44403c', tileTo: '#292524', tileBorder: '#1c1917',
    accentFrom: '#ea580c', accentTo: '#c2410c', accentHover: '#9a3412', accentText: '#7c2d12',
    selection: 'turquoise',
    scene: {
      kind: 'sunset',
      skyTop: '#431407', skyMid: '#9a3412', skyBottom: '#fdba74',
      sun: '#ffedd5', sunGlow: '#f97316',
      farMtn: '#57534e', midHill: '#44403c', frontHill: '#1c1917', tree: '#0c0a09',
      water: '#b45309', waterDeep: '#431407',
      sunY: 640,
      extra: 'volcano',
    },
  }),
  poppy: makeTheme('poppy', 'Gelincik Tarlası', 'Kıpkırmızı gelinciklerle dolu tarla', {
    tileFrom: '#ef4444', tileTo: '#dc2626', tileBorder: '#b91c1c', accentText: '#7f1d1d',
    scene: {
      kind: 'valley',
      skyTop: '#38bdf8', skyMid: '#bae6fd', skyBottom: '#f0fdf4',
      sun: '#fef9c3', sunGlow: '#fef08a',
      farMtn: '#93c5fd', midHill: '#86efac', frontHill: '#22c55e', tree: '#15803d',
      extra: 'flowers', flowerColor: '#ef4444', flowerAlt: '#1f2937',
    },
  }),
  rainbow: makeTheme('rainbow', 'Gökkuşağı Vadisi', 'Yağmur sonrası gökkuşağı ve ışıl ışıl vadi', {
    tileFrom: '#8b5cf6', tileTo: '#db2777', tileBorder: '#a21caf', accentText: '#701a75',
    bannerBg:
      'linear-gradient(90deg, #dc2626 0%, #ea580c 25%, #16a34a 50%, #2563eb 75%, #7c3aed 100%)',
    scene: {
      kind: 'valley',
      skyTop: '#38bdf8', skyMid: '#a5f3fc', skyBottom: '#f0fdf4',
      sun: '#fef9c3', sunGlow: '#fef08a',
      farMtn: '#a5b4fc', midHill: '#6ee7b7', frontHill: '#22c55e', tree: '#15803d',
      extra: 'rainbow',
    },
  }),

  // --------------------------------------------------------------- 351–700
  ruby_cliffs: makeTheme('ruby_cliffs', 'Yakut Kayalıkları', 'Kızıl yakut rengi kayalıklar ve derin yankı', {
    tileFrom: '#b91c1c', tileTo: '#991b1b', tileBorder: '#7f1d1d', accentText: '#450a0a',
    scene: {
      kind: 'sunset',
      skyTop: '#7f1d1d', skyMid: '#b91c1c', skyBottom: '#fecaca',
      sun: '#fee2e2', sunGlow: '#f87171',
      farMtn: '#991b1b', midHill: '#b91c1c', frontHill: '#7f1d1d', tree: '#450a0a',
      sunY: 640,
    },
  }),
  willow_creek: makeTheme('willow_creek', 'Söğütlü Dere', 'Söğütlerin gölgesinde çağıldayan berrak dere', {
    tileFrom: '#059669', tileTo: '#047857', tileBorder: '#064e3b', accentText: '#022c22',
    scene: {
      kind: 'lake',
      skyTop: '#6ee7b7', skyMid: '#a7f3d0', skyBottom: '#ecfdf5',
      sun: '#fef9c3', sunGlow: '#fde68a',
      farMtn: '#34d399', midHill: '#10b981', frontHill: '#059669', tree: '#064e3b',
      water: '#10b981', waterDeep: '#047857',
      extra: 'groves',
    },
  }),
  purple_hyacinth: makeTheme('purple_hyacinth', 'Mor Sümbül Yaylası', 'Mis kokulu mor sümbüllerle bezeli yayla', {
    tileFrom: '#7c3aed', tileTo: '#6d28d9', tileBorder: '#5b21b6', accentText: '#4c1d95',
    scene: {
      kind: 'valley',
      skyTop: '#c4b5fd', skyMid: '#ddd6fe', skyBottom: '#f5f3ff',
      sun: '#fef3c7', sunGlow: '#fde68a',
      farMtn: '#a78bfa', midHill: '#8b5cf6', frontHill: '#6d28d9', tree: '#4c1d95',
      extra: 'flowers', flowerColor: '#8b5cf6', flowerAlt: '#ddd6fe',
    },
  }),
  pearl_coast: makeTheme('pearl_coast', 'İnci Kıyısı', 'İnci gibi parıldayan sedefli kumsal', {
    tileFrom: '#0284c7', tileTo: '#0369a1', tileBorder: '#075985', accentText: '#0c4a6e',
    selection: 'turquoise',
    scene: {
      kind: 'lake',
      skyTop: '#bae6fd', skyMid: '#e0f2fe', skyBottom: '#f8fafc',
      sun: '#ffffff', sunGlow: '#f0f9ff',
      farMtn: '#7dd3fc', midHill: '#38bdf8', frontHill: '#f1f5f9', tree: '#0284c7',
      water: '#38bdf8', waterDeep: '#0284c7',
    },
  }),
  full_moon_lake: makeTheme('full_moon_lake', 'Dolunay Gölü', 'Gümüş dolunayın suya vuran büyülü ışığı', {
    tileFrom: '#4338ca', tileTo: '#3730a3', tileBorder: '#312e81', accentText: '#1e1b4b',
    scene: {
      kind: 'night',
      skyTop: '#1e1b4b', skyMid: '#312e81', skyBottom: '#4338ca',
      sun: '#f8fafc', sunGlow: '#c7d2fe',
      farMtn: '#312e81', midHill: '#1e1b4b', frontHill: '#0f172a', tree: '#1e1b4b',
      water: '#3730a3', waterDeep: '#1e1b4b',
      stars: true,
    },
  }),
  amber_hills: makeTheme('amber_hills', 'Kehribar Tepeleri', 'Işıl ışıl parlayan kehribar sarısı tepeler', {
    tileFrom: '#d97706', tileTo: '#b45309', tileBorder: '#92400e', accentText: '#78350f',
    scene: {
      kind: 'sunset',
      skyTop: '#f59e0b', skyMid: '#fde047', skyBottom: '#fef3c7',
      sun: '#fef08a', sunGlow: '#fde047',
      farMtn: '#d97706', midHill: '#b45309', frontHill: '#92400e', tree: '#78350f',
      sunY: 625,
    },
  }),
  fern_valley: makeTheme('fern_valley', 'Eğrelti Vadisi', 'Tarih öncesi eğrelti otlarıyla dolu derin vadi', {
    tileFrom: '#15803d', tileTo: '#166534', tileBorder: '#14532d', accentText: '#052e16',
    scene: {
      kind: 'valley',
      skyTop: '#86efac', skyMid: '#bbf7d0', skyBottom: '#f0fdf4',
      sun: '#fef9c3', sunGlow: '#fef08a',
      farMtn: '#4ade80', midHill: '#22c55e', frontHill: '#15803d', tree: '#14532d',
      extra: 'moss',
    },
  }),
  storm_cape: makeTheme('storm_cape', 'Fırtına Burnu', 'Köpüren dev dalgalar ve heybetli fırtına', {
    tileFrom: '#334155', tileTo: '#1e293b', tileBorder: '#0f172a', accentText: '#020617',
    selection: 'turquoise',
    scene: {
      kind: 'lake',
      skyTop: '#475569', skyMid: '#64748b', skyBottom: '#94a3b8',
      sun: '#cbd5e1', sunGlow: '#94a3b8',
      farMtn: '#475569', midHill: '#334155', frontHill: '#1e293b', tree: '#0f172a',
      water: '#475569', waterDeep: '#1e293b',
      extra: 'rain',
    },
  }),
  plum_orchard: makeTheme('plum_orchard', 'Erik Çiçeği Bahçesi', 'Baharın müjdecisi pembe erik çiçekleri', {
    tileFrom: '#e11d48', tileTo: '#be123c', tileBorder: '#9f1239', accentText: '#881337',
    scene: {
      kind: 'valley',
      skyTop: '#fda4af', skyMid: '#fecdd3', skyBottom: '#fff1f2',
      sun: '#fffbeb', sunGlow: '#ffe4e6',
      farMtn: '#fb7185', midHill: '#f43f5e', frontHill: '#be123c', tree: '#881337',
      extra: 'flowers', flowerColor: '#fda4af', flowerAlt: '#fef08a',
    },
  }),
  white_dunes: makeTheme('white_dunes', 'Beyaz Kumullar', 'Rüzgârın şekillendirdiği bembeyaz kum tepeleri', {
    tileFrom: '#ca8a04', tileTo: '#a16207', tileBorder: '#854d0e', accentText: '#713f12',
    scene: {
      kind: 'sunset',
      skyTop: '#fde047', skyMid: '#fef08a', skyBottom: '#fefce8',
      sun: '#ffffff', sunGlow: '#fef08a',
      farMtn: '#eab308', midHill: '#ca8a04', frontHill: '#a16207', tree: '#854d0e',
      sunY: 620,
    },
  }),
  mirror_lake: makeTheme('mirror_lake', 'Ayna Gölü', 'Dağların kusursuzca yansıdığı durgun göl', {
    tileFrom: '#0891b2', tileTo: '#0e7490', tileBorder: '#155e75', accentText: '#164e63',
    selection: 'turquoise',
    scene: {
      kind: 'lake',
      skyTop: '#67e8f9', skyMid: '#a5f3fc', skyBottom: '#cffafe',
      sun: '#ffffff', sunGlow: '#cffafe',
      farMtn: '#22d3ee', midHill: '#06b6d4', frontHill: '#0891b2', tree: '#155e75',
      water: '#06b6d4', waterDeep: '#0e7490',
    },
  }),
  cliff_falls: makeTheme('cliff_falls', 'Uçurum Şelalesi', 'Sarp kayalıklardan gümbürdeyerek inen şelale', {
    tileFrom: '#0284c7', tileTo: '#0369a1', tileBorder: '#075985', accentText: '#0c4a6e',
    scene: {
      kind: 'lake',
      skyTop: '#38bdf8', skyMid: '#7dd3fc', skyBottom: '#bae6fd',
      sun: '#ffffff', sunGlow: '#e0f2fe',
      farMtn: '#0284c7', midHill: '#0369a1', frontHill: '#075985', tree: '#0c4a6e',
      water: '#0284c7', waterDeep: '#0369a1',
      extra: 'waterfall',
    },
  }),
  nacre_bay: makeTheme('nacre_bay', 'Sedef Koyu', 'Güneş ışığında rengârenk parlayan sedefli koy', {
    tileFrom: '#c026d3', tileTo: '#a21caf', tileBorder: '#86198f', accentText: '#701a75',
    scene: {
      kind: 'lake',
      skyTop: '#f0abfc', skyMid: '#f5d0fe', skyBottom: '#fae8ff',
      sun: '#ffffff', sunGlow: '#f5d0fe',
      farMtn: '#e879f9', midHill: '#c026d3', frontHill: '#a21caf', tree: '#701a75',
      water: '#d946ef', waterDeep: '#86198f',
    },
  }),
  chestnut_woods: makeTheme('chestnut_woods', 'Kestane Ormanı', 'Ulu kestane ağaçları ve altın yapraklar', {
    tileFrom: '#9a3412', tileTo: '#7c2d12', tileBorder: '#6c250d', accentText: '#431407',
    scene: {
      kind: 'valley',
      skyTop: '#fed7aa', skyMid: '#ffedd5', skyBottom: '#fff7ed',
      sun: '#fffbeb', sunGlow: '#fed7aa',
      farMtn: '#ea580c', midHill: '#c2410c', frontHill: '#9a3412', tree: '#7c2d12',
      extra: 'leaves',
    },
  }),
  sunflower_field: makeTheme('sunflower_field', 'Günebakan Tarlası', 'Güneşe dönen uçsuz bucaksız sarı çiçekler', {
    tileFrom: '#ca8a04', tileTo: '#a16207', tileBorder: '#854d0e', accentText: '#713f12',
    scene: {
      kind: 'valley',
      skyTop: '#38bdf8', skyMid: '#bae6fd', skyBottom: '#fefce8',
      sun: '#facc15', sunGlow: '#fde047',
      farMtn: '#86efac', midHill: '#4ade80', frontHill: '#22c55e', tree: '#15803d',
      extra: 'flowers', flowerColor: '#facc15', flowerAlt: '#78350f',
    },
  }),
  frost_plain: makeTheme('frost_plain', 'Kırağı Ovası', 'Gümüş kırağı ile kaplanmış sessiz ova', {
    tileFrom: '#0284c7', tileTo: '#075985', tileBorder: '#0c4a6e', accentText: '#082f49',
    selection: 'turquoise',
    scene: {
      kind: 'valley',
      skyTop: '#93c5fd', skyMid: '#bfdbfe', skyBottom: '#f8fafc',
      sun: '#ffffff', sunGlow: '#dbeafe',
      farMtn: '#cbd5e1', midHill: '#94a3b8', frontHill: '#e2e8f0', tree: '#475569',
      extra: 'snow',
    },
  }),
  valley_of_falls: makeTheme('valley_of_falls', 'Şelaleler Vadisi', 'Dört bir yandan süzülen sayısız şelale', {
    tileFrom: '#0d9488', tileTo: '#0f766e', tileBorder: '#115e59', accentText: '#134e4a',
    scene: {
      kind: 'lake',
      skyTop: '#5eead4', skyMid: '#99f6e4', skyBottom: '#ccfbf1',
      sun: '#ffffff', sunGlow: '#ccfbf1',
      farMtn: '#14b8a6', midHill: '#0d9488', frontHill: '#0f766e', tree: '#115e59',
      water: '#14b8a6', waterDeep: '#0f766e',
      extra: 'waterfall',
    },
  }),
  red_pine_highland: makeTheme('red_pine_highland', 'Kızılçam Yaylası', 'Kızılçamların reçine kokulu serinliği', {
    tileFrom: '#b45309', tileTo: '#78350f', tileBorder: '#451a03', accentText: '#451a03',
    scene: {
      kind: 'valley',
      skyTop: '#7dd3fc', skyMid: '#bae6fd', skyBottom: '#fef3c7',
      sun: '#fef9c3', sunGlow: '#fef08a',
      farMtn: '#d97706', midHill: '#15803d', frontHill: '#b45309', tree: '#14532d',
    },
  }),
  aurora_bay: makeTheme('aurora_bay', 'Kuzey Işıkları Körfezi', 'Gökyüzünü yeşil ve mora boyayan kutup ışıkları', {
    tileFrom: '#4f46e5', tileTo: '#312e81', tileBorder: '#1e1b4b', accentText: '#1e1b4b',
    selection: 'turquoise',
    scene: {
      kind: 'night',
      skyTop: '#0f172a', skyMid: '#1e1b4b', skyBottom: '#047857',
      sun: '#a7f3d0', sunGlow: '#34d399',
      farMtn: '#312e81', midHill: '#065f46', frontHill: '#0f172a', tree: '#064e3b',
      water: '#1e1b4b', waterDeep: '#022c22',
      stars: true,
    },
  }),
  purple_horizons: makeTheme('purple_horizons', 'Mor Ufuklar', 'Ufkun leylak ve erguvan tonlarına büründüğü an', {
    tileFrom: '#9333ea', tileTo: '#7e22ce', tileBorder: '#6b21a8', accentText: '#581c87',
    scene: {
      kind: 'sunset',
      skyTop: '#581c87', skyMid: '#a855f7', skyBottom: '#f5d0fe',
      sun: '#fef08a', sunGlow: '#e879f9',
      farMtn: '#7e22ce', midHill: '#a855f7', frontHill: '#6b21a8', tree: '#3b0764',
      sunY: 630,
    },
  }),
  sea_cave: makeTheme('sea_cave', 'Deniz Mağarası', 'Turkuaz dalgaların oyduğu gizemli su mağarası', {
    tileFrom: '#0369a1', tileTo: '#075985', tileBorder: '#0c4a6e', accentText: '#082f49',
    selection: 'turquoise',
    scene: {
      kind: 'lake',
      skyTop: '#38bdf8', skyMid: '#7dd3fc', skyBottom: '#0c4a6e',
      sun: '#ffffff', sunGlow: '#bae6fd',
      farMtn: '#334155', midHill: '#1e293b', frontHill: '#0f172a', tree: '#0c4a6e',
      water: '#0284c7', waterDeep: '#0c4a6e',
    },
  }),
  almond_hills: makeTheme('almond_hills', 'Badem Çiçeği Tepeleri', 'Beyaz ve pembe badem çiçekleriyle donanmış yamaçlar', {
    tileFrom: '#db2777', tileTo: '#be185d', tileBorder: '#9d174d', accentText: '#831843',
    scene: {
      kind: 'valley',
      skyTop: '#fbcfe8', skyMid: '#fce7f3', skyBottom: '#fdf2f8',
      sun: '#fffbeb', sunGlow: '#fce7f3',
      farMtn: '#f472b6', midHill: '#a7f3d0', frontHill: '#34d399', tree: '#059669',
      extra: 'flowers', flowerColor: '#ffffff', flowerAlt: '#f472b6',
    },
  }),
  crane_marsh: makeTheme('crane_marsh', 'Turnalar Sazlığı', 'Sazlıkların üzerinde süzülen zarif turnalar', {
    tileFrom: '#65a30d', tileTo: '#4d7c0f', tileBorder: '#3f6212', accentText: '#365314',
    scene: {
      kind: 'lake',
      skyTop: '#93c5fd', skyMid: '#bfdbfe', skyBottom: '#fef08a',
      sun: '#fef08a', sunGlow: '#fde047',
      farMtn: '#a3e635', midHill: '#65a30d', frontHill: '#4d7c0f', tree: '#365314',
      water: '#38bdf8', waterDeep: '#0284c7',
      extra: 'reeds',
    },
  }),
  emerald_lagoon: makeTheme('emerald_lagoon', 'Zümrüt Lagün', 'Göz alıcı zümrüt rengi berrak lagün suları', {
    tileFrom: '#059669', tileTo: '#047857', tileBorder: '#064e3b', accentText: '#022c22',
    selection: 'turquoise',
    scene: {
      kind: 'lake',
      skyTop: '#34d399', skyMid: '#6ee7b7', skyBottom: '#a7f3d0',
      sun: '#fef9c3', sunGlow: '#fef08a',
      farMtn: '#10b981', midHill: '#059669', frontHill: '#fef08a', tree: '#064e3b',
      water: '#10b981', waterDeep: '#047857',
    },
  }),
  shaded_path: makeTheme('shaded_path', 'Gölgeli Patika', 'Asırlık çınarların altındaki serin yürüyüş yolu', {
    tileFrom: '#15803d', tileTo: '#14532d', tileBorder: '#052e16', accentText: '#052e16',
    scene: {
      kind: 'valley',
      skyTop: '#86efac', skyMid: '#bbf7d0', skyBottom: '#f0fdf4',
      sun: '#fef9c3', sunGlow: '#fef08a',
      farMtn: '#4ade80', midHill: '#22c55e', frontHill: '#15803d', tree: '#14532d',
      extra: 'groves',
    },
  }),
  snowdrop_slope: makeTheme('snowdrop_slope', 'Kardelen Yamacı', 'Karların arasından başını uzatan ilk kardelenler', {
    tileFrom: '#475569', tileTo: '#334155', tileBorder: '#1e293b', accentText: '#0f172a',
    selection: 'turquoise',
    scene: {
      kind: 'valley',
      skyTop: '#94a3b8', skyMid: '#cbd5e1', skyBottom: '#f1f5f9',
      sun: '#ffffff', sunGlow: '#e2e8f0',
      farMtn: '#cbd5e1', midHill: '#94a3b8', frontHill: '#f8fafc', tree: '#1e293b',
      extra: 'snow',
    },
  }),
  hidden_fjord: makeTheme('hidden_fjord', 'Saklı Fiyort', 'Dik yarların arasına kıvrılan derin sakin fiyort', {
    tileFrom: '#0f766e', tileTo: '#115e59', tileBorder: '#134e4a', accentText: '#042f2e',
    selection: 'turquoise',
    scene: {
      kind: 'lake',
      skyTop: '#2dd4bf', skyMid: '#5eead4', skyBottom: '#99f6e4',
      sun: '#ffffff', sunGlow: '#ccfbf1',
      farMtn: '#334155', midHill: '#1e293b', frontHill: '#0f766e', tree: '#115e59',
      water: '#0d9488', waterDeep: '#115e59',
    },
  }),
  windy_steppe: makeTheme('windy_steppe', 'Rüzgârlı Bozkır', 'Uçsuz bucaksız altın bozkır ve efsunlu rüzgâr', {
    tileFrom: '#a16207', tileTo: '#713f12', tileBorder: '#542d0c', accentText: '#422006',
    scene: {
      kind: 'valley',
      skyTop: '#38bdf8', skyMid: '#7dd3fc', skyBottom: '#fef3c7',
      sun: '#fef08a', sunGlow: '#fde047',
      farMtn: '#ca8a04', midHill: '#a16207', frontHill: '#eab308', tree: '#713f12',
    },
  }),
  obsidian_shore: makeTheme('obsidian_shore', 'Obsidyen Sahili', 'Siyah volkanik cam gibi parıldayan gizemli sahil', {
    tileFrom: '#292524', tileTo: '#1c1917', tileBorder: '#0c0a09', accentText: '#0c0a09',
    selection: 'turquoise',
    scene: {
      kind: 'sunset',
      skyTop: '#44403c', skyMid: '#78716c', skyBottom: '#fdba74',
      sun: '#ffedd5', sunGlow: '#f97316',
      farMtn: '#292524', midHill: '#1c1917', frontHill: '#0c0a09', tree: '#0c0a09',
      water: '#1c1917', waterDeep: '#0c0a09',
      sunY: 640,
      extra: 'volcano',
    },
  }),
  foaming_river: makeTheme('foaming_river', 'Köpüklü Akarsu', 'Kayaları aşarken beyaz köpükler saçan nehir', {
    tileFrom: '#0284c7', tileTo: '#075985', tileBorder: '#0c4a6e', accentText: '#082f49',
    selection: 'turquoise',
    scene: {
      kind: 'lake',
      skyTop: '#38bdf8', skyMid: '#a5f3fc', skyBottom: '#e0f2fe',
      sun: '#ffffff', sunGlow: '#bae6fd',
      farMtn: '#0284c7', midHill: '#0369a1', frontHill: '#075985', tree: '#0c4a6e',
      water: '#38bdf8', waterDeep: '#0284c7',
    },
  }),
  acacia_grove: makeTheme('acacia_grove', 'Akasya Korusu', 'Salkım salkım mis kokulu akasyalar', {
    tileFrom: '#4d7c0f', tileTo: '#365314', tileBorder: '#1a2e05', accentText: '#1a2e05',
    scene: {
      kind: 'valley',
      skyTop: '#a3e635', skyMid: '#bef264', skyBottom: '#f7fee7',
      sun: '#fef9c3', sunGlow: '#fef08a',
      farMtn: '#65a30d', midHill: '#4d7c0f', frontHill: '#365314', tree: '#1a2e05',
      extra: 'groves',
    },
  }),
  peach_orchard: makeTheme('peach_orchard', 'Şeftali Bahçesi', 'Güneşte olgunlaşan pembe-turuncu şeftaliler', {
    tileFrom: '#ea580c', tileTo: '#c2410c', tileBorder: '#9a3412', accentText: '#7c2d12',
    scene: {
      kind: 'valley',
      skyTop: '#fed7aa', skyMid: '#ffedd5', skyBottom: '#fff7ed',
      sun: '#fef08a', sunGlow: '#fed7aa',
      farMtn: '#fb923c', midHill: '#f97316', frontHill: '#ea580c', tree: '#c2410c',
      extra: 'flowers', flowerColor: '#fb923c', flowerAlt: '#fdba74',
    },
  }),
  twilight_island: makeTheme('twilight_island', 'Alacakaranlık Adası', 'Akşamın son ışıklarıyla kızıla çalan ada', {
    tileFrom: '#4338ca', tileTo: '#2e1065', tileBorder: '#1e1b4b', accentText: '#1e1b4b',
    scene: {
      kind: 'sunset',
      skyTop: '#1e1b4b', skyMid: '#581c87', skyBottom: '#f43f5e',
      sun: '#fed7aa', sunGlow: '#fb7185',
      farMtn: '#312e81', midHill: '#3b0764', frontHill: '#1e1b4b', tree: '#0f172a',
      water: '#2e1065', waterDeep: '#0f172a',
      sunY: 635,
    },
  }),
  cotton_clouds: makeTheme('cotton_clouds', 'Pamuk Bulutlar Yaylası', 'Ayakların altında uzanan bembeyaz bulut denizi', {
    tileFrom: '#0284c7', tileTo: '#0369a1', tileBorder: '#075985', accentText: '#0c4a6e',
    scene: {
      kind: 'valley',
      skyTop: '#38bdf8', skyMid: '#bae6fd', skyBottom: '#ffffff',
      sun: '#ffffff', sunGlow: '#e0f2fe',
      farMtn: '#7dd3fc', midHill: '#38bdf8', frontHill: '#bae6fd', tree: '#0369a1',
    },
  }),
  dream_archipelago: makeTheme('dream_archipelago', 'Düşler Takımadası', 'Gökkuşağı renginde adacıklar ve masalsı sular', {
    tileFrom: '#7c3aed', tileTo: '#db2777', tileBorder: '#6d28d9', accentText: '#4c1d95',
    bannerBg:
      'linear-gradient(90deg, #7c3aed 0%, #2563eb 25%, #059669 50%, #d97706 75%, #db2777 100%)',
    scene: {
      kind: 'lake',
      skyTop: '#c4b5fd', skyMid: '#fbcfe8', skyBottom: '#fdf2f8',
      sun: '#fef9c3', sunGlow: '#fde68a',
      farMtn: '#a78bfa', midHill: '#f472b6', frontHill: '#a855f7', tree: '#7c3aed',
      water: '#a855f7', waterDeep: '#6d28d9',
      extra: 'rainbow',
    },
  }),

  // --------------------------------------------------------------- 701–1000
  sapphire_falls: makeTheme('sapphire_falls', 'Safir Şelalesi', 'Safir mavisi sulara dökülen görkemli şelale', {
    tileFrom: '#1d4ed8', tileTo: '#1e40af', tileBorder: '#1e3a8a', accentText: '#172554', selection: 'turquoise',
    scene: scn('lake', ['#3b82f6', '#93c5fd', '#eff6ff'], ['#ffffff', '#dbeafe'], ['#60a5fa', '#2563eb', '#1d4ed8', '#1e3a8a'], { water: '#2563eb', waterDeep: '#1e3a8a', extra: 'waterfall' }),
  }),
  juniper_plateau: makeTheme('juniper_plateau', 'Ardıç Yaylası', 'Ardıç ağaçlarının mavi yeşil gölgesinde serin yayla', {
    tileFrom: '#3f6f63', tileTo: '#2f5a4f', tileBorder: '#1f3f37', accentText: '#14302a',
    scene: scn('valley', ['#7dd3fc', '#bae6fd', '#f0fdf4'], ['#fef9c3', '#fef08a'], ['#7aa8a0', '#4d8579', '#2f6b5e', '#1f4a40']),
  }),
  pink_salt_lake: makeTheme('pink_salt_lake', 'Pembe Tuz Gölü', 'Pembe sularıyla büyüleyen sakin tuz gölü', {
    tileFrom: '#be185d', tileTo: '#9d174d', tileBorder: '#831843', accentText: '#500724',
    scene: scn('lake', ['#fbcfe8', '#fce7f3', '#fff7ed'], ['#fffbeb', '#fde68a'], ['#f9a8d4', '#f472b6', '#fecdd3', '#be185d'], { water: '#f472b6', waterDeep: '#db2777', extra: 'salt' }),
  }),
  crocus_meadow: makeTheme('crocus_meadow', 'Çiğdem Çayırı', 'Mor ve beyaz çiğdemlerle bezeli bahar çayırı', {
    tileFrom: '#7e22ce', tileTo: '#6b21a8', tileBorder: '#581c87', accentText: '#3b0764',
    scene: scn('valley', ['#a5b4fc', '#e0e7ff', '#f5f3ff'], ['#fef9c3', '#fde68a'], ['#c4b5fd', '#86efac', '#4ade80', '#15803d'], { extra: 'flowers', flowerColor: '#a855f7', flowerAlt: '#fde047' }),
  }),
  eagle_crags: makeTheme('eagle_crags', 'Kartal Kayalıkları', 'Kartalların süzüldüğü sarp ve heybetli kayalıklar', {
    tileFrom: '#92400e', tileTo: '#78350f', tileBorder: '#451a03', accentText: '#2c1103',
    scene: scn('valley', ['#38bdf8', '#bae6fd', '#fef3c7'], ['#fffbeb', '#fde68a'], ['#a8a29e', '#78716c', '#57534e', '#44403c'], { extra: 'cliffs' }),
  }),
  linden_grove: makeTheme('linden_grove', 'Ihlamur Korusu', 'Mis kokulu ıhlamur ağaçlarının altında altın ışık', {
    tileFrom: '#4d7c0f', tileTo: '#3f6212', tileBorder: '#365314', accentText: '#1a2e05',
    scene: scn('valley', ['#bef264', '#d9f99d', '#fefce8'], ['#fef9c3', '#fde047'], ['#bef264', '#a3e635', '#84cc16', '#4d7c0f'], { extra: 'groves' }),
  }),
  moonglow_lagoon: makeTheme('moonglow_lagoon', 'Ayışığı Lagünü', 'Ayışığının gümüş yoldan süzüldüğü sessiz lagün', {
    tileFrom: '#334155', tileTo: '#1e293b', tileBorder: '#0f172a', accentText: '#020617', selection: 'turquoise',
    scene: scn('night', ['#0b1e3f', '#1d4e89', '#2b7a9b'], ['#f8fafc', '#bae6fd'], ['#164e63', '#0e3a52', '#0b2a3f', '#0a2233'], { stars: true, water: '#155e75', waterDeep: '#082f49' }),
  }),
  red_sand_sea: makeTheme('red_sand_sea', 'Kızıl Kum Denizi', 'Kızıl kum tepelerinin uçsuz bucaksız dalgaları', {
    tileFrom: '#c2410c', tileTo: '#9a3412', tileBorder: '#7c2d12', accentText: '#431407',
    scene: scn('sunset', ['#9a3412', '#f97316', '#fde68a'], ['#fff7ed', '#fdba74'], ['#ea580c', '#c2410c', '#b45309', '#7c2d12'], { sunY: 640, extra: 'dunes' }),
  }),
  blue_ice_cave: makeTheme('blue_ice_cave', 'Mavi Buz Mağarası', 'Buz sarkıtlarının arasında parlayan mavi mağara', {
    tileFrom: '#0e7490', tileTo: '#155e75', tileBorder: '#164e63', accentText: '#083344', selection: 'turquoise',
    scene: scn('lake', ['#67e8f9', '#a5f3fc', '#ecfeff'], ['#ffffff', '#cffafe'], ['#a5f3fc', '#67e8f9', '#22d3ee', '#0e7490'], { water: '#22d3ee', waterDeep: '#0e7490', extra: 'crystals' }),
  }),
  daffodil_valley: makeTheme('daffodil_valley', 'Nergis Vadisi', 'Sarı nergislerin güneşe uzandığı neşeli vadi', {
    tileFrom: '#a16207', tileTo: '#854d0e', tileBorder: '#713f12', accentText: '#422006',
    scene: scn('valley', ['#7dd3fc', '#bae6fd', '#fefce8'], ['#fef9c3', '#fde047'], ['#bbf7d0', '#86efac', '#4ade80', '#15803d'], { extra: 'flowers', flowerColor: '#facc15', flowerAlt: '#ffffff' }),
  }),
  windmill_hill: makeTheme('windmill_hill', 'Rüzgâr Değirmeni Tepesi', 'Tepede dönen değirmen ve altın rüzgâr', {
    tileFrom: '#b45309', tileTo: '#92400e', tileBorder: '#78350f', accentText: '#451a03',
    scene: scn('valley', ['#38bdf8', '#bae6fd', '#fff7ed'], ['#fffbeb', '#fde68a'], ['#bef264', '#a3e635', '#65a30d', '#3f6212'], { extra: 'windmill' }),
  }),
  blueberry_forest: makeTheme('blueberry_forest', 'Yaban Mersini Ormanı', 'Mor mavi yaban mersinleriyle dolu gizemli orman', {
    tileFrom: '#4338ca', tileTo: '#3730a3', tileBorder: '#312e81', accentText: '#1e1b4b',
    scene: scn('valley', ['#a5b4fc', '#c7d2fe', '#eef2ff'], ['#fef9c3', '#fde68a'], ['#6ee7b7', '#34d399', '#059669', '#064e3b'], { extra: 'flowers', flowerColor: '#4f46e5', flowerAlt: '#c7d2fe' }),
  }),
  mirage_oasis: makeTheme('mirage_oasis', 'Serap Vahası', 'Çölün ortasında titreşen serap ve serin palmiyeler', {
    tileFrom: '#0f766e', tileTo: '#115e59', tileBorder: '#134e4a', accentText: '#042f2e', selection: 'turquoise',
    scene: scn('sunset', ['#f59e0b', '#fcd34d', '#fef9c3'], ['#ffffff', '#fde047'], ['#fbbf24', '#f59e0b', '#d97706', '#92400e'], { sunY: 610, extra: 'palms' }),
  }),
  white_cliffs: makeTheme('white_cliffs', 'Beyaz Falezler', 'Denize dik inen bembeyaz tebeşir falezleri', {
    tileFrom: '#0369a1', tileTo: '#075985', tileBorder: '#0c4a6e', accentText: '#082f49', selection: 'turquoise',
    scene: scn('lake', ['#38bdf8', '#bae6fd', '#f0f9ff'], ['#ffffff', '#e0f2fe'], ['#e2e8f0', '#f1f5f9', '#e5e7eb', '#4d7c0f'], { water: '#0ea5e9', waterDeep: '#0369a1', extra: 'cliffs' }),
  }),
  lotus_pond: makeTheme('lotus_pond', 'Lotus Göleti', 'Pembe lotus çiçeklerinin süzüldüğü dingin gölet', {
    tileFrom: '#be185d', tileTo: '#9d174d', tileBorder: '#831843', accentText: '#500724',
    scene: scn('lake', ['#fbcfe8', '#fce7f3', '#f0fdf4'], ['#fffbeb', '#fef3c7'], ['#86efac', '#4ade80', '#22c55e', '#166534'], { water: '#34d399', waterDeep: '#047857', extra: 'lotus', flowerColor: '#f472b6', flowerAlt: '#fde047' }),
  }),
  morning_mist_plain: makeTheme('morning_mist_plain', 'Sabah Sisi Ovası', 'Sabah sisinin yavaşça süzüldüğü yumuşak ova', {
    tileFrom: '#475569', tileTo: '#334155', tileBorder: '#1e293b', accentText: '#0f172a',
    scene: scn('valley', ['#cbd5e1', '#e2e8f0', '#f8fafc'], ['#ffffff', '#fef3c7'], ['#94a3b8', '#86efac', '#4ade80', '#166534'], { extra: 'fog' }),
  }),
  firefly_creek: makeTheme('firefly_creek', 'Ateşböceği Deresi', 'Gecenin içinde ışıldayan ateşböcekleri ve ince dere', {
    tileFrom: '#166534', tileTo: '#14532d', tileBorder: '#052e16', accentText: '#022c22', selection: 'turquoise',
    scene: scn('night', ['#022c22', '#064e3b', '#115e59'], ['#ecfccb', '#bef264'], ['#0f3d32', '#0b2e27', '#072219', '#04170f'], { stars: true, water: '#0f766e', waterDeep: '#022c22', extra: 'fireflies' }),
  }),
  sea_arches: makeTheme('sea_arches', 'Deniz Kemerleri', 'Dalgaların oyduğu doğal taş kemerler', {
    tileFrom: '#0e7490', tileTo: '#155e75', tileBorder: '#164e63', accentText: '#083344', selection: 'turquoise',
    scene: scn('lake', ['#22d3ee', '#a5f3fc', '#fff7ed'], ['#fffbeb', '#fde68a'], ['#d6a77a', '#b8845a', '#a16207', '#78350f'], { water: '#06b6d4', waterDeep: '#0e7490', extra: 'arches' }),
  }),
  wisteria_garden: makeTheme('wisteria_garden', 'Mor Salkım Bahçesi', 'Sarkan mor salkımların süslediği rüya bahçesi', {
    tileFrom: '#6d28d9', tileTo: '#5b21b6', tileBorder: '#4c1d95', accentText: '#3b0764',
    scene: scn('valley', ['#c4b5fd', '#ddd6fe', '#faf5ff'], ['#fef9c3', '#fde68a'], ['#a7f3d0', '#6ee7b7', '#34d399', '#047857'], { extra: 'wisteria' }),
  }),
  hidden_crater_lake: makeTheme('hidden_crater_lake', 'Saklı Krater Gölü', 'Yanardağ kraterinde saklı turkuaz göl', {
    tileFrom: '#0f766e', tileTo: '#115e59', tileBorder: '#134e4a', accentText: '#042f2e', selection: 'turquoise',
    scene: scn('lake', ['#38bdf8', '#bae6fd', '#ecfeff'], ['#ffffff', '#e0f2fe'], ['#78716c', '#57534e', '#44403c', '#292524'], { water: '#14b8a6', waterDeep: '#0f766e', extra: 'crater' }),
  }),
  golden_wheat: makeTheme('golden_wheat', 'Altın Başak Tarlası', 'Rüzgârda dalgalanan altın sarısı başaklar', {
    tileFrom: '#a16207', tileTo: '#854d0e', tileBorder: '#713f12', accentText: '#422006',
    scene: scn('valley', ['#38bdf8', '#bae6fd', '#fffbeb'], ['#fef9c3', '#fde047'], ['#fde68a', '#fcd34d', '#eab308', '#a16207'], { extra: 'wheat' }),
  }),
  after_rain_hills: makeTheme('after_rain_hills', 'Yağmur Sonrası Tepeler', 'Yağmurun yıkadığı yemyeşil tepeler ve gökkuşağı', {
    tileFrom: '#15803d', tileTo: '#166534', tileBorder: '#14532d', accentText: '#052e16',
    scene: scn('valley', ['#7dd3fc', '#bae6fd', '#ecfdf5'], ['#fef9c3', '#fef08a'], ['#86efac', '#4ade80', '#22c55e', '#15803d'], { extra: 'rainbow' }),
  }),
  polar_night_bay: makeTheme('polar_night_bay', 'Kutup Gecesi Körfezi', 'Kutup ışıklarının dans ettiği buz gibi körfez', {
    tileFrom: '#4338ca', tileTo: '#3730a3', tileBorder: '#312e81', accentText: '#1e1b4b', selection: 'turquoise',
    scene: scn('night', ['#020617', '#0f172a', '#134e4a'], ['#e0f2fe', '#a5f3fc'], ['#1e293b', '#0f172a', '#cbd5e1', '#0f172a'], { stars: true, water: '#0f3d5e', waterDeep: '#020617', extra: 'aurora' }),
  }),
  plane_river_path: makeTheme('plane_river_path', 'Çınarlı Nehir Yolu', 'Asırlık çınarların gölgelediği nehir yolu', {
    tileFrom: '#b45309', tileTo: '#92400e', tileBorder: '#78350f', accentText: '#451a03',
    scene: scn('valley', ['#fed7aa', '#ffedd5', '#fffbeb'], ['#fffbeb', '#fed7aa'], ['#d9a066', '#c2873f', '#a16207', '#65400f'], { extra: 'leaves' }),
  }),
  orange_desert_canyon: makeTheme('orange_desert_canyon', 'Turuncu Çöl Kanyonu', 'Turuncu kayaların arasında uzanan derin kanyon', {
    tileFrom: '#c2410c', tileTo: '#9a3412', tileBorder: '#7c2d12', accentText: '#431407',
    scene: scn('sunset', ['#7c2d12', '#ea580c', '#fed7aa'], ['#fff7ed', '#fdba74'], ['#c2410c', '#9a3412', '#7c2d12', '#431407'], { sunY: 630, extra: 'cliffs' }),
  }),
  stardust_shore: makeTheme('stardust_shore', 'Yıldız Tozu Sahili', 'Gökyüzünden yıldız tozu yağan büyülü sahil', {
    tileFrom: '#6d28d9', tileTo: '#5b21b6', tileBorder: '#4c1d95', accentText: '#2e1065', selection: 'turquoise',
    scene: scn('night', ['#1e1b4b', '#4c1d95', '#be185d'], ['#fef9c3', '#fbcfe8'], ['#4c1d95', '#3b0764', '#2e1065', '#1e1b4b'], { stars: true, water: '#6d28d9', waterDeep: '#2e1065', extra: 'stardust' }),
  }),
  bamboo_valley: makeTheme('bamboo_valley', 'Bambu Vadisi', 'Yüksek bambu ormanlarının fısıldadığı vadi', {
    tileFrom: '#3f6212', tileTo: '#365314', tileBorder: '#1a2e05', accentText: '#1a2e05',
    scene: scn('valley', ['#bef264', '#d9f99d', '#f7fee7'], ['#fefce8', '#fef08a'], ['#a3e635', '#84cc16', '#65a30d', '#3f6212'], { extra: 'bamboo' }),
  }),
  flowery_pass: makeTheme('flowery_pass', 'Çiçekli Dağ Geçidi', 'Yüksek yamaçlarda çiçek açan dağ geçidi', {
    tileFrom: '#be185d', tileTo: '#9d174d', tileBorder: '#831843', accentText: '#500724',
    scene: scn('valley', ['#7dd3fc', '#bae6fd', '#fdf2f8'], ['#fffbeb', '#fef9c3'], ['#cbd5e1', '#86efac', '#4ade80', '#166534'], { extra: 'flowers', flowerColor: '#f472b6', flowerAlt: '#fef08a' }),
  }),
  silver_mist_forest: makeTheme('silver_mist_forest', 'Gümüş Sis Ormanı', 'Gümüş sisin sardığı sessiz çam ormanı', {
    tileFrom: '#52525b', tileTo: '#3f3f46', tileBorder: '#27272a', accentText: '#18181b',
    scene: scn('valley', ['#d4d4d8', '#e4e4e7', '#fafafa'], ['#ffffff', '#e4e4e7'], ['#a1a1aa', '#71717a', '#52525b', '#27272a'], { extra: 'fog' }),
  }),
  endless_horizon_isle: makeTheme('endless_horizon_isle', 'Sonsuz Ufuk Adası', 'Ufkun sonsuzluğa uzandığı tropik ada', {
    tileFrom: '#0369a1', tileTo: '#075985', tileBorder: '#0c4a6e', accentText: '#082f49', selection: 'turquoise',
    bannerBg: 'linear-gradient(90deg, #0369a1 0%, #0d9488 55%, #d97706 100%)',
    scene: scn('sunset', ['#38bdf8', '#fdba74', '#fef3c7'], ['#fffbeb', '#fde68a'], ['#7dd3fc', '#38bdf8', '#fde68a', '#166534'], { sunY: 640, water: '#0ea5e9', waterDeep: '#0369a1', extra: 'palms' }),
  }),
};

/** Manzaraların oyundaki sırası: her biri 10 bölüm sürer. */
export const THEME_ORDER: ThemeId[] = [
  'emerald', 'waterfall', 'azure', 'lavender', 'silent',
  'golden', 'misty', 'coral', 'silver', 'plateau',
  'pine', 'canyon', 'lily', 'glacier', 'desert',
  'meadow', 'coast', 'cloud', 'oasis', 'moonlight',
  'violet', 'crystal', 'olive', 'lagoon', 'autumn',
  'daisy', 'snowy', 'reed', 'butterfly', 'dawn',
  'mossy', 'rainforest', 'volcanic', 'poppy', 'rainbow',
  'ruby_cliffs', 'willow_creek', 'purple_hyacinth', 'pearl_coast', 'full_moon_lake',
  'amber_hills', 'fern_valley', 'storm_cape', 'plum_orchard', 'white_dunes',
  'mirror_lake', 'cliff_falls', 'nacre_bay', 'chestnut_woods', 'sunflower_field',
  'frost_plain', 'valley_of_falls', 'red_pine_highland', 'aurora_bay', 'purple_horizons',
  'sea_cave', 'almond_hills', 'crane_marsh', 'emerald_lagoon', 'shaded_path',
  'snowdrop_slope', 'hidden_fjord', 'windy_steppe', 'obsidian_shore', 'foaming_river',
  'acacia_grove', 'peach_orchard', 'twilight_island', 'cotton_clouds', 'dream_archipelago',
  'sapphire_falls', 'juniper_plateau', 'pink_salt_lake', 'crocus_meadow', 'eagle_crags',
  'linden_grove', 'moonglow_lagoon', 'red_sand_sea', 'blue_ice_cave', 'daffodil_valley',
  'windmill_hill', 'blueberry_forest', 'mirage_oasis', 'white_cliffs', 'lotus_pond',
  'morning_mist_plain', 'firefly_creek', 'sea_arches', 'wisteria_garden', 'hidden_crater_lake',
  'golden_wheat', 'after_rain_hills', 'polar_night_bay', 'plane_river_path', 'orange_desert_canyon',
  'stardust_shore', 'bamboo_valley', 'flowery_pass', 'silver_mist_forest', 'endless_horizon_isle',
  ...EXPANSION_REGIONS.map((region) => region.id),
  ...THIRD_JOURNEY_REGIONS.map((entry) => entry.id),
];

/** Her 10 bölümde yeni bir manzara bölümü başlar. */
export const CHAPTER_SIZE = 10;

export function getChapterIndex(levelId: number): number {
  const safeId = Math.max(1, Math.floor(levelId));
  return Math.floor((safeId - 1) / CHAPTER_SIZE);
}

export function getChapterRange(chapterIndex: number): { start: number; end: number } {
  const start = chapterIndex * CHAPTER_SIZE + 1;
  return { start, end: start + CHAPTER_SIZE - 1 };
}

/**
 * Bölüm teması her 10 bölümde bir değişir; 300 doğa manzarası sırayla gelir.
 * 1501–1510 Akşam Güneşi Vadisi ile başlar, 2991–3000 son manzaradır.
 */
export function getThemeForLevel(levelId: number): ThemeConfig {
  const chapterIndex = getChapterIndex(levelId);
  return THEMES[THEME_ORDER[chapterIndex % THEME_ORDER.length]];
}
