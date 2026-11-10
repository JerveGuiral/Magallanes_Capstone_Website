/** The window event ChatWidget listens for: open the chat and, when given, ask the question. */
export const ASK_MAGI_EVENT = 'magi:ask';

/** Opens the chat from anywhere on the site, optionally sending a question right away. */
export function askMagi(question?: string) {
  window.dispatchEvent(new CustomEvent<string | undefined>(ASK_MAGI_EVENT, { detail: question }));
}
