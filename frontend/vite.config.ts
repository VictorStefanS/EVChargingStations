import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const secureHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    headers: secureHeaders,
  },
  preview: {
    host: '0.0.0.0',
    headers: secureHeaders,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    exclude: ['**/e2e/**', '**/node_modules/**'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      exclude: ['**/src/test/**', '**/src/e2e/**']
    }
  },
})
