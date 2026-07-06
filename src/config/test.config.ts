/**
 * @fileoverview Centralized test configuration loaded from environment variables.
 * Provides type-safe access to all configurable parameters used across the test suite.
 * 
 * Usage:
 *   import { TestConfig } from '../config/test.config';
 *   const url = TestConfig.baseUrl;
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Centralized configuration object for the test suite.
 * All values are sourced from environment variables with sensible defaults.
 */
export const TestConfig = {
  /** Base URL of the storefront under test */
  baseUrl: process.env.BASE_URL || 'https://en.aboutyou.de',

  /** Test user credentials for authenticated flows */
  credentials: {
    email: process.env.TEST_USER_EMAIL || 'gohokarrasika@gmail.com',
    password: process.env.TEST_USER_PASSWORD || 'Rasika@28',
  },

  /** Timeout settings in milliseconds */
  timeouts: {
    default: parseInt(process.env.DEFAULT_TIMEOUT || '60000', 10),
    navigation: parseInt(process.env.NAVIGATION_TIMEOUT || '60000', 10),
    action: parseInt(process.env.ACTION_TIMEOUT || '30000', 10),
  },

  /** Browser configuration */
  browser: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: parseInt(process.env.SLOW_MO || '0', 10),
  },

  /** Test execution settings */
  execution: {
    retries: parseInt(process.env.RETRIES || '1', 10),
    workers: parseInt(process.env.WORKERS || '2', 10),
  },

  /** Environment identifier (staging, production, etc.) */
  env: process.env.ENV || 'staging',

  /** Path to stored authentication state */
  storageStatePath: path.resolve(__dirname, '../../.auth/user.json'),

  /**
   * Checks whether valid test credentials are configured.
   * Used to conditionally skip authenticated test flows.
   */
  hasCredentials(): boolean {
    return !!(this.credentials.email && this.credentials.password);
  },
} as const;
