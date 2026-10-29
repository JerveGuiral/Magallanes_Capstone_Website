import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * index.html's title, description and robots rule follow VITE_OFFICIAL_SITE. Until the LGU adopts
 * the site, link previews say "capstone project" and search engines are asked not to index it,
 * so a shared link is never mistaken for the municipality's official website.
 */
function siteIdentity(official: boolean): Plugin {
  const values: Record<string, string> = official
    ? {
        SITE_TITLE: 'Municipality of Magallanes, Agusan del Norte',
        SITE_DESCRIPTION:
          'Official website of the Municipality of Magallanes, Agusan del Norte: services, officials, tourism, transparency, and Bitoy, the bilingual (English/Bisaya) virtual assistant.',
        SITE_ROBOTS: 'index, follow',
      }
    : {
        SITE_TITLE: 'Municipality of Magallanes — Capstone Project',
        SITE_DESCRIPTION:
          'Capstone project: a website and Bitoy, a bilingual (English/Bisaya) chatbot, for the Municipality of Magallanes, Agusan del Norte. Not yet the official LGU website.',
        SITE_ROBOTS: 'noindex, nofollow',
      }
  return {
    name: 'site-identity',
    transformIndexHtml: (html) => html.replace(/%(SITE_TITLE|SITE_DESCRIPTION|SITE_ROBOTS)%/g, (_, key: string) => values[key]),
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), siteIdentity(env.VITE_OFFICIAL_SITE === 'true')],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/flask-api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/flask-api/, '/api'),
        },
      },
    },
  }
})
