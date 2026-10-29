import React from 'react';
import { XIcon, SendIcon, Loader2Icon, RotateCcwIcon } from 'lucide-react';
import { Bitoy, type BitoyMood } from './Bitoy';
import { ASK_BITOY_EVENT } from '../lib/askBitoy';
import { apiUrl } from '../lib/api';

// The server's "I didn't understand" intents: Bitoy looks sorry instead of pleased.
const FALLBACK_INTENT = /^(Default Fallback Intent|vague\.question)/;

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
const SUGGESTIONS = [
  'How do I apply for a business permit?',
  'Kinsa ang mayor sa Magallanes?',
  'What time does the municipal hall open?',
  'Unsa ang mga tourist spot sa Magallanes?',
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

const INITIAL: Message[] = [
  {
    id: 'initial-1',
    from: 'bot',
    text: 'Maayong adlaw! Ako si Bitoy — named after the 500-year-old Bitaug tree of Caloc-an. Ask me about permits, clearances, officials, health services, office hours or tourist spots, in English or Bisaya.'
  }
];

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>(INITIAL);
  const [draft, setDraft] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
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

  React.useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
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

  /* askBitoy() from anywhere on the site (the homepage "Meet Bitoy" section, the hero): open the
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
    window.clearTimeout(moodTimer.current);
    setMood('thinking');

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
      setIsLoading(false);
    }
  };
  sendRef.current = send;

  return (
    <>
      {open && (
        <section
          id="public-assistance-chat"
          className="fixed bottom-[5.25rem] right-4 z-50 flex h-[30rem] w-[min(24rem,calc(100vw-2rem))] animate-scale-in flex-col overflow-hidden rounded-xl border border-hairline bg-white shadow-overlay"
          aria-label="Public assistance chat"
        >
          <header className="flex items-center justify-between gap-3 bg-accent-600 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              {/* Bitoy shows the conversation's mood here; hovering him gets a wave. */}
              <span
                className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white"
                aria-hidden="true"
                onMouseEnter={() => mood === 'idle' && flashMood('wave', 1600)}
              >
                <Bitoy mood={mood} className="h-10 w-10" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-accent-600 bg-accent-200" />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-base font-bold text-white">Bitoy</h2>
                <p className="mt-0.5 font-sans text-[0.625rem] font-bold uppercase tracking-[0.08em] text-accent-100">
                  Virtual Assistant · Online 24/7
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-accent-100 transition-colors duration-150 hover:bg-white/15 hover:text-white"
              aria-label="Close chat"
            >
              <XIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>

          <div ref={logRef} className="admin-scroll flex-1 space-y-3 overflow-y-auto bg-surface px-4 py-4" aria-live="polite">
            {messages.map((m) =>
              m.from === 'bot' ? (
                <div key={m.id} className="flex items-start gap-2">
                  {/* Only the newest reply's Bitoy moves; older ones hold still. */}
                  <BitoyAvatar animated={!isLoading && m.id === lastBotId} />
                  <div className="max-w-[85%] whitespace-pre-line rounded-lg rounded-tl-sm border border-hairline bg-white px-3.5 py-2.5 text-[0.875rem] leading-relaxed text-ink shadow-subtle [overflow-wrap:anywhere]">
                    {withBreakHints(m.text)}
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
                  className="ml-auto max-w-[85%] whitespace-pre-line rounded-lg rounded-br-sm bg-accent-600 px-3.5 py-2.5 text-[0.875rem] leading-relaxed text-white shadow-subtle [overflow-wrap:anywhere]"
                >
                  {withBreakHints(m.text)}
                </div>
              )
            )}

            {isLoading && (
              <div className="flex items-start gap-2">
                <BitoyAvatar mood="thinking" animated />
                <div className="rounded-lg rounded-tl-sm border border-hairline bg-white px-3.5 py-2.5 shadow-subtle">
                  <span className="text-[0.8125rem] text-ink-muted">Bitoy is thinking…</span>
                </div>
              </div>
            )}

            {messages.length === 1 && !isLoading && (
              <div className="space-y-2 pt-2">
                <p className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                  Suggested topics
                </p>
                <ul className="space-y-1.5">
                  {SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => send(s)}
                        className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-left text-[0.8125rem] font-medium text-brand-800 shadow-subtle transition-colors duration-150 hover:border-accent-300 hover:bg-accent-50"
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
              disabled={isLoading}
              className="field min-w-0 flex-1 text-[0.875rem]"
            />
            <button
              type="submit"
              disabled={!draft.trim() || isLoading}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent-600 text-white transition-colors duration-150 hover:bg-accent-700 disabled:pointer-events-none disabled:opacity-40"
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
      <div className="fixed bottom-4 right-4 z-50 motion-safe:animate-chat-pop">
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
            className={`btn relative h-14 w-14 justify-center rounded-full bg-accent-500 p-0 text-white shadow-raised transition-[transform,background-color] duration-150 ease-gov hover:scale-[1.04] hover:bg-accent-600 active:scale-95 sm:h-auto sm:w-auto sm:py-2 sm:pl-2 sm:pr-4 sm:text-[0.875rem] ${
              nudging && !open ? 'motion-safe:animate-chat-nudge' : ''
            }`}
            aria-expanded={open}
            aria-controls="public-assistance-chat"
            aria-label={open ? 'Hide chat' : 'Ask Bitoy, the Municipal Assistant'}
          >
            {/* Breathing halo while closed; the stronger ring joins it during the hello. */}
            {!open && (
              <span
                className="pointer-events-none absolute inset-0 rounded-full bg-accent-500 motion-safe:animate-chat-breathe motion-reduce:hidden"
                aria-hidden="true"
              />
            )}
            {nudging && !open && (
              <span
                className="pointer-events-none absolute inset-0 rounded-full bg-accent-400 motion-safe:animate-chat-ring motion-reduce:hidden"
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
                className={`absolute h-5 w-5 text-accent-600 transition-all duration-200 ease-gov motion-reduce:transition-none ${
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
