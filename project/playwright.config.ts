import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium-tablet',
      testIgnore: /online\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: { width: 1024, height: 768 },
        hasTouch: true,
      },
    },
    {
      name: 'webkit-ipad',
      testIgnore: /online\.spec\.ts/,
      use: {
        ...devices['iPad (gen 7) landscape'],
      },
    },
    {
      name: 'chromium-desktop',
      testIgnore: /online\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: { width: 1366, height: 768 },
        hasTouch: false,
      },
    },
    {
      name: 'chromium-phone',
      testIgnore: /online\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'chromium-online',
      testMatch: /online\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: { width: 1366, height: 768 },
        hasTouch: false,
        baseURL: 'http://127.0.0.1:4174',
      },
    },
  ],
  webServer: [
    {
      command: 'npm run preview -- --port 4173 --host 127.0.0.1',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command:
        'node node_modules/vite/bin/vite.js --port 4174 --host 127.0.0.1',
      url: 'http://127.0.0.1:4174',
      env: {
        VITE_ROOM_TRANSPORT: 'local',
        VITE_FEATURE_ONLINE_ROOM: '1',
      },
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
})
