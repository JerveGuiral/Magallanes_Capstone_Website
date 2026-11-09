import React from 'react';
import { Link } from 'react-router-dom';
import { XIcon, SendIcon, Loader2Icon, RotateCcwIcon } from 'lucide-react';
import { Bitoy, type BitoyMood } from './Bitoy';
import { ASK_BITOY_EVENT } from '../lib/askBitoy';
import { apiUrl } from '../lib/api';

// The server's "I didn't understand" intents: Bitoy looks sorry instead of pleased.
const FALLBACK_INTENT = /^(Default Fallback Intent|vague\.question)/;

/* The free chat server sleeps when idle and can take about a minute to wake, so the limit
 * is generous; past it the visitor gets the retry message instead of an endless spinner. */
const REPLY_TIMEOUT_MS = 75_000;
/* After this long, the thinking bubble explains the wait. */
const SLOW_REPLY_MS = 8_000;

/** Bitoy beside a chat bubble. */
function BitoyAvatar({ mood = 'idle', animated }: { mood?: BitoyMood; animated: boolean }) {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-50 ring-1 ring-accent-100" aria-hidden="true">
      <Bitoy mood={mood} animated={animated} className="h-7 w-7" />
    </span>
  );
}

type Message = {
  id: string | number;
  from: 'bot' | 'user';
  text: string;
  timestamp?: Date;
  /** On an error reply: the question to send again from its "Try again" button. */
  retry?: string;
};

/* One topic each, two in English and two in Bisaya, so the first screen shows the range the
 * assistant covers — and that it answers in either language. Every one is checked to match its
 * intent at full confidence; keep it that way when changing these (a suggestion that falls
 * back to "I didn't catch that" is the worst possible first impression). */
/* Three, as compact chips: four stacked buttons filled the window and pushed Bitoy's
 * introduction out of view. English and Bisaya both, so the visitor sees either works. */
const SUGGESTIONS = [
  'How do I apply for a business permit?',
  'Kinsa ang mayor sa Magallanes?',
  'What time does the municipal hall open?',
];

/* Long email addresses are one unbreakable "word". A <wbr> after each "@" lets the line wrap
 * at a natural point (instead of mid-domain); copying the text still yields the plain address. */
function withBreakHints(text: string): React.ReactNode {
  const parts = text.split('@');
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {part}
      {i < parts.length - 1 && (
        <>
          @<wbr />
        </>
      )}
    </React.Fragment>
  ));
}

// A web address in a reply, without trailing punctuation ("…/tourism." keeps its full stop out).
// One capturing group, so split() puts the addresses at the odd indexes.
const URL_IN_TEXT = /(https?:\/\/[^\s<>"]+[^\s<>".,;:!?)\]])/;
const LINK_CLASS = 'font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-800 [overflow-wrap:anywhere]';

/**
 * Bitoy's reply with its web addresses as links ("show me a photo of the Bitaug tree" answers with
 * the tourism page and a YouTube search). A page of this website opens in place, so the chat stays
 * open; any other site opens in a new tab.
 */
