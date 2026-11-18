import React, { useMemo } from 'react';
import { ThemeId } from '../engine/types';
import { THEMES } from '../data/themes';

interface ScenicBackgroundProps {
  theme: ThemeId;
}

interface Dot {
  x: number;
  y: number;
  r: number;
  o: number;
}

/** Tema başına sabit (her açılışta aynı) dağılım üreten basit üreteç */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const RIDGE_PATH =
  'M-20 760 L150 615 L310 695 L490 590 L670 685 L840 595 L920 645 L920 900 L-20 900 Z';

const RAINBOW_COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6'];
const LEAF_COLORS = ['#ea580c', '#f59e0b', '#dc2626', '#b45309'];
const BUTTERFLY_SPOTS: Array<[number, number, number]> = [
  [230, 540, -12],
  [330, 680, 14],
  [600, 580, -6],
  [680, 720, 18],
  [460, 470, 8],
  [250, 800, -16],
  [560, 820, 10],
];

const EAGLE_SPOTS: Array<[number, number, number]> = [
  [400, 400, 1.3],
  [520, 350, 1],
  [300, 450, 0.8],
];
const LOTUS_SPOTS: Array<[number, number, number]> = [
  [300, 880, 1],
  [470, 925, 1.15],
  [620, 885, 0.9],
  [360, 1010, 1.2],
  [540, 1035, 1.1],
  [240, 960, 0.9],
  [690, 975, 1],
];
const SALT_SPARKLES: Array<[number, number]> = [
  [250, 890],
  [330, 920],
  [600, 905],
  [700, 940],
  [450, 990],
  [520, 1030],
  [380, 1040],
];
const BAMBOO_STALKS: Array<[number, number, number]> = [
  [190, 300, 12],
  [238, 380, 14],
  [292, 330, 11],
  [610, 340, 12],
  [660, 400, 14],
  [708, 310, 11],
  [420, 240, 10],
  [490, 270, 10],
];
const CRYSTAL_CLUSTERS: Array<[number, number, number]> = [
  [230, 1010, 1],
  [600, 1040, 1.2],
  [420, 1090, 0.8],
  [700, 985, 0.9],
];
const PALMS_LAKE: Array<[number, number, number]> = [
  [250, 930, 1.15],
  [335, 940, 0.95],
  [415, 932, 1.05],
];
const PALMS_OASIS: Array<[number, number, number]> = [
  [300, 975, 1.1],
  [600, 972, 1.2],
  [650, 985, 0.9],
];

