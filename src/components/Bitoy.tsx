import React from 'react';

export type BitoyMood = 'idle' | 'wave' | 'thinking' | 'happy' | 'sorry';

type BitoyProps = {
  mood?: BitoyMood;
  /** Off for avatars that should hold still (older chat messages). */
  animated?: boolean;
  className?: string;
  /** Decorative by default; pass a title to expose it to assistive tech. */
  title?: string;
};

/**
 * Bitoy, the chatbot's mascot: the ~500-year-old Bitaug tree of Barangay Caloc-an (a Philippine
 * Centennial Tree, DENR 1998), drawn as a friendly character — the same tree as the site's
 * BitaugMotif. The canopy is the head; a white Bitaug flower sits on it like a hair clip.
 *
 * Moods: `idle` sways and blinks, `wave` waves the right twig, `thinking` glances up while leaves
 * bob, `happy` hops with "^^" eyes, `sorry` droops with worried brows. Every movement is behind
 * `motion-safe:`; with reduced motion the expressions still change, nothing moves.
 *
 * Moving parts are nested groups — a static pose outside, an animation inside — so a pose
 * transform never fights an animated one, and each pivots on its own box ([transform-box:fill-box]).
 *
 * The bark brown is the one colour outside the site palette: with a green trunk and a round
 * top he read as broccoli, not a tree. It is used for the mascot only.
 */
