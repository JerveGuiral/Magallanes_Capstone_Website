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
          className="fixed bottom-20 right-4 z-50 flex h-[28rem] w-[min(24rem,calc(100vw-2rem))] flex-col border border-hairline bg-white shadow-raised animate-in fade-in slide-in-from-bottom-3 duration-200"
          aria-label="Public assistance chat"
        >
          <header className="flex items-center justify-between gap-3 bg-navy px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="font-display text-sm font-bold text-white">Public Assistance Desk</h2>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-navy-200">
                AI Municipal Assistant · Online 24/7
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-navy-200 transition-colors duration-150 hover:text-white"
              aria-label="Close chat"
            >
              <XIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>

          <div
            ref={logRef}
            className="flex-1 space-y-3 overflow-y-auto bg-surface px-4 py-4"
            aria-live="polite"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] border px-3 py-2 text-sm leading-relaxed ${m.from === 'bot'
                    ? 'border-hairline bg-white text-ink shadow-sm'
                    : 'ml-auto border-navy bg-navy text-white shadow-sm'
                  }`}
              >
                {m.text}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 max-w-[85%] border border-hairline bg-white px-3 py-2 text-sm text-ink-muted shadow-sm">
                <Loader2Icon className="h-4 w-4 animate-spin text-teal" />
                <span className="text-xs italic">Thinking...</span>
              </div>
            )}

            {messages.length === 1 && !isLoading && (
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  Suggested topics:
                </p>
                <ul className="space-y-1.5">
                  {SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => send(s)}
                        className="w-full border border-hairline bg-white px-3 py-2 text-left text-xs font-semibold text-teal transition-colors duration-150 hover:bg-teal-50 hover:border-teal"
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
              placeholder={isLoading ? 'Waiting for response...' : 'Type your question…'}
              disabled={isLoading}
              className="min-w-0 flex-1 border border-hairline px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-teal disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={!draft.trim() || isLoading}
              className="grid h-9 w-9 shrink-0 place-items-center bg-teal text-white transition-colors duration-150 hover:bg-teal-900 disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
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
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-navy px-4 py-3 text-sm font-semibold text-white shadow-raised transition-all duration-150 hover:bg-navy-900 hover:scale-[1.02] active:scale-95"
        aria-expanded={open}
      >
        <MessageSquareIcon className="h-4 w-4" aria-hidden="true" />
        {open ? 'Hide chat' : 'Ask Municipal Assistant'}
      </button>
    </>
  );
}