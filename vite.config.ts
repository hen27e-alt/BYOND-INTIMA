import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  // Never bake secret keys into a production bundle: anyone can read it.
  // Locally (npm run dev) the key from .env still works. On the live site,
  // AI calls must go through the server once it is set up.
  const exposeKeys = mode !== 'production';
  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(exposeKeys ? env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '' : ''),
      'process.env.API_KEY': JSON.stringify(exposeKeys ? env.API_KEY || process.env.API_KEY || '' : ''),
    },
    build: {
      rollupOptions: {
        output: {
          // Libraries change rarely; in their own files they stay cached between site updates.
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            motion: ['motion/react'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
