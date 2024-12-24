import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ipfs': {
        target: 'http://localhost:8080', // Proxy IPFS requests to local gateway
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ipfs/, '/ipfs'),
      },
    },
  },
});