
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import alpinejs from '@astrojs/alpinejs';

const site = process.env.SITE || 'ADTI';

const siteConfigs = {
  ADTI: {
    outDir: '../dist/adti',
    site: 'https://adti.example.com'
  }
};

const config = siteConfigs[site] || { outDir: '../dist', site: undefined };

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
    port: 5000  // Set production server to use port 5000
  }),
  devToolbar: {
    enabled: false
  },
  integrations: [tailwind(), alpinejs()],
  server: {
    host: true,
    allowedHosts: ['.repl.co', '.replit.dev','all','dev.markidiags.com']
  },
  vite: {
    server: {
      host: '0.0.0.0',
      port: 5000,
      allowedHosts: ['.repl.co', '.replit.dev','all','dev.markidiags.com'],
      hmr: {
        host: 'dev.markidiags.com',
        protocol: 'wss',
        clientPort: 443,
        path: '/'
      },
      proxy: {
        '/node_modules': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/node_modules/, '')
        }
      }
    },
    build: {
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          entryFileNames: 'assets/[name]-[hash].js'
        }
      }
    }
  },
  outDir: config.outDir,
  build: {
    format: 'directory'
  },
  site: config.site,
  // Configuration pour le contenu
  content: {
    configPath: './src/content/config'
  },
  experimental: {
    chromeDevtoolsWorkspace: false  // Disable experimental features for production
  }
});