const BARK = '#7A4E2D';
const BARK_DARK = '#5C3A21';
export function Bitoy({ mood = 'idle', animated = true, className = '', title }: BitoyProps) {
  const move = (cls: string) => (animated ? cls : '');
  const swaying = mood === 'idle' || mood === 'wave' || mood === 'happy';

  // Static poses: the canopy tilts in thought and droops when sorry; the eyes glance up.
  const canopyPose = mood === 'thinking' ? 'rotate(3deg)' : mood === 'sorry' ? 'rotate(-3deg) translateY(1.5px)' : 'none';
  const eyesPose = mood === 'thinking' ? 'translate(1.5px, -1.5px)' : 'none';

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <g className={`origin-bottom [transform-box:fill-box] ${mood === 'happy' ? move('motion-safe:animate-bitoy-hop') : ''}`}>
        {/* ground shadow */}
        <ellipse cx="32" cy="61" rx="13" ry="1.6" className="fill-accent-900/15" />

        {/* trunk with buttress roots and a little bark grain */}
        <path d="M28.5 37c0 9-1 15.5-5 21h17c-4-5.5-5-12-5-21z" fill={BARK} />
        <path d="M30.5 44v7M33.5 47v6" stroke={BARK_DARK} strokeWidth="1" strokeLinecap="round" />
        <path d="M23.5 58c-2 .6-4 1.3-5.5 2M40.5 58c2 .6 4 1.3 5.5 2" stroke={BARK} strokeWidth="1.8" strokeLinecap="round" />

        {/* left twig arm */}
        <path d="M29 47c-3.5-1-6-3.5-7.5-7" stroke={BARK} strokeWidth="2.4" strokeLinecap="round" />
        <ellipse cx="20.5" cy="38.5" rx="2.8" ry="1.6" transform="rotate(-55 20.5 38.5)" className="fill-accent-500" />

        {/* right twig arm — pivots at the shoulder to wave */}
        <g className={`origin-bottom-left [transform-box:fill-box] ${mood === 'wave' ? move('motion-safe:animate-bitoy-wave') : ''}`}>
          <path d="M35 47c3.5-1 6-3.5 7.5-7" stroke={BARK} strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="43.5" cy="38.5" rx="2.8" ry="1.6" transform="rotate(55 43.5 38.5)" className="fill-accent-500" />
        </g>

        {/* canopy (head): pose outside, sway inside, both pivoting at the base */}
        <g
          className="origin-bottom [transform-box:fill-box] motion-safe:transition-transform motion-safe:duration-300"
          style={{ transform: canopyPose }}
        >
          <g className={`origin-bottom [transform-box:fill-box] ${swaying ? move('motion-safe:animate-bitoy-sway') : ''}`}>
            {/* oval Bitaug leaves poking out of the edge, so the crown reads as foliage */}
            <g className="fill-accent-600">
              <ellipse cx="4.5" cy="21" rx="3.6" ry="1.9" transform="rotate(-35 4.5 21)" />
              <ellipse cx="59.5" cy="21" rx="3.6" ry="1.9" transform="rotate(35 59.5 21)" />
              <ellipse cx="13" cy="7.5" rx="3.4" ry="1.8" transform="rotate(-60 13 7.5)" />
              <ellipse cx="51" cy="7.5" rx="3.4" ry="1.8" transform="rotate(60 51 7.5)" />
              <ellipse cx="4" cy="32" rx="3.2" ry="1.7" transform="rotate(15 4 32)" />
              <ellipse cx="60" cy="32" rx="3.2" ry="1.7" transform="rotate(-15 60 32)" />
            </g>
            {/* a wide, spreading crown */}
            <g className="fill-accent-500">
              <circle cx="32" cy="20" r="15" />
              <circle cx="17" cy="24" r="11" />
              <circle cx="47" cy="24" r="11" />
              <circle cx="22" cy="12.5" r="8.5" />
              <circle cx="42" cy="12.5" r="8.5" />
              <circle cx="32" cy="29" r="11" />
              <circle cx="9" cy="27" r="6.5" />
              <circle cx="55" cy="27" r="6.5" />
            </g>
            {/* leaf sheen */}
            <g className="fill-accent-400">
              <ellipse cx="18" cy="11" rx="4" ry="2.2" transform="rotate(-30 18 11)" />
              <ellipse cx="28.5" cy="7" rx="3.4" ry="1.9" transform="rotate(-12 28.5 7)" />
              <ellipse cx="9" cy="23" rx="3" ry="1.8" transform="rotate(-55 9 23)" />
            </g>

            {/* thinking: three leaves bob over the crown */}
            {mood === 'thinking' && (
              <g className="fill-accent-400">
                {[26, 32, 38].map((x, i) => (
                  <ellipse
                    key={x}
                    cx={x}
                    cy="3.5"
                    rx="1.8"
                    ry="1.2"
                    className={move('motion-safe:animate-bitoy-think')}
                    style={{ animationDelay: `${i * 160}ms` }}
                  />
                ))}
              </g>
            )}

            {/* Bitaug flower, worn like a hair clip */}
            <g>
              {[0, 72, 144, 216, 288].map((a) => (
                <circle key={a} cx="48" cy="9.2" r="1.9" transform={`rotate(${a} 48 11.5)`} className="fill-white" />
              ))}
              <circle cx="48" cy="11.5" r="1.3" className="fill-accent-200" />
            </g>

            {/* cheeks */}
            <ellipse cx="20.5" cy="31" rx="2.6" ry="1.6" className="fill-accent-300/70" />
            <ellipse cx="43.5" cy="31" rx="2.6" ry="1.6" className="fill-accent-300/70" />

            {/* eyes */}
            {mood === 'happy' ? (
              <path d="M22.5 26.5q2.5-3.5 5 0M36.5 26.5q2.5-3.5 5 0" className="stroke-accent-900" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <g className="motion-safe:transition-transform motion-safe:duration-300" style={{ transform: eyesPose }}>
                <g className={`origin-center [transform-box:fill-box] ${move('motion-safe:animate-chat-blink')}`}>
                  <circle cx="25" cy="24.5" r="3.3" className="fill-accent-900" />
                  <circle cx="39" cy="24.5" r="3.3" className="fill-accent-900" />
                  <circle cx="26.2" cy="23.3" r="1.1" className="fill-white" />
                  <circle cx="40.2" cy="23.3" r="1.1" className="fill-white" />
                </g>
              </g>
            )}

            {/* worried brows */}
            {mood === 'sorry' && (
              <path d="M21.5 21.5l5-2M42.5 21.5l-5-2" className="stroke-accent-900" strokeWidth="1.6" strokeLinecap="round" />
            )}

            {/* mouth */}
            {mood === 'happy' ? (
              <path d="M27 30.5q5 6.5 10 0z" className="fill-accent-900" />
            ) : mood === 'thinking' ? (
              <circle cx="33" cy="32" r="1.5" className="stroke-accent-900" strokeWidth="1.6" />
            ) : mood === 'sorry' ? (
              <path d="M28 33.5q4-3 8 0" className="stroke-accent-900" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path d="M27.5 31q4.5 4 9 0" className="stroke-accent-900" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </g>
        </g>
      </g>
    </svg>
  );
}
