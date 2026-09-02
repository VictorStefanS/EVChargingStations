import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    trace: 'on-first-retry',
  },
  reporter: [['list']],
  webServer: {
    command: 'npx http-server ./dist -p 5173 -c-1',
    port: 5173,
    reuseExistingServer: false,
  },
});
