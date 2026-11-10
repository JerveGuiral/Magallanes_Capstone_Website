import React from 'react';

export type MagiMood = 'idle' | 'wave' | 'thinking' | 'happy' | 'sorry';

type MagiProps = {
  mood?: MagiMood;
  /** Off for avatars that should hold still (older chat messages). */
  animated?: boolean;
  /** Stone joints, the plaque's lettering and grass at the foot — only worth drawing at large sizes. */
  detailed?: boolean;
  className?: string;
  /** Decorative by default; pass a title to expose it to assistive tech. */
  title?: string;
};

/**
 * Magi, the chatbot's mascot: the Magellan Shrine of Poblacion, Magallanes — the 1872 marker of
 * the Mass held on 8 April 1521 — drawn as a friendly character. The stepped stone pedestal with
 * its inscription plaque is the body's footing; the red-brown obelisk on top carries the face and
 * two small arms. (Magi replaced Bitoy, the Bitaug tree, after the tree fell.)
 *
 * Lit from the upper left like the site's other illustrations: the obelisk and the stone are
 * shaded across their width, the cap is split into a lit and a shaded face, and a light catches
 * the brow.
 *
 * Moods: `idle` bobs gently and blinks, `wave` raises the right arm and waves, `thinking` glances
 * up while little dots rise beside the cap, `happy` hops with closed eyes and both arms up, `sorry`
 * leans with worried brows. Every movement is behind `motion-safe:`; with reduced motion the
 * expressions still change, nothing moves.
 *
 * Moving parts are nested groups — a static pose outside, an animation inside — so a pose
 * transform never fights an animated one, and each pivots on its own box ([transform-box:fill-box]).
 *
 * The stone, terracotta and plaque colours are outside the site palette; they are used for the
 * mascot only, as the Bitaug's bark browns were.
 */
const STONE_LIGHT = '#ECE7DA';
const STONE = '#CFC7B3';
const STONE_DARK = '#9C927C';
const JOINT = '#8A8070';
const TERRA_LIGHT = '#DA7353';
const TERRA = '#B9492F';
const TERRA_DARK = '#80301F';
const PLAQUE = '#F2DA8C';
const PLAQUE_EDGE = '#C29A3E';
const FACE_INK = '#2A140C';

/* The obelisk: 40 wide at the plaque block (y 72), 20 wide under the cap (y 20). */
const SHAFT = 'M44 72L54 20H74L84 72Z';
const COLLAR = 'M45.15 66H82.85L84 72H44Z';

