import { defineConfig } from 'wxt';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  publicDir: 'public',
  alias: {
    '@': path.resolve(__dirname, './src')
  },
  vite: () => ({
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }),
  manifest: {
    name: 'reTone: Rewrite Your Social Media Experience with Local AI',
    description: 'Get TL;DR summaries, de-buzzword rewrites, and even brainrot remixes of posts on your feeds',
    icons: {
      '16': 'icons/Logo128.png',
      '32': 'icons/Logo128.png',
      '48': 'icons/Logo128.png',
      '128': 'icons/Logo128.png'
    },
    permissions: ['storage', 'activeTab', 'offscreen'],
    host_permissions: [
      'https://www.reddit.com/*',
      'https://www.linkedin.com/*'
    ],
    web_accessible_resources: [
      {
        resources: ['llm-worker.js', 'offscreen.html', 'offscreen.js'],
        matches: ['<all_urls>']
      }
    ],
    content_security_policy: {
      extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
    }
  },
  runner: {
    disabled: false,
    chromiumArgs: ['--allow-file-access-from-files']
  }
});

