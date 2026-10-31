import React from 'react';

export type BitoyMood = 'idle' | 'wave' | 'thinking' | 'happy' | 'sorry';

type BitoyProps = {
  mood?: BitoyMood;
  /** Off for avatars that should hold still (older chat messages). */
  animated?: boolean;
  /** Leaf veins, bark furrows, a second flower and fruit — only worth drawing at large sizes. */
  detailed?: boolean;
  className?: string;
  /** Decorative by default; pass a title to expose it to assistive tech. */
  title?: string;
};

/**
 * Bitoy, the chatbot's mascot: the ~500-year-old Bitaug tree (Calophyllum inophyllum) of Barangay
 * Caloc-an, a Philippine Centennial Tree (DENR 1998) — the same tree as the site's BitaugMotif.
 * The crown is the head; a white Bitaug flower with its golden stamens sits on it like a hair clip.
 *
 * Drawn as a lit illustration rather than flat shapes: light falls from the upper left, every
 * foliage lobe is shaded as a sphere, a dark back mass gives the crown a far side, the crown
 * shades the trunk where it overhangs, and the bark is lit on one side. While idle the back mass,
 * the crown and the front leaves sway at different rates, so the layers shift against each other.
 *
 * Moods: `idle` sways and blinks, `wave` waves the right branch, `thinking` glances up while leaves
 * drift by, `happy` hops with closed eyes, `sorry` droops with worried brows. Every movement is
 * behind `motion-safe:`; with reduced motion the expressions still change, nothing moves.
 *
 * Moving parts are nested groups — a static pose outside, an animation inside — so a pose
 * transform never fights an animated one, and each pivots on its own box ([transform-box:fill-box]).
 *
 * The bark browns and the flower gold are the colours outside the site palette (a green trunk
 * read as broccoli, not a tree); they are used for the mascot only.
 */
const BARK_LIGHT = '#A87A50';
const BARK = '#7A4E2D';
const BARK_DARK = '#4A2E18';
const FACE_INK = '#2A1A0E';
const STAMEN = '#F2C230';
const STAMEN_DARK = '#C98F00';

/* Crown lobes, back to front: the centre lobe carries the face, so it is drawn last. */
const LOBES: [number, number, number][] = [
  [20, 54, 11], [108, 54, 11], [46, 28, 15], [82, 28, 15], [64, 20, 13],
  [38, 48, 17], [90, 48, 17], [50, 62, 14], [78, 62, 14], [64, 44, 24],
];
/* The far side of the crown, offset down and right, away from the light. */
const BACK_LOBES: [number, number, number][] = [
  [25, 61, 11], [104, 61, 12], [51, 33, 15], [87, 33, 15], [65, 26, 14],
  [41, 57, 17], [93, 57, 17], [64, 70, 15],
];
/* Leaf tips around the silhouette, so the crown reads as foliage: [x, y, angle, length]. */
const EDGE_LEAVES: [number, number, number, number][] = [
  [12, 50, 185, 9], [16, 45, 205, 8], [116, 50, -5, 9], [112, 45, -25, 8],
  [38, 17, 235, 8], [56, 12, 255, 8], [72, 12, 285, 8], [90, 17, 305, 8],
  [31, 36, 215, 8], [97, 36, 325, 8],
];
const FRONT_LEAVES: [number, number, number, number][] = [
  [15, 61, 160, 9], [113, 61, 20, 9], [31, 70, 130, 8], [97, 70, 50, 8], [42, 73, 110, 7], [86, 73, 70, 7],
];
/* Leaf texture on the crown: sunlit leaves on the upper left, shaded ones on the lower right. */
const LIT_LEAVES: [number, number, number, number][] = [
  [33, 38, -35, 7], [44, 20, -55, 7], [27, 50, -15, 6], [58, 12, -70, 6], [74, 19, -30, 6],
];
const SHADED_LEAVES: [number, number, number, number][] = [
  [98, 60, 30, 7], [86, 69, 60, 6], [105, 49, 10, 6], [40, 66, 150, 6],
];
const EXTRA_LIT: [number, number, number, number][] = [
  [21, 46, -10, 5], [38, 29, -40, 5], [52, 25, -60, 5], [84, 24, -20, 5], [30, 59, 170, 5],
];
const EXTRA_SHADED: [number, number, number, number][] = [
  [94, 40, 20, 5], [99, 66, 50, 5], [56, 71, 120, 5], [74, 72, 70, 5], [112, 57, 15, 5],
];