function withLinks(text: string): React.ReactNode {
  return text.split(URL_IN_TEXT).map((part, i) => {
    if (i % 2 === 0) return <React.Fragment key={i}>{withBreakHints(part)}</React.Fragment>;
    const label = part.replace(/^https?:\/\//, '');
    let path: string | null = null;
    try {
      const url = new URL(part);
      if (url.origin === window.location.origin) path = url.pathname + url.search + url.hash;
    } catch {
      // Not a parseable address: show it as a plain external link.
    }
    return path ? (
      <Link key={i} to={path} className={LINK_CLASS}>
        {label}
      </Link>
    ) : (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
        {label}
      </a>
    );
  });
}

const INITIAL: Message[] = [
  {
    id: 'initial-1',
    from: 'bot',
    text: 'Maayong adlaw! Ako si Bitoy — named after the 500-year-old Bitaug tree of Caloc-an. Ask me about permits, clearances, officials, health services, office hours or tourist spots, in English or Bisaya.'
  }
];

/** True below Tailwind's `sm` breakpoint (640px), where the chat opens as a full-screen sheet. */
function useIsPhone() {
  const query = '(max-width: 639px)';
  const [match, setMatch] = React.useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatch(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return match;
}

/**
 * The part of the screen the visitor can actually see — on a phone, the area above the
 * on-screen keyboard. iOS Safari does not shrink the page for the keyboard (it slides the
 * page up instead), so the sheet follows the visual viewport: its top edge and height.
 * Null when inactive or unsupported; the sheet then falls back to 100dvh.
 */
function useVisibleViewport(active: boolean) {
  const [box, setBox] = React.useState<{ top: number; height: number } | null>(null);
  React.useEffect(() => {
    const vv = window.visualViewport;
    if (!active || !vv) {
      setBox(null);
      return;
    }
    const update = () => setBox({ top: vv.offsetTop, height: vv.height });
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [active]);
  return box;
}

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const isPhone = useIsPhone();
  const visible = useVisibleViewport(open && isPhone);

  /* Phones: the chat is a full-screen sheet, so the page behind it must not scroll —
   * otherwise opening the keyboard scrolls the page and drags the sheet up with it. */
  React.useEffect(() => {
    if (!open || !isPhone) return;
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [open, isPhone]);
  const [messages, setMessages] = React.useState<Message[]>(INITIAL);
  const [draft, setDraft] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  /* True once a reply has taken longer than SLOW_REPLY_MS: the free chat server is
   * probably waking up, so the thinking bubble says so instead of looking stuck. */
  const [slowReply, setSlowReply] = React.useState(false);
  const [nudging, setNudging] = React.useState(false);
  const [mood, setMood] = React.useState<BitoyMood>('idle');
  const moodTimer = React.useRef<number>();
  const logRef = React.useRef<HTMLDivElement>(null);

  /* Bitoy shows a mood for a moment (a wave, a happy hop, a sorry droop), then settles back. */
  const flashMood = React.useCallback((next: BitoyMood, ms: number) => {
    window.clearTimeout(moodTimer.current);
    setMood(next);
    moodTimer.current = window.setTimeout(() => setMood('idle'), ms);
  }, []);
  React.useEffect(() => () => window.clearTimeout(moodTimer.current), []);

  // The free chat server sleeps when idle and takes up to a minute to wake. Nudge it when the page
  // loads, so it is usually awake by the time someone asks. Production only (VITE_API_URL set).
  React.useEffect(() => {
    if (import.meta.env.VITE_API_URL) fetch(apiUrl('/api/health')).catch(() => undefined);
  }, []);

  // A wave hello each time the chat opens.
  React.useEffect(() => {
    if (open) flashMood('wave', 1600);
  }, [open, flashMood]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);

  /* One hello per visit, a few seconds in: the launcher hops and a speech balloon greets the
   * visitor. The idle "alive" loop (float, breathing halo, blinking eyes) is kept small so it
   * never pulls attention from the page. Skipped if the chat was already opened. */
  React.useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem('chat_nudged') === '1';
    } catch {
      /* storage blocked: nudge anyway, just once for this page view */
    }
    if (seen) return;
    const start = window.setTimeout(() => {
      setNudging(true);
      try {
        sessionStorage.setItem('chat_nudged', '1');
      } catch {
        /* ignore */
      }
    }, 4000);
    const stop = window.setTimeout(() => setNudging(false), 11000);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(stop);
    };
  }, []);

  // Maintain or retrieve session ID for continuous Dialogflow conversation context
  // Storage can throw (blocked site data, some privacy modes); a fresh id still works, it
  // just won't survive a reload — far better than the whole widget crashing.
  const sessionId = React.useMemo(() => {
    const fresh = () => 'session-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
    try {
      let id = sessionStorage.getItem('df_session_id');
      if (!id) {
        id = fresh();
        sessionStorage.setItem('df_session_id', id);
      }
      return id;
    } catch {
      return fresh();
    }
  }, []);

  /* Before the visitor has asked anything, stay at the top so Bitoy's introduction is read
   * first; once a conversation starts, follow the newest message. */
  React.useEffect(() => {
    if (!logRef.current) return;
    const onlyGreeting = messages.length <= 1 && !isLoading;
    logRef.current.scrollTop = onlyGreeting ? 0 : logRef.current.scrollHeight;
  }, [messages, open, isLoading]);

  /* Mirrors AdminModal's open contract: land keyboard focus inside the panel
   * so a keyboard/screen-reader user isn't left on the toggle button, and let
   * Escape close it the same way every other overlay in the app does. Focus
   * returns to the toggle on close so the user isn't stranded off-screen. */
  React.useEffect(() => {
    if (!open) return;

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 20);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const lastBotId = [...messages].reverse().find((m) => m.from === 'bot')?.id;

  /* askBitoy() from anywhere on the site (the homepage "Meet Bitoy" section): open the
   * chat and, when a question comes with it, ask it. The ref always holds this render's `send`. */
  const sendRef = React.useRef<((text: string) => void) | null>(null);
  React.useEffect(() => {
    const onAsk = (e: Event) => {
      const question = (e as CustomEvent<string | undefined>).detail;
      setNudging(false);
      setOpen(true);
      if (question) sendRef.current?.(question);
    };
    window.addEventListener(ASK_BITOY_EVENT, onAsk);
    return () => window.removeEventListener(ASK_BITOY_EVENT, onAsk);
  }, []);

  const send = async (text: string) => {
    const value = text.trim();
    if (!value || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      from: 'user',
      text: value
    };

    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    setIsLoading(true);
    setSlowReply(false);
    window.clearTimeout(moodTimer.current);
    setMood('thinking');

    /* A time limit on the request. Without one, a chat server that accepted the connection
     * but never answered left Bitoy "thinking…" forever, and since send() ignores input
     * while a reply is pending, the visitor could not even retry. */
    const controller = new AbortController();
    const giveUp = window.setTimeout(() => controller.abort(), REPLY_TIMEOUT_MS);
    const slow = window.setTimeout(() => setSlowReply(true), SLOW_REPLY_MS);

    try {
      const response = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: value,
          sessionId: sessionId,
        }),
        signal: controller.signal,
      });

      if (response.status === 429) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-limit-${Date.now()}`,
            from: 'bot',
            text: "You're sending messages a little fast. Please wait a minute, then try again.",
            retry: value,
          },
        ]);
        flashMood('sorry', 2200);
        return;
      }
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        from: 'bot',
        text: data.reply || "I'm sorry, I couldn't get a response at this moment.",
      };

      setMessages((prev) => [...prev, botMessage]);
      if (FALLBACK_INTENT.test(data.intent || '')) flashMood('sorry', 2200);
      else flashMood('happy', 1400);
    } catch (error) {
      console.error('[ChatWidget] Error sending message to Dialogflow:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          from: 'bot',
          // The free chat server sleeps when idle; its first reply can take up to a minute.
          text: "Sorry, I couldn't reach the assistant just now. If the site has been quiet for a while, my first reply can take up to a minute while I wake up — please try again.",
          retry: value,
        },
      ]);
      flashMood('sorry', 2200);
    } finally {
      window.clearTimeout(giveUp);
      window.clearTimeout(slow);
      setSlowReply(false);
      setIsLoading(false);
    }
  };
  sendRef.current = send;

  return (
    <>
      {open && (
        <section
          id="public-assistance-chat"
          /* Phones: a full-screen sheet sized to the part of the screen the keyboard leaves
             visible (style below; 100dvh until the browser reports it). A floating 480px box
             no longer fit once the keyboard opened, so the browser pushed it up off-screen.
             From `sm` up: the floating panel above the launcher, as before. */
          className="fixed inset-x-0 top-0 z-50 flex h-[100dvh] w-full animate-scale-in flex-col overflow-hidden bg-white sm:inset-x-auto sm:bottom-[5.25rem] sm:right-4 sm:top-auto sm:h-[min(32rem,calc(100dvh-7rem))] sm:w-[min(24rem,calc(100vw-2rem))] sm:rounded-3xl sm:border sm:border-brand-100 sm:shadow-overlay"
          style={visible ? { top: visible.top, height: visible.height } : undefined}
          aria-label="Public assistance chat"
        >
          <header className="band-brand relative flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              {/* Bitoy shows the conversation's mood here; hovering him gets a wave. */}
              <span
                className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white"
                aria-hidden="true"
                onMouseEnter={() => mood === 'idle' && flashMood('wave', 1600)}
              >
                <Bitoy mood={mood} className="h-10 w-10" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-brand-700 bg-accent-400" />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-base font-bold text-white">Bitoy</h2>
                <p className="mt-0.5 font-sans text-[0.625rem] font-bold uppercase tracking-[0.08em] text-brand-50">
                  Virtual Assistant · Online 24/7
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-brand-50 transition-colors duration-150 hover:bg-white/15 hover:text-white"
              aria-label="Close chat"
            >
              <XIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>

          <div ref={logRef} className="admin-scroll flex-1 space-y-3 overflow-y-auto bg-surface-muted px-4 py-4" aria-live="polite">
            {messages.map((m) =>
              m.from === 'bot' ? (
                <div key={m.id} className="flex items-start gap-2">
                  {/* Only the newest reply's Bitoy moves; older ones hold still. */}
                  <BitoyAvatar animated={!isLoading && m.id === lastBotId} />
                  <div className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-tl-md border border-hairline bg-white px-3.5 py-2.5 text-[0.875rem] leading-relaxed text-ink shadow-subtle [overflow-wrap:anywhere]">
                    {withLinks(m.text)}
                    {m.retry && m.id === lastBotId && !isLoading && (
                      <button
                        type="button"
                        onClick={() => send(m.retry as string)}
                        className="mt-2.5 flex items-center gap-1.5 rounded-md border border-accent-200 bg-accent-50 px-3 py-1.5 text-[0.8125rem] font-semibold text-accent-800 transition-colors duration-150 hover:bg-accent-100"
                      >
                        <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Try again
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  key={m.id}
                  className="ml-auto max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md bg-brand-600 px-3.5 py-2.5 text-[0.875rem] leading-relaxed text-white shadow-subtle [overflow-wrap:anywhere]"
                >
                  {withBreakHints(m.text)}
                </div>
              )
            )}

            {isLoading && (
              <div className="flex items-start gap-2">
                <BitoyAvatar mood="thinking" animated />
                <div className="rounded-2xl rounded-tl-md border border-hairline bg-white px-3.5 py-2.5 shadow-subtle">
                  <span className="text-[0.8125rem] text-ink-muted">Bitoy is thinking…</span>
                  {slowReply && (
                    <span className="mt-1 block text-[0.75rem] leading-snug text-ink-subtle">
                      Waking up the assistant — the first reply after a quiet spell can take up to a minute.
                    </span>
                  )}
                </div>
              </div>
            )}

            {messages.length === 1 && !isLoading && (
              <div className="space-y-2 pt-2">
                <p className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                  Suggested topics
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => send(s)}
                        className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-left text-[0.8125rem] font-medium text-brand-700 transition-colors duration-150 hover:border-brand-400 hover:bg-brand-50"
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <form
            className="flex items-center gap-2 border-t border-hairline bg-white p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <label htmlFor="chat-input" className="sr-only">
              Type your question
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={isLoading ? 'Waiting for response…' : 'Type your question…'}
              enterKeyHint="send"
              autoComplete="off"
              /* Not disabled while Bitoy answers: disabling a focused field closes the phone
                 keyboard, and the page jumped as it closed. send() already ignores input
                 while a reply is pending. 16px text on phones: iOS zooms the page into any
                 smaller field on focus. */
              className="field min-w-0 flex-1 text-base sm:text-[0.875rem]"
            />
            <button
              type="submit"
              disabled={!draft.trim() || isLoading}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition-colors duration-150 hover:bg-brand-700 disabled:pointer-events-none disabled:opacity-40"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <SendIcon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </form>
        </section>
      )}

      {/* Launcher: an icon-only circle on phones (covers the least content), a compact pill
          from `sm` up. The accessible name comes from aria-label, so it survives the label
          being hidden on small screens. Layers, each with its own animation so none restarts
          another: wrapper = entrance pop, inner = idle float, button = the one-time hop. */}
      {/* Hidden on phones while the chat is open: the sheet fills the screen and has its own
          close button, and the launcher would sit on top of the text box. */}
      <div className={`fixed bottom-4 right-4 z-50 motion-safe:animate-chat-pop ${open ? 'max-sm:hidden' : ''}`}>
        <div className={open ? '' : 'motion-safe:animate-chat-float'}>
          {nudging && !open && (
            <button
              type="button"
              onClick={() => {
                setNudging(false);
                setOpen(true);
              }}
              className="absolute bottom-full right-0 mb-3 w-max max-w-[13rem] animate-scale-in rounded-xl rounded-br-sm border border-hairline bg-white px-3.5 py-2.5 text-left text-[0.8125rem] leading-snug text-ink shadow-overlay"
            >
              <span className="block font-semibold text-brand-800">Maayong adlaw! Ako si Bitoy.</span>
              Need help? Ask me in English or Bisaya.
            </button>
          )}
          <button
            type="button"
            ref={toggleRef}
            onClick={() => {
              setNudging(false);
              setOpen((v) => !v);
            }}
            className={`btn relative h-14 w-14 justify-center rounded-full bg-brand-600 p-0 text-white shadow-glow transition-[transform,background-color] duration-150 ease-gov hover:scale-[1.04] hover:bg-brand-700 active:scale-95 sm:h-auto sm:w-auto sm:py-2 sm:pl-2 sm:pr-4 sm:text-[0.875rem] ${
              nudging && !open ? 'motion-safe:animate-chat-nudge' : ''
            }`}
            aria-expanded={open}
            aria-controls="public-assistance-chat"
            aria-label={open ? 'Hide chat' : 'Ask Bitoy, the Municipal Assistant'}
          >
            {/* Breathing halo while closed; the stronger ring joins it during the hello. */}
            {!open && (
              <span
                className="pointer-events-none absolute inset-0 rounded-full bg-brand-500 motion-safe:animate-chat-breathe motion-reduce:hidden"
                aria-hidden="true"
              />
            )}
            {nudging && !open && (
              <span
                className="pointer-events-none absolute inset-0 rounded-full bg-brand-400 motion-safe:animate-chat-ring motion-reduce:hidden"
                aria-hidden="true"
              />
            )}
            {/* Bitoy ↔ close icon cross-fade with a quarter turn as the panel opens; he waves
                during the once-per-visit hello. */}
            <span className="relative grid h-10 w-10 place-items-center rounded-full bg-white" aria-hidden="true">
              <span
                className={`absolute inset-0 grid place-items-center transition-all duration-200 ease-gov motion-reduce:transition-none ${
                  open ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
                }`}
              >
                <Bitoy mood={nudging && !open ? 'wave' : 'idle'} animated={!open} className="h-9 w-9" />
              </span>
              <XIcon
                className={`absolute h-5 w-5 text-brand-600 transition-all duration-200 ease-gov motion-reduce:transition-none ${
                  open ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
                }`}
              />
            </span>
            {/* `relative` keeps the label painted above the absolutely positioned halo. */}
            <span className="relative hidden font-semibold sm:inline" aria-hidden="true">
              {open ? 'Hide chat' : 'Ask Bitoy'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
