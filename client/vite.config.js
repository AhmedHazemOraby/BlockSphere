import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration with IPFS proxy setup
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ipfs': {
        target: 'http://localhost:8080', // Proxy IPFS requests to the local gateway
        changeOrigin: true, // Enables host header changes to match the target
        rewrite: (path) => path.replace(/^\/ipfs/, '/ipfs'), // Ensure IPFS path integrity
      },
    },
  },
});