const leafPath = (len: number, w: number) =>
  `M0 0C${len * 0.25} ${-w} ${len * 0.72} ${-w} ${len} 0C${len * 0.72} ${w} ${len * 0.25} ${w} 0 0Z`;

export function Bitoy({ mood = 'idle', animated = true, detailed = false, className = '', title }: BitoyProps) {
  const move = (cls: string) => (animated ? cls : '');
  const swaying = mood === 'idle' || mood === 'wave' || mood === 'happy';

  // Every instance needs its own gradient ids: the chat shows several Bitoys at once.
  const uid = React.useId().replace(/:/g, '');
  const id = (name: string) => `bitoy-${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;

  // Static poses: the crown tilts in thought and droops when sorry; the eyes glance up.
  const canopyPose = mood === 'thinking' ? 'rotate(3deg)' : mood === 'sorry' ? 'rotate(-3deg) translateY(2.5px)' : 'none';
  const eyesPose = mood === 'thinking' ? 'translate(2px, -2px)' : 'none';

  const leaf = ([x, y, a, len]: [number, number, number, number], fill: string, key: React.Key, opacity?: number) => (
    <path key={key} d={leafPath(len, len * 0.36)} transform={`translate(${x} ${y}) rotate(${a})`} fill={fill} opacity={opacity} />
  );
  /* A shaded leaf with a glossy streak (Bitaug leaves are shiny) and, when detailed, its midrib. */
  const glossyLeaf = ([x, y, a, len]: [number, number, number, number], key: React.Key) => (
    <g key={key} transform={`translate(${x} ${y}) rotate(${a})`}>
      <path d={leafPath(len, len * 0.38)} fill={url('leaf')} />
      {detailed && <path d={`M1 0L${len - 1} 0`} className="stroke-accent-900/40" strokeWidth="0.5" strokeLinecap="round" />}
      <path d={`M${len * 0.3} ${-len * 0.16}Q${len * 0.55} ${-len * 0.26} ${len * 0.78} ${-len * 0.12}`} className="stroke-white/40" strokeWidth="0.8" strokeLinecap="round" />
    </g>
  );
  const branchCluster = (x: number, y: number, angles: number[]) =>
    angles.map((a, i) => glossyLeaf([x, y, a, 9 - i], `${x}-${a}`));
  const flower = (x: number, y: number, s: number) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[45, 135, 225, 315].map((a) => (
        <ellipse key={a} cx="0" cy="-3.3" rx="2.5" ry="3.3" transform={`rotate(${a})`} fill={url('petal')} />
      ))}
      <circle r="1.9" fill={STAMEN} />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx="0" cy="-1.9" r="0.55" transform={`rotate(${a})`} fill={STAMEN_DARK} />
      ))}
    </g>
  );

  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        {/* Each foliage lobe lit as a sphere from the upper left. */}
        <radialGradient id={id('lobe')} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" className="[stop-color:theme(colors.accent.400)]" />
          <stop offset="0.55" className="[stop-color:theme(colors.accent.500)]" />
          <stop offset="1" className="[stop-color:theme(colors.accent.700)]" />
        </radialGradient>
        <radialGradient id={id('back')} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" className="[stop-color:theme(colors.accent.700)]" />
          <stop offset="1" className="[stop-color:theme(colors.accent.900)]" />
        </radialGradient>
        {/* One light across the whole crown, so the lobes read as a single dome. */}
        <radialGradient id={id('dome')} gradientUnits="userSpaceOnUse" cx="44" cy="22" r="84">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.42" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </radialGradient>
        <linearGradient id={id('leaf')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="[stop-color:theme(colors.accent.400)]" />
          <stop offset="1" className="[stop-color:theme(colors.accent.700)]" />
        </linearGradient>
        <linearGradient id={id('bark')} gradientUnits="userSpaceOnUse" x1="40" y1="0" x2="88" y2="0">
          <stop offset="0" stopColor={BARK_LIGHT} />
          <stop offset="0.38" stopColor={BARK} />
          <stop offset="1" stopColor={BARK_DARK} />
        </linearGradient>
        <linearGradient id={id('petal')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#DCE8E1" />
        </linearGradient>
        <radialGradient id={id('fruit')} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" className="[stop-color:theme(colors.accent.200)]" />
          <stop offset="1" className="[stop-color:theme(colors.accent.600)]" />
        </radialGradient>
        <radialGradient id={id('eye')} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#4A2E1A" />
          <stop offset="1" stopColor="#140B05" />
        </radialGradient>
        <radialGradient id={id('face')}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('blush')}>
          <stop offset="0" stopColor="#F59A7A" stopOpacity="0.55" />
          <stop offset="1" stopColor="#F59A7A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('shadow')}>
          <stop offset="0" stopColor="#0F3D2B" stopOpacity="0.3" />
          <stop offset="1" stopColor="#0F3D2B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('occlusion')}>
          <stop offset="0" stopColor="#000" stopOpacity="0.5" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <clipPath id={id('crown')}>
          {LOBES.map(([cx, cy, r]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />)}
        </clipPath>
        <clipPath id={id('trunk')}>
          <path d={TRUNK} />
        </clipPath>
      </defs>

      <g className={`origin-bottom [transform-box:fill-box] ${mood === 'happy' ? move('motion-safe:animate-bitoy-hop') : ''}`}>
        {/* soft ground shadow */}
        <ellipse cx="64" cy="120.5" rx="38" ry="5" fill={url('shadow')} />

        {/* left branch, tucked behind the trunk */}
        <path d="M58 99C51 97.5 44 92 38.6 81.6C38.1 80.7 39.3 79.9 40 80.7C45 87.5 51 91.6 58.2 93Z" fill={url('bark')} />
        {branchCluster(38.5, 81, [-120, -165, -75])}

        {/* right branch — pivots at the shoulder to wave */}
        <g className={`origin-bottom-left [transform-box:fill-box] ${mood === 'wave' ? move('motion-safe:animate-bitoy-wave') : ''}`}>
          <path d="M70 99C77 97.5 84 92 89.4 81.6C89.9 80.7 88.7 79.9 88 80.7C83 87.5 77 91.6 69.8 93Z" fill={url('bark')} />
          {branchCluster(89.5, 81, [-60, -15, -105])}
        </g>

        {/* old buttressed trunk, lit on the left, shaded under the crown */}
        <path d={TRUNK} fill={url('bark')} />
        <g clipPath={url('trunk')}>
          <path d="M58.6 68C58.8 82 57.6 93 54.4 102.5" stroke={BARK_LIGHT} strokeOpacity="0.6" strokeWidth="1.6" strokeLinecap="round" />
          {detailed && (
            <g stroke={BARK_DARK} strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round">
              <path d="M61.5 76C61 88 59.6 98 56.5 108" />
              <path d="M65.5 80C65.6 92 65 103 64 114" />
              <path d="M69 74C69.4 86 70.6 97 73.5 106" />
              <path d="M58 111C55 114 51 116.5 46 118" />
              <path d="M71 111.5C74 114.5 78 116.6 83 118" />
              <path d="M65.6 91.4Q68.2 94 65.8 96.8" />
            </g>
          )}
          <ellipse cx="64" cy="70" rx="15" ry="9" fill={url('occlusion')} />
        </g>

        {/* crown (head): pose outside, sway inside, both pivoting at the base */}
        <g
          className="origin-bottom [transform-box:fill-box] motion-safe:transition-transform motion-safe:duration-300"
          style={{ transform: canopyPose }}
        >
          {/* far side of the crown — sways least */}
          <g className={`origin-bottom [transform-box:fill-box] ${swaying ? move('motion-safe:animate-bitoy-sway-back') : ''}`}>
            {BACK_LOBES.map(([cx, cy, r]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={url('back')} />)}
          </g>

          <g className={`origin-bottom [transform-box:fill-box] ${swaying ? move('motion-safe:animate-bitoy-sway') : ''}`}>
            {EDGE_LEAVES.map((l, i) => glossyLeaf(l, `edge-${i}`))}
            {LOBES.map(([cx, cy, r]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={url('lobe')} />)}
            <g clipPath={url('crown')}>
              <rect x="0" y="0" width="128" height="80" fill={url('dome')} />
              {LIT_LEAVES.map((l, i) => leaf(l, '#fff', `lit-${i}`, 0.16))}
              {SHADED_LEAVES.map((l, i) => leaf(l, '#0F3D2B', `shade-${i}`, 0.2))}
              {detailed && EXTRA_LIT.map((l, i) => leaf(l, '#fff', `xlit-${i}`, 0.13))}
              {detailed && EXTRA_SHADED.map((l, i) => leaf(l, '#0F3D2B', `xshade-${i}`, 0.17))}
            </g>

            {detailed && (
              <>
                {flower(34, 36, 0.7)}
                <path d="M101 63.5Q102 66 101.5 68" className="stroke-accent-800" strokeWidth="0.8" strokeLinecap="round" />
                <circle cx="101.5" cy="70.5" r="3" fill={url('fruit')} />
                <circle cx="100.4" cy="69.4" r="0.8" fill="#fff" opacity="0.6" />
              </>
            )}
            {/* Bitaug flower, worn like a hair clip */}
            {flower(89, 23, 1)}

            {/* thinking: leaves drift up beside the crown */}
            {mood === 'thinking' && (
              <g className="fill-accent-400">
                {[[103, 15, 1.6], [110, 9.5, 2.1], [118, 4.5, 2.6]].map(([cx, cy, r], i) => (
                  <ellipse
                    key={cx}
                    cx={cx}
                    cy={cy}
                    rx={r}
                    ry={r * 0.62}
                    transform={`rotate(-30 ${cx} ${cy})`}
                    className={move('motion-safe:animate-bitoy-think')}
                    style={{ animationDelay: `${i * 160}ms` }}
                  />
                ))}
              </g>
            )}

            {/* face: a little light on the brow, eyes set into soft sockets, warm cheeks */}
            <ellipse cx="64" cy="47" rx="22" ry="15" fill={url('face')} />
            <ellipse cx="48.5" cy="54" rx="6" ry="3.6" fill={url('blush')} />
            <ellipse cx="79.5" cy="54" rx="6" ry="3.6" fill={url('blush')} />

            {mood === 'happy' ? (
              <path d="M50.5 47Q55 41.5 59.5 47M68.5 47Q73 41.5 77.5 47" stroke={FACE_INK} strokeWidth="2" strokeLinecap="round" />
            ) : (
              <>
                <ellipse cx="55" cy="46.5" rx="6" ry="6.2" className="fill-accent-800/25" />
                <ellipse cx="73" cy="46.5" rx="6" ry="6.2" className="fill-accent-800/25" />
                <g className="motion-safe:transition-transform motion-safe:duration-300" style={{ transform: eyesPose }}>
                  <g className={`origin-center [transform-box:fill-box] ${move('motion-safe:animate-chat-blink')}`}>
                    <circle cx="55" cy="46.5" r="4.6" fill={url('eye')} />
                    <circle cx="73" cy="46.5" r="4.6" fill={url('eye')} />
                    <circle cx="56.5" cy="44.8" r="1.6" fill="#fff" />
                    <circle cx="74.5" cy="44.8" r="1.6" fill="#fff" />
                    <circle cx="53.8" cy="48.3" r="0.6" fill="#fff" opacity="0.55" />
                    <circle cx="71.8" cy="48.3" r="0.6" fill="#fff" opacity="0.55" />
                  </g>
                </g>
              </>
            )}

            {/* worried brows */}
            {mood === 'sorry' && (
              <path d="M49.5 40.5L58 37.6M78.5 40.5L70 37.6" stroke={FACE_INK} strokeWidth="1.6" strokeLinecap="round" />
            )}

            {/* mouth */}
            {mood === 'happy' ? (
              <path d="M57.5 53.5Q64 62 70.5 53.5Q64 56 57.5 53.5Z" fill={FACE_INK} />
            ) : mood === 'thinking' ? (
              <ellipse cx="66" cy="56" rx="1.8" ry="2" stroke={FACE_INK} strokeWidth="1.4" />
            ) : mood === 'sorry' ? (
              <path d="M59 57Q64 53.5 69 57" stroke={FACE_INK} strokeWidth="1.7" strokeLinecap="round" />
            ) : (
              <path d="M58.5 54Q64 58.5 69.5 54" stroke={FACE_INK} strokeWidth="1.7" strokeLinecap="round" />
            )}
          </g>

          {/* leaves in front of the crown — they rustle a little more than the rest */}
          <g className={`origin-bottom [transform-box:fill-box] ${swaying ? move('motion-safe:animate-bitoy-rustle') : ''}`}>
            {FRONT_LEAVES.map((l, i) => glossyLeaf(l, `front-${i}`))}
          </g>
        </g>
      </g>
    </svg>
  );
}

const TRUNK =
  'M57 64C57.5 79 56.4 91 53 101.5C50.5 109 45.5 114 37.5 117.6C35.4 118.5 35.8 119.8 38 119.8L48.5 119.6C52.5 119.5 55.5 118.2 58 116.2C60 118.6 62.3 119.8 64.6 119.8C67 119.8 69.1 118.8 70.9 116.7C73.6 118.7 77 119.7 81 119.7L90.2 119.8C92.4 119.8 92.8 118.5 90.7 117.6C83 113.8 78 108.6 75.4 101.2C72.2 91.2 70.8 79.2 71.2 64Z';