export function Magi({ mood = 'idle', animated = true, detailed = false, className = '', title }: MagiProps) {
  const move = (cls: string) => (animated ? cls : '');
  const armsUp = mood === 'happy';

  // Every instance needs its own gradient ids: the chat shows several at once.
  const uid = React.useId().replace(/:/g, '');
  const id = (name: string) => `magi-${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;

  // Static poses: the obelisk leans when sorry and tips a little in thought; the eyes glance up.
  const bodyPose = mood === 'sorry' ? 'rotate(-4deg) translateY(1.5px)' : mood === 'thinking' ? 'rotate(2deg)' : 'none';
  const eyesPose = mood === 'thinking' ? 'translate(2px, -2.5px)' : 'none';

  /* An arm is one thick rounded stroke with a round hand at its end. */
  const arm = (d: string, hx: number, hy: number) => (
    <>
      <path d={d} stroke={url('arm')} strokeWidth="5.5" strokeLinecap="round" />
      <circle cx={hx} cy={hy} r="3.4" fill={TERRA_LIGHT} />
      <circle cx={hx - 1} cy={hy - 1} r="1.1" fill="#fff" opacity="0.35" />
    </>
  );
  /* A block of the pedestal: shaded face, lit top edge. */
  const block = (x: number, y: number, w: number, h: number) => (
    <>
      <rect x={x} y={y} width={w} height={h} rx="1.6" fill={url('stone')} />
      <rect x={x} y={y} width={w} height="2.4" rx="1.2" fill={STONE_LIGHT} />
    </>
  );

  return (
    <svg
      // Small avatars (chat bubbles, the launcher) are framed like a portrait — the obelisk, its
      // face and the plaque block — so the face stays readable at 28 px; large ones show it whole.
      viewBox={detailed ? '0 0 128 128' : '20 2 88 88'}
      fill="none"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={id('terra')} gradientUnits="userSpaceOnUse" x1="44" y1="0" x2="84" y2="0">
          <stop offset="0" stopColor={TERRA_LIGHT} />
          <stop offset="0.45" stopColor={TERRA} />
          <stop offset="1" stopColor={TERRA_DARK} />
        </linearGradient>
        <linearGradient id={id('arm')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={TERRA_LIGHT} />
          <stop offset="1" stopColor={TERRA} />
        </linearGradient>
        <linearGradient id={id('stone')} gradientUnits="userSpaceOnUse" x1="18" y1="0" x2="110" y2="0">
          <stop offset="0" stopColor={STONE_LIGHT} />
          <stop offset="0.45" stopColor={STONE} />
          <stop offset="1" stopColor={STONE_DARK} />
        </linearGradient>
        <linearGradient id={id('plaque')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBEDB8" />
          <stop offset="1" stopColor={PLAQUE} />
        </linearGradient>
        <radialGradient id={id('eye')} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#4A2416" />
          <stop offset="1" stopColor="#140805" />
        </radialGradient>
        <radialGradient id={id('face')}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('blush')}>
          <stop offset="0" stopColor="#F7A08A" stopOpacity="0.7" />
          <stop offset="1" stopColor="#F7A08A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('shadow')}>
          <stop offset="0" stopColor="#1E2A3A" stopOpacity="0.28" />
          <stop offset="1" stopColor="#1E2A3A" stopOpacity="0" />
        </radialGradient>
        <clipPath id={id('shaft')}>
          <path d={SHAFT} />
        </clipPath>
      </defs>

      <g className={`origin-bottom [transform-box:fill-box] ${mood === 'happy' ? move('motion-safe:animate-magi-hop') : ''}`}>
        {/* soft ground shadow */}
        <ellipse cx="64" cy="121" rx="44" ry="4.5" fill={url('shadow')} />

        {/* stepped pedestal: platform, middle step, plaque block */}
        {block(18, 106, 92, 14)}
        {block(30, 92, 68, 14)}
        {block(40, 72, 48, 20)}
        {detailed && (
          <g stroke={JOINT} strokeOpacity="0.45" strokeWidth="0.8" strokeLinecap="round">
            <path d="M41 113H109M48 106V112M80 113V120M58 99H97M64 92V99M84 99V106" />
          </g>
        )}
        {/* the inscription plaque */}
        <rect x="52" y="76" width="24" height="12" rx="1" fill={url('plaque')} stroke={PLAQUE_EDGE} strokeWidth="0.9" />
        <g stroke={PLAQUE_EDGE} strokeWidth="0.9" strokeLinecap="round">
          <path d="M56 80H72M56 83H68" />
          {detailed && <path d="M56 85.6H70" />}
        </g>
        {detailed && (
          <g stroke="#6E9B4E" strokeWidth="1.1" strokeLinecap="round">
            <path d="M14 120L12.5 115M16 120L16.5 114.5M18 120L20 116" />
            <path d="M110 120L108.5 115.5M112 120L113 114.5M114 120L116.5 116" />
          </g>
        )}

        {/* obelisk (head and body): pose outside, gentle bob inside, both pivoting at the base */}
        <g
          className="origin-bottom [transform-box:fill-box] motion-safe:transition-transform motion-safe:duration-300"
          style={{ transform: bodyPose }}
        >
          <g className={`origin-bottom [transform-box:fill-box] ${mood === 'idle' ? move('motion-safe:animate-magi-bob') : ''}`}>
            {/* left arm rests on the plaque block, or goes up with the right when happy */}
            {armsUp ? arm('M48 55Q40 50 37 41', 36.5, 38.5) : arm('M48 55Q41 59 40 66', 40, 67.5)}

            {/* right arm: raised and waving, up when happy, else resting */}
            {mood === 'wave' ? (
              <g className={`origin-bottom-left [transform-box:fill-box] ${move('motion-safe:animate-magi-wave')}`}>
                {arm('M80 55Q88 51 91 41', 91.5, 38.5)}
              </g>
            ) : armsUp ? (
              arm('M80 55Q88 50 91 41', 91.5, 38.5)
            ) : (
              arm('M80 55Q87 59 88 66', 88, 67.5)
            )}

            {/* the shaft, lit on the left, with a stone collar at its foot */}
            <path d={SHAFT} fill={url('terra')} />
            <g clipPath={url('shaft')}>
              <path d="M47.5 70L56.5 21" stroke="#fff" strokeOpacity="0.28" strokeWidth="1.6" strokeLinecap="round" />
              {detailed && (
                <g stroke={TERRA_DARK} strokeOpacity="0.35" strokeWidth="0.8">
                  <path d="M50 40H78M47 56H81" />
                </g>
              )}
            </g>
            <path d={COLLAR} fill={url('stone')} />
            <path d="M45.15 66H82.85" stroke={STONE_LIGHT} strokeWidth="1.2" />

            {/* the pointed cap: a lit face and a shaded face */}
            <path d="M54 20L64 6L64 20Z" fill={TERRA_LIGHT} />
            <path d="M64 6L74 20L64 20Z" fill={TERRA_DARK} />

            {/* thinking: little dots rise beside the cap */}
            {mood === 'thinking' && (
              <g fill={TERRA_LIGHT}>
                {[[84, 22, 1.8], [91, 15, 2.3], [99, 8, 2.8]].map(([cx, cy, r], i) => (
                  <circle
                    key={cx}
                    cx={cx}
                    cy={cy}
                    r={r}
                    className={move('motion-safe:animate-magi-think')}
                    style={{ animationDelay: `${i * 160}ms` }}
                  />
                ))}
              </g>
            )}

            {/* face: a little light on the brow, eyes, warm cheeks */}
            <ellipse cx="64" cy="42" rx="13" ry="10" fill={url('face')} />
            <ellipse cx="54.5" cy="51.5" rx="4.2" ry="2.6" fill={url('blush')} />
            <ellipse cx="73.5" cy="51.5" rx="4.2" ry="2.6" fill={url('blush')} />

            {mood === 'happy' ? (
              <path d="M53.8 45Q57.5 40 61.2 45M66.8 45Q70.5 40 74.2 45" stroke={FACE_INK} strokeWidth="2" strokeLinecap="round" />
            ) : (
              <g className="motion-safe:transition-transform motion-safe:duration-300" style={{ transform: eyesPose }}>
                <g className={`origin-center [transform-box:fill-box] ${move('motion-safe:animate-chat-blink')}`}>
                  <circle cx="57.5" cy="44" r="4.2" fill={url('eye')} />
                  <circle cx="70.5" cy="44" r="4.2" fill={url('eye')} />
                  <circle cx="58.9" cy="42.4" r="1.5" fill="#fff" />
                  <circle cx="71.9" cy="42.4" r="1.5" fill="#fff" />
                  <circle cx="56.4" cy="45.7" r="0.55" fill="#fff" opacity="0.55" />
                  <circle cx="69.4" cy="45.7" r="0.55" fill="#fff" opacity="0.55" />
                </g>
              </g>
            )}

            {/* worried brows */}
            {mood === 'sorry' && (
              <path d="M52.5 38.6L60 36M75.5 38.6L68 36" stroke={FACE_INK} strokeWidth="1.6" strokeLinecap="round" />
            )}

            {/* mouth */}
            {mood === 'happy' ? (
              <path d="M58.5 51Q64 58.5 69.5 51Q64 53.3 58.5 51Z" fill={FACE_INK} />
            ) : mood === 'thinking' ? (
              <ellipse cx="66" cy="53" rx="1.7" ry="1.9" stroke={FACE_INK} strokeWidth="1.4" />
            ) : mood === 'sorry' ? (
              <path d="M59.5 54.5Q64 51 68.5 54.5" stroke={FACE_INK} strokeWidth="1.7" strokeLinecap="round" />
            ) : (
              <path d="M59.5 51.5Q64 55.5 68.5 51.5" stroke={FACE_INK} strokeWidth="1.7" strokeLinecap="round" />
            )}
          </g>
        </g>
      </g>
    </svg>
  );
}
