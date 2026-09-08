import { defineConfig, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    //* 번들 Chromium 대신 시스템에 설치된 Google Chrome 을 쓴다.
    //* Playwright 1.63 은 macOS 12 용 Chromium 을 더 이상 배포하지 않는다.
    channel: 'chrome',
  },
  projects: [
    {
      name: 'mobile',
      //* Chromium 기반 안드로이드 기기. channel:'chrome' 를 쓰므로 WebKit 기기 서술자는 쓰지 않는다
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  //* 이미 떠 있는 dev 서버가 있으면 그대로 쓴다
  webServer: {
    command: 'pnpm dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
