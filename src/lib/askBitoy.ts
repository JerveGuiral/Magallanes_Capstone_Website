/** The window event ChatWidget listens for: open the chat and, when given, ask the question. */
export const ASK_BITOY_EVENT = 'bitoy:ask';

/** Opens the chat from anywhere on the site, optionally sending a question right away. */
export function askBitoy(question?: string) {
  window.dispatchEvent(new CustomEvent<string | undefined>(ASK_BITOY_EVENT, { detail: question }));
}
