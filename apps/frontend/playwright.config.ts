import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60 * 1000,
  fullyParallel: false,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  // Web server setup is external; tests assume dev server is running on port 3000
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
})
