/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { resolve } from 'path';

// Production-specific config that forces using main.prod.tsx
export default defineConfig({
  base: '',
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
    // Explicitly use main.prod.tsx as entry point for production
    rollupOptions: {
      input: resolve(__dirname, 'src/main.prod.tsx'),
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom']
        },
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
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
