import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Preview URLs differ per environment (e2b, kiro.dev gateways, tunnels).
    // Pinning a single suffix makes Vite answer "host is not allowed" and the
    // app never boots, so accept whatever host the preview is served from.
    host: true,
    allowedHosts: true,
  },
});