export const ScenicBackground: React.FC<ScenicBackgroundProps> = ({ theme }) => {
  const scene = THEMES[theme].scene;
  const extra = scene.extra;

  const stars = useMemo<Dot[]>(() => {
    if (!scene.stars) return [];
    const rand = seeded(42);
    return Array.from({ length: 42 }, () => ({
      x: rand() * 900,
      y: rand() * 560,
      r: 1 + rand() * 2.2,
      o: 0.35 + rand() * 0.6,
    }));
  }, [scene.stars]);

  // Yağmur / kar / yaprak tanecikleri
  const particles = useMemo<Dot[]>(() => {
    const rand = seeded(7 + theme.length * 13);
    return Array.from({ length: 56 }, () => ({
      x: rand() * 900,
      y: rand() * 1000,
      r: rand(),
      o: 0.4 + rand() * 0.5,
    }));
  }, [theme]);

  // Çiçekler, sazlar ve ağaçlar için konumlar
  const scatter = useMemo(() => {
    const rand = seeded(99 + theme.length * 7);
    const front: Dot[] = Array.from({ length: 40 }, () => ({
      x: rand() * 900,
      y: 965 + rand() * 215,
      r: 5 + rand() * 4.5,
      o: 1,
    }));
    const back: Dot[] = Array.from({ length: 22 }, () => ({
      x: rand() * 900,
      y: 878 + rand() * 50,
      r: 2.4 + rand() * 1.8,
      o: 0.9,
    }));
    const reeds = Array.from({ length: 30 }, (_, i) => ({
      x: i % 2 === 0 ? 8 + rand() * 225 : 655 + rand() * 235,
      y: 885 + rand() * 55,
      h: 46 + rand() * 44,
      sway: (rand() - 0.5) * 14,
    }));
    return { front, back, reeds };
  }, [theme]);

  const isLake = !!scene.water;
  const noPines =
    extra === 'dunes' || extra === 'dune_flowers' || extra === 'wheat' ||
    extra === 'bamboo' || (extra === 'palms' && !isLake);
  const isSunset = scene.kind === 'sunset';
  const isNight = scene.kind === 'night';
  const sunY = scene.sunY ?? (isSunset ? 635 : 180);
  const sunX = isSunset ? 450 : isNight ? 700 : 740;
  const sunR = isSunset ? 76 : isNight ? 42 : 46;
  const flowerColor = scene.flowerColor ?? '#f472b6';
  const flowerAlt = scene.flowerAlt ?? '#fde047';

  const renderParticle = (p: Dot, i: number): React.ReactNode => {
    if (extra === 'rain') {
      return (
        <line
          key={i}
          x1={p.x}
          y1={p.y}
          x2={p.x - 8}
          y2={p.y + 26}
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          opacity={p.o * 0.6}
        />
      );
    }
    if (extra === 'snow') {
      return <circle key={i} cx={p.x} cy={p.y} r={2.4 + p.r * 2} fill="#ffffff" opacity={p.o} />;
    }
    if (extra === 'petals') {
      return <ellipse key={i} cx={p.x} cy={p.y} rx="6" ry="3" fill={flowerColor} opacity={p.o} transform={`rotate(${(i * 37) % 180} ${p.x} ${p.y})`} />;
    }
    return (
      <ellipse
        key={i}
        cx={p.x}
        cy={p.y}
        rx="7.5"
        ry="3.6"
        fill={LEAF_COLORS[i % LEAF_COLORS.length]}
        opacity={p.o}
        transform={`rotate(${(i * 37) % 180} ${p.x} ${p.y})`}
      />
    );
  };

  const hasParticles = extra === 'rain' || extra === 'snow' || extra === 'leaves' || extra === 'petals';
  const particleList = extra === 'leaves' || extra === 'petals' ? particles.slice(0, 30) : particles;
  const fallSpeedClass =
    extra === 'rain' ? 'scene-fall-fast' : extra === 'snow' ? 'scene-fall-slow' : '';

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden transition-all duration-700"
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 900 1200"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sceneSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={scene.skyTop} />
            <stop offset="45%" stopColor={scene.skyMid} />
            <stop offset="78%" stopColor={scene.skyBottom} />
            <stop offset="100%" stopColor={scene.skyBottom} />
          </linearGradient>
          <radialGradient id="sceneSunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={scene.sun} stopOpacity="0.95" />
            <stop offset="40%" stopColor={scene.sunGlow} stopOpacity="0.45" />
            <stop offset="100%" stopColor={scene.sunGlow} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sceneWater" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={scene.water ?? scene.skyMid} />
            <stop offset="100%" stopColor={scene.waterDeep ?? scene.water ?? scene.skyMid} />
          </linearGradient>
          <radialGradient id="sceneFog" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sceneFirefly" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef9c3" stopOpacity="1" />
            <stop offset="45%" stopColor="#bef264" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#bef264" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sceneAuroraA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
            <stop offset="45%" stopColor="#34d399" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sceneAuroraB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
          <clipPath id="sceneRidgeClip">
            <path d={RIDGE_PATH} />
          </clipPath>
        </defs>

        {/* Gökyüzü */}
        <rect width="900" height="1200" fill="url(#sceneSky)" />

        {/* Yıldızlar (gece manzaraları) */}
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" opacity={s.o} />
        ))}

        {/* Gökkuşağı */}
        {(extra === 'rainbow' || extra === 'rainbow_cliffs') && (
          <g fill="none" strokeWidth="15" opacity="0.58">
            {RAINBOW_COLORS.map((color, i) => {
              const r = 300 - i * 15;
              return (
                <path
                  key={color}
                  d={`M ${450 - r} 760 A ${r} ${r} 0 0 1 ${450 + r} 760`}
                  stroke={color}
                />
              );
            })}
          </g>
        )}

        {/* Güneş / ay halesi */}
        <circle
          cx={sunX}
          cy={sunY}
          r={isSunset ? 240 : 170}
          fill="url(#sceneSunGlow)"
          className="animate-sun-breathe"
        />
        <circle cx={sunX} cy={sunY} r={sunR} fill={scene.sun} opacity="0.94" />
        {isNight && (
          <circle cx={sunX - 12} cy={sunY - 8} r={sunR * 0.82} fill={scene.skyTop} opacity="0.35" />
        )}

        {/* Yumuşak bulutlar */}
        <g className="animate-cloud-slow" opacity={isNight ? 0.3 : 0.8}>
          <path
            d="M80 175 C80 155 98 140 120 140 C128 122 148 112 170 115 C192 104 222 114 232 136 C252 138 266 153 266 172 C266 188 252 198 234 198 L104 198 C88 198 80 189 80 175 Z"
            fill="#ffffff"
          />
          <path
            d="M570 250 C570 236 582 226 598 226 C606 212 626 206 644 214 C658 206 678 214 684 228 C698 230 708 240 708 252 C708 264 698 272 684 272 L588 272 C576 272 570 262 570 250 Z"
            fill="#ffffff"
            opacity="0.72"
          />
        </g>
        <g className="animate-cloud-med" opacity={isNight ? 0.22 : 0.62}>
          <path
            d="M320 120 C320 107 332 97 346 98 C355 86 372 82 388 89 C400 84 416 90 422 103 C434 105 442 114 442 124 C442 134 434 140 422 140 L336 140 C326 140 320 132 320 120 Z"
            fill="#ffffff"
          />
        </g>

        {/* Kutup ışıkları */}
        {extra === 'aurora' && (
          <g>
            <g className="aurora-wave" opacity="0.7">
              <path
                d="M-40 330 Q140 190 320 290 T690 240 T940 310 L940 470 Q720 380 520 450 T200 410 T-40 480 Z"
                fill="url(#sceneAuroraA)"
              />
            </g>
            <g className="aurora-wave aurora-wave-b" opacity="0.55">
              <path
                d="M-40 250 Q200 120 380 210 T760 170 T940 240 L940 360 Q700 290 500 350 T180 320 T-40 380 Z"
                fill="url(#sceneAuroraB)"
              />
            </g>
          </g>
        )}

        {/* Yıldız tozu: parlayan ve kayan yıldızlar */}
        {extra === 'stardust' && (
          <g>
            {stars.slice(0, 14).map((st, i) => (
              <g key={`tw${i}`} transform={`translate(${st.x} ${st.y}) scale(${1 + st.r * 0.35})`}>
                <path
                  className="twinkle"
                  style={{ animationDelay: `${(i % 7) * 0.45}s` }}
                  d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z"
                  fill="#fef9c3"
                />
              </g>
            ))}
            {[0, 1, 2].map((i) => (
              <g key={`ss${i}`} transform={`translate(${180 + i * 210} ${70 + i * 55})`}>
                <g className="shooting-star" style={{ animationDelay: `${i * 3.1}s` }}>
                  <line x1="0" y1="0" x2="-70" y2="-34" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
                  <circle cx="0" cy="0" r="4" fill="#ffffff" />
                </g>
              </g>
            ))}
          </g>
        )}

        {/* Small birds and distant lightning give the new regions their own silhouettes. */}
        {extra === 'birds' && (
          <g className="animate-cloud-slow" fill="none" stroke={scene.tree} strokeWidth="3" strokeLinecap="round" opacity="0.75">
            {EAGLE_SPOTS.map(([x, y, scale], index) => (
              <path key={index} transform={`translate(${x} ${y - 45}) scale(${scale})`} d="M-18 0 Q-9 -10 0 0 Q9 -10 18 0" />
            ))}
          </g>
        )}
        {extra === 'lightning' && (
          <path className="scene-lightning" d="M660 215 L625 302 L652 302 L618 380 L694 278 L661 278 L697 215 Z" fill="#fff6cc" />
        )}
        {extra === 'wind_chimes' && (
          <g transform="translate(650 245)">
            <g className="scene-sway-top">
              <path d="M-33 0 Q0 -18 33 0" fill="none" stroke="#87684d" strokeWidth="4" strokeLinecap="round" />
              {[-24, -12, 0, 12, 24].map((x, index) => (
                <g key={x}>
                  <line x1={x} y1="-2" x2={x} y2={32 + (index % 2) * 9} stroke="#87684d" strokeWidth="1.5" />
                  <rect x={x - 3} y={27 + (index % 2) * 9} width="6" height="29" rx="3" fill="#c9b49b" />
                </g>
              ))}
              <line x1="0" y1="-12" x2="0" y2="-38" stroke="#87684d" strokeWidth="2" />
            </g>
          </g>
        )}

        {/* Uzak dağlar */}
        <path
          d="M-20 710 L110 560 L235 645 L390 505 L545 620 L710 520 L920 650 L920 850 L-20 850 Z"
          fill={scene.farMtn}
          opacity="0.75"
        />
        <path d="M390 505 L350 555 L380 544 L404 560 L430 540 Z" fill="#ffffff" opacity="0.5" />
        <path d="M710 520 L674 556 L702 548 L724 560 L748 545 Z" fill="#ffffff" opacity="0.42" />

        {/* Orta mesafe sırt */}
        <path d={RIDGE_PATH} fill={scene.midHill} opacity="0.88" />

        {/* Kayalıklar ve kartallar */}
        {(extra === 'cliffs' || extra === 'rainbow_cliffs') && (
          <g>
            <path d="M-30 520 L110 470 L200 560 L240 690 L222 800 L-30 840 Z" fill={scene.frontHill} />
            <path d="M-30 560 L90 520 L160 600 L196 720 L170 800 L-30 830 Z" fill={scene.midHill} opacity="0.65" />
            <path d="M930 500 L790 452 L700 548 L668 690 L690 810 L930 850 Z" fill={scene.frontHill} />
            <path d="M930 544 L810 500 L740 590 L712 720 L732 810 L930 835 Z" fill={scene.midHill} opacity="0.65" />
            <g stroke="#ffffff" strokeWidth="3" opacity="0.28" fill="none" strokeLinecap="round">
              <path d="M30 600 L170 626" />
              <path d="M20 680 L200 704" />
              <path d="M740 612 L900 590" />
              <path d="M726 700 L900 676" />
            </g>
            <g className="animate-cloud-slow" fill="#1f2937" opacity="0.8">
              {EAGLE_SPOTS.map(([x, y, k], i) => (
                <path
                  key={i}
                  transform={`translate(${x} ${y}) scale(${k})`}
                  d="M-18 0 Q-9 -12 0 -1 Q9 -12 18 0 Q9 -5 0 4 Q-9 -5 -18 0 Z"
                />
              ))}
            </g>
          </g>
        )}

        {/* Krater kenarları */}
        {extra === 'crater' && (
          <g>
            <path d="M-30 760 L40 620 L130 560 L230 610 L300 700 L330 760 Z" fill={scene.frontHill} />
            <path d="M930 760 L860 620 L770 556 L670 612 L610 700 L580 760 Z" fill={scene.frontHill} />
            <path d="M-30 700 L60 590 L140 548 L210 580 L130 640 Z" fill={scene.midHill} opacity="0.7" />
            <path d="M930 700 L840 590 L760 546 L690 580 L770 640 Z" fill={scene.midHill} opacity="0.7" />
          </g>
        )}

        {/* Kayalara tutunmuş yosunlar */}
        {extra === 'moss' && (
          <g clipPath="url(#sceneRidgeClip)" fill={scene.frontHill} opacity="0.82">
            <ellipse cx="150" cy="650" rx="92" ry="34" />
            <ellipse cx="490" cy="628" rx="104" ry="38" />
            <ellipse cx="840" cy="632" rx="92" ry="34" />
            <ellipse cx="310" cy="724" rx="82" ry="22" />
            <ellipse cx="670" cy="714" rx="82" ry="22" />
          </g>
        )}

        {/* Yanardağ */}
        {extra === 'volcano' && (
          <g>
            <g className="animate-cloud-slow" fill="#57534e" opacity="0.38">
              <circle cx="450" cy="468" r="26" />
              <circle cx="430" cy="428" r="34" />
              <circle cx="472" cy="392" r="42" />
              <circle cx="446" cy="344" r="50" />
            </g>
            <path d="M240 770 L398 522 Q450 500 502 522 L660 770 Z" fill={scene.tree} />
            <ellipse cx="450" cy="517" rx="50" ry="11" fill="#fb923c" />
            <path
              d="M440 522 Q428 600 456 664 Q472 706 450 770"
              fill="none"
              stroke="#f97316"
              strokeWidth="11"
              strokeLinecap="round"
              opacity="0.92"
            />
            <path
              d="M470 524 Q496 584 482 646"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.9"
            />
          </g>
        )}

        {isLake ? (
          <>
            {/* Sakin su yüzeyi */}
            <rect x="0" y="730" width="900" height="470" fill="url(#sceneWater)" />
            {/* Dağların suya yansıması */}
            <path
              d="M0 730 L140 855 L290 795 L460 885 L645 795 L795 855 L900 790 L900 730 Z"
              fill={scene.waterDeep ?? scene.water ?? scene.skyMid}
              opacity="0.3"
            />
            {/* Deniz kemerleri */}
            {extra === 'arches' && (
              <g>
                <path d="M170 780 L170 676 Q170 604 250 604 Q330 604 330 676 L330 780 L282 780 L282 690 Q282 660 250 660 Q218 660 218 690 L218 780 Z" fill={scene.midHill} />
                <path d="M282 780 L282 690 Q282 660 250 660 L250 640 Q330 640 330 690 L330 780 Z" fill={scene.frontHill} opacity="0.55" />
                <path d="M560 790 L560 700 Q560 640 626 640 Q692 640 692 700 L692 790 L652 790 L652 712 Q652 686 626 686 Q600 686 600 712 L600 790 Z" fill={scene.midHill} />
                <path d="M652 790 L652 712 Q652 686 626 686 L626 668 Q692 668 692 712 L692 790 Z" fill={scene.frontHill} opacity="0.55" />
                <ellipse cx="250" cy="782" rx="96" ry="10" fill="#ffffff" opacity="0.7" />
                <ellipse cx="626" cy="792" rx="84" ry="9" fill="#ffffff" opacity="0.65" />
              </g>
            )}
            {/* Şelale */}
            {(extra === 'waterfall' || extra === 'icy_falls') && (
              <g>
                <rect x="471" y="626" width="38" height="112" rx="11" fill="#ffffff" opacity="0.88" />
                <rect x="479" y="634" width="5" height="98" rx="2.5" fill="#bae6fd" opacity="0.8" />
                <rect x="494" y="640" width="5" height="92" rx="2.5" fill="#bae6fd" opacity="0.7" />
                <ellipse cx="490" cy="742" rx="52" ry="11" fill="#ffffff" opacity="0.85" />
                <ellipse cx="490" cy="756" rx="74" ry="7" fill="#ffffff" opacity="0.4" />
              </g>
            )}
            {/* Su parıltıları */}
            <g className="animate-water-shimmer" fill="#ffffff">
              <rect x="145" y="775" width="130" height="5" rx="3" opacity="0.6" />
              <rect x="175" y="798" width="90" height="4" rx="2" opacity="0.45" />
              <rect x="420" y="815" width="160" height="5" rx="3" opacity="0.4" />
              <rect x="590" y="770" width="110" height="4" rx="2" opacity="0.5" />
              <rect x="290" y="865" width="190" height="5" rx="3" opacity="0.32" />
            </g>
            {extra === 'stardust' && isNight && (
              <g className="animate-water-shimmer" fill="#fff8d9" opacity="0.7">
                {SALT_SPARKLES.map(([x, y], index) => (
                  <path key={index} transform={`translate(${x} ${y}) scale(.7)`} d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" />
                ))}
              </g>
            )}
            {extra === 'reef' && (
              <g fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.75">
                {[185, 290, 420, 550, 680, 765].map((x, index) => (
                  <g key={x} transform={`translate(${x} ${1050 + (index % 3) * 28}) scale(${0.75 + (index % 2) * 0.2})`}>
                    <path d="M0 80 V15 M0 52 Q-30 52 -31 18 M0 42 Q30 40 33 6 M-30 34 Q-49 34 -48 7 M31 26 Q48 26 49 -3" stroke={index % 2 ? '#f29f8f' : '#e67572'} strokeWidth="9" />
                    <circle cx="-31" cy="18" r="5" fill="#ffd0b9" />
                    <circle cx="33" cy="6" r="5" fill="#ffd0b9" />
                  </g>
                ))}
              </g>
            )}
            {extra === 'seafoam' && (
              <g className="animate-water-shimmer" fill="none" stroke="#fffef5" strokeLinecap="round" opacity="0.75">
                <path d="M0 925 Q100 885 205 922 T410 920 T650 915 T910 923" strokeWidth="8" />
                <path d="M40 945 Q135 916 220 945 M580 940 Q710 910 865 941" strokeWidth="4" />
              </g>
            )}
            {extra === 'flamingos' && (
              <g fill="none" stroke="#db879e" strokeWidth="5" strokeLinecap="round">
                {[320, 500, 640].map((x, index) => (
                  <g key={x} transform={`translate(${x} ${890 + index * 17}) scale(${0.8 + index * 0.1})`}>
                    <ellipse cx="0" cy="0" rx="24" ry="12" fill="#f1a5b8" stroke="none" />
                    <path d="M-9 8 L-12 35 M5 9 L9 35 M18 -2 Q32 -15 25 -37 Q18 -48 10 -37" />
                    <path d="M10 -37 L3 -33" stroke="#49464f" />
                  </g>
                ))}
              </g>
            )}
            {/* Lotus çiçekleri */}
            {extra === 'lotus' && (
              <g>
                {LOTUS_SPOTS.map(([x, y, k], i) => (
                  <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
                    <ellipse cx="0" cy="8" rx="38" ry="12" fill="#16a34a" />
                    <ellipse cx="-6" cy="6" rx="26" ry="8" fill="#22c55e" opacity="0.85" />
                    {[-52, -26, 0, 26, 52].map((deg) => (
                      <ellipse key={deg} cx="0" cy="-12" rx="7" ry="16" fill={flowerColor} transform={`rotate(${deg} 0 4)`} />
                    ))}
                    <circle cx="0" cy="-2" r="5" fill={flowerAlt} />
                  </g>
                ))}
              </g>
            )}
            {/* Tuz kabuğu ve parıltılar */}
            {extra === 'salt' && (
              <g>
                <ellipse cx="270" cy="905" rx="150" ry="16" fill="#ffffff" opacity="0.8" />
                <ellipse cx="650" cy="925" rx="170" ry="18" fill="#ffffff" opacity="0.75" />
                <ellipse cx="450" cy="1010" rx="260" ry="22" fill="#ffffff" opacity="0.28" />
                <g className="animate-water-shimmer" fill="#ffffff">
                  {SALT_SPARKLES.map(([x, y], i) => (
                    <path
                      key={i}
                      transform={`translate(${x} ${y})`}
                      d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z"
                      opacity="0.85"
                    />
                  ))}
                </g>
              </g>
            )}
            {/* Kıyı burunları */}
            <path
              d="M-20 825 Q135 805 240 875 Q175 940 -20 965 Z"
              fill={scene.frontHill}
              opacity="0.95"
            />
            <path
              d="M920 810 Q745 795 635 875 Q740 945 920 980 Z"
              fill={scene.frontHill}
              opacity="0.95"
            />
            {/* Kıyı çamları */}
            <g fill={scene.tree} opacity="0.9">
              <polygon points="55,730 22,825 88,825" />
              <polygon points="55,775 16,860 94,860" />
              <polygon points="120,765 92,845 148,845" />
              <polygon points="835,720 800,820 870,820" />
              <polygon points="835,765 792,855 878,855" />
              <polygon points="775,760 748,835 802,835" />
            </g>
            {extra === 'groves' && (
              <g fill={scene.tree} opacity="0.9">
                {[110, 790].map((x) => (
                  <g key={x} transform={`translate(${x} 875)`}>
                    <rect x="-5" y="-60" width="10" height="60" rx="4" />
                    <ellipse cx="0" cy="-75" rx="53" ry="30" />
                    <path d="M-42 -75 Q-65 -40 -55 -15 Q-47 -40 -39 -52 M35 -75 Q60 -42 50 -12 Q44 -38 31 -54" />
                  </g>
                ))}
              </g>
            )}
            {extra === 'lighthouse' && (
              <g transform="translate(625 840)">
                <path d="M-22 0 L-16 -95 L16 -95 L22 0 Z" fill="#fff8ec" />
                <path d="M-19 -28 H19 L17 -48 H-17 Z M-16 -68 H16 L15 -83 H-15 Z" fill="#c95e52" />
                <rect x="-12" y="-110" width="24" height="15" rx="2" fill="#3b5361" />
                <path d="M-16 -110 L0 -122 L16 -110 Z" fill="#c95e52" />
                <circle className="twinkle" cx="0" cy="-102" r="4" fill="#fff4b4" />
              </g>
            )}
            {(extra === 'flowers' || extra === 'butterflies' || extra === 'petals') && (
              <g>
                {scatter.front.filter((item) => item.x < 200 || item.x > 700).map((item, index) => (
                  <g key={index}>
                    <circle cx={item.x} cy={item.y} r={item.r} fill={flowerColor} />
                    <circle cx={item.x} cy={item.y} r={item.r * 0.4} fill={flowerAlt} />
                  </g>
                ))}
              </g>
            )}
            {/* Sazlar */}
            {extra === 'reeds' && (
              <g>
                {scatter.reeds.map((reed, i) => (
                  <g key={i}>
                    <line
                      x1={reed.x}
                      y1={reed.y}
                      x2={reed.x + reed.sway}
                      y2={reed.y - reed.h}
                      stroke={scene.tree}
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <ellipse
                      cx={reed.x + reed.sway}
                      cy={reed.y - reed.h + 9}
                      rx="3.4"
                      ry="9.5"
                      fill="#7c5a2b"
                    />
                  </g>
                ))}
              </g>
            )}
            <path
              d="M-20 1070 Q240 1005 460 1060 T920 1030 L920 1200 L-20 1200 Z"
              fill={scene.waterDeep ?? scene.tree}
              opacity="0.3"
            />
          </>
        ) : (
          <>
            {/* Arka tepeler */}
            <path
              d="M-20 780 Q180 675 390 755 T920 725 L920 1200 L-20 1200 Z"
              fill={scene.midHill}
              opacity="0.85"
            />
            {/* Orta tepeler */}
            <path
              d="M-20 840 Q240 735 510 825 T920 805 L920 1200 L-20 1200 Z"
              fill={scene.midHill}
            />
            {/* Vadi patikası */}
            <path
              d="M450 810 Q500 865 445 935 T495 1200 L565 1200 Q505 970 515 910 Q522 855 475 812 Z"
              fill="#fef3c7"
              opacity="0.28"
            />
            {/* Ön plan tepeler */}
            <path
              d="M-20 935 Q200 845 450 935 T920 905 L920 1200 L-20 1200 Z"
              fill={scene.frontHill}
            />
            {/* Çam ağaçları */}
            {!noPines && (
            <>
            <g fill={scene.tree} opacity="0.88">
              <polygon points="75,785 45,865 105,865" />
              <polygon points="75,820 38,895 112,895" />
              <polygon points="135,805 110,875 160,875" />
              <polygon points="135,838 104,905 166,905" />
              <polygon points="790,770 760,850 820,850" />
              <polygon points="790,805 752,882 828,882" />
              <polygon points="845,795 820,865 870,865" />
            </g>
            <g fill={scene.tree} opacity="0.7">
              <polygon points="35,860 5,950 65,950" />
              <polygon points="860,845 825,945 895,945" />
              <circle cx="190" cy="878" r="24" />
              <circle cx="215" cy="885" r="18" />
              <circle cx="725" cy="866" r="22" />
            </g>
            </>
            )}

            {/* Kum tepeleri */}
            {(extra === 'dunes' || extra === 'dune_flowers') && (
              <g>
                <path d="M-20 880 Q150 800 330 870 T700 850 T920 870 L920 1200 L-20 1200 Z" fill={scene.farMtn} opacity="0.95" />
                <path d="M-20 960 Q200 890 420 955 T920 930 L920 1200 L-20 1200 Z" fill={scene.frontHill} />
                <path d="M-20 1060 Q260 1000 520 1050 T920 1030 L920 1200 L-20 1200 Z" fill={scene.tree} opacity="0.35" />
                <g fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.28">
                  <path d="M60 962 Q260 900 420 952" />
                  <path d="M500 940 Q700 890 880 932" />
                  <path d="M120 1064 Q300 1012 520 1052" />
                </g>
              </g>
            )}

            {/* Rüzgâr değirmeni */}
            {extra === 'windmill' && (
              <g transform="translate(640 818)">
                <polygon points="-26,0 26,0 17,-96 -17,-96" fill="#f5f5f4" />
                <polygon points="-17,-96 17,-96 0,-124" fill="#92400e" />
                <rect x="-7" y="-26" width="14" height="26" rx="3" fill="#78350f" />
                <g transform="translate(0 -104)">
                  <g className="windmill-blades">
                    {[0, 90, 180, 270].map((deg) => (
                      <g key={deg} transform={`rotate(${deg})`}>
                        <rect x="-2.5" y="-78" width="5" height="78" fill="#78350f" />
                        <rect x="2.5" y="-76" width="16" height="44" fill="#fffbeb" opacity="0.95" stroke="#a16207" strokeWidth="1.5" />
                      </g>
                    ))}
                  </g>
                  <circle r="6" fill="#451a03" />
                </g>
              </g>
            )}

            {/* Altın başaklar */}
            {extra === 'wheat' && (
              <g>
                {scatter.back.map((f, i) => (
                  <g key={`wb${i}`} className="scene-sway" style={{ animationDelay: `${(i % 6) * 0.35}s` }}>
                    <line x1={f.x} y1={f.y + 14} x2={f.x} y2={f.y - 12} stroke="#b45309" strokeWidth="1.6" strokeLinecap="round" />
                    <ellipse cx={f.x} cy={f.y - 14} rx="2.4" ry="6" fill="#f59e0b" />
                  </g>
                ))}
                {scatter.front.map((f, i) => (
                  <g key={`wf${i}`} className="scene-sway" style={{ animationDelay: `${(i % 6) * 0.35}s` }}>
                    <line x1={f.x} y1={f.y + 34} x2={f.x} y2={f.y - 22} stroke="#b45309" strokeWidth="2.4" strokeLinecap="round" />
                    <ellipse cx={f.x - 4} cy={f.y - 14} rx="3" ry="7" fill="#fbbf24" transform={`rotate(-24 ${f.x - 4} ${f.y - 14})`} />
                    <ellipse cx={f.x + 4} cy={f.y - 14} rx="3" ry="7" fill="#fbbf24" transform={`rotate(24 ${f.x + 4} ${f.y - 14})`} />
                    <ellipse cx={f.x} cy={f.y - 24} rx="3" ry="8" fill="#f59e0b" />
                    <ellipse cx={f.x - 4} cy={f.y - 2} rx="3" ry="7" fill="#fcd34d" transform={`rotate(-24 ${f.x - 4} ${f.y - 2})`} />
                    <ellipse cx={f.x + 4} cy={f.y - 2} rx="3" ry="7" fill="#fcd34d" transform={`rotate(24 ${f.x + 4} ${f.y - 2})`} />
                  </g>
                ))}
              </g>
            )}

            {/* Bambu ormanı */}
            {extra === 'bamboo' && (
              <g>
                {BAMBOO_STALKS.map(([x, h, w], i) => (
                  <g key={i} className="scene-sway" style={{ animationDelay: `${(i % 5) * 0.5}s` }}>
                    <rect x={x - w / 2} y={1010 - h} width={w} height={h + 190} rx={w / 2} fill={i % 2 ? scene.tree : scene.frontHill} />
                    {Array.from({ length: Math.floor(h / 62) }, (_, k) => (
                      <rect key={k} x={x - w / 2 - 1.5} y={1010 - h + 40 + k * 62} width={w + 3} height="4" rx="2" fill="#ecfccb" opacity="0.55" />
                    ))}
                    <ellipse cx={x + w + 8} cy={1010 - h + 14} rx="16" ry="4.5" fill="#84cc16" transform={`rotate(-24 ${x + w + 8} ${1010 - h + 14})`} />
                    <ellipse cx={x - w - 8} cy={1010 - h + 32} rx="15" ry="4.2" fill="#a3e635" transform={`rotate(22 ${x - w - 8} ${1010 - h + 32})`} />
                  </g>
                ))}
              </g>
            )}

            {/* Mor salkım ağaçları */}
            {extra === 'wisteria' && (
              <g>
                <WisteriaTree x={250} y={905} scale={1} leaf={scene.tree} />
                <WisteriaTree x={650} y={895} scale={0.85} leaf={scene.tree} />
              </g>
            )}

            {/* Zeytin ağaçları */}
            {extra === 'groves' && (
              <g>
                {Array.from({ length: 9 }, (_, i) => {
                  const x = 250 + i * 52;
                  const y = 884 + ((i * 17) % 26);
                  return (
                    <g key={`b${i}`}>
                      <rect x={x - 2} y={y - 4} width="4" height="15" rx="2" fill="#6b4f2a" />
                      <ellipse cx={x} cy={y - 10} rx="15" ry="12" fill={scene.tree} />
                      <ellipse cx={x - 4} cy={y - 13} rx="7" ry="5" fill="#c5d08a" opacity="0.5" />
                    </g>
                  );
                })}
                {Array.from({ length: 7 }, (_, i) => {
                  const x = 150 + i * 100;
                  const y = 1010 + ((i * 23) % 70);
                  return (
                    <g key={`f${i}`}>
                      <rect x={x - 3} y={y - 6} width="6" height="24" rx="3" fill="#6b4f2a" />
                      <ellipse cx={x} cy={y - 18} rx="26" ry="20" fill={scene.tree} />
                      <ellipse cx={x - 7} cy={y - 23} rx="12" ry="8" fill="#c5d08a" opacity="0.5" />
                    </g>
                  );
                })}
              </g>
            )}

            {/* Çiçekler */}
            {(extra === 'flowers' || extra === 'butterflies' || extra === 'dune_flowers' || extra === 'petals') && (
              <g>
                {scatter.back.map((f, i) => (
                  <g key={`b${i}`} opacity={f.o}>
                    <circle cx={f.x} cy={f.y} r={f.r} fill={flowerColor} />
                    <circle cx={f.x} cy={f.y} r={f.r * 0.4} fill={flowerAlt} />
                  </g>
                ))}
                {scatter.front.map((f, i) => (
                  <g key={`f${i}`}>
                    <circle cx={f.x} cy={f.y} r={f.r} fill={flowerColor} />
                    <circle cx={f.x} cy={f.y} r={f.r * 0.42} fill={flowerAlt} />
                  </g>
                ))}
              </g>
            )}
            {extra === 'pinecones' && (
              <g>
                {scatter.front.slice(0, 17).map((item, index) => (
                  <g key={index} transform={`translate(${item.x} ${item.y}) rotate(${(index % 5 - 2) * 12})`}>
                    <ellipse rx="7" ry="11" fill="#75523b" />
                    <path d="M-4 -5 L4 -1 M-5 0 L5 4 M-4 5 L3 8" stroke="#c69b6b" strokeWidth="1.5" />
                  </g>
                ))}
              </g>
            )}
            {extra === 'dew' && (
              <g fill="#e5fbff" stroke="#a9dde6" strokeWidth="1.5">
                {scatter.front.slice(0, 20).map((item, index) => (
                  <g key={index} className="twinkle" style={{ animationDelay: `${(index % 7) * 0.3}s` }}>
                    <ellipse cx={item.x} cy={item.y} rx="4" ry="6" opacity="0.85" />
                    <circle cx={item.x - 1} cy={item.y - 2} r="1.3" fill="#ffffff" stroke="none" />
                  </g>
                ))}
              </g>
            )}
            {extra === 'horses' && (
              <g fill={scene.tree} opacity="0.8">
                {[310, 440, 570].map((x, index) => (
                  <g key={x} transform={`translate(${x} ${885 + (index % 2) * 15}) scale(${0.7 + index * 0.08})`}>
                    <ellipse cx="0" cy="-19" rx="25" ry="11" />
                    <path d="M16 -25 L25 -42 L33 -39 L35 -28 L23 -20 Z M-19 -20 L-29 -29 L-25 -11 Z M-16 -12 L-20 12 L-14 12 L-9 -12 M10 -12 L13 12 L19 12 L17 -13 Z" />
                  </g>
                ))}
              </g>
            )}
          </>
        )}

        {/* Sis */}
        {extra === 'fog' && (
          <g>
            <g className="animate-cloud-slow">
              <ellipse cx="230" cy="790" rx="320" ry="46" fill="url(#sceneFog)" opacity="0.8" />
              <ellipse cx="720" cy="880" rx="340" ry="52" fill="url(#sceneFog)" opacity="0.75" />
            </g>
            <g className="animate-cloud-med">
              <ellipse cx="470" cy="735" rx="380" ry="40" fill="url(#sceneFog)" opacity="0.7" />
              <ellipse cx="180" cy="965" rx="300" ry="50" fill="url(#sceneFog)" opacity="0.7" />
              <ellipse cx="740" cy="1030" rx="280" ry="46" fill="url(#sceneFog)" opacity="0.6" />
            </g>
          </g>
        )}

        {/* Palmiyeler: göllerde kum adası, çölde vaha havuzu */}
        {extra === 'palms' && (
          <g>
            {isLake ? (
              <ellipse cx="330" cy="935" rx="210" ry="28" fill="#fde68a" />
            ) : (
              <>
                <ellipse cx="450" cy="985" rx="170" ry="24" fill="#14b8a6" />
                <ellipse cx="450" cy="982" rx="136" ry="15" fill="#99f6e4" opacity="0.7" />
              </>
            )}
            {(isLake ? PALMS_LAKE : PALMS_OASIS).map(([x, y, k], i) => (
              <Palm key={i} x={x} y={y} scale={k} />
            ))}
          </g>
        )}

        {/* Ateşböcekleri */}
        {extra === 'fireflies' && (
          <g>
            {particles.slice(0, 22).map((p, i) => {
              const x = 40 + (p.x / 900) * 820;
              const y = 640 + p.y * 0.46;
              return (
                <g
                  key={i}
                  className="firefly"
                  style={{ animationDelay: `${(i % 8) * 0.55}s`, animationDuration: `${2.6 + (i % 5) * 0.55}s` }}
                >
                  <circle cx={x} cy={y} r="11" fill="url(#sceneFirefly)" />
                  <circle cx={x} cy={y} r="2.6" fill="#fefce8" />
                </g>
              );
            })}
          </g>
        )}

        {/* Buz sarkıtları ve kristaller */}
        {(extra === 'crystals' || extra === 'icy_falls') && (
          <g>
            {Array.from({ length: 15 }, (_, i) => {
              const x = i * 62 + ((i * 37) % 28);
              const h = 46 + ((i * 53) % 78);
              const tip = x + ((i % 3) - 1) * 7;
              return (
                <g key={`ic${i}`}>
                  <polygon points={`${x - 24},-4 ${x + 24},-4 ${tip},${h}`} fill="#e0f2fe" opacity="0.5" />
                  <polygon points={`${x - 24},-4 ${x - 2},-4 ${tip},${h}`} fill="#ffffff" opacity="0.35" />
                </g>
              );
            })}
            {CRYSTAL_CLUSTERS.map(([x, y, k], i) => (
              <g key={`cc${i}`} transform={`translate(${x} ${y}) scale(${k})`}>
                <polygon points="-18,0 -8,-62 2,0" fill="#a5f3fc" opacity="0.9" />
                <polygon points="-2,0 12,-92 26,0" fill="#67e8f9" opacity="0.92" />
                <polygon points="20,0 30,-48 40,0" fill="#e0f2fe" opacity="0.9" />
                <polygon points="12,-92 26,0 14,0" fill="#ffffff" opacity="0.4" />
              </g>
            ))}
          </g>
        )}

        {extra === 'cave' && (
          <g fill={scene.tree} opacity="0.88">
            <path d="M-20 -20 H920 V135 Q790 115 730 218 L696 330 Q672 150 578 95 Q455 26 322 95 Q228 150 204 330 L170 218 Q110 115 -20 135 Z" />
            <path d="M-20 110 L170 180 Q190 250 180 390 L120 650 L-20 730 Z" />
            <path d="M920 110 L730 180 Q710 250 720 390 L780 650 L920 730 Z" />
          </g>
        )}

        {/* Kelebekler */}
        {extra === 'butterflies' && (
          <>
            {[0, 1].map((group) => (
              <g key={group} className={group === 0 ? 'animate-cloud-slow' : 'animate-cloud-med'}>
                {BUTTERFLY_SPOTS.filter((_, i) => i % 2 === group).map(([x, y, rot], i) => (
                  <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`} opacity="0.92">
                    <ellipse cx="-7" cy="-3" rx="8.5" ry="5.8" fill={flowerColor} transform="rotate(-28 -7 -3)" />
                    <ellipse cx="7" cy="-3" rx="8.5" ry="5.8" fill={flowerColor} transform="rotate(28 7 -3)" />
                    <ellipse cx="-5" cy="5" rx="5" ry="4" fill={flowerAlt} />
                    <ellipse cx="5" cy="5" rx="5" ry="4" fill={flowerAlt} />
                    <rect x="-1" y="-6" width="2" height="13" rx="1" fill="#1f2937" />
                  </g>
                ))}
              </g>
            ))}
          </>
        )}

        {/* Yağmur, kar veya savrulan yapraklar */}
        {hasParticles && (
          <>
            <g className={`scene-fall ${fallSpeedClass}`}>
              {particleList.filter((_, i) => i % 2 === 0).map(renderParticle)}
            </g>
            <g className={`scene-fall scene-fall-b ${fallSpeedClass}`}>
              {particleList.filter((_, i) => i % 2 === 1).map(renderParticle)}
            </g>
          </>
        )}
      </svg>

      {/* Bulmaca alanının okunabilirliğini koruyan çok hafif ferah üst katman */}
      <div
        className="absolute inset-x-0 top-0 h-[55%]"
        style={{
          background: isNight
            ? 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 65%, rgba(255,255,255,0) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 65%, rgba(255,255,255,0) 100%)',
        }}
      />
    </div>
  );
};

interface PalmProps {
  x: number;
  y: number;
  scale: number;
}

const Palm: React.FC<PalmProps> = ({ x, y, scale }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M0 0 Q8 -48 -4 -96" fill="none" stroke="#7c4a1e" strokeWidth="8" strokeLinecap="round" />
    <g transform="translate(-4 -96)">
      <g className="palm-sway">
        {[-165, -125, -85, -45, -5, 35].map((deg) => (
          <path key={deg} transform={`rotate(${deg})`} d="M0 0 Q34 -30 74 8 Q36 -10 0 0 Z" fill="#15803d" />
        ))}
        <circle r="5" cx="2" cy="4" fill="#78350f" />
      </g>
    </g>
  </g>
);

interface WisteriaTreeProps {
  x: number;
  y: number;
  scale: number;
  leaf: string;
}

const WISTERIA_COLORS = ['#a78bfa', '#8b5cf6', '#c4b5fd', '#7c3aed', '#ddd6fe'];

const WisteriaTree: React.FC<WisteriaTreeProps> = ({ x, y, scale, leaf }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x="-7" y="-72" width="14" height="72" rx="5" fill="#6b4f2a" />
    <ellipse cx="0" cy="-104" rx="92" ry="44" fill={leaf} />
    <ellipse cx="-38" cy="-96" rx="52" ry="30" fill={leaf} opacity="0.9" />
    <ellipse cx="42" cy="-98" rx="54" ry="30" fill={leaf} opacity="0.9" />
    {[-64, -36, -8, 22, 52].map((dx, i) => (
      <g key={dx} className="scene-sway-top" style={{ animationDelay: `${i * 0.5}s` }}>
        {[0, 1, 2, 3, 4].map((k) => (
          <circle
            key={k}
            cx={dx + (k % 2 ? 3 : -3)}
            cy={-70 + k * 13 + (i % 2) * 6}
            r={9 - k * 1.3}
            fill={WISTERIA_COLORS[(k + i) % WISTERIA_COLORS.length]}
          />
        ))}
      </g>
    ))}
  </g>
);
