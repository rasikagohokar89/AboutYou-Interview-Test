/**
 * @fileoverview Global setup for authentication state.
 * 
 * If .auth/user.json exists with valid cookies, it is reused (no login).
 * If it is missing or empty, a headed Chrome window opens for manual login.
 */

import { test as setup, chromium } from '@playwright/test';
import { TestConfig } from './config/test.config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Reusable helper function to verify authentication state for a specific account.
 * Checks if storageState file exists and has valid cookies. If not, prompts for manual login.
 */
async function verifyAuthState(storageStatePath: string, accountName: string) {
  const authDir = path.dirname(storageStatePath);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // If a valid auth state already exists, reuse it
  if (fs.existsSync(storageStatePath)) {
    try {
      const content = JSON.parse(fs.readFileSync(storageStatePath, 'utf-8'));
      if (Array.isArray(content.cookies) && content.cookies.length > 0) {
        console.log(`Using existing auth state for ${accountName} from: ${path.basename(storageStatePath)}`);
        return;
      }
    } catch {
      // File is corrupted or invalid, will re-login below
    }
  }

  // No valid auth state — open headed Chrome for manual login
  console.log('\n---------------------------------------------------------');
  console.log(`  MANUAL LOGIN REQUIRED: ${accountName.toUpperCase()}`);
  console.log('---------------------------------------------------------');
  console.log(`  No valid auth state found (${path.basename(storageStatePath)} is empty or missing).`);
  console.log('  A Chrome window will open — please:');
  console.log('  1. Click the Account/Login icon');
  console.log(`  2. Log in manually (use credentials for: ${accountName})`);
  console.log('  3. Complete any CAPTCHA if prompted');
  console.log('  4. Once logged in, return here and press ENTER');
  console.log('---------------------------------------------------------\n');

  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    args: ['--disable-blink-features=AutomationControlled'],
    ignoreDefaultArgs: ['--enable-automation'],
  });

  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  await page.goto(TestConfig.baseUrl);

  // Wait for user to press Enter in the terminal
  await new Promise<void>((resolve) => {
    process.stdin.resume();
    process.stdin.once('data', () => resolve());
  });

  await context.storageState({ path: storageStatePath });
  console.log(`✅ Session saved successfully to: ${path.basename(storageStatePath)}`);
  await browser.close();
}

setup('verify authentication state', async () => {
  const file1 = TestConfig.storageStatePath;
  const file2 = path.join(path.dirname(file1), 'user-1.json');

  console.log('--- Verifying Auth State 1 ---');
  await verifyAuthState(file1, 'Account 1');

  console.log('--- Verifying Auth State 2 ---');
  await verifyAuthState(file2, 'Account 2');
});


