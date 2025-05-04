import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Add enhanced production build options
    minify: true,
    sourcemap: true,
    // Increase build performance and avoid timeouts
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      // Output configuration for production
      output: {
        // Improve chunking for better performance
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'ai-libs': ['openai'],
          'three-vendor': ['three']
        },
      },
    }
  },
  // Increase memory limit for Node during build
  server: {
    // Configure server options
    host: true,
    port: 5173,
  },
  // Handle environment variable fallbacks
  define: {
    // Ensure all required environment variables have fallbacks for CI
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
})
