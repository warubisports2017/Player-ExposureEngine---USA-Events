import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          'react': 'preact/compat',
          'react-dom': 'preact/compat',
          'react-dom/client': 'preact/compat',
          'react/jsx-runtime': 'preact/jsx-runtime',
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-preact': ['preact'],
              'vendor-recharts': ['recharts'],
              'vendor-supabase': ['@supabase/supabase-js'],
            }
          }
        }
      }
    };
});
