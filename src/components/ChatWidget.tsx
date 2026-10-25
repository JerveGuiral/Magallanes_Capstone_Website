import React from 'react';
import { MessageSquareIcon, XIcon, SendIcon, Loader2Icon } from 'lucide-react';

type Message = {
  id: string | number;
  from: 'bot' | 'user';
  text: string;
  timestamp?: Date;
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
    text: 'Maayong adlaw! This is the Magallanes Public Assistance Desk. Ask about permits, clearances, officials, office hours, or tourist spots — in English or Bisaya.'
  }
];

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>(INITIAL);
  const [draft, setDraft] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [nudging, setNudging] = React.useState(false);
  const logRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);

  /* One gentle nudge per visit, a few seconds in, so a first-time visitor notices the
   * assistant. Never repeats or loops — constant motion beside page content is distracting —
   * and is skipped if the chat was already opened. */
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
    const stop = window.setTimeout(() => setNudging(false), 6500);
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

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: value,
          sessionId: sessionId,
        }),
      });

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
    } catch (error) {
      console.error('[ChatWidget] Error sending message to Dialogflow:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          from: 'bot',
          text: 'Sorry, I am having trouble connecting to the public assistance service right now. Please ensure the backend server is running.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {open && (
        <section
          id="public-assistance-chat"
          className="fixed bottom-[4.5rem] right-4 z-50 flex h-[30rem] w-[min(24rem,calc(100vw-2rem))] animate-scale-in flex-col overflow-hidden rounded-xl border border-hairline bg-white shadow-overlay"
          aria-label="Public assistance chat"
        >
          <header className="flex items-center justify-between gap-3 bg-brand-800 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sea-500 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sea-500" />
                </span>
                <h2 className="font-display text-sm font-bold text-white">Public Assistance Desk</h2>
              </div>
              <p className="mt-0.5 font-sans text-[0.625rem] font-bold uppercase tracking-[0.08em] text-brand-200">
                AI Municipal Assistant · Online 24/7
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-brand-200 transition-colors duration-150 hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              <XIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>

          <div ref={logRef} className="admin-scroll flex-1 space-y-3 overflow-y-auto bg-surface px-4 py-4" aria-live="polite">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] whitespace-pre-line [overflow-wrap:anywhere] px-3.5 py-2.5 text-[0.875rem] leading-relaxed shadow-subtle ${
                  m.from === 'bot'
                    ? 'rounded-lg rounded-tl-sm border border-hairline bg-white text-ink'
                    : 'ml-auto rounded-lg rounded-br-sm bg-brand-600 text-white'
                }`}
              >
                {withBreakHints(m.text)}
              </div>
            ))}

            {isLoading && (
              <div className="flex max-w-[85%] items-center gap-2 rounded-lg rounded-tl-sm border border-hairline bg-white px-3.5 py-2.5 shadow-subtle">
                <Loader2Icon className="h-3.5 w-3.5 animate-spin text-brand-600" aria-hidden="true" />
                <span className="text-[0.8125rem] text-ink-muted">Thinking…</span>
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
                        className="w-full rounded-lg border border-hairline bg-white px-3.5 py-2.5 text-left text-[0.8125rem] font-medium text-brand-700 shadow-subtle transition-colors duration-150 hover:border-brand-400 hover:bg-brand-50"
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
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand-800 text-white transition-colors duration-150 hover:bg-brand-600 disabled:pointer-events-none disabled:opacity-40"
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
          being hidden on small screens. The entrance animation lives on this wrapper and the
          nudge on the button, so ending one never restarts the other. */}
      <div className="fixed bottom-4 right-4 z-50 motion-safe:animate-chat-pop">
        <button
          type="button"
          ref={toggleRef}
          onClick={() => {
            setNudging(false);
            setOpen((v) => !v);
          }}
          className={`btn btn-primary relative h-12 w-12 justify-center rounded-full p-0 shadow-raised transition-transform duration-150 ease-gov hover:scale-[1.04] active:scale-95 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5 sm:text-[0.875rem] ${
            nudging && !open ? 'motion-safe:animate-chat-nudge' : ''
          }`}
          aria-expanded={open}
          aria-controls="public-assistance-chat"
          aria-label={open ? 'Hide chat' : 'Ask the Municipal Assistant'}
        >
          {nudging && !open && (
            <span
              className="pointer-events-none absolute inset-0 rounded-full bg-brand-600 motion-safe:animate-chat-ring"
              aria-hidden="true"
            />
          )}
          {/* Chat ↔ close icons cross-fade with a quarter turn as the panel opens. */}
          <span className="relative grid h-5 w-5 place-items-center sm:h-4 sm:w-4" aria-hidden="true">
            <MessageSquareIcon
              className={`absolute h-5 w-5 transition-all duration-200 ease-gov motion-reduce:transition-none sm:h-4 sm:w-4 ${
                open ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
              }`}
            />
            <XIcon
              className={`absolute h-5 w-5 transition-all duration-200 ease-gov motion-reduce:transition-none sm:h-4 sm:w-4 ${
                open ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
              }`}
            />
          </span>
          {/* `relative` keeps the label painted above the absolutely positioned ring. */}
          <span className="relative hidden sm:inline" aria-hidden="true">
            {open ? 'Hide chat' : 'Ask Assistant'}
          </span>
        </button>
      </div>
    </>
  );
}
