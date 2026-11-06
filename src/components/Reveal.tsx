import React from 'react';

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait after the element scrolls into view — staggers a row of items. */
  delay?: number;
  as?: 'div' | 'section' | 'article' | 'li';
};

type State = 'static' | 'waiting' | 'shown';

/**
 * Subtle single-axis fade/slide as content scrolls into view.
 *
 * Content is VISIBLE by default. It is hidden (to be revealed) only when the element
 * is measured below the fold on mount and the browser has IntersectionObserver — so
 * anything already on screen, any browser that never fires the observer (link previews,
 * screenshot tools), and anyone who prefers reduced motion simply sees the content.
 * The previous version started every item at opacity 0 and relied on the scroll
 * trigger firing, which left whole grids blank when it did not.
 */
export function Reveal({ children, className = '', delay = 0, as = 'div' }: RevealProps) {
  const ref = React.useRef<HTMLElement>(null);
  const [state, setState] = React.useState<State>('static');

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen

    setState('waiting');
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        setState('shown');
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style: React.CSSProperties | undefined =
    state === 'static'
      ? undefined
      : {
          opacity: state === 'shown' ? 1 : 0,
          transform: state === 'shown' ? 'none' : 'translateY(14px)',
          transition: `opacity 480ms cubic-bezier(0.23, 1, 0.32, 1) ${delay}s, transform 480ms cubic-bezier(0.23, 1, 0.32, 1) ${delay}s`,
        };

  return React.createElement(as, { ref, className, style }, children);
}
