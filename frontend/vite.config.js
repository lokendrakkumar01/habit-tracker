import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        // Vite 8 / Rolldown requires manualChunks as a function
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-')) return 'vendor-charts';
            if (id.includes('react-icons') || id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) return 'vendor-forms';
            if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('@tanstack')) return 'vendor-state';
            if (id.includes('react-hot-toast') || id.includes('canvas-confetti')) return 'vendor-fx';
            if (id.includes('react-router') || id.includes('react-dom') || id.includes('react/')) return 'vendor-react';
            return 'vendor';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'recharts'],
  },
})
