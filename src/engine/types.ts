import type { ExpansionThemeId } from '../data/expansionThemes';
import type { ThirdJourneyThemeId } from '../data/thirdJourneyThemes';

export type Direction = 'across' | 'down';

export type ThemeId =
  | 'emerald'
  | 'waterfall'
  | 'azure'
  | 'lavender'
  | 'silent'
  | 'golden'
  | 'misty'
  | 'coral'
  | 'silver'
  | 'plateau'
  | 'pine'
  | 'canyon'
  | 'lily'
  | 'glacier'
  | 'desert'
  | 'meadow'
  | 'coast'
  | 'cloud'
  | 'oasis'
  | 'moonlight'
  | 'violet'
  | 'crystal'
  | 'olive'
  | 'lagoon'
  | 'autumn'
  | 'daisy'
  | 'snowy'
  | 'reed'
  | 'butterfly'
  | 'dawn'
  | 'mossy'
  | 'rainforest'
  | 'volcanic'
  | 'poppy'
  | 'rainbow'
  | 'ruby_cliffs'
  | 'willow_creek'
  | 'purple_hyacinth'
  | 'pearl_coast'
  | 'full_moon_lake'
  | 'amber_hills'
  | 'fern_valley'
  | 'storm_cape'
  | 'plum_orchard'
  | 'white_dunes'
  | 'mirror_lake'
  | 'cliff_falls'
  | 'nacre_bay'
  | 'chestnut_woods'
  | 'sunflower_field'
  | 'frost_plain'
  | 'valley_of_falls'
  | 'red_pine_highland'
  | 'aurora_bay'
  | 'purple_horizons'
  | 'sea_cave'
  | 'almond_hills'
  | 'crane_marsh'
  | 'emerald_lagoon'
  | 'shaded_path'
  | 'snowdrop_slope'
  | 'hidden_fjord'
  | 'windy_steppe'
  | 'obsidian_shore'
  | 'foaming_river'
  | 'acacia_grove'
  | 'peach_orchard'
  | 'twilight_island'
  | 'cotton_clouds'
  | 'dream_archipelago'
  | 'sapphire_falls'
  | 'juniper_plateau'
  | 'pink_salt_lake'
  | 'crocus_meadow'
  | 'eagle_crags'
  | 'linden_grove'
  | 'moonglow_lagoon'
  | 'red_sand_sea'
  | 'blue_ice_cave'
  | 'daffodil_valley'
  | 'windmill_hill'
  | 'blueberry_forest'
  | 'mirage_oasis'
  | 'white_cliffs'
  | 'lotus_pond'
  | 'morning_mist_plain'
  | 'firefly_creek'
  | 'sea_arches'
  | 'wisteria_garden'
  | 'hidden_crater_lake'
  | 'golden_wheat'
  | 'after_rain_hills'
  | 'polar_night_bay'
  | 'plane_river_path'
  | 'orange_desert_canyon'
  | 'stardust_shore'
  | 'bamboo_valley'
  | 'flowery_pass'
  | 'silver_mist_forest'
  | 'endless_horizon_isle'
  | ExpansionThemeId
  | ThirdJourneyThemeId;

export interface PlacedWord {
  word: string;
  row: number;
  col: number;
  dir: Direction;
}

export interface LevelDefinition {
  id: number;
  title?: string;
  theme: ThemeId;
  letters: string[];
  words: PlacedWord[];
  rewardCoins: number;
  isRestLevel?: boolean;
}

export interface RawLevelSpec {
  id: number;
  theme: ThemeId;
  letters: string[];
  targetWords: string[];
  rewardCoins: number;
  isRestLevel?: boolean;
}

export interface GridCell {
  row: number;
  col: number;
  letter: string;
  wordIndices: number[]; // Hangi hedef kelimelere ait olduğu
}

export interface CompiledGrid {
  rows: number;
  cols: number;
  cells: Map<string, GridCell>; // key: `${row},${col}`
}

export interface ValidationResult {
  levelId: number;
  valid: boolean;
  errors: string[];
}

export interface LevelProgress {
  foundWords: string[];
  revealedCells: string[]; // `${row},${col}` formatında ipucu ile açılan hücreler
  bonusWords: string[];
}

export interface GameSettings {
  soundEnabled: boolean;
}

export interface SaveState {
  version: number;
  unlockedLevel: number;
  currentLevel: number;
  coins: number;
  completedLevels: number[];
  totalBonusFound: number;
  progressByLevel: Record<number, LevelProgress>;
  settings: GameSettings;
}

export type WordCheckOutcome =
  | { status: 'too-short' }
  | { status: 'target-found'; word: string; wordIndex: number }
  | { status: 'already-found-target'; word: string; wordIndex: number }
  | { status: 'bonus-found'; word: string; coinsEarned: number }
  | { status: 'already-found-bonus'; word: string }
  | { status: 'invalid'; word: string };

export type ScreenId = 'menu' | 'game' | 'levels';

export function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}
