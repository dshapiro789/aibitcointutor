import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// Get the repository name from package.json
const getRepoName = () => {
  try {
    const url = process.env.GITHUB_REPOSITORY;
    return url ? `/${url.split('/')[1]}/` : '/';
  } catch (e) {
    return '/';
  }
};

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/aibitcointutor/' : '/',
  plugins: [
    wasm(),
    react(),
    nodePolyfills({
      include: ['stream', 'buffer', 'crypto', 'events', 'process', 'util']
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  },
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});