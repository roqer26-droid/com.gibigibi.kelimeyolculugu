import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudFog,
  Coins,
  Droplet,
  Droplets,
  Flame,
  Flower,
  Flower2,
  Gem,
  Leaf,
  Lock,
  Moon,
  MoonStar,
  Mountain,
  Play,
  Shell,
  Snowflake,
  Star,
  Sun,
  Sunset,
  Tent,
  TreePine,
  Waves,
  Bird,
  CloudRain,
  Clover,
  Diamond,
  Fish,
  FlameKindling,
  MountainSnow,
  Rainbow,
  Rose,
  Shrub,
  Sprout,
  Sunrise,
  TreeDeciduous,
  Wheat,
  Anchor,
  Cherry,
  Citrus,
  Compass,
  Ship,
  Sparkles,
  Trees,
  Wind,
  Fan,
  Feather,
  Grape,
  Infinity as InfinityIcon,
  Landmark,
  TreePalm,
} from 'lucide-react';
import { LevelDefinition, SaveState, ThemeId } from '../engine/types';
import { LEVELS } from '../data/levels';
import {
  CHAPTER_SIZE,
  getChapterIndex,
  getChapterRange,
  getThemeForLevel,
} from '../data/themes';
import type { SceneExtra } from '../data/themes';
import { soundManager } from '../utils/sound';

