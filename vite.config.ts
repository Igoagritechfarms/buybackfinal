import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import express from 'express';
import path from 'path';
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import otpRoutes from './server/otpRoutes.js';

function otpApiPlugin(): Plugin {
  return {
    name: 'farmgate-otp-api',
    configureServer(server: ViteDevServer) {
      const app = express();
      app.use(express.json());
      app.use('/api', otpRoutes);
      server.middlewares.use(app);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return {
    plugins: [otpApiPlugin(), react(), tailwindcss()],
    define: {
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env['VITE_GEMINI_API_KEY']),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    css: {
      devSourcemap: false,
    },
    server: {
      hmr: process.env['DISABLE_HMR'] !== 'true',
      host: '0.0.0.0',
      strictPort: false,
      allowedHosts: ['purple-geckos-crash.loca.lt', 'localhost', '127.0.0.1'],
    },
  };
});
