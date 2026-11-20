import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir:'./tests/browser',
  timeout:45000,
  workers:1,
  use:{
    baseURL:process.env.AGRIDELTA_TEST_URL || 'http://127.0.0.1:4173',
    launchOptions:{executablePath:process.env.AGRIDELTA_CHROMIUM || undefined},
    trace:'retain-on-failure',
    screenshot:'only-on-failure',
  },
  webServer:process.env.AGRIDELTA_TEST_URL ? undefined : {
    command:'npm run dev -- --port 4173',
    url:'http://127.0.0.1:4173',
    reuseExistingServer:!process.env.CI,
  },
});
