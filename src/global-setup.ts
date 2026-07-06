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

setup('verify authentication state', async () => {
  const authDir = path.dirname(TestConfig.storageStatePath);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // If a valid auth state already exists, reuse it
  if (fs.existsSync(TestConfig.storageStatePath)) {
    try {
      const content = JSON.parse(fs.readFileSync(TestConfig.storageStatePath, 'utf-8'));
      if (Array.isArray(content.cookies) && content.cookies.length > 0) {
        console.log('Using existing auth state from .auth/user.json');
        return;
      }
    } catch {
      // File is corrupted, will re-login below
    }
  }

  // No valid auth state — open headed Chrome for manual login
  console.log('\n---------------------------------------------------------');
  console.log('  MANUAL LOGIN REQUIRED');
  console.log('---------------------------------------------------------');
  console.log('  No valid auth state found (.auth/user.json is empty or missing).');
  console.log('  A Chrome window will open — please:');
  console.log('  1. Click the Account/Login icon');
  console.log('  2. Log in manually');
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

  await context.storageState({ path: TestConfig.storageStatePath });
  console.log('Session saved successfully to .auth/user.json');
  await browser.close();
});


