/**
 * @fileoverview Playwright configuration for the About You Checkout QA Suite.
 * 
 * Configures:
 * - Multi-browser execution (Chromium, Firefox, WebKit)
 * - Storage state for authenticated sessions
 * - HTML reporting with screenshots on failure
 * - Global setup for authentication state persistence
 * - Tag-based test filtering (@smoke, @regression, @edge-case, @negative)
 */

import { defineConfig, devices } from '@playwright/test';
import { TestConfig } from './src/config/test.config';

export default defineConfig({
  /* Root directory for test files */
  testDir: './tests',

  /* Run tests in parallel within files */
  fullyParallel: false,

  /* Fail build on CI if test.only is left in source */
  forbidOnly: !!process.env.CI,

  /* Retry configuration — more retries in CI */
  retries: process.env.CI ? 2 : TestConfig.execution.retries,

  /* Parallel worker count */
  workers: process.env.CI ? 1 : TestConfig.execution.workers,

  /* HTML reporter with open-on-failure for local, always for CI */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ...(process.env.CI ? [['junit', { outputFile: 'test-results/junit-report.xml' }] as const] : []),
  ],

  /* Global timeout for each test */
  timeout: TestConfig.timeouts.default,

  /* Shared settings for all projects */
  use: {
    /* Base URL for relative navigations: await page.goto('/basket') */
    baseURL: TestConfig.baseUrl,

    /* Capture screenshot on failure for debugging */
    screenshot: 'only-on-failure',

    /* Record video on first retry to diagnose flaky tests */
    video: 'retain-on-failure',

    /* Capture trace on first retry for detailed debugging */
    trace: 'retain-on-failure',

    /* Default navigation timeout */
    navigationTimeout: TestConfig.timeouts.navigation,

    /* Default action timeout (click, fill, etc.) */
    actionTimeout: TestConfig.timeouts.action,

    /* Accept downloads for potential file download tests */
    acceptDownloads: true,

    /* Extra HTTP headers — simulate real user */
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },

  /* Browser-specific project configurations */
  projects: [
    /**
     * Setup project: Authenticates and saves storage state.
     * Runs before all other projects to establish login session.
     */
    {
      name: 'setup',
      testMatch: /global-setup\.ts/,
    },

    /**
     * Chromium (primary browser) — authenticated tests.
     * Uses stored auth state from the setup project.
     */
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: TestConfig.storageStatePath,
      },
      dependencies: ['setup'],
    },

    /**
     * Firefox — cross-browser validation.
     * Uses stored auth state from the setup project.
     */
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: TestConfig.storageStatePath,
      },
      dependencies: ['setup'],
    },

  ],
});