interface LevelSelectProps {
  save: SaveState;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

const THEME_ICONS: Partial<Record<ThemeId, React.ReactNode>> = {
  emerald: <Gem className="h-4 w-4" />,
  waterfall: <Droplets className="h-4 w-4" />,
  azure: <Waves className="h-4 w-4" />,
  lavender: <Flower2 className="h-4 w-4" />,
  silent: <Moon className="h-4 w-4" />,
  golden: <Sun className="h-4 w-4" />,
  misty: <CloudFog className="h-4 w-4" />,
  coral: <Shell className="h-4 w-4" />,
  silver: <Droplet className="h-4 w-4" />,
  plateau: <Mountain className="h-4 w-4" />,
  pine: <TreePine className="h-4 w-4" />,
  canyon: <Flame className="h-4 w-4" />,
  lily: <Flower className="h-4 w-4" />,
  glacier: <Snowflake className="h-4 w-4" />,
  desert: <Star className="h-4 w-4" />,
  meadow: <Leaf className="h-4 w-4" />,
  coast: <Sunset className="h-4 w-4" />,
  cloud: <Cloud className="h-4 w-4" />,
  oasis: <Tent className="h-4 w-4" />,
  moonlight: <MoonStar className="h-4 w-4" />,
  violet: <Flower2 className="h-4 w-4" />,
  crystal: <Diamond className="h-4 w-4" />,
  olive: <Sprout className="h-4 w-4" />,
  lagoon: <Fish className="h-4 w-4" />,
  autumn: <TreeDeciduous className="h-4 w-4" />,
  daisy: <Clover className="h-4 w-4" />,
  snowy: <MountainSnow className="h-4 w-4" />,
  reed: <Wheat className="h-4 w-4" />,
  butterfly: <Bird className="h-4 w-4" />,
  dawn: <Sunrise className="h-4 w-4" />,
  mossy: <Shrub className="h-4 w-4" />,
  rainforest: <CloudRain className="h-4 w-4" />,
  volcanic: <FlameKindling className="h-4 w-4" />,
  poppy: <Rose className="h-4 w-4" />,
  rainbow: <Rainbow className="h-4 w-4" />,
  ruby_cliffs: <Gem className="h-4 w-4" />,
  willow_creek: <TreeDeciduous className="h-4 w-4" />,
  purple_hyacinth: <Flower2 className="h-4 w-4" />,
  pearl_coast: <Shell className="h-4 w-4" />,
  full_moon_lake: <Moon className="h-4 w-4" />,
  amber_hills: <Sun className="h-4 w-4" />,
  fern_valley: <Leaf className="h-4 w-4" />,
  storm_cape: <CloudRain className="h-4 w-4" />,
  plum_orchard: <Cherry className="h-4 w-4" />,
  white_dunes: <Tent className="h-4 w-4" />,
  mirror_lake: <Waves className="h-4 w-4" />,
  cliff_falls: <Droplets className="h-4 w-4" />,
  nacre_bay: <Anchor className="h-4 w-4" />,
  chestnut_woods: <Trees className="h-4 w-4" />,
  sunflower_field: <Sprout className="h-4 w-4" />,
  frost_plain: <Snowflake className="h-4 w-4" />,
  valley_of_falls: <Droplets className="h-4 w-4" />,
  red_pine_highland: <TreePine className="h-4 w-4" />,
  aurora_bay: <Sparkles className="h-4 w-4" />,
  purple_horizons: <Sunset className="h-4 w-4" />,
  sea_cave: <Mountain className="h-4 w-4" />,
  almond_hills: <Flower className="h-4 w-4" />,
  crane_marsh: <Bird className="h-4 w-4" />,
  emerald_lagoon: <Fish className="h-4 w-4" />,
  shaded_path: <Compass className="h-4 w-4" />,
  snowdrop_slope: <MountainSnow className="h-4 w-4" />,
  hidden_fjord: <Ship className="h-4 w-4" />,
  windy_steppe: <Wind className="h-4 w-4" />,
  obsidian_shore: <Diamond className="h-4 w-4" />,
  foaming_river: <Waves className="h-4 w-4" />,
  acacia_grove: <TreePine className="h-4 w-4" />,
  peach_orchard: <Citrus className="h-4 w-4" />,
  twilight_island: <MoonStar className="h-4 w-4" />,
  cotton_clouds: <Cloud className="h-4 w-4" />,
  dream_archipelago: <Rainbow className="h-4 w-4" />,
  sapphire_falls: <Droplets className="h-4 w-4" />,
  juniper_plateau: <Trees className="h-4 w-4" />,
  pink_salt_lake: <Droplet className="h-4 w-4" />,
  crocus_meadow: <Flower className="h-4 w-4" />,
  eagle_crags: <Feather className="h-4 w-4" />,
  linden_grove: <TreeDeciduous className="h-4 w-4" />,
  moonglow_lagoon: <Moon className="h-4 w-4" />,
  red_sand_sea: <Sun className="h-4 w-4" />,
  blue_ice_cave: <Snowflake className="h-4 w-4" />,
  daffodil_valley: <Flower2 className="h-4 w-4" />,
  windmill_hill: <Fan className="h-4 w-4" />,
  blueberry_forest: <Grape className="h-4 w-4" />,
  mirage_oasis: <TreePalm className="h-4 w-4" />,
  white_cliffs: <Mountain className="h-4 w-4" />,
  lotus_pond: <Flower className="h-4 w-4" />,
  morning_mist_plain: <CloudFog className="h-4 w-4" />,
  firefly_creek: <Sparkles className="h-4 w-4" />,
  sea_arches: <Landmark className="h-4 w-4" />,
  wisteria_garden: <Flower2 className="h-4 w-4" />,
  hidden_crater_lake: <FlameKindling className="h-4 w-4" />,
  golden_wheat: <Wheat className="h-4 w-4" />,
  after_rain_hills: <Rainbow className="h-4 w-4" />,
  polar_night_bay: <MoonStar className="h-4 w-4" />,
  plane_river_path: <Leaf className="h-4 w-4" />,
  orange_desert_canyon: <Mountain className="h-4 w-4" />,
  stardust_shore: <Star className="h-4 w-4" />,
  bamboo_valley: <Sprout className="h-4 w-4" />,
  flowery_pass: <Rose className="h-4 w-4" />,
  silver_mist_forest: <TreePine className="h-4 w-4" />,
  endless_horizon_isle: <InfinityIcon className="h-4 w-4" />,
};

const EXPANSION_ICONS: Partial<Record<SceneExtra, React.ReactNode>> = {
  flowers: <Flower2 className="h-4 w-4" />,
  groves: <Trees className="h-4 w-4" />,
  waterfall: <Droplets className="h-4 w-4" />,
  icy_falls: <Snowflake className="h-4 w-4" />,
  birds: <Bird className="h-4 w-4" />,
  pinecones: <TreePine className="h-4 w-4" />,
  reef: <Fish className="h-4 w-4" />,
  dew: <Droplet className="h-4 w-4" />,
  dune_flowers: <Flower className="h-4 w-4" />,
  seafoam: <Waves className="h-4 w-4" />,
  cave: <Mountain className="h-4 w-4" />,
  cliffs: <Mountain className="h-4 w-4" />,
  lotus: <Flower className="h-4 w-4" />,
  rainbow_cliffs: <Rainbow className="h-4 w-4" />,
  lightning: <CloudRain className="h-4 w-4" />,
  palms: <TreePalm className="h-4 w-4" />,
  stardust: <Star className="h-4 w-4" />,
  fog: <CloudFog className="h-4 w-4" />,
  leaves: <Leaf className="h-4 w-4" />,
  dunes: <Sun className="h-4 w-4" />,
  crystals: <Diamond className="h-4 w-4" />,
  lighthouse: <Landmark className="h-4 w-4" />,
  horses: <Compass className="h-4 w-4" />,
  flamingos: <Bird className="h-4 w-4" />,
  petals: <Flower2 className="h-4 w-4" />,
  wind_chimes: <Wind className="h-4 w-4" />,
};

interface Chapter {
  index: number;
  start: number;
  end: number;
  levels: LevelDefinition[];
}

const CHAPTERS_PER_PAGE = 10;

export const LevelSelect: React.FC<LevelSelectProps> = ({
  save,
  onSelectLevel,
  onBack,
}) => {
  const completedSet = useMemo(() => new Set(save.completedLevels), [save.completedLevels]);

  const chapters = useMemo<Chapter[]>(() => {
    const count = Math.ceil(LEVELS.length / CHAPTER_SIZE);
    return Array.from({ length: count }, (_, index) => {
      const { start } = getChapterRange(index);
      const end = Math.min(LEVELS.length, start + CHAPTER_SIZE - 1);
      return {
        index,
        start,
        end,
        levels: LEVELS.slice(index * CHAPTER_SIZE, (index + 1) * CHAPTER_SIZE),
      };
    });
  }, []);

  const currentChapterIndex = getChapterIndex(save.currentLevel);
  const [selectedChapter, setSelectedChapter] = useState(currentChapterIndex);
  const [pageIndex, setPageIndex] = useState(Math.floor(currentChapterIndex / CHAPTERS_PER_PAGE));
  const chapterRefs = useRef(new Map<number, HTMLElement>());
  const pageCount = Math.ceil(chapters.length / CHAPTERS_PER_PAGE);
  const firstChapterIndex = pageIndex * CHAPTERS_PER_PAGE;
  const visibleChapters = chapters.slice(firstChapterIndex, firstChapterIndex + CHAPTERS_PER_PAGE);

  const showChapter = (index: number) => {
    setSelectedChapter(index);
    setPageIndex(Math.floor(index / CHAPTERS_PER_PAGE));
  };

  // Only the selected page is rendered, keeping long journeys responsive on mobile.
  useEffect(() => {
    chapterRefs.current.get(selectedChapter)?.scrollIntoView({ block: 'start' });
  }, [pageIndex, selectedChapter]);

  return (
    <div className="relative z-10 flex h-full w-full flex-col">
      {/* Üst başlık çubuğu */}
      <header className="mx-auto flex w-full max-w-lg shrink-0 items-center justify-between px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onBack();
          }}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/92 text-slate-700 shadow-md ring-1 ring-white/90 transition hover:scale-105 active:scale-95"
          aria-label="Ana menüye dön"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center">
          <div className="rounded-full bg-white/92 px-5 py-1.5 text-base font-black text-slate-800 shadow-md ring-1 ring-white/90">
            Bölümler
          </div>
          <div className="mt-1 rounded-full bg-white/85 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-600 shadow-sm">
            {save.completedLevels.length} / {LEVELS.length} tamamlandı
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-white/92 px-3.5 py-1.5 text-sm font-black text-amber-600 shadow-md ring-1 ring-white/90">
          <Coins className="h-4 w-4 text-amber-500" />
          <span>{save.coins}</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg shrink-0 px-4 pb-2">
        <label className="sr-only" htmlFor="chapter-jump">Manzaraya git</label>
        <select
          id="chapter-jump"
          value={selectedChapter}
          onChange={(event) => {
            const chapterIndex = Number(event.currentTarget.value);
            showChapter(chapterIndex);
          }}
          className="w-full cursor-pointer rounded-2xl border border-white/90 bg-white/90 px-4 py-2 text-sm font-extrabold text-slate-700 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {chapters.map((chapter) => (
            <option key={chapter.index} value={chapter.index}>
              {getThemeForLevel(chapter.start).name} · {chapter.start}–{chapter.end}
            </option>
          ))}
        </select>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs font-extrabold text-slate-700">
          <button
            type="button"
            disabled={pageIndex === 0}
            onClick={() => showChapter((pageIndex - 1) * CHAPTERS_PER_PAGE)}
            className="flex min-h-9 cursor-pointer items-center gap-1 rounded-xl bg-white/90 px-3 shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Önceki bölüm aralığı"
          >
            <ChevronLeft className="h-4 w-4" /> Önceki
          </button>
          <span className="rounded-xl bg-white/85 px-2 py-1.5 text-center">
            {visibleChapters[0]?.start}–{visibleChapters[visibleChapters.length - 1]?.end} / {LEVELS.length}
          </span>
          <button
            type="button"
            disabled={pageIndex >= pageCount - 1}
            onClick={() => showChapter((pageIndex + 1) * CHAPTERS_PER_PAGE)}
            className="flex min-h-9 cursor-pointer items-center gap-1 rounded-xl bg-white/90 px-3 shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Sonraki bölüm aralığı"
          >
            Sonraki <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Kaydırılabilir bölüm haritası */}
      <div className="custom-scroll mx-auto w-full max-w-lg flex-1 overflow-y-auto px-4 pt-2 pb-8">
        <div className="flex flex-col gap-4">
          {visibleChapters.map((chapter) => {
            const theme = getThemeForLevel(chapter.start);
            const chapterCompleted = chapter.levels.filter((lvl) =>
              completedSet.has(lvl.id)
            ).length;
            const isChapterUnlocked = chapter.levels.some(
              (lvl) => lvl.id <= save.unlockedLevel
            );
            const isCurrentChapter = chapter.index === currentChapterIndex;

            return (
              <section
                key={chapter.index}
                ref={(node) => {
                  if (node) chapterRefs.current.set(chapter.index, node);
                  else chapterRefs.current.delete(chapter.index);
                }}
                className={`overflow-hidden rounded-3xl border-2 bg-white/88 shadow-xl backdrop-blur-sm transition ${
                  isCurrentChapter ? 'border-sky-300/90' : 'border-white/85'
                }`}
              >
                {/* Tema başlık şeridi */}
                <div
                  className="flex items-center justify-between px-4 py-3 text-white"
                  style={{ background: theme.bannerBg }}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20">
                      {THEME_ICONS[theme.id] ??
                        (theme.scene.extra && EXPANSION_ICONS[theme.scene.extra]) ??
                        (theme.scene.water ? <Waves className="h-4 w-4" /> : <Mountain className="h-4 w-4" />)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-black leading-tight">
                        {theme.name}
                      </h2>
                      <p className="truncate text-[11px] font-bold text-white/85">
                        Bölüm {chapter.start} – {chapter.end} • {theme.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">
                    {!isChapterUnlocked && <Lock className="h-3.5 w-3.5" />}
                    <span>
                      {chapterCompleted} / {chapter.levels.length}
                    </span>
                  </div>
                </div>

                {/* 5 sütunlu bölüm ızgarası (10 bölüm = 2 satır) */}
                <div className="grid grid-cols-5 gap-2.5 p-3.5 sm:gap-3 sm:p-4">
                  {chapter.levels.map((lvl) => {
                    const isUnlocked = lvl.id <= save.unlockedLevel;
                    const isCompleted = completedSet.has(lvl.id);
                    const isCurrent = lvl.id === save.currentLevel;
                    const progress = save.progressByLevel[lvl.id];
                    const foundCount = progress?.foundWords.length ?? 0;
                    const hasPartialProgress =
                      !isCompleted && foundCount > 0 && foundCount < lvl.words.length;

                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => {
                          if (!isUnlocked) return;
                          soundManager.playClick();
                          onSelectLevel(lvl.id);
                        }}
                        aria-label={
                          isUnlocked
                            ? `Bölüm ${lvl.id}${isCompleted ? ' (Tamamlandı)' : ''}`
                            : `Bölüm ${lvl.id} (Kilitli)`
                        }
                        className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl font-black transition-all ${
                          isUnlocked
                            ? 'cursor-pointer hover:-translate-y-0.5 active:scale-95'
                            : 'cursor-not-allowed opacity-60'
                        }`}
                        style={{
                          background: isCompleted
                            ? theme.filledTileBg
                            : isCurrent
                              ? '#ffffff'
                              : isUnlocked
                                ? '#f8fafc'
                                : '#e2e8f0',
                          color: isCompleted
                            ? '#ffffff'
                            : isUnlocked
                              ? '#1e293b'
                              : '#64748b',
                          border: isCurrent
                            ? `2.5px solid ${theme.lineColor}`
                            : isCompleted
                              ? `1.5px solid ${theme.filledTileBorder}`
                              : '1.5px solid rgba(203, 213, 225, 0.9)',
                          boxShadow: isCurrent
                            ? `0 0 0 3px ${theme.lineGlow}, 0 4px 10px rgba(15, 23, 42, 0.14)`
                            : isCompleted
                              ? '0 3px 0 rgba(15, 23, 42, 0.18)'
                              : '0 2px 0 rgba(148, 163, 184, 0.35)',
                        }}
                      >
                        {!isUnlocked ? (
                          <>
                            <Lock className="h-4 w-4 text-slate-400" />
                            <span className="mt-0.5 text-[11px] font-bold text-slate-400">
                              {lvl.id}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-base leading-none sm:text-lg">
                              {lvl.id}
                            </span>

                            {isCompleted ? (
                              <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/25">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </span>
                            ) : hasPartialProgress ? (
                              <span className="mt-1 rounded-full bg-sky-100 px-1.5 text-[9px] font-extrabold text-sky-700">
                                {foundCount}/{lvl.words.length}
                              </span>
                            ) : isCurrent ? (
                              <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-white">
                                <Play className="h-2.5 w-2.5 fill-white" />
                              </span>
                            ) : (
                              <span className="mt-1 text-[9px] font-bold text-slate-400">
                                {lvl.words.length} kel.
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <p className="mx-auto rounded-full bg-white/85 px-4 py-1.5 text-center text-[11px] font-bold text-slate-600 shadow-sm">
            Her 10 bölümde yeni bir doğa manzarasına geçilir.
          </p>
        </div>
      </div>
    </div>
  );
};
