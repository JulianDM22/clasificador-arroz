/**
 * @file vite.config.js
 * @description Configuración de Vite (compilación y servidor de desarrollo) y de Vitest
 *              (pruebas unitarias de componentes con jsdom).
 * @fecha_creacion 2026-10-18
 * @actualizacion 2026-10-18
 * @autor Julian Delgado (@JulianDM22), Cesar Camilo Hoyos Diaz (@Camilo1408)
 * @version 1.0.0
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  preview: { port: 4173 },
  build: {
    rollupOptions: {
      // Librerías en archivos aparte: el navegador las guarda en caché entre versiones de la app.
      output: { manualChunks: { react: ['react', 'react-dom', 'react-router-dom'], mui: ['@mui/material', '@mui/icons-material'] } },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/pruebas/setup.js',
    include: ['src/**/*.test.{js,jsx}'],
    coverage: { reporter: ['text', 'html'], include: ['src/**/*.{js,jsx}'], exclude: ['src/pruebas/**', 'src/main.jsx'] },
  },
});
