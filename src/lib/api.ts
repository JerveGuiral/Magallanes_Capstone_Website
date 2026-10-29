/**
 * URL of a chat-server endpoint. Locally VITE_API_URL is unset and Vite proxies /api to the
 * server; once deployed it is the chat server's own address (e.g. https://magallanes-chat.onrender.com),
 * which the server allows through ALLOWED_ORIGINS.
 */
export const apiUrl = (path: string) => `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}${path}`;
