import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for a React project.
// This tells Vite to use the React plugin and where to find our source files.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173 // Default Vite dev server port
  }
});
