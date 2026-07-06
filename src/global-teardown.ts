/**
 * @fileoverview Global teardown — runs after all test projects complete.
 * Handles cleanup of temporary test artifacts and auth state.
 */

import { test as teardown } from '@playwright/test';
import { TestConfig } from './config/test.config';
import * as fs from 'fs';

teardown('cleanup test artifacts', async () => {
  // Remove stored auth state to avoid stale sessions
  try {
    if (fs.existsSync(TestConfig.storageStatePath)) {
      fs.unlinkSync(TestConfig.storageStatePath);
      console.log('🧹 Auth state cleaned up.');
    }
  } catch {
    // Non-critical — cleanup is best-effort
  }
});
