import React from 'react';
import { MessageSquareIcon, XIcon, SendIcon, Loader2Icon } from 'lucide-react';

type Message = {
  id: string | number;
  from: 'bot' | 'user';
  text: string;
  timestamp?: Date;
};

const SUGGESTIONS = [
  'How do I apply for a business permit?',
  'Where to apply for business permit?',
  'How much is the business permit fee?'
];

const INITIAL: Message[] = [
  {
    id: 'initial-1',
    from: 'bot',
    text: 'Maayong adlaw! This is the Magallanes Public Assistance Desk. Ask about permits, clearances, or advisories and I will point you to the right office.'
  }
];

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>(INITIAL);
  const [draft, setDraft] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const logRef = React.useRef<HTMLDivElement>(null);

  // Maintain or retrieve session ID for continuous Dialogflow conversation context
  const sessionId = React.useMemo(() => {
    let id = sessionStorage.getItem('df_session_id');
    if (!id) {
      id = 'session-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
      sessionStorage.setItem('df_session_id', id);
    }
    return id;
  }, []);

  React.useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, open, isLoading]);

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
              <p className="mt-0.5 font-display text-[0.625rem] font-bold uppercase tracking-[0.08em] text-brand-200">
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
                className={`max-w-[85%] px-3.5 py-2.5 text-[0.875rem] leading-relaxed shadow-subtle ${
                  m.from === 'bot'
                    ? 'rounded-lg rounded-tl-sm border border-hairline bg-white text-ink'
                    : 'ml-auto rounded-lg rounded-br-sm bg-brand-600 text-white'
                }`}
              >
                {m.text}
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
                <p className="font-display text-[0.625rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
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

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn btn-primary fixed bottom-4 right-4 z-50 rounded-full px-5 py-3 shadow-raised transition-transform duration-150 ease-gov hover:scale-[1.03] active:scale-95"
        aria-expanded={open}
      >
        <MessageSquareIcon className="h-4 w-4" aria-hidden="true" />
        {open ? 'Hide chat' : 'Ask Municipal Assistant'}
      </button>
    </>
  );
}
